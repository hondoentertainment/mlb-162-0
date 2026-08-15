import { del, list, put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { utcDateKey } from '../src/game/dailySeed';
import { parsePicks, verifyDailyRun } from '../src/game/verifyRun';

interface DailyEntry {
  id: string;
  wins: number;
  losses: number;
  gradeLabel: string;
  rosterNames: string[];
  createdAt: string;
}

const MAX_ENTRIES = 100;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;

/** Best-effort spam brake. Per-instance only — the WAF is the real limiter. */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT_MAX;
}

function clientKey(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return (raw ?? 'unknown').split(',')[0]!.trim();
}

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function prefixFor(dateKey: string): string {
  return `daily-boards/${dateKey}/`;
}

/**
 * Entries live in one blob each, under a lexicographically sortable name, so
 * concurrent submissions never overwrite one another and reads can pick the
 * leaders from listing metadata alone.
 */
function entryPath(dateKey: string, entry: DailyEntry): string {
  const rank = String(Math.max(0, 999 - entry.wins)).padStart(3, '0');
  return `${prefixFor(dateKey)}${rank}-${entry.createdAt}-${entry.id}.json`;
}

function parseBody(req: VercelRequest): Record<string, unknown> {
  if (req.body == null) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString('utf8')) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return req.body as Record<string, unknown>;
}

async function listEntryBlobs(dateKey: string) {
  const { blobs } = await list({ prefix: prefixFor(dateKey), limit: 1000 });
  return blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
}

async function readTopEntries(dateKey: string, limit: number): Promise<DailyEntry[]> {
  const blobs = (await listEntryBlobs(dateKey)).slice(0, limit);
  const entries = await Promise.all(
    blobs.map(async (blob) => {
      try {
        const res = await fetch(blob.url, { cache: 'no-store' });
        if (!res.ok) return null;
        return (await res.json()) as DailyEntry;
      } catch {
        return null;
      }
    }),
  );
  return entries.filter((e): e is DailyEntry => !!e);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      error: 'Global daily board not configured',
      entries: [],
    });
  }

  try {
    if (req.method === 'GET') {
      const dateKey = String(req.query.date ?? '');
      if (!DATE_RE.test(dateKey)) {
        return res.status(400).json({ error: 'Invalid date' });
      }
      const entries = await readTopEntries(dateKey, MAX_ENTRIES);
      entries.sort((a, b) => b.wins - a.wins || a.createdAt.localeCompare(b.createdAt));
      return res.status(200).json({ dateKey, entries });
    }

    if (req.method === 'POST') {
      if (rateLimited(clientKey(req))) {
        return res.status(429).json({ error: 'Too many submissions' });
      }

      const body = parseBody(req);
      const dateKey = typeof body.dateKey === 'string' ? body.dateKey : '';
      if (!DATE_RE.test(dateKey)) {
        return res.status(400).json({ error: 'Invalid dateKey' });
      }

      // Only the current UTC day is live; yesterday is allowed for runs that
      // straddle the rollover.
      const today = utcDateKey();
      const yesterday = utcDateKey(new Date(Date.now() - 86_400_000));
      if (dateKey !== today && dateKey !== yesterday) {
        return res.status(400).json({ error: 'Board is closed for that date' });
      }

      const id = typeof body.id === 'string' ? body.id : '';
      if (!ID_RE.test(id)) {
        return res.status(400).json({ error: 'Invalid id' });
      }

      const picks = parsePicks(body.picks);
      if (!picks) {
        return res.status(400).json({ error: 'Missing or malformed picks' });
      }

      // The record is recomputed from a replay of that date's spins; whatever
      // wins the client claims is ignored.
      const verified = verifyDailyRun(dateKey, picks);
      if (!verified.ok) {
        return res.status(400).json({ error: `Run rejected: ${verified.error}` });
      }

      const entry: DailyEntry = {
        id,
        wins: verified.result.wins,
        losses: verified.result.losses,
        gradeLabel: verified.result.gradeLabel,
        rosterNames: verified.roster.map((s) => s.player?.name ?? '—'),
        createdAt: new Date().toISOString(),
      };

      // Drop any earlier submission from this attempt id before writing.
      const existing = await listEntryBlobs(dateKey);
      const previous = existing.filter((b) => b.pathname.endsWith(`-${id}.json`));
      await Promise.all(
        previous.map((b) => del(b.pathname).catch(() => undefined)),
      );

      await put(entryPath(dateKey, entry), JSON.stringify(entry), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });

      const after = await listEntryBlobs(dateKey);
      const rank = after.findIndex((b) => b.pathname.endsWith(`-${id}.json`)) + 1;

      return res.status(200).json({
        ok: true,
        rank: rank || null,
        wins: entry.wins,
        losses: entry.losses,
        gradeLabel: entry.gradeLabel,
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('[api/daily]', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}

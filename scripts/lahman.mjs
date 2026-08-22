/**
 * Overlay Chadwick/Lahman season lines onto the generated player catalog.
 * Source: https://github.com/chadwickbureau/baseballdatabank (CC BY-SA 4.0)
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE = join(__dirname, '.cache');

const DATABANK_MIRRORS = [
  'https://raw.githubusercontent.com/cbwinslow/baseballdatabank/master/core',
  'https://raw.githubusercontent.com/keberwein/baseballdatabank/master/core',
  'https://raw.githubusercontent.com/chadwickbureau/baseballdatabank/master/core',
];

/** Lahman franchID → our franchise id */
export const FRANCH_TO_OURS = {
  ARI: 'ari',
  ATL: 'atl',
  BAL: 'bal',
  BOS: 'bos',
  CHC: 'chc',
  CHW: 'cws',
  CIN: 'cin',
  CLE: 'cle',
  COL: 'col',
  DET: 'det',
  HOU: 'hou',
  KCR: 'kc',
  ANA: 'laa',
  LAD: 'lad',
  FLA: 'mia',
  MIL: 'mil',
  MIN: 'min',
  NYM: 'nym',
  NYY: 'nyy',
  OAK: 'oak',
  PHI: 'phi',
  PIT: 'pit',
  SDP: 'sd',
  SFG: 'sf',
  SEA: 'sea',
  STL: 'stl',
  TBD: 'tb',
  TEX: 'tex',
  TOR: 'tor',
  WSN: 'wsh',
};

export function normalizeName(value) {
  return String(value)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

export function parsePersonName(full) {
  let s = String(full).trim().replace(/\./g, '');
  s = s.replace(/\s+(Jr|Sr|II|III|IV)$/i, '');
  const parts = s.split(/\s+/).filter(Boolean);
  const last = parts.pop() ?? '';
  const first = parts.join(' ');
  return { first: normalizeName(first), last: normalizeName(last) };
}

export function decadeYearRange(decade) {
  const start = Number(String(decade).slice(0, 4));
  return { start, end: start + 9 };
}

export function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.length);
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? '';
    });
    return row;
  });
}

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

async function loadCsv(name) {
  mkdirSync(CACHE, { recursive: true });
  const path = join(CACHE, name);
  if (existsSync(path)) return readFileSync(path, 'utf8');
  let lastError = `Failed to fetch ${name}`;
  for (const base of DATABANK_MIRRORS) {
    try {
      const res = await fetch(`${base}/${name}`);
      if (!res.ok) {
        lastError = `Failed to fetch ${name}: ${res.status}`;
        continue;
      }
      const text = await res.text();
      writeFileSync(path, text);
      return text;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  throw new Error(lastError);
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function battingLine(rows) {
  let ab = 0;
  let h = 0;
  let doubles = 0;
  let triples = 0;
  let hr = 0;
  let bb = 0;
  let hbp = 0;
  let sf = 0;
  for (const r of rows) {
    ab += num(r.AB);
    h += num(r.H);
    doubles += num(r['2B']);
    triples += num(r['3B']);
    hr += num(r.HR);
    bb += num(r.BB);
    hbp += num(r.HBP);
    sf += num(r.SF);
  }
  const pa = ab + bb + hbp + sf;
  if (ab < 30 && pa < 40) return null;
  const avg = ab ? h / ab : 0;
  const obp = pa ? (h + bb + hbp) / pa : 0;
  const slg = ab ? (h + doubles + 2 * triples + 3 * hr) / ab : 0;
  return {
    avg: round(avg, 3),
    obp: round(obp, 3),
    slg: round(slg, 3),
  };
}

export function pitchingLine(rows) {
  let outs = 0;
  let er = 0;
  let h = 0;
  let bb = 0;
  let so = 0;
  for (const r of rows) {
    outs += num(r.IPouts);
    er += num(r.ER);
    h += num(r.H);
    bb += num(r.BB);
    so += num(r.SO);
  }
  const ip = outs / 3;
  if (ip < 15) return null;
  return {
    era: round((er * 9) / ip, 2),
    whip: round((h + bb) / ip, 2),
    k9: round((so * 9) / ip, 1),
  };
}

function round(n, digits) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function yearOf(iso) {
  if (!iso) return null;
  const y = Number(String(iso).slice(0, 4));
  return Number.isFinite(y) ? y : null;
}

export function careerOverlapsDecade(person, decade) {
  const { start, end } = decadeYearRange(decade);
  const debut = yearOf(person.debut) ?? 1871;
  const fin = yearOf(person.finalGame) ?? 2026;
  return debut <= end && fin >= start;
}

/**
 * @param {Array<{id: string, name: string, franchiseId: string, decade: string, pitching?: object, batting?: object}>} players
 */
export async function enrichPlayers(players) {
  const [peopleText, teamsText, battingText, pitchingText] = await Promise.all([
    loadCsv('People.csv'),
    loadCsv('Teams.csv'),
    loadCsv('Batting.csv'),
    loadCsv('Pitching.csv'),
  ]);

  const people = parseCsv(peopleText);
  const teams = parseCsv(teamsText);
  const batting = parseCsv(battingText);
  const pitching = parseCsv(pitchingText);

  const teamToFranch = new Map();
  for (const t of teams) {
    teamToFranch.set(`${t.yearID}|${t.teamID}`, t.franchID);
  }

  const ourTeam = (year, teamID) => {
    const franch = teamToFranch.get(`${year}|${teamID}`);
    return franch ? (FRANCH_TO_OURS[franch] ?? null) : null;
  };

  const byLast = new Map();
  for (const p of people) {
    const last = normalizeName(p.nameLast);
    const first = normalizeName(p.nameFirst);
    const given = normalizeName(p.nameGiven).replace(/\s+/g, '');
    const bucket = byLast.get(last) ?? [];
    bucket.push({ ...p, _first: first, _given: given });
    byLast.set(last, bucket);
  }

  const batByPlayer = groupBy(batting, (r) => r.playerID);
  const pitByPlayer = groupBy(pitching, (r) => r.playerID);

  let matched = 0;
  for (const player of players) {
    player.statsSource = 'approx';
    const { first, last } = parsePersonName(player.name);
    const candidates = (byLast.get(last) ?? []).filter((c) => {
      if (!careerOverlapsDecade(c, player.decade)) return false;
      return (
        c._first === first ||
        c._given.startsWith(first) ||
        first.startsWith(c._first) ||
        (first.length >= 2 && c._first.startsWith(first))
      );
    });
    if (!candidates.length) continue;

    const { start, end } = decadeYearRange(player.decade);
    const isPitcher = Boolean(player.pitching);
    let best = null;
    let bestWeight = -1;

    for (const cand of candidates) {
      const rows = (isPitcher ? pitByPlayer.get(cand.playerID) : batByPlayer.get(cand.playerID)) ?? [];
      const inWindow = rows.filter((r) => {
        const year = num(r.yearID);
        if (year < start || year > end) return false;
        return ourTeam(r.yearID, r.teamID) === player.franchiseId;
      });
      if (!inWindow.length) continue;
      const weight = isPitcher
        ? inWindow.reduce((s, r) => s + num(r.IPouts), 0)
        : inWindow.reduce((s, r) => s + num(r.AB) + num(r.BB), 0);
      if (weight > bestWeight) {
        bestWeight = weight;
        best = { cand, inWindow };
      }
    }

    if (!best) continue;
    const line = isPitcher ? pitchingLine(best.inWindow) : battingLine(best.inWindow);
    if (!line) continue;
    if (isPitcher) player.pitching = line;
    else player.batting = line;
    player.statsSource = 'lahman';
    matched++;
  }

  return { matched, total: players.length };
}

function groupBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const bucket = map.get(key);
    if (bucket) bucket.push(row);
    else map.set(key, [row]);
  }
  return map;
}

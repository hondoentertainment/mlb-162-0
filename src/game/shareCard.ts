import type { GradeId, Position } from '../config/constants';

export interface ShareCardSlot {
  position: Position;
  name: string | null;
}

export interface ShareCardInput {
  wins: number;
  losses: number;
  gradeLabel: string;
  gradeId?: GradeId;
  modeLabel: string;
  rosterNames: string[];
  roster?: ShareCardSlot[];
  score?: number;
  challengeCode?: string | null;
}

/** Exported at 2x so downloads and native shares stay crisp. */
const SCALE = 2;
const W = 1200;
const H = 630;

const DISPLAY = '"Fraunces", Georgia, "Times New Roman", serif';
const BODY = '"DM Sans", "Segoe UI", system-ui, sans-serif';

interface Accent {
  /** Pill background and rule color. */
  base: string;
  /** Text drawn on top of `base`. */
  on: string;
  /** Glow behind the record. */
  glow: string;
}

const ACCENTS: Record<GradeId, Accent> = {
  perfection: { base: '#f2d16b', on: '#102018', glow: 'rgba(242, 209, 107, 0.30)' },
  dynasty: { base: '#d4a84b', on: '#102018', glow: 'rgba(212, 168, 75, 0.24)' },
  contender: { base: '#3d8f5a', on: '#faf6ee', glow: 'rgba(61, 143, 90, 0.24)' },
  playoffs: { base: '#5a8fa8', on: '#faf6ee', glow: 'rgba(90, 143, 168, 0.22)' },
  rebuilding: { base: '#6b7c6e', on: '#faf6ee', glow: 'rgba(107, 124, 110, 0.18)' },
};

const LABEL_TO_GRADE: Record<string, GradeId> = {
  PERFECTION: 'perfection',
  DYNASTY: 'dynasty',
  CONTENDER: 'contender',
  PLAYOFFS: 'playoffs',
  REBUILDING: 'rebuilding',
};

export function accentFor(input: Pick<ShareCardInput, 'gradeId' | 'gradeLabel'>): Accent {
  const id = input.gradeId ?? LABEL_TO_GRADE[input.gradeLabel.toUpperCase()] ?? 'rebuilding';
  return ACCENTS[id];
}

type Measure = (text: string) => number;

/** Shrink `text` with an ellipsis until it fits `maxWidth`. */
export function ellipsize(text: string, maxWidth: number, measure: Measure): string {
  if (measure(text) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && measure(`${out}…`) > maxWidth) {
    out = out.slice(0, -1).trimEnd();
  }
  return `${out}…`;
}

/** Wrap `text` to at most `maxLines`, ellipsizing the final line. */
export function wrapLines(
  text: string,
  maxWidth: number,
  measure: Measure,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [''];

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (measure(next) <= maxWidth || !current) {
      current = next;
      continue;
    }
    lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }

  const consumed = lines.join(' ').split(/\s+/).filter(Boolean).length;
  const rest = words.slice(consumed).join(' ');
  lines.push(rest || current);

  return lines
    .slice(0, maxLines)
    .map((line, i) =>
      i === Math.min(lines.length, maxLines) - 1
        ? ellipsize(line, maxWidth, measure)
        : line,
    );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawBackdrop(ctx: CanvasRenderingContext2D, accent: Accent) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#04100a');
  grad.addColorStop(0.5, '#0a2416');
  grad.addColorStop(1, '#14402a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Warm grass light rising from the bottom edge
  const glow = ctx.createRadialGradient(W * 0.5, H * 1.05, 40, W * 0.5, H * 1.05, W * 0.72);
  glow.addColorStop(0, 'rgba(45, 107, 63, 0.55)');
  glow.addColorStop(1, 'rgba(45, 107, 63, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Grade-tinted halo behind the record
  const halo = ctx.createRadialGradient(300, 320, 20, 300, 320, 360);
  halo.addColorStop(0, accent.glow);
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);
}

function drawDiamond(ctx: CanvasRenderingContext2D) {
  const R = 268;
  ctx.save();
  ctx.translate(900, 332);

  ctx.strokeStyle = 'rgba(244, 239, 228, 0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -R);
  ctx.lineTo(R, 0);
  ctx.lineTo(0, R);
  ctx.lineTo(-R, 0);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = 'rgba(196, 120, 74, 0.09)';
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(244, 239, 228, 0.09)';
  for (const [bx, by] of [
    [0, -R],
    [R, 0],
    [0, R],
    [-R, 0],
  ]) {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-9, -9, 18, 18);
    ctx.restore();
  }

  ctx.restore();
}

function drawTexture(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(244, 239, 228, 0.045)';
  for (let y = 0; y < H; y += 4) {
    for (let x = (y / 4) % 2 === 0 ? 0 : 2; x < W; x += 4) {
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawFrame(ctx: CanvasRenderingContext2D, accent: Accent) {
  ctx.strokeStyle = 'rgba(244, 239, 228, 0.16)';
  ctx.lineWidth = 2;
  roundRect(ctx, 24, 24, W - 48, H - 48, 20);
  ctx.stroke();

  // Accent tick in the top-left corner of the frame
  ctx.strokeStyle = accent.base;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(24, 84);
  ctx.lineTo(24, 44);
  ctx.quadraticCurveTo(24, 24, 44, 24);
  ctx.lineTo(84, 24);
  ctx.stroke();
}

function drawEyebrow(ctx: CanvasRenderingContext2D, input: ShareCardInput, accent: Accent) {
  // Wordmark lockup, top left
  ctx.fillStyle = '#faf6ee';
  ctx.font = `800 46px ${DISPLAY}`;
  ctx.fillText('162', 72, 96);
  const brandW = ctx.measureText('162').width;
  ctx.fillStyle = accent.base;
  ctx.fillText('-0', 72 + brandW, 96);

  ctx.save();
  ctx.fillStyle = 'rgba(232, 223, 200, 0.62)';
  ctx.font = `600 15px ${BODY}`;
  ctx.letterSpacing = '0.2em';
  ctx.fillText('MAJOR LEAGUE BASEBALL', 74, 122);
  ctx.restore();

  // Mode chip, top right
  ctx.save();
  ctx.font = `700 20px ${BODY}`;
  ctx.letterSpacing = '0.12em';
  const label = input.modeLabel.toUpperCase();
  const chipW = ctx.measureText(label).width + 44;
  const chipX = W - 72 - chipW;
  ctx.fillStyle = 'rgba(244, 239, 228, 0.10)';
  roundRect(ctx, chipX, 66, chipW, 40, 999);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 239, 228, 0.22)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, chipX, 66, chipW, 40, 999);
  ctx.stroke();
  ctx.fillStyle = '#f4efe4';
  ctx.fillText(label, chipX + 22, 93);
  ctx.restore();

  ctx.strokeStyle = 'rgba(244, 239, 228, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(72, 150);
  ctx.lineTo(W - 72, 150);
  ctx.stroke();

  ctx.strokeStyle = accent.base;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(72, 150);
  ctx.lineTo(180, 150);
  ctx.stroke();
}

function drawHeadline(ctx: CanvasRenderingContext2D, input: ShareCardInput, accent: Accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(232, 223, 200, 0.62)';
  ctx.font = `600 16px ${BODY}`;
  ctx.letterSpacing = '0.18em';
  ctx.fillText('FINAL RECORD', 74, 210);
  ctx.restore();

  const wins = String(input.wins);
  ctx.fillStyle = '#faf6ee';
  ctx.font = `800 140px ${DISPLAY}`;
  ctx.fillText(wins, 72, 330);
  const winsW = ctx.measureText(wins).width;

  ctx.fillStyle = 'rgba(232, 223, 200, 0.5)';
  ctx.font = `700 66px ${DISPLAY}`;
  ctx.fillText(`-${input.losses}`, 72 + winsW + 14, 330);

  // Grade pill
  ctx.font = `700 30px ${DISPLAY}`;
  const pillW = ctx.measureText(input.gradeLabel).width + 60;
  ctx.fillStyle = accent.base;
  roundRect(ctx, 72, 372, pillW, 60, 999);
  ctx.fill();
  ctx.fillStyle = accent.on;
  ctx.textAlign = 'center';
  ctx.fillText(input.gradeLabel, 72 + pillW / 2, 413);
  ctx.textAlign = 'left';

  if (input.score != null) {
    ctx.fillStyle = 'rgba(232, 223, 200, 0.75)';
    ctx.font = `500 22px ${BODY}`;
    ctx.fillText(`Score ${input.score}/1000`, 72 + pillW + 24, 412);
  }
}

function slotsFrom(input: ShareCardInput): ShareCardSlot[] {
  if (input.roster?.length) return input.roster;
  const positions: Position[] = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'SP'];
  return positions.map((position, i) => {
    const name = input.rosterNames[i];
    return { position, name: !name || name === '—' ? null : name };
  });
}

function drawRoster(ctx: CanvasRenderingContext2D, input: ShareCardInput, accent: Accent) {
  const slots = slotsFrom(input).slice(0, 9);

  const gridX = 636;
  const gridY = 168;
  const cellW = 164;
  const cellH = 92;
  const gapX = 14;
  const gapY = 12;

  ctx.fillStyle = '#e8c97a';
  ctx.font = `700 18px ${BODY}`;
  ctx.save();
  ctx.letterSpacing = '0.16em';
  ctx.fillText('STARTING NINE', gridX, 142);
  ctx.restore();

  slots.forEach((slot, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = gridX + col * (cellW + gapX);
    const y = gridY + row * (cellH + gapY);
    const filled = !!slot.name;

    ctx.fillStyle = filled ? 'rgba(4, 16, 10, 0.72)' : 'rgba(4, 16, 10, 0.42)';
    roundRect(ctx, x, y, cellW, cellH, 14);
    ctx.fill();
    ctx.strokeStyle = filled ? 'rgba(212, 168, 75, 0.42)' : 'rgba(244, 239, 228, 0.16)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, cellW, cellH, 14);
    ctx.stroke();

    ctx.fillStyle = filled ? accent.base : 'rgba(232, 223, 200, 0.45)';
    ctx.font = `700 15px ${BODY}`;
    ctx.save();
    ctx.letterSpacing = '0.12em';
    ctx.fillText(slot.position.toUpperCase(), x + 16, y + 30);
    ctx.restore();

    if (!filled) {
      ctx.fillStyle = 'rgba(232, 223, 200, 0.4)';
      ctx.font = `500 19px ${BODY}`;
      ctx.fillText('Open', x + 16, y + 64);
      return;
    }

    ctx.fillStyle = '#f4efe4';
    ctx.font = `700 20px ${BODY}`;
    const measure: Measure = (t) => ctx.measureText(t).width;
    const lines = wrapLines(slot.name!, cellW - 32, measure, 2);
    lines.forEach((text, li) => {
      ctx.fillText(text, x + 16, y + (lines.length === 1 ? 64 : 58 + li * 22));
    });
  });
}

function drawFooter(ctx: CanvasRenderingContext2D, input: ShareCardInput, accent: Accent) {
  if (input.challengeCode) {
    ctx.font = `700 20px ${BODY}`;
    ctx.save();
    ctx.letterSpacing = '0.14em';
    const text = `CODE ${input.challengeCode}`;
    const w = ctx.measureText(text).width + 40;
    ctx.fillStyle = 'rgba(212, 168, 75, 0.16)';
    roundRect(ctx, 72, 458, w, 42, 999);
    ctx.fill();
    ctx.strokeStyle = accent.base;
    ctx.lineWidth = 1.5;
    roundRect(ctx, 72, 458, w, 42, 999);
    ctx.stroke();
    ctx.fillStyle = '#e8c97a';
    ctx.fillText(text, 92, 486);
    ctx.restore();
  }

  ctx.fillStyle = 'rgba(232, 223, 200, 0.72)';
  ctx.font = `600 22px ${BODY}`;
  ctx.fillText('Can you go 162-0?', 72, 582);

  ctx.fillStyle = 'rgba(232, 223, 200, 0.5)';
  ctx.font = `500 20px ${BODY}`;
  ctx.textAlign = 'right';
  ctx.fillText('162-amber.vercel.app', W - 72, 582);
  ctx.textAlign = 'left';
}

export function drawShareCard(input: ShareCardInput): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = 'alphabetic';

  const accent = accentFor(input);
  drawBackdrop(ctx, accent);
  drawDiamond(ctx);
  drawTexture(ctx);
  drawFrame(ctx, accent);
  drawEyebrow(ctx, input, accent);
  drawHeadline(ctx, input, accent);
  drawRoster(ctx, input, accent);
  drawFooter(ctx, input, accent);

  return canvas;
}

export async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to export share card'));
    }, 'image/png');
  });
}

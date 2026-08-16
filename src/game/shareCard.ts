import { POSITIONS, type GradeId, type Position } from '../config/constants';

export interface ShareCardInput {
  wins: number;
  losses: number;
  gradeLabel: string;
  gradeId?: GradeId;
  modeLabel: string;
  rosterNames: string[];
  challengeCode?: string | null;
}

export const SHARE_CARD_WIDTH = 2400;
export const SHARE_CARD_HEIGHT = 1260;

const GRADE_ACCENT: Record<string, string> = {
  PERFECTION: '#f4d27a',
  DYNASTY: '#d4a84b',
  CONTENDER: '#8ec5a3',
  PLAYOFFS: '#7eb6d6',
  REBUILDING: '#c4784a',
};

export function gradeAccent(gradeLabel: string): string {
  return GRADE_ACCENT[gradeLabel] ?? '#d4a84b';
}

export function rosterSlots(names: string[]): { position: Position; name: string }[] {
  return POSITIONS.map((position, i) => ({
    position,
    name: names[i]?.trim() || 'Open',
  }));
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitName(ctx: CanvasRenderingContext2D, name: string, maxWidth: number): string {
  if (ctx.measureText(name).width <= maxWidth) return name;
  let cut = name;
  while (cut.length > 2 && ctx.measureText(`${cut}…`).width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut}…`;
}

export function drawShareCard(input: ShareCardInput): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const accent = gradeAccent(input.gradeLabel);
  const grad = ctx.createLinearGradient(0, 0, 0, SHARE_CARD_HEIGHT);
  grad.addColorStop(0, '#07140d');
  grad.addColorStop(0.55, '#0c2e1a');
  grad.addColorStop(1, '#163820');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  ctx.strokeStyle = 'rgba(244, 239, 228, 0.16)';
  ctx.lineWidth = 8;
  roundRect(ctx, 36, 36, SHARE_CARD_WIDTH - 72, SHARE_CARD_HEIGHT - 72, 28);
  ctx.stroke();

  ctx.save();
  ctx.translate(1980, 820);
  ctx.rotate((-28 * Math.PI) / 180);
  ctx.fillStyle = 'rgba(196, 120, 74, 0.22)';
  ctx.beginPath();
  ctx.moveTo(0, -180);
  ctx.lineTo(180, 0);
  ctx.lineTo(0, 180);
  ctx.lineTo(-180, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = accent;
  ctx.font = '700 44px Fraunces, Georgia, serif';
  ctx.fillText('MAJOR LEAGUE BASEBALL', 120, 140);

  ctx.fillStyle = '#faf6ee';
  ctx.font = '800 168px Fraunces, Georgia, serif';
  ctx.fillText('162-0', 120, 310);

  ctx.fillStyle = '#e8dfc8';
  ctx.font = '600 40px DM Sans, sans-serif';
  ctx.fillText(input.modeLabel, 120, 380);

  ctx.fillStyle = '#faf6ee';
  ctx.font = '800 150px Fraunces, Georgia, serif';
  ctx.fillText(`${input.wins}-${input.losses}`, 120, 540);

  const pillW = 360;
  ctx.fillStyle = accent;
  roundRect(ctx, 120, 580, pillW, 78, 999);
  ctx.fill();
  ctx.fillStyle = '#102018';
  ctx.font = '700 36px Fraunces, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(input.gradeLabel, 120 + pillW / 2, 632);
  ctx.textAlign = 'left';

  if (input.challengeCode) {
    const badge = `CODE ${input.challengeCode}`;
    ctx.font = '700 32px DM Sans, sans-serif';
    const bw = Math.max(280, ctx.measureText(badge).width + 48);
    ctx.fillStyle = 'rgba(16, 32, 24, 0.85)';
    roundRect(ctx, SHARE_CARD_WIDTH - 120 - bw, 110, bw, 64, 999);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    roundRect(ctx, SHARE_CARD_WIDTH - 120 - bw, 110, bw, 64, 999);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.fillText(badge, SHARE_CARD_WIDTH - 120 - bw / 2, 154);
    ctx.textAlign = 'left';
  }

  const slots = rosterSlots(input.rosterNames);
  const gap = 16;
  const gridX = 120;
  const gridY = 720;
  const gridW = SHARE_CARD_WIDTH - 240;
  const cellW = (gridW - gap * 8) / 9;
  const cellH = 220;

  slots.forEach((slot, i) => {
    const x = gridX + i * (cellW + gap);
    ctx.fillStyle = 'rgba(244, 239, 228, 0.06)';
    roundRect(ctx, x, gridY, cellW, cellH, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 239, 228, 0.16)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, gridY, cellW, cellH, 16);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = '700 28px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(slot.position, x + cellW / 2, gridY + 48);

    ctx.fillStyle = slot.name === 'Open' ? 'rgba(244, 239, 228, 0.45)' : '#faf6ee';
    ctx.font = '600 26px DM Sans, sans-serif';
    const lines = wrapName(ctx, slot.name, cellW - 20);
    lines.forEach((line, li) => {
      ctx.fillText(line, x + cellW / 2, gridY + 100 + li * 32);
    });
    ctx.textAlign = 'left';
  });

  ctx.fillStyle = 'rgba(232, 223, 200, 0.65)';
  ctx.font = '500 32px DM Sans, sans-serif';
  ctx.fillText('Can you go 162-0?', 120, 1188);

  return canvas;
}

export function wrapName(
  ctx: CanvasRenderingContext2D,
  name: string,
  maxWidth: number,
): string[] {
  const words = name.split(' ');
  if (words.length === 1) return [fitName(ctx, name, maxWidth)];
  const first = words[0]!;
  const rest = words.slice(1).join(' ');
  if (ctx.measureText(name).width <= maxWidth) return [name];
  return [fitName(ctx, first, maxWidth), fitName(ctx, rest, maxWidth)];
}

export async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to export share card'));
    }, 'image/png');
  });
}

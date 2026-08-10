export interface ShareCardInput {
  wins: number;
  losses: number;
  gradeLabel: string;
  modeLabel: string;
  rosterNames: string[];
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

export function drawShareCard(input: ShareCardInput): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const grad = ctx.createLinearGradient(0, 0, 0, 630);
  grad.addColorStop(0, '#07140d');
  grad.addColorStop(0.55, '#0c2e1a');
  grad.addColorStop(1, '#1a4d2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 630);

  // Clay diamond hint
  ctx.save();
  ctx.translate(980, 420);
  ctx.rotate((-28 * Math.PI) / 180);
  ctx.fillStyle = 'rgba(196, 120, 74, 0.28)';
  ctx.beginPath();
  ctx.moveTo(0, -110);
  ctx.lineTo(110, 0);
  ctx.lineTo(0, 110);
  ctx.lineTo(-110, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Chalk lines
  ctx.strokeStyle = 'rgba(244, 239, 228, 0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 520);
  ctx.lineTo(420, 200);
  ctx.lineTo(760, 520);
  ctx.stroke();

  ctx.fillStyle = '#d4a84b';
  ctx.font = '700 28px Fraunces, Georgia, serif';
  ctx.fillText('MAJOR LEAGUE BASEBALL', 72, 78);

  ctx.fillStyle = '#faf6ee';
  ctx.font = '800 110px Fraunces, Georgia, serif';
  ctx.fillText('162-0', 72, 190);

  ctx.fillStyle = '#e8dfc8';
  ctx.font = '600 28px DM Sans, sans-serif';
  ctx.fillText(input.modeLabel, 72, 240);

  ctx.fillStyle = '#faf6ee';
  ctx.font = '800 96px Fraunces, Georgia, serif';
  ctx.fillText(`${input.wins}-${input.losses}`, 72, 360);

  ctx.fillStyle = '#102018';
  roundRect(ctx, 72, 390, 280, 52, 999);
  ctx.fill();
  ctx.fillStyle = '#d4a84b';
  roundRect(ctx, 72, 390, 280, 52, 999);
  ctx.fill();
  ctx.fillStyle = '#102018';
  ctx.font = '700 26px Fraunces, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(input.gradeLabel, 212, 425);
  ctx.textAlign = 'left';

  const line = input.rosterNames.join('  ·  ');
  ctx.fillStyle = 'rgba(244, 239, 228, 0.88)';
  ctx.font = '500 22px DM Sans, sans-serif';
  const maxWidth = 1050;
  if (ctx.measureText(line).width <= maxWidth) {
    ctx.fillText(line, 72, 520);
  } else {
    const mid = Math.ceil(input.rosterNames.length / 2);
    ctx.fillText(input.rosterNames.slice(0, mid).join('  ·  '), 72, 500);
    ctx.fillText(input.rosterNames.slice(mid).join('  ·  '), 72, 534);
  }

  ctx.fillStyle = 'rgba(232, 223, 200, 0.65)';
  ctx.font = '500 20px DM Sans, sans-serif';
  ctx.fillText('Can you go 162-0?', 72, 590);

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

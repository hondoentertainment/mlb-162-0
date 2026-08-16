import { useEffect, useRef, useState } from 'react';
import type { GradeId } from '../config/constants';
import { canvasToPngBlob, drawShareCard } from '../game/shareCard';

export function ShareCard(props: {
  wins: number;
  losses: number;
  gradeLabel: string;
  gradeId?: GradeId;
  modeLabel: string;
  rosterNames: string[];
  challengeCode?: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const paint = () => {
      if (cancelled) return;
      const canvas = drawShareCard({
        wins: props.wins,
        losses: props.losses,
        gradeLabel: props.gradeLabel,
        gradeId: props.gradeId,
        modeLabel: props.modeLabel,
        rosterNames: props.rosterNames,
        challengeCode: props.challengeCode,
      });
      canvasRef.current = canvas;
      const host = document.getElementById('share-card-preview');
      if (host) {
        host.replaceChildren(canvas);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.borderRadius = '12px';
        canvas.style.display = 'block';
      }
    };
    paint();
    void document.fonts?.ready.then(paint);
    return () => {
      cancelled = true;
    };
  }, [
    props.wins,
    props.losses,
    props.gradeLabel,
    props.gradeId,
    props.modeLabel,
    props.challengeCode,
    props.rosterNames,
  ]);

  const download = async () => {
    const canvas = canvasRef.current ?? drawShareCard(props);
    const blob = await canvasToPngBlob(canvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `162-0-${props.wins}-${props.losses}.png`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Image downloaded.');
  };

  const shareNative = async () => {
    const canvas = canvasRef.current ?? drawShareCard(props);
    const blob = await canvasToPngBlob(canvas);
    const file = new File([blob], `162-0-${props.wins}-${props.losses}.png`, {
      type: 'image/png',
    });
    const text = `162-0 · ${props.wins}-${props.losses} · ${props.gradeLabel}`;
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: '162-0', text, files: [file] });
        setStatus('Shared.');
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: '162-0', text });
        setStatus('Shared text.');
        return;
      }
      await download();
    } catch {
      setStatus(null);
    }
  };

  return (
    <div>
      <div id="share-card-preview" aria-label="Share card preview" />
      <div className="btn-row" style={{ marginTop: '1rem' }}>
        <button type="button" className="btn btn-primary" onClick={shareNative}>
          Share image
        </button>
        <button type="button" className="btn btn-secondary" onClick={download}>
          Download PNG
        </button>
      </div>
      {status && <p className="toast">{status}</p>}
    </div>
  );
}

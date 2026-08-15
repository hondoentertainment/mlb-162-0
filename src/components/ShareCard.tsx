import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  canvasToPngBlob,
  drawShareCard,
  type ShareCardInput,
} from '../game/shareCard';

export function ShareCard(props: ShareCardInput) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const {
    wins,
    losses,
    gradeLabel,
    gradeId,
    modeLabel,
    rosterNames,
    roster,
    score,
    challengeCode,
  } = props;

  const input: ShareCardInput = useMemo(
    () => ({
      wins,
      losses,
      gradeLabel,
      gradeId,
      modeLabel,
      rosterNames,
      roster,
      score,
      challengeCode,
    }),
    [wins, losses, gradeLabel, gradeId, modeLabel, rosterNames, roster, score, challengeCode],
  );

  useEffect(() => {
    let cancelled = false;

    const render = () => {
      if (cancelled) return;
      const canvas = drawShareCard(input);
      canvasRef.current = canvas;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      hostRef.current?.replaceChildren(canvas);
    };

    render();
    // Webfonts often resolve after first paint; redraw once they are ready.
    void document.fonts?.ready.then(render);

    return () => {
      cancelled = true;
    };
  }, [input]);

  const fileName = `162-0-${wins}-${losses}.png`;

  const download = useCallback(async () => {
    const canvas = canvasRef.current ?? drawShareCard(input);
    const blob = await canvasToPngBlob(canvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Image downloaded.');
  }, [fileName, input]);

  const shareNative = useCallback(async () => {
    const canvas = canvasRef.current ?? drawShareCard(input);
    const blob = await canvasToPngBlob(canvas);
    const file = new File([blob], fileName, { type: 'image/png' });
    const text = `162-0 · ${wins}-${losses} · ${gradeLabel}`;
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
  }, [download, fileName, gradeLabel, input, losses, wins]);

  return (
    <div>
      <div
        id="share-card-preview"
        ref={hostRef}
        aria-label="Share card preview"
        data-testid="share-card-preview"
      />
      <div className="btn-row" style={{ marginTop: '1rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          data-testid="share-image"
          onClick={shareNative}
        >
          Share image
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          data-testid="download-png"
          onClick={download}
        >
          Download PNG
        </button>
      </div>
      {status && <p className="toast">{status}</p>}
    </div>
  );
}

import type { ReactNode } from 'react';

export type BoardStateKind = 'loading' | 'empty' | 'offline';

/** Designed placeholder for a leaderboard with nothing to list yet. */
export function BoardState({
  kind,
  title,
  body,
  children,
  testId = 'board-state',
}: {
  kind: BoardStateKind;
  title: string;
  body: string;
  children?: ReactNode;
  testId?: string;
}) {
  const glyph = kind === 'offline' ? '!' : kind === 'loading' ? '…' : '◆';
  return (
    <div
      className={`board-state ${kind}`}
      role="status"
      aria-live="polite"
      data-testid={testId}
      data-kind={kind}
    >
      <div className="board-state-glyph" aria-hidden="true">
        {glyph}
      </div>
      <h3 className="board-state-title">{title}</h3>
      <p className="board-state-body">{body}</p>
      {children && <div className="btn-row">{children}</div>}
    </div>
  );
}

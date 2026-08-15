/** @jsxImportSource react */
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const CODE_RE = /^[A-Z0-9]{4,10}$/;

const COLORS = {
  night: '#04100a',
  mid: '#0a2416',
  grass: '#14402a',
  ivory: '#faf6ee',
  cream: '#e8dfc8',
  gold: '#d4a84b',
  goldSoft: '#e8c97a',
  ink: '#102018',
};

export function OgCard({ code }: { code?: string | null }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '64px 72px',
        backgroundColor: COLORS.mid,
        backgroundImage: `linear-gradient(160deg, ${COLORS.night} 0%, ${COLORS.mid} 55%, ${COLORS.grass} 100%)`,
        color: COLORS.ivory,
        fontFamily: 'sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontSize: 46, fontWeight: 800, letterSpacing: '-0.03em' }}>
          <span>162</span>
          <span style={{ color: COLORS.gold }}>-0</span>
        </div>
        <div
          style={{
            display: 'flex',
            marginLeft: 24,
            paddingTop: 8,
            fontSize: 17,
            letterSpacing: '0.2em',
            color: 'rgba(232, 223, 200, 0.65)',
          }}
        >
          MAJOR LEAGUE BASEBALL
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {code ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                letterSpacing: '0.18em',
                color: COLORS.goldSoft,
                marginBottom: 18,
              }}
            >
              CHALLENGE INVITE
            </div>
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                padding: '18px 40px',
                borderRadius: 999,
                backgroundColor: COLORS.gold,
                color: COLORS.ink,
                fontSize: 68,
                fontWeight: 800,
                letterSpacing: '0.06em',
              }}
            >
              {code}
            </div>
            <div style={{ display: 'flex', marginTop: 28, fontSize: 34, color: COLORS.cream }}>
              Same spins for everyone. No skips. Can you beat their nine?
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 66, fontWeight: 800, lineHeight: 1.1 }}>
              Draft legends.
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 66,
                fontWeight: 800,
                lineHeight: 1.1,
                color: COLORS.goldSoft,
              }}
            >
              Chase a perfect season.
            </div>
            <div style={{ display: 'flex', marginTop: 26, fontSize: 32, color: COLORS.cream }}>
              Spin a franchise and decade, fill nine positions, go 162-0.
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', fontSize: 24, color: 'rgba(232, 223, 200, 0.75)' }}>
          C · 1B · 2B · 3B · SS · LF · CF · RF · SP
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: 'rgba(232, 223, 200, 0.5)' }}>
          162-amber.vercel.app
        </div>
      </div>
    </div>
  );
}

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get('c') ?? '').toUpperCase();
  const code = CODE_RE.test(raw) ? raw : null;

  return new ImageResponse(<OgCard code={code} />, {
    width: 1200,
    height: 630,
    headers: {
      'cache-control': 'public, immutable, no-transform, max-age=86400',
    },
  });
}

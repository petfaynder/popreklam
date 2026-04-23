/**
 * opengraph-image.js — Auto-generated Open Graph image for the homepage.
 * Next.js serves this as /opengraph-image.png (1200x630).
 * Each page's layout.js can override with its own opengraph-image file.
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MrPop.io — Premium Popunder & Push Ad Network';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.03) 59px, rgba(255,255,255,0.03) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.03) 59px, rgba(255,255,255,0.03) 60px)',
          }}
        />

        {/* Accent glow top-left */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,51,102,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Accent glow bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,51,102,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background: '#FF3366',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 80px',
            gap: 0,
          }}
        >
          {/* Logo / Name */}
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              letterSpacing: '-4px',
              color: '#ffffff',
              lineHeight: 1,
              marginBottom: 16,
              display: 'flex',
            }}
          >
            Mr
            <span style={{ color: '#FF3366' }}>Pop</span>
            .io
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 30,
              color: '#888888',
              fontWeight: 500,
              letterSpacing: '0px',
              marginBottom: 40,
              display: 'flex',
            }}
          >
            Premium Popunder & Push Ad Network
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: 48,
              alignItems: 'center',
            }}
          >
            {[
              { value: '10,000+', label: 'Publishers' },
              { value: '$8 CPM', label: 'Max Earnings' },
              { value: 'Weekly', label: 'Payouts' },
              { value: '100%', label: 'Fill Rate' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: '#FF3366',
                    letterSpacing: '-1px',
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: '#555555',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 48,
            fontSize: 16,
            color: '#333333',
            fontWeight: 700,
            letterSpacing: '1px',
            display: 'flex',
          }}
        >
          mrpop.io
        </div>
      </div>
    ),
    { ...size }
  );
}

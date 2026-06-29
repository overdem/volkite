import { useTranslations } from 'next-intl';
import type { WindData } from '@/lib/openmeteo';

interface HeroProps {
  wind: WindData | null;
}

export default function Hero({ wind }: HeroProps) {
  const t = useTranslations('hero');

  return (
    <header
      id="top"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        background: '#062131',
      }}
    >
      {/* Background with Ken Burns */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #062131 0%, #07283b 50%, #0c3346 100%)',
          animation: 'kenburns 18s ease-in-out infinite alternate',
        }}
      />
      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg,rgba(6,33,49,.55) 0%,rgba(6,33,49,.25) 35%,rgba(6,33,49,.85) 100%)',
        }}
      />

      {/* Live wind chip */}
      <div
        style={{
          position: 'absolute',
          top: '96px',
          right: 'clamp(20px,5vw,72px)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(6,33,49,.55)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,.16)',
          borderRadius: '999px',
          padding: '9px 16px',
          color: '#dceaf0',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '.04em',
        }}
        role="status"
        aria-label="Live wind speed"
      >
        <span
          style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: '#3ee07a',
            animation: 'pulse-dot 1.6s infinite',
            flexShrink: 0,
          }}
        />
        <span style={{ opacity: 0.7 }}>{t('liveNow')}</span>
        <span
          style={{
            color: '#14b8cf',
            fontFamily: 'Anton, Impact, sans-serif',
            fontSize: '16px',
            letterSpacing: '.02em',
          }}
        >
          {wind ? `${wind.speed} kn` : '— kn'}
        </span>
        {wind && (
          <span style={{ opacity: 0.7 }}>{wind.dir}</span>
        )}
      </div>

      {/* Hero content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '0 clamp(20px,5vw,72px) clamp(56px,7vw,96px)',
          maxWidth: '1080px',
        }}
      >
        {/* Kicker */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            color: '#14b8cf',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '.22em',
            marginBottom: '22px',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{ width: '28px', height: '2px', background: '#14b8cf', flexShrink: 0 }}
          />
          {t('kicker')}
        </div>

        {/* H1 */}
        <h1
          style={{
            fontFamily: 'Anton, Impact, sans-serif',
            color: '#fbf6ec',
            fontSize: 'clamp(54px,11vw,150px)',
            lineHeight: 0.9,
            letterSpacing: '.01em',
            textShadow: '0 6px 40px rgba(0,0,0,.4)',
          }}
        >
          {t('title')}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: '#dceaf0',
            fontSize: 'clamp(16px,2vw,21px)',
            fontWeight: 500,
            maxWidth: '560px',
            margin: '26px 0 34px',
            lineHeight: 1.5,
          }}
        >
          {t('sub')}
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <a
            href="#rezervasyon"
            style={{
              background: '#ff6a3d',
              color: '#fff',
              fontFamily: 'Manrope, system-ui, sans-serif',
              fontWeight: 800,
              fontSize: '16px',
              padding: '16px 30px',
              borderRadius: '12px',
              boxShadow: '0 14px 34px -10px rgba(255,106,61,.7)',
              textDecoration: 'none',
            }}
          >
            {t('btn1')}
          </a>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.28)',
              color: '#fbf6ec',
              fontFamily: 'Manrope, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: '15px',
              padding: '14px 22px',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#14b8cf',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderLeft: '10px solid #06222f',
                  marginLeft: '3px',
                }}
              />
            </span>
            {t('btn2')}
          </button>
        </div>
      </div>
    </header>
  );
}

import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('site');

  return (
    <main
      style={{ background: 'var(--cream)', minHeight: '100vh' }}
      className="flex flex-col items-center justify-center gap-6 p-8"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          className="font-display text-on-dark"
          style={{
            fontSize: 'clamp(48px, 10vw, 120px)',
            lineHeight: 0.95,
            color: 'var(--ink)',
          }}
        >
          volkite
        </span>

        <p
          className="font-body"
          style={{
            color: 'var(--on-light-soft)',
            fontSize: '18px',
            maxWidth: '480px',
          }}
        >
          {t('description')}
        </p>

        <span
          style={{
            background: 'var(--cyan)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.08em',
            padding: '6px 16px',
            borderRadius: '999px',
          }}
        >
          {t('phase')}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '16px',
        }}
      >
        {(['tr', 'en', 'bg', 'ro'] as const).map((loc) => (
          <a
            key={loc}
            href={loc === 'tr' ? '/' : `/${loc}`}
            style={{
              background: 'var(--surface)',
              color: 'var(--on-dark)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '13px',
              padding: '6px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            {loc.toUpperCase()}
          </a>
        ))}
      </div>
    </main>
  );
}

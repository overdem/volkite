'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Booking() {
  const t = useTranslations('booking');
  const [form, setForm] = useState({ fname: '', lname: '', email: '', msg: '' });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    setBusy(false);
  }

  return (
    <section id="rezervasyon" style={{ background: '#fbf6ec', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,72px)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(40px,6vw,80px)', alignItems: 'start' }}>
        <div>
          <div style={{ color: '#14b8cf', fontWeight: 800, fontSize: '13px', letterSpacing: '.22em', marginBottom: '16px', textTransform: 'uppercase' }}>
            {t('kicker')}
          </div>
          <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 'clamp(34px,4.5vw,56px)', lineHeight: .98, color: '#07283b', marginBottom: '18px' }}>
            {t('title')}
          </h2>
          <p style={{ fontSize: '17px', lineHeight: 1.65, color: '#3a5563', marginBottom: '32px' }}>{t('sub')}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.18em', color: '#14b8cf', textTransform: 'uppercase', marginBottom: '6px' }}>{t('phone')}</div>
              <a href="tel:+905326101011" style={{ fontSize: '20px', fontWeight: 800, color: '#07283b', textDecoration: 'none' }}>+90 532 610 10 11</a>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.18em', color: '#14b8cf', textTransform: 'uppercase', marginBottom: '6px' }}>{t('address')}</div>
              <p style={{ fontSize: '15px', color: '#3a5563', lineHeight: 1.5, margin: 0 }}>Kefaloz Koyu, Gökçeada<br />Çanakkale, Türkiye</p>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', padding: 'clamp(28px,4vw,44px)', boxShadow: '0 4px 40px rgba(7,40,59,.08)' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤙</div>
              <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: '28px', color: '#07283b', marginBottom: '12px' }}>{t('thanksTitle')}</h3>
              <p style={{ color: '#3a5563', fontSize: '16px', lineHeight: 1.6 }}>{t('thanksBody')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5a7079', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.1em' }}>{t('fName')}</label>
                  <input
                    type="text"
                    required
                    value={form.fname}
                    onChange={(e) => setForm({ ...form, fname: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #ece1cc', borderRadius: '10px', fontSize: '15px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#07283b', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5a7079', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.1em' }}>{t('fSurname')}</label>
                  <input
                    type="text"
                    required
                    value={form.lname}
                    onChange={(e) => setForm({ ...form, lname: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #ece1cc', borderRadius: '10px', fontSize: '15px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#07283b', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5a7079', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.1em' }}>{t('fEmail')}</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #ece1cc', borderRadius: '10px', fontSize: '15px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#07283b', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5a7079', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.1em' }}>{t('fMsg')}</label>
                <textarea
                  rows={4}
                  value={form.msg}
                  onChange={(e) => setForm({ ...form, msg: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #ece1cc', borderRadius: '10px', fontSize: '15px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#07283b', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                style={{ background: busy ? '#9fc0cf' : '#07283b', color: '#fbf6ec', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 800, fontFamily: 'Manrope, system-ui, sans-serif', cursor: busy ? 'not-allowed' : 'pointer', transition: 'background .2s' }}
              >
                {busy ? '...' : t('fSend')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

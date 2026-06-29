'use client';

import { useState, useTransition } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function OgrenciLoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/ogrenci`,
        },
      });
      if (err) setError(err.message);
      else setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#062131]">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-xl font-bold text-white mb-2">E-postanı kontrol et</h1>
          <p className="text-[#9fc0cf] text-sm">
            <strong className="text-white">{email}</strong> adresine giriş bağlantısı gönderdik.
            Bağlantıya tıklayınca portalına yönlendirileceksin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#062131]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display text-3xl tracking-widest text-[#14b8cf]">VOLKITE</span>
          <p className="text-[#9fc0cf] text-sm mt-1">Öğrenci Portalı</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0c3346] rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs text-[#9fc0cf] mb-1.5">E-posta adresin</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ornek@email.com"
              className="w-full bg-[#07283b] border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#14b8cf] transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#14b8cf] text-[#062131] font-bold py-2.5 rounded-lg text-sm hover:bg-[#0fa3b8] transition-colors disabled:opacity-60"
          >
            {pending ? 'Gönderiliyor…' : 'Giriş Bağlantısı Gönder'}
          </button>

          <p className="text-xs text-center text-[#5a7079]">
            Şifre yok — e-postana tek kullanımlık bağlantı gönderilir.
          </p>
        </form>
      </div>
    </div>
  );
}

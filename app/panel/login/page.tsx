'use client';

import { useState, useTransition } from 'react';
import { login } from '../actions';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#062131]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display text-3xl tracking-widest text-[#14b8cf]">VOLKITE</span>
          <p className="text-[#9fc0cf] text-sm mt-1">Hoca Paneli</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0c3346] rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs text-[#9fc0cf] mb-1.5">E-posta</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-[#07283b] border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#14b8cf] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#9fc0cf] mb-1.5">Şifre</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
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
            {pending ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}

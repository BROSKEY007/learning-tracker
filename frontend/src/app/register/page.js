'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      const result = await api('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      const token = result.token || result.data?.token;
      if (!token) throw new Error('Login response has no token');
      setToken(token);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Start tracking what you learn every day.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
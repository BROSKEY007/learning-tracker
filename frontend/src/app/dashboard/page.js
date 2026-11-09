'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken, clearToken } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    api('/auth/me')
      .then((res) => setUser(res.data?.user || res.data || res.user))
      .catch(() => {
        clearToken();
        router.replace('/login');
      });
  }, [router]);

  function handleLogout() {
    clearToken();
    router.replace('/login');
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center text-slate-500">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-indigo-600">Learning Tracker</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            What did you learn today?
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            The entry form and your date-wise cards come in the next class.
          </p>
        </div>
      </section>
    </main>
  );
}
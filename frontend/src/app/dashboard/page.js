'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken, clearToken } from '@/lib/auth';
import EntryForm from '@/components/EntryForm';
import EntryCard from '@/components/EntryCard';

function groupByDate(entries) {
  const groups = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.date === entry.entry_date) {
      last.items.push(entry);
    } else {
      groups.push({ date: entry.entry_date, items: [entry] });
    }
  }
  return groups;
}

function formatDate(dateStr) {
  const today = new Date().toLocaleDateString('en-CA');
  const pretty = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return dateStr === today ? `Today · ${pretty}` : pretty;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [pageError, setPageError] = useState('');

  function handleApiError(err) {
    if (err.status === 401) {
      clearToken();
      router.replace('/login');
    } else {
      setPageError(err.message);
    }
  }

  async function refreshEntries() {
    try {
      const res = await api('/entries');
      setEntries(res.data);
    } catch (err) {
      handleApiError(err);
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    async function init() {
      try {
        const me = await api('/auth/me');
        setUser(me.data?.user || me.data || me.user);
        const list = await api('/entries');
        setEntries(list.data);
      } catch (err) {
        if (err.status === 401) {
          clearToken();
          router.replace('/login');
        } else {
          setPageError(err.message);
        }
      }
    }
    init();
  }, [router]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this entry and its images?')) return;
    try {
      await api(`/entries/${id}`, { method: 'DELETE' });
      setEntries((current) => current.filter((e) => e.id !== id));
    } catch (err) {
      handleApiError(err);
    }
  }

  function handleLogout() {
    clearToken();
    router.replace('/login');
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-slate-500">
        {pageError || 'Loading...'}
      </main>
    );
  }

  const groups = groupByDate(entries);

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
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

      <section className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <EntryForm onCreated={refreshEntries} />

        {pageError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {pageError}
          </p>
        )}

        {groups.length === 0 ? (
          <p className="text-center text-slate-500">
            No entries yet. Write what you learned today!
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.date}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {formatDate(group.date)}
              </h2>
              <div className="space-y-4">
                {group.items.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
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
  const [loaded, setLoaded] = useState(false);
  const [pageError, setPageError] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  function reload() {
    setReloadKey((k) => k + 1);
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    api('/auth/me')
      .then((me) => setUser(me.data?.user || me.data || me.user))
      .catch((err) => {
        if (err.status === 401) {
          clearToken();
          router.replace('/login');
        } else {
          setPageError(err.message);
        }
      });
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!getToken()) return;
    let ignore = false;

    async function load() {
      try {
        const path = query
          ? `/entries?search=${encodeURIComponent(query)}`
          : '/entries';
        const res = await api(path);
        if (ignore) return;
        setEntries(res.data);
        setPageError('');
        setLoaded(true);
      } catch (err) {
        if (ignore) return;
        if (err.status === 401) {
          clearToken();
          router.replace('/login');
        } else {
          setPageError(err.message);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [router, query, reloadKey]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this entry and its images?')) return;
    try {
      await api(`/entries/${id}`, { method: 'DELETE' });
      setEntries((current) => current.filter((e) => e.id !== id));
    } catch (err) {
      if (err.status === 401) {
        clearToken();
        router.replace('/login');
      } else {
        setPageError(err.message);
      }
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
      <header className="sticky top-0 z-10 bg-white shadow-sm">
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
        <EntryForm onCreated={reload} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Your entries</h2>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics and notes..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-72"
          />
        </div>

        {pageError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {pageError}
          </p>
        )}

        {!loaded ? (
          <p className="text-center text-slate-500">Loading entries...</p>
        ) : groups.length === 0 ? (
          <p className="text-center text-slate-500">
            {query
              ? `No entries match "${query}"`
              : 'No entries yet. Write what you learned today!'}
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
                    onChanged={reload}
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
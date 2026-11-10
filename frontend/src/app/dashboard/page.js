'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken, clearToken } from '@/lib/auth';
import EntryForm from '@/components/EntryForm';
import EntryCard from '@/components/EntryCard';
import WorkspaceShell from '@/components/WorkspaceShell';
import { useConfirm } from '@/components/ConfirmationProvider';
import Link from 'next/link';
import Icon from '@/components/Icon';

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

export default function DashboardPage({ mode = 'browse' }) {
  const writing = mode === 'write';
  const confirm = useConfirm();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [pageError, setPageError] = useState('');
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('all');
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
    if (!(await confirm({ title: 'Delete this journal?', description: 'This journal and its images will be permanently deleted. This cannot be undone.', subject: entries.find(entry => entry.id === id)?.topic, confirmLabel: 'Delete journal' }))) return;
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
      <main className="loading-page" role="status">
        {pageError || 'Loading...'}
      </main>
    );
  }

  const filteredEntries = entries.filter(entry => month === 'all' || entry.entry_date.slice(5, 7) === month);
  const groups = groupByDate(filteredEntries);

  return (
    <WorkspaceShell user={user} writing={writing} onLogout={handleLogout}>
      <div className="page-heading journal-heading">
        <div><h1>{writing ? 'A new discovery' : 'Learning journal'}</h1><p>{writing ? 'Write it down. Come back to it. Make it yours.' : 'Your notes, ideas, and small breakthroughs. All in one place.'}</p></div>
        <div className="heading-actions">{!writing && <Link className="primary-button" href="/dashboard/write"><Icon name="plus" size={16}/>New journal</Link>}</div>
      </div>
      {writing ? <section className="journal-body write-view"><EntryForm onCreated={() => { reload(); router.push('/dashboard'); }} /></section> : <section className="journal-body browse-view">
        <div className="entries-heading" id="entries">
          <h2>Entries <span className="count-badge">{filteredEntries.length}</span></h2>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics and notes..."
            className="entry-search" aria-label="Search topics and notes"
          />
        </div>

        <div className="month-filter" role="group" aria-label="Filter journals by month">
          <button type="button" aria-pressed={month === 'all'} onClick={() => setMonth('all')}>All</button>
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((label, index) => { const value = String(index + 1).padStart(2, '0'); return <button type="button" key={label} aria-pressed={month === value} onClick={() => setMonth(value)}>{label}</button>; })}
        </div>
        {pageError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {pageError}
          </p>
        )}

        {!loaded ? (
          <p className="text-center text-slate-500">Loading entries...</p>
        ) : groups.length === 0 ? (
          <p className="empty-state">
            {query || month !== 'all'
              ? 'No journals match these filters. Try another month or search.'
              : 'No journals yet. Choose Write journal in the sidebar to share what you learned.'}
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.date} className="timeline-row">
              <h2 className="timeline-date">
                {formatDate(group.date)}
              </h2>
              <div className="timeline-cards">
                {group.items.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    author={user.name}
                    onDelete={handleDelete}
                    onChanged={reload}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>}
    </WorkspaceShell>
  );
}
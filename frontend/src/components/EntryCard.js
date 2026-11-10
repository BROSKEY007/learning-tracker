'use client';

import { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import JournalCardContent from './JournalCardContent';
import Icon from './Icon';
import { useConfirm } from './ConfirmationProvider';
import { api } from '@/lib/api';
import { MAX_FILES, checkImages } from '@/lib/images';

export default function EntryCard({ entry, author, onDelete, onChanged }) {
  const cardRef = useRef(null);
  const confirm = useConfirm();
  useLayoutEffect(() => {
    if (!cardRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced') return;
    const context = gsap.context(() => {
      gsap.fromTo(cardRef.current, { y: 16, opacity: 0.5, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: document.documentElement.dataset.motion === 'fast' ? 0.18 : 0.38, ease: 'power3.out', clearProps: 'all' });
    });
    return () => context.revert();
  }, []);
  const [editing, setEditing] = useState(false);
  const [topic, setTopic] = useState(entry.topic);
  const [notes, setNotes] = useState(entry.notes || '');
  const [date, setDate] = useState(entry.entry_date);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function startEdit() {
    setTopic(entry.topic);
    setNotes(entry.notes || '');
    setDate(entry.entry_date);
    setError('');
    setEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api(`/entries/${entry.id}`, {
        method: 'PUT',
        body: { topic, notes, entry_date: date },
      });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveImage(imageId) {
    if (!(await confirm({ title: 'Remove this image?', description: 'This image will be removed from your journal. Your notes and other images will stay.', subject: entry.topic, confirmLabel: 'Remove image' }))) return;
    setBusy(true);
    setError('');
    try {
      await api(`/entries/${entry.id}/images/${imageId}`, { method: 'DELETE' });
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAddImages(e) {
    const picked = Array.from(e.target.files);
    e.target.value = '';
    if (picked.length === 0) return;

    const problem = checkImages(entry.images.length, picked);
    if (problem) return setError(problem);

    setBusy(true);
    setError('');
    try {
      const formData = new FormData();
      picked.forEach((f) => formData.append('images', f));
      await api(`/entries/${entry.id}/images`, { method: 'POST', formData });
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="journal-entry editing-entry space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Topic</label>
          <input
            type="text"
            required
            maxLength={150}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Notes / details
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">Images</p>
          <p className="text-xs text-slate-400">
            Images are added or removed right away.
          </p>

          {entry.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {entry.images.map((img) => (
                <div key={img.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="h-20 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRemoveImage(img.id)}
                    aria-label="Remove image"
                    className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-red-500 text-xs text-white disabled:opacity-60"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {entry.images.length < MAX_FILES && (
            <label className="mt-2 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-3 py-3 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600">
              + Add images
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                disabled={busy}
                onChange={handleAddImages}
                className="hidden"
              />
            </label>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? 'Working...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex-1 rounded-lg border border-slate-300 py-2 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return <article ref={cardRef} className={`journal-entry journal-styled-card card-tone-${String(entry.id).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4}`}>
    <JournalCardContent entry={entry} author={author} actions={<>
      <button type="button" onClick={startEdit} className="journal-edit" aria-label={`Edit ${entry.topic}`}><Icon name="edit" size={15}/>Edit</button>
      <button type="button" onClick={() => onDelete(entry.id)} className="journal-delete" aria-label={`Delete ${entry.topic}`}><Icon name="trash" size={15}/>Delete</button>
    </>} />
  </article>;
}

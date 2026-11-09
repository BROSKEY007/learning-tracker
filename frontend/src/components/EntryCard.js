'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { MAX_FILES, checkImages } from '@/lib/images';

export default function EntryCard({ entry, onDelete, onChanged }) {
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
    if (!window.confirm('Remove this image?')) return;
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
        className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-2 ring-indigo-200"
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
                    className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-red-500 text-xs text-white disabled:opacity-60"
                  >
                    ×
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

  const single = entry.images.length === 1;

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="break-words text-lg font-semibold text-slate-800">
          {entry.topic}
        </h3>
        <div className="flex shrink-0 gap-3 text-sm">
          <button
            onClick={startEdit}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {entry.notes && (
        <p className="mt-2 whitespace-pre-wrap break-words text-slate-600">
          {entry.notes}
        </p>
      )}

      {entry.images.length > 0 && (
        <div
          className={`mt-4 grid gap-2 ${
            single ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'
          }`}
        >
          {entry.images.map((img) => (
            <a key={img.id} href={img.url} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className={`w-full rounded-lg object-cover ${
                  single ? 'max-h-72' : 'h-32'
                }`}
              />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
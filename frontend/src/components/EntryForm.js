'use client';

import { useState, useMemo, useEffect } from 'react';
import { api } from '@/lib/api';

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function todayString() {
  return new Date().toLocaleDateString('en-CA');
}

export default function EntryForm({ onCreated }) {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(todayString());
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const previews = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files]
  );

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  function handleFiles(e) {
    const picked = Array.from(e.target.files);
    e.target.value = '';
    setError('');

    const all = [...files, ...picked];
    if (all.length > MAX_FILES) {
      return setError(`You can add up to ${MAX_FILES} images`);
    }
    if (picked.some((f) => !TYPES.includes(f.type))) {
      return setError('Only JPG, PNG, WEBP or GIF images are allowed');
    }
    if (picked.some((f) => f.size > MAX_SIZE)) {
      return setError('Each image must be 5MB or smaller');
    }
    setFiles(all);
  }

  function removeFile(index) {
    setFiles(files.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api('/entries', {
        method: 'POST',
        body: { topic, notes, entry_date: date },
      });

      let imageError = '';
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((f) => formData.append('images', f));
        try {
          await api(`/entries/${res.data.id}/images`, {
            method: 'POST',
            formData,
          });
        } catch (err) {
          imageError = err.message;
        }
      }

      setTopic('');
      setNotes('');
      setDate(todayString());
      setFiles([]);
      if (imageError) {
        setError(`Entry saved, but the images failed: ${imageError}`);
      }
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-800">
        What did you learn today?
      </h2>

      <div>
        <label className="block text-sm font-medium text-slate-700">Topic</label>
        <input
          type="text"
          required
          maxLength={150}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. PostgreSQL JOINs"
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
          placeholder="Write what you understood..."
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
        <p className="text-sm font-medium text-slate-700">
          Images (optional, up to {MAX_FILES})
        </p>
        <label className="mt-1 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600">
          + Add images
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
        </label>

        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map((src, i) => (
              <div key={src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-20 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-red-500 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
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
        {loading ? 'Saving...' : 'Save entry'}
      </button>
    </form>
  );
}
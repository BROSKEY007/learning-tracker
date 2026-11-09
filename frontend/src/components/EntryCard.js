export default function EntryCard({ entry, onDelete }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="break-words text-lg font-semibold text-slate-800">
          {entry.topic}
        </h3>
        <button
          onClick={() => onDelete(entry.id)}
          className="shrink-0 text-sm text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>

      {entry.notes && (
        <p className="mt-2 whitespace-pre-wrap break-words text-slate-600">
          {entry.notes}
        </p>
      )}

      {entry.images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {entry.images.map((img) => (
            <a key={img.id} href={img.url} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-32 w-full rounded-lg object-cover"
              />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
import Icon from './Icon';

export default function JournalCardContent({ entry, author, actions, preview = false }) {
  const images = entry.images || [];
  const date = new Date(`${entry.entry_date.slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return <>
    <div className="journal-card-meta"><span className="journal-kind">Learning note</span><time dateTime={entry.entry_date}>{date}</time></div>
    <div className={'journal-media ' + (images.length ? 'has-images' : 'no-images')}>
      {images.length ? images.map(image => preview ? <span key={image.id}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt="" />
      </span> : <a key={image.id} href={image.url} target="_blank" rel="noreferrer" aria-label={`Open image for ${entry.topic}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt={`Screenshot for ${entry.topic}`} />
      </a>) : <span className="journal-thumbnail"><Icon name="book" size={34}/></span>}
    </div>
    <div className="journal-copy"><h3>{entry.topic}</h3>{entry.notes && <p>{entry.notes}</p>}</div>
    <div className="journal-card-footer"><span className="journal-owner"><span className="journal-owner-avatar">{(author || 'J').slice(0, 1).toUpperCase()}</span>{author || 'My journal'}</span>{actions && <div className="journal-actions">{actions}</div>}</div>
  </>;
}

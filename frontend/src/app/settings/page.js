'use client';
import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { applyAppearance, normalizeTheme, THEME_PRESETS } from '@/lib/appearance';
import WorkspaceShell from '@/components/WorkspaceShell';
import Icon from '@/components/Icon';
import Link from 'next/link';
import JournalCardContent from '@/components/JournalCardContent';
const cardStyles = [{ id: 'classic', name: 'Classic', description: 'Give every idea room to breathe.' }, { id: 'inbox', name: 'Inbox', description: 'More notes. Less scrolling.' }, { id: 'image', name: 'Visual', description: 'Put your screenshots in focus.' }];
const sampleEntry = { topic: 'JOINs finally clicked.', notes: 'INNER JOIN keeps the matches. LEFT JOIN keeps every row on the left. That one distinction made it all make sense.', entry_date: '2026-11-10', images: [] };
export default function SettingsPage() {
  const [settings, setSettings] = useState({ theme: 'black', accent: 'blue', motion: 'normal', cardStyle: 'classic' });
  const [saved, setSaved] = useState(false);
  const previewRoot = useRef(null);
  const previewTween = useRef(null);
  useEffect(() => () => previewTween.current?.kill(), []);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('lt_appearance') || 'null');
      // Synchronize this form with browser-owned preferences after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setSettings(current => ({ ...current, ...stored, theme: normalizeTheme(stored.theme) }));
    } catch { /* Default preferences remain available. */ }
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => applyAppearance(settings);
    apply(); media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [settings]);
  function update(key, value) {
    const next = { ...settings, [key]: value }; setSettings(next);
    if (key === 'cardStyle' && previewRoot.current && next.motion !== 'reduced' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const target = previewRoot.current.querySelector('.card-sample-' + value + ' .journal-styled-card');
      previewTween.current?.kill();
      if (target) previewTween.current = gsap.fromTo(target, { scale: 0.94, y: 8 }, { scale: 1, y: 0, duration: next.motion === 'fast' ? 0.16 : 0.3, ease: 'power3.out', clearProps: 'transform', overwrite: true });
    }
    applyAppearance(next);
    try { localStorage.setItem('lt_appearance', JSON.stringify(next)); setSaved(true); } catch { setSaved(false); }
  }
  return <WorkspaceShell settings>
    <div className="page-heading settings-heading"><div><h1>Appearance</h1><p>A workspace that feels like you.</p></div><Link className="settings-back" href="/dashboard">View your journal <Icon name="arrow" size={16}/></Link></div>
    <section className="settings-section" id="journal-cards">
      <div className="setting-section-heading"><div><h2>Journal layout</h2><p>Choose how your stories show up.</p></div><span className="preview-disclosure">Sample journal entries</span></div>
      <div className="card-style-options" ref={previewRoot} role="group" aria-label="Journal card style">
        {cardStyles.map(style => <button key={style.id} type="button" className={'card-style-option ' + (settings.cardStyle === style.id ? 'is-selected' : '')} aria-label={style.name + ' journal layout'} aria-pressed={settings.cardStyle === style.id} onClick={() => update('cardStyle', style.id)}>
          <span className={'card-style-sample card-sample-' + style.id} aria-hidden="true"><span className="journal-styled-card"><JournalCardContent preview entry={style.id === 'image' ? { ...sampleEntry, images: [{ id: 'preview', url: '/journal-preview.svg' }] } : sampleEntry} author="You" /></span></span>
          <span className="card-option-title">{style.name}{settings.cardStyle === style.id && <span className="selected-style-mark"><Icon name="check" size={13}/>Selected</span>}</span><span className="card-option-description">{style.description}</span>
        </button>)}
      </div>
    </section>
    <section className="settings-section" id="theme">
      <h2>Workspace theme</h2><p>Pick a ready-made look. One click, the whole workspace.</p>
      <div className="theme-options" role="group" aria-label="Theme">
        {THEME_PRESETS.map(({ id: theme, label }) => <button key={theme} className={'theme-option ' + (settings.theme === theme ? 'is-selected' : '')} aria-pressed={settings.theme === theme} onClick={() => update('theme', theme)}>
          <div className={'theme-preview preview-' + theme} aria-hidden="true"><div className="preview-top"><i/><i/><i/></div><div className="preview-nav"><span/><span/><span/></div><div className="preview-body"><div className="preview-menu"><span>Learning journal</span><span>Write an entry</span></div><div className="preview-line"/><div className="preview-line short"/></div><div className="preview-avatar">LT</div>{settings.theme === theme && <span className="preview-check"><Icon name="check" size={12}/></span>}</div>
          <span className="theme-label">{label}</span>
        </button>)}
      </div>
    </section>
    <section className="settings-section setting-row" id="motion"><div><h2>Motion</h2><p>Set the pace, or keep things still.</p></div><select aria-label="Animation speed" value={settings.motion} onChange={e => update('motion', e.target.value)}><option value="normal">Normal</option><option value="fast">Fast</option><option value="reduced">Reduced</option></select></section>
    <p className="settings-save-status" role="status">{saved ? 'Saved. Your workspace is up to date.' : 'Changes save automatically on this device.'}</p>
  </WorkspaceShell>;
}

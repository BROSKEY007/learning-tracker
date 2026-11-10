'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { clearToken, getToken } from '@/lib/auth';
import Icon from './Icon';
import MotionSurface from './MotionSurface';

export default function WorkspaceShell({ children, settings = false, writing = false, user, onLogout }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const currentUser = user || profile;
  useEffect(() => {
    if (user || !getToken()) return;
    let active = true;
    api('/auth/me').then(me => {
      if (active) setProfile(me.data?.user || me.data || me.user);
    }).catch(() => { /* Keep the greeting neutral when the profile is unavailable. */ });
    return () => { active = false; };
  }, [user]);
  const initials = currentUser?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'LT';
  function logout() { if (onLogout) return onLogout(); clearToken(); router.replace('/login'); }
  return <div className="workspace-frame">
    <header className="workspace-topbar">
      <div className="workspace-breadcrumb"><span>My workspace</span><span className="breadcrumb-divider">/</span><Icon name={settings ? 'settings' : writing ? 'plus' : 'book'} size={16}/><strong>{settings ? 'Appearance' : writing ? 'New journal' : 'Learning journal'}</strong></div>
      <div className="topbar-right"><span className="workspace-status">{currentUser?.name ? `Hi, ${currentUser.name}` : 'Hi there'}</span><span className="avatar">{initials}</span></div>
    </header>
    <div className="workspace-grid">
      <aside className="primary-sidebar" aria-label="Main navigation">
        <Link href="/dashboard" className="sidebar-brand"><span className="brand-mark"><Icon name="book" size={20}/></span><span>Learning<br/><strong>Tracker</strong></span></Link>
        <nav aria-label="Learning journal">

          <Link className={!settings && writing ? 'nav-item selected' : 'nav-item'} aria-current={!settings && writing ? 'page' : undefined} href="/dashboard/write"><Icon name="plus"/>Write journal</Link>
          <Link className={!settings && !writing ? 'nav-item selected' : 'nav-item'} aria-current={!settings && !writing ? 'page' : undefined} href="/dashboard"><Icon name="book"/>Your journals</Link>
        </nav>
        <div className="sidebar-bottom">
          <Link className={settings ? 'nav-item selected' : 'nav-item'} href="/settings"><Icon name="settings"/>Settings</Link>
          <button className="nav-item" onClick={logout}><Icon name="logout"/>Log out</button>
          <div className="sidebar-profile"><span className="avatar">{initials}</span><div><strong>{currentUser?.name || 'Your workspace'}</strong><span>Personal journal</span></div></div>
        </div>
      </aside>
      <main className="workspace-content"><MotionSurface>{children}</MotionSurface></main>
    </div>
  </div>;
}

'use client';
import { useEffect } from 'react';
import { applyAppearance } from '@/lib/appearance';
export default function AppearanceProvider({ children }) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    function apply() {
      try { applyAppearance(JSON.parse(localStorage.getItem('lt_appearance') || '{}')); }
      catch { applyAppearance({}); }
    }
    apply(); media.addEventListener('change', apply); window.addEventListener('storage', apply);
    return () => { media.removeEventListener('change', apply); window.removeEventListener('storage', apply); };
  }, []);
  return children;
}

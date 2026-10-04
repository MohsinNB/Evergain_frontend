import { useCallback, useEffect, useState } from 'react';

/**
 * Two-state theme toggle (system ↔ pinned opposite), per modern dark-mode guidance:
 * - No pin → follow system preference.
 * - Toggle pins the opposite of what's currently shown; toggling again returns to system.
 * The inline script in index.html applies the pin before first paint (no flash).
 */

type Scheme = 'light' | 'dark';
const STORAGE_KEY = 'color-scheme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

function readPinned(): Scheme | null {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'light' || v === 'dark' ? v : null;
}

function applyPinned(pinned: Scheme | null) {
  const root = document.documentElement;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (pinned) {
    root.dataset.theme = pinned;
    localStorage.setItem(STORAGE_KEY, pinned);
    if (meta) meta.content = pinned;
  } else {
    delete root.dataset.theme;
    localStorage.removeItem(STORAGE_KEY);
    if (meta) meta.content = 'light dark';
  }
}

export function useTheme() {
  const [pinned, setPinned] = useState<Scheme | null>(readPinned);
  const [systemDark, setSystemDark] = useState<boolean>(() => media().matches);

  // React to OS theme changes at any time.
  useEffect(() => {
    const mq = media();
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const systemScheme: Scheme = systemDark ? 'dark' : 'light';
  const scheme: Scheme = pinned ?? systemScheme;

  const toggle = useCallback(() => {
    // Pinned → back to system. Not pinned → pin the opposite of what's showing.
    const next: Scheme | null = pinned ? null : systemScheme === 'dark' ? 'light' : 'dark';
    applyPinned(next);
    setPinned(next);
  }, [pinned, systemScheme]);

  return { scheme, isPinned: pinned !== null, toggle };
}

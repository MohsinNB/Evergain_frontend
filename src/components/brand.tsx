import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import styles from './brand.module.css';

export function Logo({ to = '/', subtitle }: { to?: string; subtitle?: string }) {
  return (
    <Link to={to} className={styles.logo} aria-label="Evergain Avenue home">
      <span className={styles.logoMark} aria-hidden="true">
        <svg viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="20" fill="#fff" />
          <path d="M32 21l8 5.8-3 9.4h-10l-3-9.4z" fill="currentColor" />
          <path
            d="M32 12v9M13.5 26.5l10.5.3M50.5 26.5l-10.5.3M20.5 48.5l6.5-12.3M43.5 48.5l-6.5-12.3"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className={styles.logoText}>
        <strong>Evergain</strong>
        <span>{subtitle ?? 'Avenue'}</span>
      </span>
    </Link>
  );
}

export function ThemeToggle() {
  const { scheme, toggle } = useTheme();
  const nextLabel = scheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      id="theme-toggle"
      className={styles.iconBtn}
      onClick={toggle}
      aria-label={nextLabel}
      title={nextLabel}
    >
      {scheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

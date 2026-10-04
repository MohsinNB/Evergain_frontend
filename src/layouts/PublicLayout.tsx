import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Logo, ThemeToggle } from '@/components/brand';
import { PUBLIC_NAV } from './nav';
import styles from './PublicLayout.module.css';

/**
 * Customer shell (mobile-first):
 * - Glass top bar: logo + (desktop) nav links + theme toggle.
 * - Glass bottom tab bar on phones — every destination is one thumb-tap away.
 */
export function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className={styles.shell}>
      <header className={`${styles.topbar} glass`}>
        <div className={`container ${styles.topbarInner}`}>
          <Logo />
          <nav className={styles.desktopNav} aria-label="Main">
            {PUBLIC_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `${styles.desktopLink} ${isActive ? styles.active : ''}`}
              >
                <item.icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className={styles.main}>
        <Outlet />
      </main>

      <nav className={`${styles.bottomNav} glass`} aria-label="Main">
        {PUBLIC_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            id={`nav-${item.label.toLowerCase()}`}
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            <span className={styles.tabIcon}>
              <item.icon size={22} aria-hidden="true" />
            </span>
            <span className={styles.tabLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

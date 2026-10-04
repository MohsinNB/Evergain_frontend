import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CalendarRange,
  ClipboardList,
  Images,
  LayoutDashboard,
  Menu,
  Repeat,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { Logo, ThemeToggle } from '@/components/brand';
import styles from './AdminLayout.module.css';

interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  superAdminOnly?: boolean;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
  { to: '/admin/calendar', label: 'Calendar', icon: CalendarRange },
  { to: '/admin/permanent', label: 'Permanent Plans', icon: Repeat },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/admin/admins', label: 'Admins', icon: ShieldCheck, superAdminOnly: true },
  { to: '/admin/settings', label: 'Ground Settings', icon: Settings, superAdminOnly: true },
];

/** The 3 most-used admin pages get a permanent spot in the mobile bottom bar. */
const MOBILE_PRIMARY = ADMIN_NAV.slice(0, 3);

/**
 * Admin shell: sidebar on desktop, bottom bar + slide-in drawer on phones.
 * Role filtering (super_admin items) is wired in Phase 6 once admin auth lands.
 */
export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const navList = (
    <ul className={styles.navList}>
      {ADMIN_NAV.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
          >
            <item.icon size={19} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Admin">
        <div className={styles.sidebarHead}>
          <Logo to="/admin" subtitle="Admin" />
        </div>
        <nav>{navList}</nav>
      </aside>

      <div className={styles.body}>
        <header className={`${styles.topbar} glass`}>
          <div className={styles.mobileLogo}>
            <Logo to="/admin" subtitle="Admin" />
          </div>
          <div className={styles.topbarSpacer} />
          <ThemeToggle />
        </header>

        <main id="main" className={styles.main}>
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom bar */}
      <nav className={`${styles.bottomNav} glass`} aria-label="Admin quick">
        {MOBILE_PRIMARY.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            <item.icon size={22} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          id="admin-menu-toggle"
          className={styles.tab}
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="admin-drawer"
        >
          <Menu size={22} aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`${styles.backdrop} ${drawerOpen ? styles.backdropOpen : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="admin-drawer"
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
        aria-label="Admin menu"
        inert={!drawerOpen}
      >
        <div className={styles.drawerHead}>
          <strong>Menu</strong>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav>{navList}</nav>
      </aside>
    </div>
  );
}

import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Images, Repeat, UserRound } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path (used for "/"). */
  end?: boolean;
}

/** Customer navigation — same 4 destinations on mobile (bottom bar) and desktop (top bar). */
export const PUBLIC_NAV: NavItem[] = [
  { to: '/', label: 'Book', icon: CalendarDays, end: true },
  { to: '/gallery', label: 'Gallery', icon: Images },
  { to: '/plans', label: 'Plans', icon: Repeat },
  { to: '/account', label: 'Account', icon: UserRound },
];

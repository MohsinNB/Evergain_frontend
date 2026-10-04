import type { HTMLAttributes, ReactNode } from 'react';
import styles from './ui.module.css';

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/* ── Card ─────────────────────────────────────────────── */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  interactive?: boolean;
}

export function Card({ padded = true, interactive = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cx(styles.card, padded && styles.padded, interactive && styles.interactive, className)}
      {...rest}
    />
  );
}

/* ── Badge ────────────────────────────────────────────── */
type BadgeTone = 'pitch' | 'sun' | 'sky' | 'berry' | 'kick' | 'neutral';

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[`badge_${tone}`], className)}>
      {icon}
      {children}
    </span>
  );
}

/* ── Booking status pill ──────────────────────────────── */
export type BookingStatus = 'PENDING' | 'BOOKED' | 'CANCELLED' | 'EXPIRED' | 'NO_SHOW';

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  BOOKED: 'Booked',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  NO_SHOW: 'No-show',
};

export function StatusPill({ status }: { status: BookingStatus }) {
  return (
    <span className={cx(styles.status, styles[`status_${status}`])}>
      <span className={styles.statusDot} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ── Skeleton ─────────────────────────────────────────── */
interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '1rem', radius, className }: SkeletonProps) {
  return (
    <span
      className={cx(styles.skeleton, className)}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

/* ── Empty / info state ───────────────────────────────── */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      {icon && <div className={styles.emptyIcon}>{icon}</div>}
      <h3 className={styles.emptyTitle}>{title}</h3>
      {description && <p className={styles.emptyText}>{description}</p>}
      {action}
    </div>
  );
}

/* ── Page header ──────────────────────────────────────── */
interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </header>
  );
}

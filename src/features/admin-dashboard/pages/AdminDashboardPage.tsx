import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  CalendarCheck,
  Clock,
  XCircle,
  RefreshCw,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { todayInDhaka, formatDateLong } from '@/lib/date';
import { formatTaka, formatTimeRange } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState, StatusPill, Badge } from '@/components/ui/primitives';
import { useAdminAuth } from '@/features/admin-auth/context/AdminAuthContext';
import { getDailyAnalytics, getAdminBookings } from '../api';
import styles from './AdminDashboard.module.css';

export function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const today = useMemo(() => todayInDhaka(), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Daily Analytics Stats Query
  const {
    data: stats,
    isLoading: loadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin-daily-analytics', selectedDate],
    queryFn: () => getDailyAnalytics(selectedDate),
  });

  // Today's Bookings Query
  const {
    data: bookingsData,
    isLoading: loadingBookings,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['admin-today-bookings', selectedDate],
    queryFn: () => getAdminBookings({ date: selectedDate }),
  });

  const handleRefresh = () => {
    refetchStats();
    refetchBookings();
  };

  return (
    <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
      {/* Admin Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.greetingRow}>
            <h1 className={styles.title}>Dashboard</h1>
            {admin && (
              <Badge tone="pitch" icon={<ShieldCheck size={12} />}>
                {admin.role.toUpperCase().replace('_', ' ')}
              </Badge>
            )}
          </div>
          <p className={styles.subtitle}>Overview & live bookings for {formatDateLong(selectedDate)}</p>
        </div>

        <div className={styles.headerActions}>
          <input
            type="date"
            className={styles.dateInput}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <Button variant="secondary" size="md" iconLeft={<RefreshCw size={16} />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Link to="/admin/bookings/new">
            <Button variant="primary" size="md" iconLeft={<PlusCircle size={16} />}>
              Manual Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className={styles.statsGrid}>
        <Card className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.iconGreen}`}>
            <DollarSign size={24} />
          </div>
          <div className={styles.metricMeta}>
            <span className={styles.metricLabel}>Total Revenue</span>
            <span className={styles.metricValue}>{loadingStats ? <Skeleton width="100px" height="28px" /> : formatTaka(stats?.totalRevenue ?? 0)}</span>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.iconPitch}`}>
            <CalendarCheck size={24} />
          </div>
          <div className={styles.metricMeta}>
            <span className={styles.metricLabel}>Confirmed Bookings</span>
            <span className={styles.metricValue}>{loadingStats ? <Skeleton width="60px" height="28px" /> : stats?.bookedCount ?? 0}</span>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.iconAmber}`}>
            <Clock size={24} />
          </div>
          <div className={styles.metricMeta}>
            <span className={styles.metricLabel}>Pending Holds</span>
            <span className={styles.metricValue}>{loadingStats ? <Skeleton width="60px" height="28px" /> : stats?.pendingCount ?? 0}</span>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.iconRose}`}>
            <XCircle size={24} />
          </div>
          <div className={styles.metricMeta}>
            <span className={styles.metricLabel}>Cancelled Slots</span>
            <span className={styles.metricValue}>{loadingStats ? <Skeleton width="60px" height="28px" /> : stats?.cancelledCount ?? 0}</span>
          </div>
        </Card>
      </div>

      {/* Bookings Section */}
      <Card className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h2 className={styles.tableTitle}>Bookings ({formatDateLong(selectedDate)})</h2>
            <span className={styles.tableSubtitle}>{bookingsData?.total ?? 0} records found</span>
          </div>
          <Link to="/admin/bookings" className={styles.viewAllLink}>
            View All Bookings <ArrowRight size={16} />
          </Link>
        </div>

        {loadingBookings ? (
          <div style={{ padding: 'var(--space-4)' }}>
            <Skeleton height="160px" radius="var(--radius-md)" />
          </div>
        ) : !bookingsData || bookingsData.bookings.length === 0 ? (
          <EmptyState title="No bookings found for this date" description="Offline and online slot bookings will appear here." />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Payment Ref</th>
                </tr>
              </thead>
              <tbody>
                {bookingsData.bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{formatTimeRange(b.startTime, b.endTime)}</strong>
                    </td>
                    <td>{b.customerName}</td>
                    <td>{b.customerPhone}</td>
                    <td className={styles.priceCol}>{formatTaka(b.price)}</td>
                    <td>
                      <StatusPill status={b.status} />
                    </td>
                    <td>
                      <code className={styles.code}>{b.payment?.tranId || String(b._id || '').slice(-6)}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

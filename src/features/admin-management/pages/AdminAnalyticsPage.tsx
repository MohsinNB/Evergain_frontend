import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { formatTaka } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState } from '@/components/ui/primitives';
import { getMonthlyAnalytics, getYearlyAnalytics } from '../api';
import styles from './AdminAnalytics.module.css';

export function AdminAnalyticsPage() {
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(10);

  // Fetch monthly analytics
  const {
    data: monthlyData,
    isLoading: loadingMonthly,
    refetch: refetchMonthly,
  } = useQuery({
    queryKey: ['admin-monthly-analytics', year, month],
    queryFn: () => getMonthlyAnalytics(year, month),
    enabled: viewMode === 'monthly',
  });

  // Fetch yearly analytics
  const {
    data: yearlyData,
    isLoading: loadingYearly,
    refetch: refetchYearly,
  } = useQuery({
    queryKey: ['admin-yearly-analytics', year],
    queryFn: () => getYearlyAnalytics(year),
    enabled: viewMode === 'yearly',
  });

  const chartData = viewMode === 'monthly' ? monthlyData?.dailyBreakdown : yearlyData?.monthlyBreakdown;
  const totalRev = viewMode === 'monthly' ? monthlyData?.totalRevenue : yearlyData?.totalRevenue;
  const totalBookings = viewMode === 'monthly' ? monthlyData?.totalBookings : yearlyData?.totalBookings;
  const isLoading = viewMode === 'monthly' ? loadingMonthly : loadingYearly;

  return (
    <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics & Revenue Reports</h1>
          <p className={styles.subtitle}>Visual charts and booking statistics breakdown.</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.modeToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'monthly' ? styles.toggleActive : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'yearly' ? styles.toggleActive : ''}`}
              onClick={() => setViewMode('yearly')}
            >
              Yearly
            </button>
          </div>

          {viewMode === 'monthly' && (
            <select className={styles.select} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>
          )}

          <select className={styles.select} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>

          <Button
            variant="secondary"
            size="md"
            iconLeft={<RefreshCw size={16} />}
            onClick={() => (viewMode === 'monthly' ? refetchMonthly() : refetchYearly())}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsRow}>
        <Card className={styles.statCard}>
          <div className={styles.statIconGreen}>
            <DollarSign size={24} />
          </div>
          <div>
            <span className={styles.statLabel}>Total Period Revenue</span>
            <span className={styles.statValue}>
              {isLoading ? <Skeleton width="100px" height="28px" /> : formatTaka(totalRev ?? 0)}
            </span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIconPitch}>
            <Calendar size={24} />
          </div>
          <div>
            <span className={styles.statLabel}>Total Period Bookings</span>
            <span className={styles.statValue}>
              {isLoading ? <Skeleton width="60px" height="28px" /> : totalBookings ?? 0}
            </span>
          </div>
        </Card>
      </div>

      {/* Chart Card */}
      <Card className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <TrendingUp size={20} className={styles.chartIcon} />
          <h2 className={styles.chartTitle}>Revenue Trend ({viewMode === 'monthly' ? `October ${year}` : year})</h2>
        </div>

        {isLoading ? (
          <Skeleton height="300px" radius="var(--radius-lg)" />
        ) : !chartData || chartData.length === 0 ? (
          <EmptyState title="No data for this period" description="Revenue charts will update as bookings occur." />
        ) : (
          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData as any[]} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey={viewMode === 'monthly' ? 'day' : 'monthName'} stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} tickFormatter={(v) => `৳${v}`} />
                <Tooltip
                  formatter={(value: any) => [formatTaka(Number(value)), 'Revenue']}
                  contentStyle={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--ink)',
                  }}
                />
                <Bar dataKey="revenue" fill="var(--pitch)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}

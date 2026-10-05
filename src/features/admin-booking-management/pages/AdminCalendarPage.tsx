import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { todayInDhaka } from '@/lib/date';
import { formatTaka } from '@/lib/format';
import { Card, Skeleton, EmptyState, Badge } from '@/components/ui/primitives';
import { getMonthlyCalendar } from '../api';
import styles from './AdminCalendar.module.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AdminCalendarPage() {
  const navigate = useNavigate();
  const today = useMemo(() => todayInDhaka(), []);

  // Format month string YYYY-MM
  const [currentMonth, setCurrentMonth] = useState<string>(() => today.slice(0, 7));

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-calendar', currentMonth],
    queryFn: () => getMonthlyCalendar(currentMonth),
  });

  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 2, 1));
    setCurrentMonth(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(Date.UTC(y ?? 2026, (m ?? 1), 1));
    setCurrentMonth(date.toISOString().slice(0, 7));
  };

  const monthLabel = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, 1));
    return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(date);
  }, [currentMonth]);

  // Compute leading empty cells for 7-day grid alignment
  const firstDayOffset = useMemo(() => {
    if (!data?.days || data.days.length === 0) return 0;
    const firstDate = data.days[0]?.date || `${currentMonth}-01`;
    const [y, m, d] = firstDate.split('-').map(Number);
    return new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1)).getUTCDay();
  }, [data, currentMonth]);

  return (
    <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Monthly Calendar View</h1>
          <p className={styles.subtitle}>Overview of ground bookings, holds & closures by month.</p>
        </div>

        {/* Month Navigator */}
        <div className={styles.navBox}>
          <button type="button" className={styles.navBtn} onClick={handlePrevMonth} title="Previous Month">
            <ChevronLeft size={20} />
          </button>
          <span className={styles.monthTitle}>{monthLabel}</span>
          <button type="button" className={styles.navBtn} onClick={handleNextMonth} title="Next Month">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Card */}
      <Card className={styles.calendarCard}>
        {/* Weekday Headers */}
        <div className={styles.weekdayGrid}>
          {WEEKDAYS.map((wd) => (
            <div key={wd} className={styles.weekdayHead}>
              {wd}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: 'var(--space-4)' }}>
            <Skeleton height="320px" radius="var(--radius-lg)" />
          </div>
        ) : error ? (
          <EmptyState title="Could not load calendar" description="Please check backend connection." />
        ) : (
          <div className={styles.daysGrid}>
            {/* Empty offset cells */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`offset-${i}`} className={styles.emptyCell} />
            ))}

            {/* Month Day Cells */}
            {data?.days.map((day) => {
              const isToday = day.date === today;
              const dayNum = Number(day.date.split('-')[2]);
              const pendingCount = day.bookings?.filter((b) => b.status === 'PENDING').length || 0;

              return (
                <div
                  key={day.date}
                  className={`${styles.dayCell} ${day.isClosed ? styles.cellClosed : ''} ${isToday ? styles.cellToday : ''}`}
                  onClick={() => navigate(`/admin/bookings?date=${day.date}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.cellHeader}>
                    <span className={styles.dayNum}>{dayNum}</span>
                    {isToday && <span className={styles.todayBadge}>Today</span>}
                  </div>

                  {day.isClosed ? (
                    <div className={styles.closureTag}>
                      <ShieldCheck size={12} /> Closed
                    </div>
                  ) : (
                    <div className={styles.cellStats}>
                      {day.totalBookings > 0 && (
                        <Badge tone="pitch">{day.totalBookings} Booked</Badge>
                      )}
                      {pendingCount > 0 && (
                        <Badge tone="sun">{pendingCount} Hold</Badge>
                      )}
                      {day.totalRevenue > 0 && (
                        <span className={styles.revenueText}>{formatTaka(day.totalRevenue)}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

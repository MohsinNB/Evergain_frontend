import { useMemo } from 'react';
import { dateParts, nextDays, relativeDayLabel, todayInDhaka } from '@/lib/date';
import styles from './DateStrip.module.css';

interface DateStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  daysCount?: number;
}

export function DateStrip({ selectedDate, onSelectDate, daysCount = 14 }: DateStripProps) {
  const today = useMemo(() => todayInDhaka(), []);
  const dates = useMemo(() => nextDays(today, daysCount), [today, daysCount]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollArea} role="tablist" aria-label="Select Date">
        {dates.map((date) => {
          const isSelected = date === selectedDate;
          const isToday = date === today;
          const parts = dateParts(date);
          const relLabel = relativeDayLabel(date, today);

          return (
            <button
              key={date}
              type="button"
              role="tab"
              aria-selected={isSelected}
              id={`date-tab-${date}`}
              className={`${styles.pill} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
              onClick={() => onSelectDate(date)}
            >
              <span className={styles.relLabel}>{relLabel}</span>
              <span className={styles.dayNum}>{parts.day}</span>
              <span className={styles.month}>{parts.monthShort}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

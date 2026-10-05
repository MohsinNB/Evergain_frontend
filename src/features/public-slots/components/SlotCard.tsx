import type { SlotView } from '../api';
import { formatTaka, formatTimeRange } from '@/lib/format';
import { Badge } from '@/components/ui/primitives';
import { Tag } from 'lucide-react';
import styles from './SlotCard.module.css';

interface SlotCardProps {
  slot: SlotView;
  isSelected: boolean;
  onSelect: (slot: SlotView) => void;
}

export function SlotCard({ slot, isSelected, onSelect }: SlotCardProps) {
  const { startTime, endTime, status, price, originalPrice, isDiscounted } = slot;
  const timeLabel = formatTimeRange(startTime, endTime);
  const isAvailable = status === 'available';
  const discountAmount = originalPrice - price;

  if (!isAvailable) {
    return (
      <div className={`${styles.card} ${styles.booked}`} aria-disabled="true">
        <span className={styles.time}>{timeLabel}</span>
        <span className={styles.bookedText}>Booked</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      id={`slot-card-${startTime}`}
      className={`${styles.card} ${styles.available} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(slot)}
      aria-pressed={isSelected}
    >
      {isDiscounted && discountAmount > 0 && (
        <div className={styles.discountBadge}>
          <Badge tone="sun" icon={<Tag size={12} />}>
            {formatTaka(discountAmount)} OFF
          </Badge>
        </div>
      )}

      <div className={styles.content}>
        <span className={styles.time}>{timeLabel}</span>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatTaka(price)}</span>
          {isDiscounted && <span className={styles.oldPrice}>{formatTaka(originalPrice)}</span>}
        </div>
      </div>
    </button>
  );
}

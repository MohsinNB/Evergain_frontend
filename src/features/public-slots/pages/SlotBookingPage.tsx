import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Tag, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { todayInDhaka } from '@/lib/date';
import { Skeleton, EmptyState, Badge } from '@/components/ui/primitives';
import { DateStrip } from '../components/DateStrip';
import { SlotCard } from '../components/SlotCard';
import { BookingDrawer } from '../components/BookingDrawer';
import type { SlotView } from '../api';
import { getGrounds, getSlots } from '../api';
import styles from './SlotBookingPage.module.css';

export function SlotBookingPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => todayInDhaka());
  const [selectedSlot, setSelectedSlot] = useState<SlotView | null>(null);

  // Fetch active grounds
  const { data: grounds, isLoading: loadingGrounds } = useQuery({
    queryKey: ['grounds'],
    queryFn: getGrounds,
  });

  const activeGround = grounds?.[0]; // Current ground
  const groundId = activeGround?._id ?? '';

  // Fetch slots for selected date & ground
  const {
    data: slotData,
    isLoading: loadingSlots,
    error: slotError,
  } = useQuery({
    queryKey: ['slots', groundId, selectedDate],
    queryFn: () => getSlots(groundId, selectedDate),
    enabled: Boolean(groundId),
  });

  // Clear slot selection when date changes
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSelectSlot = (slot: SlotView) => {
    if (selectedSlot?.startTime === slot.startTime) {
      setSelectedSlot(null); // toggle deselect
    } else {
      setSelectedSlot(slot);
    }
  };

  const availableSlotsCount = useMemo(() => {
    return slotData?.slots.filter((s) => s.status === 'available').length ?? 0;
  }, [slotData]);

  return (
    <div className="container">
      {/* Top Banner / Hero */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>Instant Online Booking</span>
          </div>
          <h1 className={styles.title}>Book Your Slot</h1>
          <p className={styles.subtitle}>
            {activeGround ? (
              <span className={styles.locationTag}>
                <MapPin size={16} /> {activeGround.name} · {activeGround.location}
              </span>
            ) : (
              'Select a date & time to reserve your ground'
            )}
          </p>
        </div>
      </section>

      {/* Date Strip */}
      <section className={styles.dateSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Calendar size={18} /> Select Date
          </h2>
          {slotData && !slotData.isClosed && (
            <span className={styles.slotCounter}>
              <strong>{availableSlotsCount}</strong> slots available
            </span>
          )}
        </div>
        <DateStrip selectedDate={selectedDate} onSelectDate={handleSelectDate} />
      </section>

      {/* Legend & Promo strip */}
      <section className={styles.legendStrip}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotAvailable}`} />
          <span>Available</span>
        </div>
        <div className={styles.legendItem}>
          <Badge tone="sun" icon={<Tag size={12} />}>
            ৳50 OFF
          </Badge>
          <span>Unbooked within 48h</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotBooked}`} />
          <span>Booked</span>
        </div>
      </section>

      {/* Slot Grid / States */}
      <section className={styles.slotsSection}>
        {loadingGrounds || loadingSlots ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height="84px" radius="var(--radius-lg)" />
            ))}
          </div>
        ) : slotData?.isClosed ? (
          <EmptyState
            icon={<ShieldCheck size={32} />}
            title="Ground Closed Today"
            description={slotData.closureReason || 'The ground is closed for maintenance or holidays on this date.'}
          />
        ) : slotError ? (
          <EmptyState
            title="Could not load slots"
            description={slotError instanceof Error ? slotError.message : 'Please check your connection and try again.'}
          />
        ) : slotData?.slots.length === 0 ? (
          <EmptyState title="No slots available" description="Please try selecting another date." />
        ) : (
          <div className={styles.grid}>
            {slotData?.slots.map((slot) => (
              <SlotCard
                key={slot.startTime}
                slot={slot}
                isSelected={selectedSlot?.startTime === slot.startTime}
                onSelect={handleSelectSlot}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bottom Sheet Drawer */}
      <BookingDrawer
        groundId={groundId}
        date={selectedDate}
        slot={selectedSlot}
        onClearSlot={() => setSelectedSlot(null)}
      />
    </div>
  );
}

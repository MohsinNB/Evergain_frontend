import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { X, ShieldCheck, ArrowRight, Clock, AlertTriangle, Tag } from 'lucide-react';
import { BD_PHONE_REGEX, formatTaka, formatTimeRange } from '@/lib/format';
import { formatDateLong } from '@/lib/date';
import { Button } from '@/components/ui/Button';
import type { SlotView } from '../api';
import { createBookingRequest } from '../api';
import { useCustomerAuth } from '../../customer-auth/context/CustomerAuthContext';
import { getCustomerCoupons } from '../../customer-account/api';
import styles from './BookingDrawer.module.css';

const formSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  phone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid 11-digit BD number (e.g. 01712345678)'),
  couponId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BookingDrawerProps {
  groundId: string;
  date: string;
  slot: SlotView | null;
  onClearSlot: () => void;
}

export function BookingDrawer({ groundId, date, slot, onClearSlot }: BookingDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { customer } = useCustomerAuth();

  const { data: coupons } = useQuery({
    queryKey: ['customer-coupons'],
    queryFn: getCustomerCoupons,
    enabled: Boolean(customer),
  });

  const unusedCoupons = coupons?.filter((c) => !c.isUsed) || [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer?.name || '',
      phone: customer?.phone || '',
      couponId: '',
    },
  });

  useEffect(() => {
    if (customer) {
      if (customer.name) setValue('name', customer.name);
      if (customer.phone) setValue('phone', customer.phone);
    }
  }, [customer, setValue]);

  if (!slot) return null;

  const dateStr = formatDateLong(date);
  const timeStr = formatTimeRange(slot.startTime, slot.endTime);
  const priceStr = formatTaka(slot.price);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const result = await createBookingRequest({
        groundId,
        date,
        startTime: slot.startTime,
        name: values.name,
        phone: values.phone,
        couponId: values.couponId || undefined,
      });

      toast.success('Slot hold created! Redirecting to payment checkout...');
      window.location.href = result.gatewayUrl;
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || 'Could not complete booking request.';
      toast.error(msg);
    }
  };

  return (
    <>
      {/* Sticky Bottom Bar (Thumb reach) */}
      <div className={`${styles.bottomBar} glass rise-in`} role="region" aria-label="Selected slot summary">
        <div className={`container ${styles.barInner}`}>
          <div className={styles.summaryInfo}>
            <div className={styles.summaryBadge}>
              <Clock size={14} />
              <span>15-min hold</span>
            </div>
            <span className={styles.summaryMeta}>
              {dateStr} · {timeStr}
            </span>
            <span className={styles.summaryPrice}>{priceStr}</span>
          </div>

          <div className={styles.barActions}>
            <button type="button" className={styles.clearBtn} onClick={onClearSlot} aria-label="Deselect slot">
              <X size={20} />
            </button>
            <Button
              variant="cta"
              size="lg"
              iconRight={<ArrowRight size={20} />}
              id="book-now-trigger-btn"
              onClick={() => setIsOpen(true)}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>

      {/* Slide-Up Bottom Sheet Modal */}
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => !loading && setIsOpen(false)}>
          <div
            className={`${styles.sheet} rise-in`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
          >
            <div className={styles.sheetHeader}>
              <div>
                <h3 id="sheet-title" className={styles.sheetTitle}>
                  Complete Your Booking
                </h3>
                <p className={styles.sheetSubtitle}>No password required for your first booking</p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                disabled={loading}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected slot ticket pill */}
            <div className={styles.ticketCard}>
              <div className={styles.ticketRow}>
                <div>
                  <span className={styles.ticketLabel}>Evergain Avenue Ground</span>
                  <div className={styles.ticketTime}>
                    {dateStr} · {timeStr}
                  </div>
                </div>
                <span className={styles.ticketPrice}>{priceStr}</span>
              </div>
              <div className={styles.holdNotice}>
                <ShieldCheck size={16} />
                <span>Slot will be locked for 15 minutes while you pay online.</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="customer-name" className={styles.label}>
                  Your Name
                </label>
                <input
                  id="customer-name"
                  type="text"
                  placeholder="e.g. Tanvir Ahmed"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  disabled={loading}
                  {...register('name')}
                />
                {errors.name && <span className={styles.errorMsg}>{errors.name.message}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="customer-phone" className={styles.label}>
                  Mobile Number (BD)
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  placeholder="01712345678"
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                  disabled={loading}
                  {...register('phone')}
                />
                {errors.phone && <span className={styles.errorMsg}>{errors.phone.message}</span>}
              </div>

              {/* Coupon Picker for logged in customers */}
              {customer && unusedCoupons.length > 0 && (
                <div className={styles.field}>
                  <label htmlFor="customer-coupon" className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={14} style={{ color: 'var(--color-pitch-emerald)' }} /> Apply Discount Coupon
                  </label>
                  <select
                    id="customer-coupon"
                    className={styles.input}
                    disabled={loading}
                    {...register('couponId')}
                  >
                    <option value="">No coupon selected</option>
                    {unusedCoupons.map((coupon) => (
                      <option key={coupon._id} value={coupon._id}>
                        {coupon.type === 'profile_completion' ? 'Profile Completion Reward (৳50 OFF)' : `Coupon (${coupon.amountValue} OFF)`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.guaranteeNote}>
                <AlertTriangle size={15} />
                <span>You will be redirected to SSLCommerz to pay securely via bKash / Nagad / Cards.</span>
              </div>

              <Button
                type="submit"
                variant="cta"
                size="lg"
                block
                loading={loading}
                iconRight={<ArrowRight size={20} />}
                id="submit-guest-booking-btn"
              >
                Proceed to Pay {priceStr}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

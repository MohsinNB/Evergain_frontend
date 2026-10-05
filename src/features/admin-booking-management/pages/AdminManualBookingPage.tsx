import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { BD_PHONE_REGEX } from '@/lib/format';
import { todayInDhaka } from '@/lib/date';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/primitives';
import { ArrowLeft, PlusCircle, ShieldCheck } from 'lucide-react';
import { getGrounds } from '@/features/public-slots/api';
import { createAdminManualBooking } from '../api';
import styles from './AdminManualBooking.module.css';

const manualBookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:mm (e.g. 18:00)'),
  customerName: z.string().trim().min(1, 'Customer name is required').max(100),
  customerPhone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid 11-digit BD number'),
  price: z.number().min(0).optional(),
  paymentStatus: z.enum(['paid', 'pending']),
  notes: z.string().max(500).optional(),
});

type ManualBookingValues = z.infer<typeof manualBookingSchema>;

export function AdminManualBookingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: grounds } = useQuery({
    queryKey: ['grounds'],
    queryFn: getGrounds,
  });

  const activeGround = grounds?.[0];
  const groundId = activeGround?._id ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManualBookingValues>({
    resolver: zodResolver(manualBookingSchema),
    defaultValues: {
      date: todayInDhaka(),
      startTime: '18:00',
      customerName: 'Offline Customer',
      customerPhone: '01700000000',
      paymentStatus: 'paid',
      notes: 'Manual booking created by admin',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ManualBookingValues) =>
      createAdminManualBooking({
        groundId,
        ...values,
      }),
    onSuccess: () => {
      toast.success('Manual booking created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-daily-analytics'] });
      navigate('/admin/bookings');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not create manual booking');
    },
  });

  const onSubmit = (values: ManualBookingValues) => {
    if (!groundId) {
      toast.error('Ground not found');
      return;
    }
    mutation.mutate(values);
  };

  return (
    <div className="container" style={{ maxWidth: '600px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link to="/admin/bookings" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Bookings
        </Link>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Manual Offline Booking</h1>
        <p className={styles.subtitle}>Book or block a time slot directly for cash or phone bookings.</p>
      </div>

      <Card className={styles.card}>
        <div className={styles.groundBadge}>
          <ShieldCheck size={16} />
          <span>{activeGround?.name || 'Evergain Avenue Ground'}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="manual-date" className={styles.label}>
                Booking Date
              </label>
              <input
                id="manual-date"
                type="date"
                className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
                {...register('date')}
              />
              {errors.date && <span className={styles.errorMsg}>{errors.date.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="manual-time" className={styles.label}>
                Start Time (HH:mm)
              </label>
              <input
                id="manual-time"
                type="text"
                placeholder="18:00"
                className={`${styles.input} ${errors.startTime ? styles.inputError : ''}`}
                {...register('startTime')}
              />
              {errors.startTime && <span className={styles.errorMsg}>{errors.startTime.message}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="manual-name" className={styles.label}>
              Customer / Block Name
            </label>
            <input
              id="manual-name"
              type="text"
              placeholder="e.g. Tanvir Ahmed or Maintenance Block"
              className={`${styles.input} ${errors.customerName ? styles.inputError : ''}`}
              {...register('customerName')}
            />
            {errors.customerName && <span className={styles.errorMsg}>{errors.customerName.message}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="manual-phone" className={styles.label}>
              Customer Mobile (BD)
            </label>
            <input
              id="manual-phone"
              type="tel"
              placeholder="01712345678"
              className={`${styles.input} ${errors.customerPhone ? styles.inputError : ''}`}
              {...register('customerPhone')}
            />
            {errors.customerPhone && <span className={styles.errorMsg}>{errors.customerPhone.message}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="manual-price" className={styles.label}>
                Custom Price (Optional)
              </label>
              <input
                id="manual-price"
                type="number"
                placeholder={`Default: ${activeGround?.pricePerSlot || 1500}`}
                className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                {...register('price', { valueAsNumber: true })}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="manual-payment" className={styles.label}>
                Payment Status
              </label>
              <select id="manual-payment" className={styles.select} {...register('paymentStatus')}>
                <option value="paid">Paid (Cash/Offline)</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="manual-notes" className={styles.label}>
              Notes (Optional)
            </label>
            <textarea
              id="manual-notes"
              rows={3}
              placeholder="Any special notes for this booking..."
              className={styles.textarea}
              {...register('notes')}
            />
          </div>

          <Button
            type="submit"
            variant="cta"
            size="lg"
            block
            loading={mutation.isPending}
            iconLeft={<PlusCircle size={20} />}
          >
            Create Booking / Block Slot
          </Button>
        </form>
      </Card>
    </div>
  );
}

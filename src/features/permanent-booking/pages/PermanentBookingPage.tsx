import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, ShieldCheck, Sparkles, AlertCircle, CheckCircle, XCircle, LogIn, PlusCircle } from 'lucide-react';
import { useCustomerAuth } from '../../customer-auth/context/CustomerAuthContext';
import { formatTimeRange } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState, Badge } from '@/components/ui/primitives';
import { createPermanentBookingPlan, getMyPermanentBookings, cancelPermanentBookingPlan, type PermanentBookingPlan } from '../api';
import { getGroundSettingsData } from '../../admin-management/api';
import styles from '../PermanentBooking.module.css';

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', full: 'Sunday' },
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' },
];

export function PermanentBookingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { customer } = useCustomerAuth();

  const [selectedDay, setSelectedDay] = useState(5); // Friday default
  const [startTime, setStartTime] = useState('18:00');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch ground details
  const { data: grounds } = useQuery({
    queryKey: ['ground-settings-public'],
    queryFn: getGroundSettingsData,
  });
  const ground = grounds?.[0];

  // Fetch my active permanent bookings if logged in
  const { data: myPlans, isLoading: loadingPlans } = useQuery({
    queryKey: ['my-permanent-bookings'],
    queryFn: getMyPermanentBookings,
    enabled: !!customer,
  });

  const createMutation = useMutation({
    mutationFn: createPermanentBookingPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-permanent-bookings'] });
      setSuccessMsg('Permanent booking plan requested! Admin will review and apply custom discounts.');
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create permanent plan');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelPermanentBookingPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-permanent-bookings'] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customer) {
      navigate('/login?redirect=/plans');
      return;
    }
    if (!ground) {
      setErrorMsg('Ground details not loaded');
      return;
    }

    createMutation.mutate({
      groundId: ground._id,
      dayOfWeek: selectedDay,
      startTime,
      startDate,
      commitmentMonths: 3,
    });
  };

  return (
    <div className={`container ${styles.container}`}>
      {/* Hero Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroBadge}>
          <Sparkles size={14} /> VIP Permanent Membership
        </div>
        <h1 className={styles.heroTitle}>Permanent Slot Booking Plans</h1>
        <p className={styles.heroSubtitle}>
          Commit to 3 months of weekly football action. Secure your favorite weekly slot with automatic reservations and exclusive discounted pricing.
        </p>

        <div className={styles.benefitsGrid}>
          <div className={styles.benefitItem}>
            <Calendar className={styles.benefitIcon} size={22} />
            <div className={styles.benefitText}>
              <h4>Guaranteed Weekly Slot</h4>
              <p>Pre-reserved automatically ahead of each week so no one else can book it.</p>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <Sparkles className={styles.benefitIcon} size={22} />
            <div className={styles.benefitText}>
              <h4>Exclusive Discount Rates</h4>
              <p>Admin sets special fixed or percentage discounts for permanent subscribers.</p>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <ShieldCheck className={styles.benefitIcon} size={22} />
            <div className={styles.benefitText}>
              <h4>3-Month Commitment</h4>
              <p>Minimum 3-month recurring lock to build long-term squad matches.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Builder Card */}
      <Card className={styles.builderCard}>
        <h2 className={styles.sectionTitle}>
          <PlusCircle size={22} style={{ color: 'var(--color-pitch-emerald)' }} /> Subscribe to Permanent Slot
        </h2>

        {!customer && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div>
              <strong style={{ display: 'block', color: 'var(--color-text-primary)' }}>Customer Registration Required</strong>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Permanent bookings require a registered Customer account to manage weekly slots.
              </span>
            </div>
            <Button variant="primary" size="md" iconLeft={<LogIn size={16} />} onClick={() => navigate('/login?redirect=/plans')}>
              Sign In to Subscribe
            </Button>
          </div>
        )}

        {errorMsg && (
          <div style={{ color: 'var(--color-accent-rose)', fontSize: 'var(--font-size-sm)', background: 'rgba(239,68,68,0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ color: 'var(--color-pitch-emerald)', fontSize: 'var(--font-size-sm)', background: 'rgba(16,185,129,0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Day selection */}
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            Select Preferred Day of Week
          </label>
          <div className={styles.daysGrid}>
            {DAYS_OF_WEEK.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`${styles.dayBtn} ${selectedDay === d.id ? styles.dayBtnActive : ''}`}
                onClick={() => setSelectedDay(d.id)}
              >
                <span className={styles.dayName}>{d.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Slot Start Time
              </label>
              <select
                style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                value={startTime}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setStartTime(e.target.value)}
              >
                <option value="16:00">4:00 PM – 5:00 PM</option>
                <option value="17:00">5:00 PM – 6:00 PM</option>
                <option value="18:00">6:00 PM – 7:00 PM</option>
                <option value="19:00">7:00 PM – 8:00 PM</option>
                <option value="20:00">8:00 PM – 9:00 PM</option>
                <option value="21:00">9:00 PM – 10:00 PM</option>
                <option value="22:00">10:00 PM – 11:00 PM</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Start Date (First Match)
              </label>
              <input
                type="date"
                style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                value={startDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="cta"
            size="lg"
            block
            disabled={!customer}
            loading={createMutation.isPending}
          >
            Submit 3-Month Permanent Plan Request
          </Button>
        </form>
      </Card>

      {/* Customer's Active Permanent Plans */}
      {customer && (
        <div>
          <h2 className={styles.sectionTitle}>Your Permanent Subscriptions</h2>

          {loadingPlans ? (
            <Skeleton height="200px" radius="var(--radius-lg)" />
          ) : !myPlans || myPlans.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Calendar size={32} />}
                title="No active permanent plans"
                description="Select a day and slot above to create your 3-month commitment plan."
              />
            </Card>
          ) : (
            <div className={styles.plansGrid}>
              {myPlans.map((plan: PermanentBookingPlan) => (
                <Card key={plan._id} className={styles.planCard}>
                  <div className={styles.planHeader}>
                    <span className={styles.dayBadge}>{DAYS_OF_WEEK.find((d) => d.id === plan.dayOfWeek)?.full}s</span>
                    {plan.status === 'active' && <Badge tone="pitch" icon={<CheckCircle size={12} />}>Active</Badge>}
                    {plan.status === 'cancelled' && <Badge tone="neutral" icon={<XCircle size={12} />}>Cancelled</Badge>}
                    {plan.status === 'completed' && <Badge tone="sky">Completed</Badge>}
                  </div>

                  <div className={styles.timeRow}>
                    <Clock size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    {formatTimeRange(plan.startTime, plan.endTime)}
                  </div>

                  <div className={styles.planMeta}>
                    <span>Starts: <strong>{plan.startDate}</strong></span>
                    <span>Commitment: <strong>{plan.commitmentMonths} Months</strong></span>
                    <span>
                      Discount:{' '}
                      <strong>
                        {plan.discountValue > 0
                          ? plan.discountType === 'fixed'
                            ? `৳${plan.discountValue} OFF per match`
                            : `${plan.discountValue}% OFF`
                          : 'Standard Rate'}
                      </strong>
                    </span>
                  </div>

                  {plan.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(plan._id)}
                      style={{ marginTop: 'var(--space-2)' }}
                    >
                      Cancel Plan
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

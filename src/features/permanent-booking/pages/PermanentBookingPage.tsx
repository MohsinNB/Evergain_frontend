import { useState, useMemo, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, ShieldCheck, Sparkles, AlertCircle, CheckCircle, XCircle, LogIn, PlusCircle } from 'lucide-react';
import { useCustomerAuth } from '../../customer-auth/context/CustomerAuthContext';
import { formatTimeRange } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState, Badge } from '@/components/ui/primitives';
import { createPermanentBookingPlan, getMyPermanentBookings, cancelPermanentBookingPlan, type PermanentBookingPlan } from '../api';
import { getGrounds } from '../../public-slots/api';
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

  // Fetch ground details (public endpoint)
  const { data: grounds, isLoading: loadingGrounds } = useQuery({
    queryKey: ['grounds'],
    queryFn: getGrounds,
  });
  const ground = grounds?.[0];

  // Dynamic slot generation from ground hours
  const availableSlots = useMemo(() => {
    if (!ground) {
      return [
        { start: '16:00', end: '17:00', label: '4:00 PM – 5:00 PM' },
        { start: '17:00', end: '18:00', label: '5:00 PM – 6:00 PM' },
        { start: '18:00', end: '19:00', label: '6:00 PM – 7:00 PM' },
        { start: '19:00', end: '20:00', label: '7:00 PM – 8:00 PM' },
        { start: '20:00', end: '21:00', label: '8:00 PM – 9:00 PM' },
        { start: '21:00', end: '22:00', label: '9:00 PM – 10:00 PM' },
        { start: '22:00', end: '23:00', label: '10:00 PM – 11:00 PM' },
      ];
    }
    const [openH, openM] = ground.openingTime.split(':').map(Number);
    const [closeH, closeM] = ground.closingTime.split(':').map(Number);
    const dur = ground.slotDurationMinutes || 60;

    const openMins = (openH ?? 0) * 60 + (openM ?? 0);
    let closeMins = (closeH ?? 0) * 60 + (closeM ?? 0);
    if (closeMins <= openMins) closeMins += 24 * 60;

    const list: Array<{ start: string; end: string; label: string }> = [];
    for (let m = openMins; m + dur <= closeMins; m += dur) {
      const sH = Math.floor((m % (24 * 60)) / 60).toString().padStart(2, '0');
      const sM = ((m % (24 * 60)) % 60).toString().padStart(2, '0');
      const startStr = `${sH}:${sM}`;

      const endTotal = m + dur;
      const eH = Math.floor((endTotal % (24 * 60)) / 60).toString().padStart(2, '0');
      const eM = ((endTotal % (24 * 60)) % 60).toString().padStart(2, '0');
      const endStr = `${eH}:${eM}`;

      list.push({
        start: startStr,
        end: endStr,
        label: formatTimeRange(startStr, endStr),
      });
    }
    return list;
  }, [ground]);

  useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.some((s) => s.start === startTime)) {
      setStartTime(availableSlots[0].start);
    }
  }, [availableSlots, startTime]);

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
      setErrorMsg('Ground details are currently loading. Please try again.');
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
          <PlusCircle size={22} style={{ color: 'var(--pitch)' }} /> Subscribe to Permanent Slot
        </h2>

        {/* Active Ground Badge */}
        {ground && (
          <div className={styles.groundBadge}>
            <ShieldCheck size={16} style={{ color: 'var(--pitch)' }} />
            <span>
              Ground: <strong>{ground.name}</strong> ({ground.location})
            </span>
          </div>
        )}

        {!customer && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', background: 'var(--sky-soft)', border: '1px solid var(--border)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div>
              <strong style={{ display: 'block', color: 'var(--ink)' }}>Customer Registration Required</strong>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                Permanent bookings require a registered Customer account to manage weekly slots.
              </span>
            </div>
            <Button variant="primary" size="md" iconLeft={<LogIn size={16} />} onClick={() => navigate('/login?redirect=/plans')}>
              Sign In to Subscribe
            </Button>
          </div>
        )}

        {errorMsg && (
          <div style={{ color: 'var(--berry)', fontSize: 'var(--text-sm)', background: 'var(--berry-soft)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ color: 'var(--pitch)', fontSize: 'var(--text-sm)', background: 'var(--pitch-soft)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Day selection */}
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--ink)' }}>
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
              <label className={styles.label}>
                Slot Start Time
              </label>
              <select
                className={styles.select}
                value={startTime}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setStartTime(e.target.value)}
              >
                {availableSlots.map((slot) => (
                  <option key={slot.start} value={slot.start}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={styles.label}>
                Start Date (First Match)
              </label>
              <input
                type="date"
                className={styles.inputDate}
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="cta"
            size="lg"
            block
            disabled={!customer || loadingGrounds || !ground}
            loading={createMutation.isPending}
          >
            {loadingGrounds ? 'Loading Ground...' : 'Submit 3-Month Permanent Plan Request'}
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
                    <span>Commitment: <strong>{plan.commitmentMonths} Months ({plan.totalMatches || 13} matches)</strong></span>
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
                    {plan.totalAmount ? (
                      <span>Total Subscription Fee: <strong>৳{plan.totalAmount}</strong></span>
                    ) : null}
                    <div style={{ marginTop: 'var(--space-2)' }}>
                      {plan.paymentStatus === 'paid' ? (
                        <Badge tone="pitch" icon={<CheckCircle size={12} />}>
                          Paid in Full · {plan.paymentMethod || 'Confirmed'}
                        </Badge>
                      ) : (
                        <div style={{ background: 'var(--sun-soft)', color: 'var(--sun-ink)', padding: '6px 10px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', border: '1px solid var(--border)', lineHeight: 1.4 }}>
                          <strong>Payment Pending:</strong> Please pay ৳{plan.totalAmount || 'total'} via bKash or Cash to Admin to confirm full membership.
                        </div>
                      )}
                    </div>
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

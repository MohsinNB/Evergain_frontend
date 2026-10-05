import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Ticket,
  LogOut,
  Edit3,
  LogIn,
  UserPlus,
  Sparkles,
  CheckCircle2,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { formatTaka, formatTimeRange } from '@/lib/format';
import { formatDateLong, todayInDhaka } from '@/lib/date';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState, StatusPill, Badge } from '@/components/ui/primitives';
import { useCustomerAuth } from '@/features/customer-auth/context/CustomerAuthContext';
import { getCustomerCoupons, getCustomerBookings, updateCustomerProfile } from '../api';
import styles from './AccountPage.module.css';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').max(100),
  email: z.string().email('Valid email address required').or(z.literal('')).optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function AccountPage() {
  const { customer, loading: authLoading, logout, refetchMe } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'coupons' | 'settings'>('bookings');
  const [bookingSubTab, setBookingSubTab] = useState<'all' | 'upcoming' | 'previous'>('all');

  // Fetch bookings history
  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: getCustomerBookings,
    enabled: Boolean(customer),
  });

  // Fetch coupons
  const { data: coupons, isLoading: loadingCoupons } = useQuery({
    queryKey: ['my-coupons'],
    queryFn: getCustomerCoupons,
    enabled: Boolean(customer),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: customer?.name || '', email: customer?.email || '' },
  });

  const updateMutation = useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: async () => {
      toast.success('Profile updated successfully!');
      await refetchMe();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not update profile');
    },
  });

  if (authLoading) {
    return (
      <div className="container" style={{ maxWidth: '640px', paddingTop: 'var(--space-8)' }}>
        <Skeleton height="200px" radius="var(--radius-xl)" />
      </div>
    );
  }

  // Guest state (not logged in)
  if (!customer) {
    return (
      <div className="container" style={{ maxWidth: '540px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
        <Card className={styles.guestCard}>
          <div className={styles.guestIcon}>
            <User size={36} />
          </div>
          <h1 className={styles.guestTitle}>Customer Account</h1>
          <p className={styles.guestSubtitle}>
            Log in or sign up to view your booking history, redeem ৳50 discount coupons, and manage permanent plans.
          </p>

          <div className={styles.guestActions}>
            <Link to="/login" style={{ width: '100%' }}>
              <Button variant="cta" size="lg" block iconLeft={<LogIn size={20} />}>
                Log In
              </Button>
            </Link>
            <Link to="/signup" style={{ width: '100%' }}>
              <Button variant="secondary" size="lg" block iconLeft={<UserPlus size={20} />}>
                Register for ৳50 Coupon
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isUpcomingBooking = (b: { date: string; status: string }) => {
    const today = todayInDhaka();
    if (b.status === 'CANCELLED' || b.status === 'EXPIRED' || b.status === 'NO_SHOW') {
      return false;
    }
    return b.date >= today;
  };

  const filteredBookings = (bookings || []).filter((b) => {
    if (bookingSubTab === 'upcoming') return isUpcomingBooking(b);
    if (bookingSubTab === 'previous') return !isUpcomingBooking(b);
    return true;
  });

  const onSubmitProfile = (values: ProfileValues) => {
    updateMutation.mutate({
      name: values.name,
      email: values.email || undefined,
    });
  };

  return (
    <div className="container" style={{ maxWidth: '720px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      {/* Profile Summary Header Card */}
      <Card className={`${styles.profileCard} rise-in`}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {customer.name.slice(0, 1).toUpperCase()}
          </div>
          <div className={styles.profileMeta}>
            <div className={styles.nameRow}>
              <h1 className={styles.profileName}>{customer.name}</h1>
              {customer.isRegistered && (
                <Badge tone="pitch" icon={<ShieldCheck size={12} />}>
                  Registered Member
                </Badge>
              )}
            </div>
            <div className={styles.contactRow}>
              <span>
                <Phone size={14} /> {customer.phone}
              </span>
              {customer.email && (
                <span>
                  <Mail size={14} /> {customer.email}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={logout}
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{customer.totalBookings}</span>
            <span className={styles.statLabel}>Total Bookings</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{coupons?.filter((c) => !c.isUsed).length ?? 0}</span>
            <span className={styles.statLabel}>Active Coupons</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className={styles.tabNav} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'bookings'}
          className={`${styles.tabBtn} ${activeTab === 'bookings' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Calendar size={18} /> My Bookings
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'coupons'}
          className={`${styles.tabBtn} ${activeTab === 'coupons' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          <Ticket size={18} /> Coupons ({coupons?.filter((c) => !c.isUsed).length ?? 0})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'settings'}
          className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Edit3 size={18} /> Settings
        </button>
      </div>

      {/* Tab Panels */}
      <div className={styles.tabContent}>
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className={styles.sectionStack}>
            {/* Filter Sub-Pills */}
            {bookings && bookings.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <button
                  type="button"
                  onClick={() => setBookingSubTab('all')}
                  style={{
                    padding: '4px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    background: bookingSubTab === 'all' ? 'var(--pitch)' : 'var(--surface-2)',
                    color: bookingSubTab === 'all' ? '#fff' : 'var(--muted)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  All ({bookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingSubTab('upcoming')}
                  style={{
                    padding: '4px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    background: bookingSubTab === 'upcoming' ? 'var(--sky)' : 'var(--surface-2)',
                    color: bookingSubTab === 'upcoming' ? '#fff' : 'var(--muted)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  Upcoming ({bookings.filter(isUpcomingBooking).length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingSubTab('previous')}
                  style={{
                    padding: '4px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    background: bookingSubTab === 'previous' ? 'var(--ink)' : 'var(--surface-2)',
                    color: bookingSubTab === 'previous' ? '#fff' : 'var(--muted)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  Previous ({bookings.filter((b) => !isUpcomingBooking(b)).length})
                </button>
              </div>
            )}

            {loadingBookings ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height="120px" radius="var(--radius-lg)" />
              ))
            ) : !bookings || bookings.length === 0 ? (
              <EmptyState
                icon={<Calendar size={32} />}
                title="No bookings yet"
                description="Your past and upcoming slot bookings will appear here."
              />
            ) : filteredBookings.length === 0 ? (
              <EmptyState
                icon={<Calendar size={32} />}
                title={`No ${bookingSubTab} bookings`}
                description={`You have no ${bookingSubTab} slot bookings.`}
              />
            ) : (
              filteredBookings.map((booking) => {
                const upcoming = isUpcomingBooking(booking);
                return (
                  <Card key={booking._id} className={styles.bookingCard}>
                    <div className={styles.bookingHead}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className={styles.groundName}>{booking.groundId?.name || 'Evergain Avenue'}</span>
                          <Badge tone={upcoming ? 'sky' : 'neutral'}>
                            {upcoming ? 'Upcoming' : 'Previous'}
                          </Badge>
                        </div>
                        <div className={styles.bookingTime}>
                          {formatDateLong(booking.date)} · {formatTimeRange(booking.startTime, booking.endTime)}
                        </div>
                      </div>
                      <StatusPill status={booking.status} />
                    </div>
                    <div className={styles.bookingFooter}>
                      <span className={styles.bookingTran}>Ref: {booking.payment?.tranId || booking._id}</span>
                      <span className={styles.bookingPrice}>{formatTaka(booking.price)}</span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div className={styles.sectionStack}>
            {loadingCoupons ? (
              <Skeleton height="100px" radius="var(--radius-lg)" />
            ) : !coupons || coupons.length === 0 ? (
              <EmptyState
                icon={<Tag size={32} />}
                title="No coupons available"
                description="Complete your profile registration to get a ৳50 discount coupon!"
              />
            ) : (
              coupons.map((coupon) => (
                <Card key={coupon._id} className={`${styles.couponCard} ${coupon.isUsed ? styles.couponUsed : ''}`}>
                  <div className={styles.couponLeft}>
                    <div className={styles.couponBadgeIcon}>
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className={styles.couponTitle}>
                        {coupon.type === 'profile_completion' ? 'Profile Completion Discount' : 'Promo Discount'}
                      </h3>
                      <p className={styles.couponDesc}>
                        {formatTaka(coupon.amountValue)} OFF on your next slot booking
                      </p>
                    </div>
                  </div>
                  <Badge tone={coupon.isUsed ? 'neutral' : 'sun'}>
                    {coupon.isUsed ? 'Already Used' : 'Available'}
                  </Badge>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === 'settings' && (
          <Card className={styles.settingsCard}>
            <h2 className={styles.settingsTitle}>Update Profile Information</h2>
            <form onSubmit={handleSubmit(onSubmitProfile)} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="profile-name" className={styles.label}>
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  {...register('name')}
                />
                {errors.name && <span className={styles.errorMsg}>{errors.name.message}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="profile-email" className={styles.label}>
                  Email Address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  placeholder="tanvir@example.com"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  {...register('email')}
                />
                {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Mobile Number</label>
                <input type="text" className={styles.inputDisabled} value={customer.phone} disabled />
                <span className={styles.fieldNote}>Mobile number cannot be changed.</span>
              </div>

              <Button
                type="submit"
                variant="cta"
                size="lg"
                loading={updateMutation.isPending}
                iconLeft={<CheckCircle2 size={20} />}
              >
                Save Changes
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

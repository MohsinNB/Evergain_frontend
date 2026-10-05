import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, RefreshCw, CheckCircle, XCircle, Tag, X } from 'lucide-react';
import { formatTimeRange } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState, Badge } from '@/components/ui/primitives';
import {
  getAdminPermanentBookings,
  cancelPermanentBookingPlan,
  updatePermanentBookingDiscount,
  type PermanentBookingPlan,
  type PlanDiscountType,
} from '../api';
import styles from '../PermanentBooking.module.css';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AdminPermanentBookingsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingPlan, setEditingPlan] = useState<PermanentBookingPlan | null>(null);

  const [discountType, setDiscountType] = useState<PlanDiscountType>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const { data: plans, isLoading, refetch } = useQuery({
    queryKey: ['admin-permanent-bookings', statusFilter],
    queryFn: () => getAdminPermanentBookings(statusFilter !== 'all' ? { status: statusFilter } : undefined),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelPermanentBookingPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permanent-bookings'] });
    },
  });

  const discountMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { discountType: PlanDiscountType; discountValue: number } }) =>
      updatePermanentBookingDiscount(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permanent-bookings'] });
      setEditingPlan(null);
    },
  });

  const handleOpenDiscountModal = (plan: PermanentBookingPlan) => {
    setEditingPlan(plan);
    setDiscountType(plan.discountType || 'fixed');
    setDiscountValue(plan.discountValue || 0);
  };

  const handleDiscountSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    discountMutation.mutate({
      id: editingPlan._id,
      input: { discountType, discountValue },
    });
  };

  return (
    <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-3xl)', fontWeight: 800, margin: '0 0 var(--space-1) 0' }}>
            Permanent Booking Subscriptions
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 'var(--font-size-md)' }}>
            Manage recurring weekly 3-month plans and custom subscriber discounts.
          </p>
        </div>

        <Button variant="secondary" size="md" iconLeft={<RefreshCw size={16} />} onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {['all', 'active', 'cancelled', 'completed'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: statusFilter === st ? 'var(--color-pitch-emerald)' : 'var(--color-bg-subtle)',
              color: statusFilter === st ? '#000' : 'var(--color-text-secondary)',
              fontWeight: statusFilter === st ? 800 : 500,
              fontSize: 'var(--font-size-xs)',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {st}
          </button>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <Skeleton height="300px" radius="var(--radius-lg)" />
        ) : !plans || plans.length === 0 ? (
          <EmptyState
            icon={<Calendar size={32} />}
            title="No permanent booking plans found"
            description="Subscribed customer plans will show up here."
          />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Weekly Day</th>
                  <th>Slot Time</th>
                  <th>Start Date</th>
                  <th>Discount Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => {
                  const customerObj = typeof plan.customerId === 'object' ? plan.customerId : null;
                  return (
                    <tr key={plan._id}>
                      <td>
                        <strong>{customerObj?.name || 'Customer'}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {customerObj?.phone || '-'}
                        </div>
                      </td>
                      <td>
                        <strong>{DAY_NAMES[plan.dayOfWeek]}</strong>
                      </td>
                      <td>{formatTimeRange(plan.startTime, plan.endTime)}</td>
                      <td>{plan.startDate}</td>
                      <td>
                        {plan.discountValue > 0 ? (
                          <Badge tone="pitch">
                            {plan.discountType === 'fixed' ? `৳${plan.discountValue} Off` : `${plan.discountValue}% Off`}
                          </Badge>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Standard Rate</span>
                        )}
                      </td>
                      <td>
                        {plan.status === 'active' && <Badge tone="pitch" icon={<CheckCircle size={12} />}>Active</Badge>}
                        {plan.status === 'cancelled' && <Badge tone="neutral" icon={<XCircle size={12} />}>Cancelled</Badge>}
                        {plan.status === 'completed' && <Badge tone="sky">Completed</Badge>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            iconLeft={<Tag size={12} />}
                            onClick={() => handleOpenDiscountModal(plan)}
                          >
                            Set Discount
                          </Button>
                          {plan.status === 'active' && (
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={cancelMutation.isPending}
                              onClick={() => cancelMutation.mutate(plan._id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Discount Editor Modal */}
      {editingPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }}>
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Update Subscription Discount</h3>
              <button type="button" onClick={() => setEditingPlan(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDiscountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Discount Type
                </label>
                <select
                  style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                  value={discountType}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setDiscountType(e.target.value as PlanDiscountType)}
                >
                  <option value="fixed">Fixed Taka Discount (৳)</option>
                  <option value="percentage">Percentage Discount (%)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Discount Value ({discountType === 'fixed' ? '৳ Amount' : '% Percentage'})
                </label>
                <input
                  type="number"
                  style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                  value={discountValue}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDiscountValue(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <Button type="button" variant="secondary" onClick={() => setEditingPlan(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={discountMutation.isPending}>
                  Save Discount
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, RefreshCw, CheckCircle, XCircle, Tag, X, DollarSign } from 'lucide-react';
import { formatTimeRange } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState, Badge } from '@/components/ui/primitives';
import {
  getAdminPermanentBookings,
  cancelPermanentBookingPlan,
  updatePermanentBookingDiscount,
  markPermanentBookingPlanPaid,
  type PermanentBookingPlan,
  type PlanDiscountType,
  type PermanentPaymentMethod,
} from '../api';
import styles from '../PermanentBooking.module.css';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AdminPermanentBookingsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingPlan, setEditingPlan] = useState<PermanentBookingPlan | null>(null);

  const [payingPlan, setPayingPlan] = useState<PermanentBookingPlan | null>(null);
  const [payMethod, setPayMethod] = useState<PermanentPaymentMethod>('BKASH');
  const [payNotes, setPayNotes] = useState<string>('');

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

  const markPaidMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { paymentMethod: PermanentPaymentMethod; paymentNotes?: string } }) =>
      markPermanentBookingPlanPaid(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permanent-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setPayingPlan(null);
      setPayNotes('');
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

  const handleMarkPaidSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!payingPlan) return;
    markPaidMutation.mutate({
      id: payingPlan._id,
      input: {
        paymentMethod: payMethod,
        paymentNotes: payNotes.trim() || undefined,
      },
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
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => {
                  const customerObj = typeof plan.customerId === 'object' ? plan.customerId : null;
                  const isPlanPaid = plan.paymentStatus === 'paid';
                  return (
                    <tr key={plan._id}>
                      <td>
                        <strong>{customerObj?.name || 'Customer'}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
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
                          <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Standard Rate</span>
                        )}
                      </td>
                      <td>
                        {isPlanPaid ? (
                          <div>
                            <Badge tone="pitch" icon={<CheckCircle size={12} />}>
                              Paid · {plan.paymentMethod || 'Full'}
                            </Badge>
                            {plan.totalAmount ? (
                              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                                ৳{plan.totalAmount} ({plan.totalMatches || 13} matches)
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div>
                            <Badge tone="sun">
                              Unpaid
                            </Badge>
                            {plan.totalAmount ? (
                              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginTop: '2px' }}>
                                Total: ৳{plan.totalAmount}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </td>
                      <td>
                        {plan.status === 'active' && <Badge tone="pitch" icon={<CheckCircle size={12} />}>Active</Badge>}
                        {plan.status === 'cancelled' && <Badge tone="neutral" icon={<XCircle size={12} />}>Cancelled</Badge>}
                        {plan.status === 'completed' && <Badge tone="sky">Completed</Badge>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          {!isPlanPaid && plan.status === 'active' && (
                            <Button
                              variant="cta"
                              size="sm"
                              iconLeft={<DollarSign size={13} />}
                              onClick={() => {
                                setPayingPlan(plan);
                                setPayMethod('BKASH');
                                setPayNotes('');
                              }}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            iconLeft={<Tag size={12} />}
                            onClick={() => handleOpenDiscountModal(plan)}
                          >
                            Discount
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
                <label className={styles.label}>
                  Discount Type
                </label>
                <select
                  className={styles.select}
                  value={discountType}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setDiscountType(e.target.value as PlanDiscountType)}
                >
                  <option value="fixed">Fixed Taka Discount (৳)</option>
                  <option value="percentage">Percentage Discount (%)</option>
                </select>
              </div>

              <div>
                <label className={styles.label}>
                  Discount Value ({discountType === 'fixed' ? '৳ Amount' : '% Percentage'})
                </label>
                <input
                  type="number"
                  className={styles.inputDate}
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

      {/* Mark Plan Paid Modal */}
      {payingPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--ink)' }}>Confirm Full Plan Payment</h3>
              <button type="button" onClick={() => setPayingPlan(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--surface-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--muted)' }}>Customer:</span>
                <strong style={{ color: 'var(--ink)' }}>{typeof payingPlan.customerId === 'object' ? payingPlan.customerId.name : 'Customer'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--muted)' }}>Slot:</span>
                <strong style={{ color: 'var(--ink)' }}>{DAY_NAMES[payingPlan.dayOfWeek]} ({formatTimeRange(payingPlan.startTime, payingPlan.endTime)})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--muted)' }}>Total Commitment Amount:</span>
                <strong style={{ color: 'var(--pitch)', fontSize: 'var(--text-base)' }}>৳{payingPlan.totalAmount || (payingPlan.commitmentMonths ? payingPlan.commitmentMonths * 4 * 750 : 'N/A')}</strong>
              </div>
            </div>

            <form onSubmit={handleMarkPaidSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className={styles.label}>
                  Payment Method Received
                </label>
                <select
                  className={styles.select}
                  value={payMethod}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setPayMethod(e.target.value as PermanentPaymentMethod)}
                >
                  <option value="BKASH">bKash (Send-Money / Merchant Payment)</option>
                  <option value="CASH">Cash (Received at Ground Counter)</option>
                  <option value="BANK">Bank Transfer / POS Card</option>
                </select>
              </div>

              <div>
                <label className={styles.label}>
                  Reference / Transaction ID / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TrxID 9J4728... or Cash received at reception"
                  className={styles.inputDate}
                  value={payNotes}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPayNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <Button type="button" variant="secondary" onClick={() => setPayingPlan(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="cta" loading={markPaidMutation.isPending}>
                  Confirm Paid
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

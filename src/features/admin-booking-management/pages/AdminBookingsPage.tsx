import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  XCircle,
  UserX,
  X,
  AlertTriangle,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { formatDateLong } from '@/lib/date';
import { formatTaka, formatTimeRange } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState, StatusPill } from '@/components/ui/primitives';
import { toast } from 'sonner';
import type { AdminBookingItem } from '@/features/admin-dashboard/api';
import { getAdminBookingsList, cancelBooking, markBookingNoShow, revertBookingToBooked } from '../api';
import styles from './AdminBookings.module.css';

export function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const dateParam = searchParams.get('date') || '';
  const statusParam = searchParams.get('status') || '';

  const [dateFilter, setDateFilter] = useState(dateParam);
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [searchQuery, setSearchQuery] = useState('');

  // Cancel Modal State
  const [cancellingBooking, setCancellingBooking] = useState<AdminBookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // No-Show Confirmation Modal State
  const [noShowBooking, setNoShowBooking] = useState<AdminBookingItem | null>(null);

  // Fetch bookings list
  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin-bookings', dateFilter, statusFilter, searchQuery],
    queryFn: () =>
      getAdminBookingsList({
        date: dateFilter || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      }),
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelBooking(id, reason),
    onSuccess: () => {
      toast.success('Booking cancelled successfully and slot freed!');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-daily-analytics'] });
      setCancellingBooking(null);
      setCancelReason('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not cancel booking');
    },
  });

  // No-Show Mutation
  const noShowMutation = useMutation({
    mutationFn: markBookingNoShow,
    onSuccess: () => {
      toast.success('Booking marked as NO_SHOW');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-daily-analytics'] });
      setNoShowBooking(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not mark as no-show');
    },
  });

  // Revert to BOOKED Mutation
  const revertMutation = useMutation({
    mutationFn: revertBookingToBooked,
    onSuccess: () => {
      toast.success('Booking restored to BOOKED (active) successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-daily-analytics'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not restore booking status');
    },
  });

  const handleApplyFilter = () => {
    const nextParams = new URLSearchParams();
    if (dateFilter) nextParams.set('date', dateFilter);
    if (statusFilter) nextParams.set('status', statusFilter);
    setSearchParams(nextParams);
    refetch();
  };

  const handleClearFilter = () => {
    setDateFilter('');
    setStatusFilter('');
    setSearchQuery('');
    setSearchParams({});
  };

  const handleConfirmCancel = () => {
    if (!cancellingBooking) return;
    if (!cancelReason.trim()) {
      toast.error('Please enter a cancellation reason');
      return;
    }
    cancelMutation.mutate({ id: cancellingBooking._id, reason: cancelReason });
  };

  return (
    <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bookings Management</h1>
          <p className={styles.subtitle}>View, filter, cancel, or mark no-show for all ground bookings.</p>
        </div>
        <Link to="/admin/bookings/new">
          <Button variant="primary" size="md" iconLeft={<PlusCircle size={16} />}>
            New Manual Booking
          </Button>
        </Link>
      </div>

      {/* Filter Bar Card */}
      <Card className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Date Filter</label>
            <input
              type="date"
              className={styles.input}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Booking Status</label>
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="BOOKED">BOOKED (Confirmed)</option>
              <option value="PENDING">PENDING (15-min Hold)</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="NO_SHOW">NO_SHOW</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Search Customer</label>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Name or phone..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterBtnGroup}>
            <Button variant="secondary" size="md" iconLeft={<Filter size={16} />} onClick={handleApplyFilter}>
              Filter
            </Button>
            {(dateFilter || statusFilter || searchQuery) && (
              <Button variant="ghost" size="md" onClick={handleClearFilter}>
                Clear
              </Button>
            )}
            <Button variant="ghost" size="md" iconLeft={<RefreshCw size={16} />} onClick={() => refetch()} title="Refresh data" />
          </div>
        </div>
      </Card>

      {/* Bookings Table Card */}
      <Card className={styles.tableCard}>
        <div className={styles.tableHeadRow}>
          <h2 className={styles.tableTitle}>Bookings List</h2>
          <span className={styles.totalBadge}>{data?.total ?? 0} total records</span>
        </div>

        {isLoading ? (
          <div style={{ padding: 'var(--space-4)' }}>
            <Skeleton height="200px" radius="var(--radius-md)" />
          </div>
        ) : !data || data.bookings.length === 0 ? (
          <EmptyState
            icon={<Calendar size={32} />}
            title="No bookings match your filters"
            description="Try clearing your search or selecting another date/status."
          />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Ref</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div>
                        <strong>{formatDateLong(booking.date)}</strong>
                        <div className={styles.timeSub}>{formatTimeRange(booking.startTime, booking.endTime)}</div>
                      </div>
                    </td>
                    <td>
                      <strong>{booking.customerName}</strong>
                    </td>
                    <td>{booking.customerPhone}</td>
                    <td>
                      <span className={styles.typeBadge}>{booking.bookingType}</span>
                    </td>
                    <td className={styles.priceCol}>{formatTaka(booking.price)}</td>
                    <td>
                      <StatusPill status={booking.status} />
                    </td>
                    <td>
                      <code className={styles.code}>{booking.payment?.tranId || String(booking._id || '').slice(-6)}</code>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        {booking.status === 'BOOKED' && (
                          <>
                            <button
                              type="button"
                              className={styles.cancelBtn}
                              onClick={() => setCancellingBooking(booking)}
                              title="Cancel booking"
                            >
                              <XCircle size={16} /> Cancel
                            </button>
                            <button
                              type="button"
                              className={styles.noShowBtn}
                              onClick={() => setNoShowBooking(booking)}
                              title="Mark No-Show"
                            >
                              <UserX size={16} /> No-Show
                            </button>
                          </>
                        )}
                        {(booking.status === 'NO_SHOW' || booking.status === 'CANCELLED') && (
                          <>
                            <button
                              type="button"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 700,
                                background: 'var(--pitch-soft)',
                                color: 'var(--pitch-strong)',
                                border: '1px solid var(--border-strong)',
                                cursor: 'pointer',
                              }}
                              onClick={() => revertMutation.mutate(booking._id)}
                              disabled={revertMutation.isPending}
                              title="Restore status to BOOKED"
                            >
                              <RotateCcw size={14} /> Restore
                            </button>
                            {booking.status === 'NO_SHOW' && (
                              <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => setCancellingBooking(booking)}
                                title="Cancel booking"
                              >
                                <XCircle size={16} /> Cancel
                              </button>
                            )}
                          </>
                        )}
                        {booking.status === 'PENDING' && (
                          <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={() => setCancellingBooking(booking)}
                            title="Cancel hold"
                          >
                            <XCircle size={16} /> Release
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Confirm No-Show Warning Modal */}
      {noShowBooking && (
        <div className={styles.modalOverlay} onClick={() => setNoShowBooking(null)}>
          <div className={`${styles.modal} rise-in`} onClick={(e) => e.stopPropagation()} role="dialog">
            <div className={styles.modalHead}>
              <div className={styles.modalTitleRow}>
                <UserX size={20} className={styles.warningIcon} />
                <h3>Confirm Customer No-Show</h3>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setNoShowBooking(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Are you sure you want to mark the booking for <strong>{noShowBooking.customerName}</strong> on{' '}
                {formatDateLong(noShowBooking.date)} ({formatTimeRange(noShowBooking.startTime, noShowBooking.endTime)}) as <strong>NO_SHOW</strong>?
              </p>
              <p className={styles.modalSubtext} style={{ marginTop: '8px', color: 'var(--amber-600, #d97706)' }}>
                This indicates the customer did not show up for their booked time slot. You can still restore or cancel this record later if needed.
              </p>

              <div className={styles.modalActions} style={{ marginTop: 'var(--space-4)' }}>
                <Button variant="secondary" size="md" onClick={() => setNoShowBooking(null)}>
                  Go Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={noShowMutation.isPending}
                  iconLeft={<UserX size={18} />}
                  onClick={() => noShowMutation.mutate(noShowBooking._id)}
                >
                  Confirm No-Show
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {cancellingBooking && (
        <div className={styles.modalOverlay} onClick={() => setCancellingBooking(null)}>
          <div className={`${styles.modal} rise-in`} onClick={(e) => e.stopPropagation()} role="dialog">
            <div className={styles.modalHead}>
              <div className={styles.modalTitleRow}>
                <AlertTriangle size={20} className={styles.warningIcon} />
                <h3>Cancel Booking</h3>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setCancellingBooking(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Are you sure you want to cancel the booking for <strong>{cancellingBooking.customerName}</strong> on{' '}
                {formatDateLong(cancellingBooking.date)} ({formatTimeRange(cancellingBooking.startTime, cancellingBooking.endTime)})?
              </p>
              <p className={styles.modalSubtext}>This action will immediately free the slot for other customers to book.</p>

              <div className={styles.field} style={{ marginTop: 'var(--space-3)' }}>
                <label htmlFor="cancel-reason" className={styles.label}>
                  Cancellation Reason (Required)
                </label>
                <textarea
                  id="cancel-reason"
                  rows={3}
                  className={styles.textarea}
                  placeholder="e.g. Customer requested cancellation / Weather emergency..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <div className={styles.modalActions}>
                <Button variant="secondary" size="md" onClick={() => setCancellingBooking(null)}>
                  Keep Booking
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  loading={cancelMutation.isPending}
                  iconLeft={<XCircle size={18} />}
                  onClick={handleConfirmCancel}
                >
                  Confirm Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Calendar, Clock, User, Phone, Receipt, Gift, ArrowRight, PlusCircle } from 'lucide-react';
import { formatTaka, formatTimeRange } from '@/lib/format';
import { formatDateLong } from '@/lib/date';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState } from '@/components/ui/primitives';
import { getPublicReceipt } from '../api';
import styles from './BookingResult.module.css';

export function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get('tran_id') || '';
  const bookingId = searchParams.get('booking_id') || '';

  const identifier = bookingId || tranId;

  const { data: receipt, isLoading, error } = useQuery({
    queryKey: ['public-receipt', identifier],
    queryFn: () => getPublicReceipt(identifier),
    enabled: Boolean(identifier),
    refetchInterval: (query) => {
      // If status is still PENDING, poll every 2 seconds until IPN flips it to BOOKED
      return query.state.data?.status === 'PENDING' ? 2000 : false;
    },
  });

  if (!identifier) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <EmptyState title="No booking reference found" description="Transaction ID or Booking ID missing from URL." />
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '640px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      {/* Success Badge Banner */}
      <div className={`${styles.statusHeader} rise-in`}>
        <div className={styles.iconSuccess}>
          <CheckCircle2 size={56} />
        </div>
        <h1 className={styles.statusTitle}>Booking Confirmed!</h1>
        <p className={styles.statusSubtitle}>Your indoor football slot has been reserved successfully.</p>
      </div>

      {isLoading ? (
        <Card className={styles.ticketCard}>
          <Skeleton height="200px" radius="var(--radius-lg)" />
        </Card>
      ) : error || !receipt ? (
        <Card className={styles.ticketCard}>
          <EmptyState
            title="Receipt details pending"
            description="Payment completed! Backend IPN is processing your receipt."
          />
        </Card>
      ) : (
        <>
          {/* Confirmed Ticket Card */}
          <Card className={`${styles.ticketCard} rise-in`}>
            <div className={styles.ticketHeader}>
              <div>
                <span className={styles.ticketGroundLabel}>Evergain Avenue</span>
                <h2 className={styles.ticketGroundName}>{receipt.groundName}</h2>
              </div>
              <span className={styles.statusBadgeConfirmed}>BOOKED</span>
            </div>

            <div className={styles.ticketDivider} />

            <div className={styles.ticketGrid}>
              <div className={styles.gridItem}>
                <span className={styles.itemLabel}>
                  <Calendar size={14} /> Date
                </span>
                <span className={styles.itemValue}>{formatDateLong(receipt.date)}</span>
              </div>

              <div className={styles.gridItem}>
                <span className={styles.itemLabel}>
                  <Clock size={14} /> Time Slot
                </span>
                <span className={styles.itemValue}>{formatTimeRange(receipt.startTime, receipt.endTime)}</span>
              </div>

              <div className={styles.gridItem}>
                <span className={styles.itemLabel}>
                  <User size={14} /> Booked By
                </span>
                <span className={styles.itemValue}>{receipt.customerName}</span>
              </div>

              <div className={styles.gridItem}>
                <span className={styles.itemLabel}>
                  <Phone size={14} /> Mobile
                </span>
                <span className={styles.itemValue}>{receipt.customerPhone}</span>
              </div>
            </div>

            <div className={styles.ticketDivider} />

            <div className={styles.ticketFooter}>
              <div className={styles.footerItem}>
                <span className={styles.itemLabel}>
                  <Receipt size={14} /> Transaction ID
                </span>
                <code className={styles.tranCode}>{receipt.payment?.tranId || tranId}</code>
              </div>
              <div className={styles.footerPrice}>
                <span className={styles.itemLabel}>Amount Paid</span>
                <span className={styles.paidPrice}>{formatTaka(receipt.price)}</span>
              </div>
            </div>
          </Card>

          {/* Profile Completion Offer Banner (Shown only if customer is not registered & hasn't received coupon) */}
          {receipt.showProfileOffer && (
            <div className={`${styles.offerCard} rise-in`}>
              <div className={styles.offerHeader}>
                <Gift size={24} className={styles.offerIcon} />
                <div>
                  <h3 className={styles.offerTitle}>Get ৳50 OFF Your Next Booking!</h3>
                  <p className={styles.offerText}>
                    Set up your password & email to claim your exclusive profile completion coupon.
                  </p>
                </div>
              </div>
              <Link to={`/signup?phone=${encodeURIComponent(receipt.customerPhone)}`} className={styles.offerBtn}>
                Claim ৳50 Discount <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </>
      )}

      {/* Action Links */}
      <div className={styles.actionRow}>
        <Button variant="primary" size="lg" block iconLeft={<PlusCircle size={20} />} onClick={() => (window.location.href = '/')}>
          Book Another Slot
        </Button>
      </div>
    </div>
  );
}

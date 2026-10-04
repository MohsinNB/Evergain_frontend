import { useSearchParams, useNavigate } from 'react-router-dom';
import { Ban, ArrowLeft, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/primitives';
import styles from './BookingResult.module.css';

export function BookingCancelledPage() {
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get('tran_id') || '';
  const navigate = useNavigate();

  return (
    <div className="container" style={{ maxWidth: '600px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      <div className={`${styles.statusHeader} rise-in`}>
        <div className={styles.iconCancelled}>
          <Ban size={56} />
        </div>
        <h1 className={styles.statusTitle}>Payment Cancelled</h1>
        <p className={styles.statusSubtitle}>You cancelled the checkout session before completing the payment.</p>
      </div>

      <Card className={`${styles.ticketCard} rise-in`}>
        <div className={styles.noticeBox}>
          <div>
            <strong>Slot Freed Automatically</strong>
            <p>The time slot has been freed for others to book. Feel free to pick another date or time slot whenever you are ready.</p>
          </div>
        </div>

        {tranId && (
          <div className={styles.tranMetaRow}>
            <span>Cancelled Ref:</span>
            <code>{tranId}</code>
          </div>
        )}
      </Card>

      <div className={styles.actionRow}>
        <Button variant="primary" size="lg" block iconLeft={<CalendarDays size={20} />} onClick={() => navigate('/')}>
          Choose New Slot
        </Button>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Return to Home
        </button>
      </div>
    </div>
  );
}

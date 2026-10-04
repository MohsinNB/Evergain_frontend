import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/primitives';
import styles from './BookingResult.module.css';

export function BookingFailedPage() {
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get('tran_id') || '';
  const navigate = useNavigate();

  return (
    <div className="container" style={{ maxWidth: '600px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      <div className={`${styles.statusHeader} rise-in`}>
        <div className={styles.iconFailed}>
          <XCircle size={56} />
        </div>
        <h1 className={styles.statusTitle}>Payment Failed</h1>
        <p className={styles.statusSubtitle}>Your payment could not be processed by the payment gateway.</p>
      </div>

      <Card className={`${styles.ticketCard} rise-in`}>
        <div className={styles.noticeBox}>
          <ShieldAlert size={20} className={styles.noticeIconDanger} />
          <div>
            <strong>No money was deducted</strong>
            <p>Your 15-minute slot hold will automatically expire. You can try booking the slot again anytime.</p>
          </div>
        </div>

        {tranId && (
          <div className={styles.tranMetaRow}>
            <span>Reference Transaction:</span>
            <code>{tranId}</code>
          </div>
        )}
      </Card>

      <div className={styles.actionRow}>
        <Button variant="cta" size="lg" block iconLeft={<RefreshCw size={20} />} onClick={() => navigate('/')}>
          Try Booking Again
        </Button>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Return to Home
        </button>
      </div>
    </div>
  );
}

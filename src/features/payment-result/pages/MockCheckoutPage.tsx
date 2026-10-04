import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CreditCard, Smartphone, ShieldCheck, CheckCircle2, XCircle, Ban, ArrowLeft } from 'lucide-react';
import { formatTaka } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/primitives';
import { simulateMockPayment } from '../api';
import styles from './MockCheckoutPage.module.css';

export function MockCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tranId = searchParams.get('tran_id') || searchParams.get('tranId') || 'MOCK_TRAN_123';
  const amount = Number(searchParams.get('amount') || 1500);

  const [method, setMethod] = useState<'bkash' | 'nagad' | 'card'>('bkash');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'success' | 'fail' | 'cancel') => {
    setLoading(true);
    try {
      if (action === 'success') {
        // Post to backend SSLCommerz success handler
        const result = await simulateMockPayment(tranId, 'success');
        toast.success('Simulated successful payment!');
        window.location.href = result.redirectUrl;
      } else if (action === 'fail') {
        toast.error('Payment failed simulation');
        navigate(`/booking/failed?tran_id=${tranId}`);
      } else {
        toast.info('Payment cancelled');
        navigate(`/booking/cancelled?tran_id=${tranId}`);
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || 'Payment simulation failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', paddingTop: 'var(--space-6)' }}>
      {/* Dev Notice Badge */}
      <div className={styles.devBanner}>
        <ShieldCheck size={18} />
        <div>
          <strong>SSLCommerz Dev Sandbox Simulator</strong>
          <p>SSLCommerz Store ID is unconfigured. Use this simulator to test your payment integration.</p>
        </div>
      </div>

      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.merchantLogo}>
            <span>Evergain</span> Avenue
          </div>
          <div className={styles.amountBox}>
            <span className={styles.amountLabel}>Total Amount</span>
            <span className={styles.amountValue}>{formatTaka(amount)}</span>
          </div>
        </div>

        <div className={styles.tranMeta}>
          <span>Transaction ID: <strong>{tranId}</strong></span>
          <span>Currency: <strong>BDT</strong></span>
        </div>

        {/* Payment Method Selector */}
        <div className={styles.methodSection}>
          <label className={styles.sectionLabel}>Select Payment Method</label>
          <div className={styles.methodGrid}>
            <button
              type="button"
              className={`${styles.methodCard} ${method === 'bkash' ? styles.methodActive : ''}`}
              onClick={() => setMethod('bkash')}
            >
              <Smartphone size={24} className={styles.bkashIcon} />
              <span>bKash</span>
            </button>
            <button
              type="button"
              className={`${styles.methodCard} ${method === 'nagad' ? styles.methodActive : ''}`}
              onClick={() => setMethod('nagad')}
            >
              <Smartphone size={24} className={styles.nagadIcon} />
              <span>Nagad</span>
            </button>
            <button
              type="button"
              className={`${styles.methodCard} ${method === 'card' ? styles.methodActive : ''}`}
              onClick={() => setMethod('card')}
            >
              <CreditCard size={24} className={styles.cardIcon} />
              <span>Cards</span>
            </button>
          </div>
        </div>

        {/* Simulated Inputs */}
        <div className={styles.inputBox}>
          {method === 'card' ? (
            <div>
              <label className={styles.inputLabel}>Card Number (Simulated)</label>
              <input type="text" className={styles.input} defaultValue="4111 2222 3333 4444" readOnly />
            </div>
          ) : (
            <div>
              <label className={styles.inputLabel}>{method === 'bkash' ? 'bKash' : 'Nagad'} Account Number</label>
              <input type="text" className={styles.input} defaultValue="01712345678" readOnly />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <Button
            variant="cta"
            size="lg"
            block
            loading={loading}
            iconLeft={<CheckCircle2 size={20} />}
            onClick={() => handleAction('success')}
          >
            Pay {formatTaka(amount)} (Simulate Success)
          </Button>

          <div className={styles.secondaryActions}>
            <Button
              variant="danger"
              size="md"
              disabled={loading}
              iconLeft={<XCircle size={18} />}
              onClick={() => handleAction('fail')}
            >
              Simulate Failure
            </Button>
            <Button
              variant="secondary"
              size="md"
              disabled={loading}
              iconLeft={<Ban size={18} />}
              onClick={() => handleAction('cancel')}
            >
              Cancel Payment
            </Button>
          </div>
        </div>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
        <button
          type="button"
          className="muted text-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} /> Return to Slot Booking
        </button>
      </div>
    </div>
  );
}

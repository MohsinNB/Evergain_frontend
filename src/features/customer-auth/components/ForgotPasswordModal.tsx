import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, KeyRound, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/primitives';
import { sendOtp, customerResetPassword } from '../api';
import styles from '../pages/AuthForm.module.css';

const step1Schema = z.object({
  identifier: z.string().trim().min(1, 'Mobile number or email is required'),
});

const step2Schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain numbers only'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIdentifier?: string;
  onSuccess?: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose, initialIdentifier = '', onSuccess }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');

  const formStep1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { identifier: initialIdentifier },
  });

  const formStep2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: '', newPassword: '' },
  });

  if (!isOpen) return null;

  const handleStep1Submit = async (values: Step1Values) => {
    setLoading(true);
    try {
      const isEmail = values.identifier.includes('@');
      const selectedChannel = isEmail ? 'email' : 'sms';
      setChannel(selectedChannel);

      const payload = isEmail
        ? { email: values.identifier, channel: 'email' as const, purpose: 'reset_password' as const }
        : { phone: values.identifier, channel: 'sms' as const, purpose: 'reset_password' as const };

      await sendOtp(payload);
      setIdentifier(values.identifier);
      setStep(2);
      toast.success('Password reset OTP sent!');
    } catch (err: any) {
      toast.error(err.message || 'Could not send reset OTP. Check your phone number or email.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (values: Step2Values) => {
    setLoading(true);
    try {
      await customerResetPassword({
        identifier,
        otp: values.otp,
        newPassword: values.newPassword,
        otpChannel: channel,
      });
      toast.success('Password reset successfully! Please login with your new password.');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password. Please check the OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '460px',
          position: 'relative',
          padding: 'var(--space-6)',
        }}
        onClick={(e) => e.stopPropagation()}
        className="rise-in"
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted)',
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--pitch-soft)',
              color: 'var(--pitch-strong)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <KeyRound size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Reset Password</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              {step === 1 ? 'Enter your registered phone number or email to receive reset code.' : `Code sent to ${identifier}`}
            </p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={formStep1.handleSubmit(handleStep1Submit)} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="reset-identifier" className={styles.label}>
                Mobile Number or Email Address
              </label>
              <input
                id="reset-identifier"
                type="text"
                placeholder="01712345678 or user@example.com"
                className={`${styles.input} ${formStep1.formState.errors.identifier ? styles.inputError : ''}`}
                disabled={loading}
                {...formStep1.register('identifier')}
              />
              {formStep1.formState.errors.identifier && (
                <span className={styles.errorMsg}>{formStep1.formState.errors.identifier.message}</span>
              )}
            </div>

            <Button
              type="submit"
              variant="cta"
              size="lg"
              block
              loading={loading}
              iconRight={<ArrowRight size={18} />}
            >
              Send Reset Code (OTP)
            </Button>
          </form>
        ) : (
          <form onSubmit={formStep2.handleSubmit(handleStep2Submit)} className={styles.form}>
            <div className={styles.devOtpBanner}>
              <ShieldCheck size={16} />
              <span>Dev Mode OTP code: <strong>123456</strong></span>
              <button
                type="button"
                className={styles.autoFillBtn}
                onClick={() => formStep2.setValue('otp', '123456')}
              >
                Auto-fill
              </button>
            </div>

            <div className={styles.field}>
              <label htmlFor="reset-otp" className={styles.label}>
                6-Digit OTP Code
              </label>
              <input
                id="reset-otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                className={`${styles.input} ${formStep2.formState.errors.otp ? styles.inputError : ''}`}
                disabled={loading}
                {...formStep2.register('otp')}
              />
              {formStep2.formState.errors.otp && (
                <span className={styles.errorMsg}>{formStep2.formState.errors.otp.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="reset-new-password" className={styles.label}>
                New Password
              </label>
              <input
                id="reset-new-password"
                type="password"
                placeholder="Minimum 6 characters"
                className={`${styles.input} ${formStep2.formState.errors.newPassword ? styles.inputError : ''}`}
                disabled={loading}
                {...formStep2.register('newPassword')}
              />
              {formStep2.formState.errors.newPassword && (
                <span className={styles.errorMsg}>{formStep2.formState.errors.newPassword.message}</span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              block
              loading={loading}
              iconLeft={<CheckCircle2 size={18} />}
            >
              Save New Password
            </Button>

            <button
              type="button"
              className={styles.backStepBtn}
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Change phone/email
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}

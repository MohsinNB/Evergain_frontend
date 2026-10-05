import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { BD_PHONE_REGEX } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/primitives';
import { UserPlus, ArrowRight, ShieldCheck, Sparkles, AlertCircle, KeyRound, LogIn } from 'lucide-react';
import { sendOtp } from '../api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import styles from './AuthForm.module.css';

const step1Schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  phone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid 11-digit BD number (e.g. 01712345678)'),
  email: z.string().email('Enter a valid email address').or(z.literal('')).optional(),
});

const step2Schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be digits only'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

export function SignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup } = useCustomerAuth();

  const initialPhone = searchParams.get('phone') || '';

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [existingAccountErr, setExistingAccountErr] = useState<string | null>(null);

  const formStep1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: '', phone: initialPhone, email: '' },
  });

  const formStep2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: '', password: '' },
  });

  const handleStep1Submit = async (values: Step1Values) => {
    setLoading(true);
    setExistingAccountErr(null);
    try {
      await sendOtp({
        phone: values.phone,
        email: values.email || undefined,
        channel: 'sms',
        purpose: 'signup',
      });
      setStep1Data(values);
      setStep(2);
      toast.success('OTP sent! (Dev Mode: enter 123456)');
    } catch (err: any) {
      const msg = err.message || 'Could not send OTP';
      if (msg.toLowerCase().includes('already exists')) {
        setExistingAccountErr(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (values: Step2Values) => {
    if (!step1Data) return;
    setLoading(true);
    try {
      await signup({
        name: step1Data.name,
        phone: step1Data.phone,
        email: step1Data.email || undefined,
        otp: values.otp,
        password: values.password,
        otpChannel: 'sms',
      });
      navigate('/account');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerBadge}>
          <Sparkles size={14} />
          <span>Profile Discount Reward</span>
        </div>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Sign up to claim ৳50 off your next booking & manage permanent plans.</p>
      </div>

      <Card className={styles.card}>
        {/* Progress indicator */}
        <div className={styles.stepIndicator}>
          <div className={`${styles.stepPill} ${step >= 1 ? styles.stepActive : ''}`}>
            <span>1</span> Info & Phone
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.stepPill} ${step === 2 ? styles.stepActive : ''}`}>
            <span>2</span> OTP & Password
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={formStep1.handleSubmit(handleStep1Submit)} className={styles.form}>
            {existingAccountErr && (
              <div
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--berry, #ef4444)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--berry, #dc2626)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{existingAccountErr}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <Link
                    to="/login"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--pitch)',
                      color: '#fff',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <LogIn size={14} /> Log In
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowForgotPassword(true)}
                    iconLeft={<KeyRound size={14} />}
                  >
                    Forgot Password?
                  </Button>
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="signup-name" className={styles.label}>
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="Tanvir Ahmed"
                className={`${styles.input} ${formStep1.formState.errors.name ? styles.inputError : ''}`}
                disabled={loading}
                {...formStep1.register('name')}
              />
              {formStep1.formState.errors.name && (
                <span className={styles.errorMsg}>{formStep1.formState.errors.name.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="signup-phone" className={styles.label}>
                Mobile Number (BD)
              </label>
              <input
                id="signup-phone"
                type="tel"
                placeholder="01712345678"
                className={`${styles.input} ${formStep1.formState.errors.phone ? styles.inputError : ''}`}
                disabled={loading}
                {...formStep1.register('phone')}
              />
              {formStep1.formState.errors.phone && (
                <span className={styles.errorMsg}>{formStep1.formState.errors.phone.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="signup-email" className={styles.label}>
                Email Address (Optional)
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="tanvir@example.com"
                className={`${styles.input} ${formStep1.formState.errors.email ? styles.inputError : ''}`}
                disabled={loading}
                {...formStep1.register('email')}
              />
              {formStep1.formState.errors.email && (
                <span className={styles.errorMsg}>{formStep1.formState.errors.email.message}</span>
              )}
            </div>

            <Button
              type="submit"
              variant="cta"
              size="lg"
              block
              loading={loading}
              iconRight={<ArrowRight size={20} />}
              id="send-otp-btn"
            >
              Send Verification OTP
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
              <label htmlFor="signup-otp" className={styles.label}>
                6-Digit OTP Code (sent to {step1Data?.phone})
              </label>
              <input
                id="signup-otp"
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
              <label htmlFor="signup-password" className={styles.label}>
                Choose Password
              </label>
              <input
                id="signup-password"
                type="password"
                placeholder="Minimum 6 characters"
                className={`${styles.input} ${formStep2.formState.errors.password ? styles.inputError : ''}`}
                disabled={loading}
                {...formStep2.register('password')}
              />
              {formStep2.formState.errors.password && (
                <span className={styles.errorMsg}>{formStep2.formState.errors.password.message}</span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              block
              loading={loading}
              iconLeft={<UserPlus size={20} />}
              id="complete-signup-btn"
            >
              Complete Registration & Claim Coupon
            </Button>

            <button
              type="button"
              className={styles.backStepBtn}
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Change phone number
            </button>
          </form>
        )}

        <div className={styles.footerLink}>
          Already registered? <Link to="/login">Login to your account</Link>
        </div>
      </Card>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        initialIdentifier={formStep1.getValues('phone') || formStep1.getValues('email') || ''}
        onSuccess={() => navigate('/login')}
      />
    </div>
  );
}

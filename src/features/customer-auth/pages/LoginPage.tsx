import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/primitives';
import { LogIn } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import styles from './AuthForm.module.css';

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Mobile number or email address is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      await login(values);
      navigate('/account');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Check your mobile number/email & password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '460px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <div className={styles.header}>
        <h1 className={styles.title}>Customer Login</h1>
        <p className={styles.subtitle}>Log in to manage your bookings, redeem coupons & create permanent plans.</p>
      </div>

      <Card className={styles.card}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="login-identifier" className={styles.label}>
              Mobile Number or Email Address
            </label>
            <input
              id="login-identifier"
              type="text"
              placeholder="01712345678 or user@example.com"
              className={`${styles.input} ${errors.identifier ? styles.inputError : ''}`}
              disabled={loading}
              {...register('identifier')}
            />
            {errors.identifier && <span className={styles.errorMsg}>{errors.identifier.message}</span>}
          </div>

          <div className={styles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="login-password" className={styles.label}>
                Password
              </label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--pitch-strong)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              disabled={loading}
              {...register('password')}
            />
            {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
          </div>

          <Button
            type="submit"
            variant="cta"
            size="lg"
            block
            loading={loading}
            iconLeft={<LogIn size={20} />}
            id="customer-login-btn"
          >
            Log In
          </Button>
        </form>

        <div className={styles.footerLink}>
          Don't have an account yet? <Link to="/signup">Register to get ৳50 OFF coupon</Link>
        </div>
      </Card>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        initialIdentifier={getValues('identifier') || ''}
      />
    </div>
  );
}

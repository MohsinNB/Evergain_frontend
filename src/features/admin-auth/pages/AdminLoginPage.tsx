import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { BD_PHONE_REGEX } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/primitives';
import { ShieldCheck, LogIn } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import styles from './AdminLogin.module.css';

const adminLoginSchema = z.object({
  phone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid 11-digit BD number (e.g. 01712345678)'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { phone: '', password: '' },
  });

  const onSubmit = async (values: AdminLoginValues) => {
    setLoading(true);
    try {
      await login(values);
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.message || 'Admin login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '440px', paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-12)' }}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <ShieldCheck size={16} />
          <span>Management Portal</span>
        </div>
        <h1 className={styles.title}>Admin Portal</h1>
        <p className={styles.subtitle}>Sign in with your authorized admin credentials.</p>
      </div>

      <Card className={styles.card}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="admin-phone" className={styles.label}>
              Admin Phone Number
            </label>
            <input
              id="admin-phone"
              type="tel"
              placeholder="01712345678"
              className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
              disabled={loading}
              {...register('phone')}
            />
            {errors.phone && <span className={styles.errorMsg}>{errors.phone.message}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="admin-password" className={styles.label}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              placeholder="Enter admin password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              disabled={loading}
              {...register('password')}
            />
            {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            block
            loading={loading}
            iconLeft={<LogIn size={20} />}
            id="admin-login-btn"
          >
            Log In as Admin
          </Button>
        </form>
      </Card>
    </div>
  );
}

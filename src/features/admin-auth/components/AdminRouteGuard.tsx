import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Skeleton, EmptyState } from '@/components/ui/primitives';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminRouteGuardProps {
  superAdminOnly?: boolean;
  children?: ReactNode;
}

export function AdminRouteGuard({ superAdminOnly = false, children }: AdminRouteGuardProps) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <Skeleton height="300px" radius="var(--radius-xl)" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (superAdminOnly && admin.role !== 'super_admin') {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <EmptyState
          icon={<ShieldAlert size={36} />}
          title="Super Admin Access Required"
          description={`Your role (${admin.role}) does not have permission to access this module.`}
        />
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}

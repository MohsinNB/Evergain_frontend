import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AdminUser, AdminLoginInput } from '../api';
import { getAdminMe, adminLogin, adminLogout } from '../api';
import { toast } from 'sonner';

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (input: AdminLoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refetchAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdmin = async () => {
    try {
      const data = await getAdminMe();
      setAdmin(data);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const handleLogin = async (input: AdminLoginInput) => {
    const res = await adminLogin(input);
    setAdmin(res.admin);
    toast.success(`Welcome to Admin Panel, ${res.admin.name}!`);
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
    } finally {
      setAdmin(null);
      toast.info('Admin logged out.');
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login: handleLogin,
        logout: handleLogout,
        refetchAdmin: fetchAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

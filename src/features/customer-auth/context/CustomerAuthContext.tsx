import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CustomerUser, CustomerLoginInput, CustomerSignupInput } from '../api';
import { getCustomerMe, customerLogin, customerSignup, customerLogout } from '../api';
import { toast } from 'sonner';
import { queryClient } from '@/lib/queryClient';

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  loading: boolean;
  login: (input: CustomerLoginInput) => Promise<void>;
  signup: (input: CustomerSignupInput) => Promise<void>;
  logout: () => Promise<void>;
  refetchMe: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const data = await getCustomerMe();
      setCustomer(data);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const handleLogin = async (input: CustomerLoginInput) => {
    const res = await customerLogin(input);
    setCustomer(res.customer);
    queryClient.invalidateQueries({ queryKey: ['my-coupons'] });
    queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    queryClient.invalidateQueries({ queryKey: ['customer-coupons'] });
    toast.success(`Welcome back, ${res.customer.name}!`);
  };

  const handleSignup = async (input: CustomerSignupInput) => {
    const res = await customerSignup(input);
    setCustomer(res.customer);
    queryClient.invalidateQueries({ queryKey: ['my-coupons'] });
    queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    queryClient.invalidateQueries({ queryKey: ['customer-coupons'] });
    toast.success('Account created successfully! Claim your ৳50 discount coupon.');
  };

  const handleLogout = async () => {
    try {
      await customerLogout();
    } finally {
      setCustomer(null);
      toast.info('Logged out successfully.');
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
        refetchMe: fetchMe,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}

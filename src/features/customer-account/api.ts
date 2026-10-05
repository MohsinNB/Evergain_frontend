import { getData, api } from '@/lib/api';

export interface CustomerProfile {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  isRegistered: boolean;
  totalBookings: number;
  createdAt: string;
}

export interface DiscountCouponItem {
  _id: string;
  type: string; // 'profile_completion'
  amountType: 'fixed' | 'percentage';
  amountValue: number;
  isUsed: boolean;
  usedInBookingId?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface CustomerBookingHistoryItem {
  _id: string;
  groundId: { _id: string; name: string; location: string };
  bookingType: 'one_time' | 'permanent';
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'BOOKED' | 'CANCELLED' | 'EXPIRED' | 'NO_SHOW';
  customerName: string;
  customerPhone: string;
  price: number;
  payment: {
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    tranId: string;
    paidAt?: string;
  };
  createdAt: string;
}

/** Get customer profile */
export async function getCustomerProfile(): Promise<CustomerProfile> {
  return getData<CustomerProfile>('/customer/profile');
}

/** Update customer profile */
export async function updateCustomerProfile(input: { name?: string; email?: string }): Promise<CustomerProfile> {
  const res = await api.patch('/customer/profile', input);
  return res.data.data;
}

/** Get customer coupons */
export async function getCustomerCoupons(): Promise<DiscountCouponItem[]> {
  return getData<DiscountCouponItem[]>('/customer/coupons');
}

/** Get customer booking history */
export async function getCustomerBookings(): Promise<CustomerBookingHistoryItem[]> {
  return getData<CustomerBookingHistoryItem[]>('/bookings/me');
}

import { getData, api, type ApiResponse } from '@/lib/api';

export interface DailyAnalytics {
  date: string;
  totalBookings: number;
  totalRevenue: number;
  pendingCount: number;
  bookedCount: number;
  cancelledCount: number;
  noShowCount: number;
}

export interface AdminBookingItem {
  _id: string;
  groundId: { name: string; location: string };
  bookingType: 'one_time' | 'permanent';
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'BOOKED' | 'CANCELLED' | 'EXPIRED' | 'NO_SHOW';
  customerId: { name: string; phone: string; email?: string };
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

/** Get daily analytics for admin dashboard */
export async function getDailyAnalytics(date: string): Promise<DailyAnalytics> {
  return getData<DailyAnalytics>('/analytics/daily', { date });
}

/** Get admin bookings list */
export async function getAdminBookings(params: { date?: string; status?: string }): Promise<{ bookings: AdminBookingItem[]; total: number }> {
  const res = await api.get<ApiResponse<AdminBookingItem[]>>('/bookings', { params });
  return {
    bookings: res.data.data || [],
    total: res.data.meta?.total ?? (res.data.data?.length || 0),
  };
}

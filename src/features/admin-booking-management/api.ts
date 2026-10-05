import { getData, api, type ApiResponse } from '@/lib/api';
import type { AdminBookingItem } from '../admin-dashboard/api';

export interface AdminBookingsQueryParams {
  date?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminManualBookingInput {
  groundId: string;
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  price?: number;
  paymentStatus?: 'paid' | 'pending';
  notes?: string;
}

export interface CalendarDayBookingItem {
  id: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'BOOKED' | 'CANCELLED' | 'EXPIRED' | 'NO_SHOW';
  customerName: string;
  customerPhone: string;
  price: number;
}

export interface CalendarDayOverview {
  date: string; // YYYY-MM-DD
  dayOfWeek: number;
  isClosed: boolean;
  closureReason?: string;
  totalBookings: number;
  totalRevenue: number;
  bookings: CalendarDayBookingItem[];
}

export interface CalendarMonthResponse {
  month: string; // YYYY-MM
  days: CalendarDayOverview[];
}

/** Fetch admin bookings list with filters */
export async function getAdminBookingsList(params: AdminBookingsQueryParams): Promise<{ bookings: AdminBookingItem[]; total: number }> {
  const res = await api.get<ApiResponse<AdminBookingItem[]>>('/bookings', { params: params as Record<string, unknown> });
  return {
    bookings: res.data.data || [],
    total: res.data.meta?.total ?? (res.data.data?.length || 0),
  };
}

/** Fetch single booking details */
export async function getBookingDetails(id: string): Promise<AdminBookingItem> {
  return getData<AdminBookingItem>(`/bookings/${id}`);
}

/** Admin manual booking / slot block */
export async function createAdminManualBooking(input: AdminManualBookingInput): Promise<AdminBookingItem> {
  const res = await api.post('/bookings/admin-manual', input);
  return res.data.data;
}

/** Cancel a booking */
export async function cancelBooking(id: string, cancelReason: string): Promise<AdminBookingItem> {
  const res = await api.patch(`/bookings/${id}/cancel`, { cancelReason });
  return res.data.data;
}

/** Mark booking as NO_SHOW */
export async function markBookingNoShow(id: string): Promise<AdminBookingItem> {
  const res = await api.patch(`/bookings/${id}/no-show`);
  return res.data.data;
}

/** Revert NO_SHOW or CANCELLED booking back to BOOKED */
export async function revertBookingToBooked(id: string): Promise<AdminBookingItem> {
  const res = await api.patch(`/bookings/${id}/revert-booked`);
  return res.data.data;
}

/** Get monthly calendar overview */
export async function getMonthlyCalendar(month: string): Promise<CalendarMonthResponse> {
  return getData<CalendarMonthResponse>('/calendar', { month });
}

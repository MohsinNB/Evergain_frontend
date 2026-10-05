import { getData, api } from '@/lib/api';

export type PermanentBookingStatus = 'active' | 'cancelled' | 'completed';
export type PlanDiscountType = 'fixed' | 'percentage';

export interface CustomerSummary {
  _id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface GroundSummary {
  _id: string;
  name: string;
  location: string;
}

export interface PermanentBookingPlan {
  _id: string;
  customerId: CustomerSummary | string;
  groundId: GroundSummary | string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string;
  endTime: string;
  discountType: PlanDiscountType;
  discountValue: number;
  startDate: string;
  commitmentMonths: number;
  status: PermanentBookingStatus;
  createdAt: string;
}

export interface CreatePermanentBookingInput {
  groundId: string;
  dayOfWeek: number;
  startTime: string;
  startDate: string;
  commitmentMonths?: number;
}

export interface UpdatePlanDiscountInput {
  discountType: PlanDiscountType;
  discountValue: number;
}

/** Customer: Create a 3-month commitment permanent booking plan */
export async function createPermanentBookingPlan(input: CreatePermanentBookingInput): Promise<PermanentBookingPlan> {
  const res = await api.post('/permanent-bookings', input);
  return res.data.data;
}

/** Customer: Get my active permanent booking plans */
export async function getMyPermanentBookings(): Promise<PermanentBookingPlan[]> {
  return getData<PermanentBookingPlan[]>('/permanent-bookings/me');
}

/** Admin: Get all permanent booking plans in system */
export async function getAdminPermanentBookings(params?: { status?: string; groundId?: string }): Promise<PermanentBookingPlan[]> {
  return getData<PermanentBookingPlan[]>('/permanent-bookings', params);
}

/** Customer / Admin: Cancel a permanent booking plan */
export async function cancelPermanentBookingPlan(id: string): Promise<PermanentBookingPlan> {
  const res = await api.patch(`/permanent-bookings/${id}/cancel`);
  return res.data.data;
}

/** Admin: Update plan discount */
export async function updatePermanentBookingDiscount(id: string, input: UpdatePlanDiscountInput): Promise<PermanentBookingPlan> {
  const res = await api.patch(`/permanent-bookings/${id}/discount`, input);
  return res.data.data;
}

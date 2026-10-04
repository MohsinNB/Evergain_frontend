import { getData, api } from '@/lib/api';

export interface Ground {
  _id: string;
  name: string;
  location: string;
  openingTime: string;
  closingTime: string;
  slotDurationMinutes: number;
  pricePerSlot: number;
  isActive: boolean;
  closures: Array<{ date: string; reason: string }>;
}

export interface SlotView {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  originalPrice: number;
  price: number;
  discountApplied: boolean;
  discountAmount: number;
}

export interface SlotsResponse {
  groundId: string;
  groundName: string;
  date: string;
  isClosed: boolean;
  closureReason: string | null;
  pricePerSlot: number;
  slotDurationMinutes: number;
  slots: SlotView[];
}

export interface BookingRequestInput {
  groundId: string;
  date: string;
  startTime: string;
  name: string;
  phone: string;
  couponId?: string;
}

export interface BookingRequestResult {
  bookingId: string;
  tranId: string;
  price: number;
  holdExpiresAt: string;
  gatewayUrl: string;
}

/** Fetch active grounds list */
export async function getGrounds(): Promise<Ground[]> {
  return getData<Ground[]>('/grounds');
}

/** Fetch slots for a given date and ground */
export async function getSlots(groundId: string, date: string): Promise<SlotsResponse> {
  return getData<SlotsResponse>('/slots', { groundId, date });
}

/** Create guest booking request (creates 15-min PENDING hold & returns SSLCommerz checkout URL) */
export async function createBookingRequest(input: BookingRequestInput): Promise<BookingRequestResult> {
  const res = await api.post('/bookings/request', input);
  return res.data.data;
}

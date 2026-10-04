import { getData, api } from '@/lib/api';

export interface PublicReceipt {
  _id: string;
  bookingType: 'one_time' | 'permanent';
  groundName: string;
  groundLocation: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string;
  price: number;
  status: 'PENDING' | 'BOOKED' | 'CANCELLED' | 'EXPIRED' | 'NO_SHOW';
  payment: {
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    tranId: string;
    paidAt?: string;
  };
}

/** Fetch public receipt by transaction ID or booking ID */
export async function getPublicReceipt(identifier: string): Promise<PublicReceipt> {
  return getData<PublicReceipt>(`/bookings/public-receipt/${identifier}`);
}

/** Dev mock payment trigger */
export async function simulateMockPayment(tranId: string, action: 'success' | 'fail' | 'cancel'): Promise<{ redirectUrl: string }> {
  const endpoint = `/payment/sslcommerz/${action}`;
  // Passing JSON flag or accepting application/json returns the redirectUrl JSON
  const res = await api.post(endpoint, { tran_id: tranId }, { params: { json: 'true' } });
  return res.data.data;
}

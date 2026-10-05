import { getData, api } from '@/lib/api';

export interface CustomerUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  isRegistered: boolean;
  totalBookings: number;
  createdAt: string;
}

export interface SendOtpInput {
  phone?: string;
  email?: string;
  channel?: 'sms' | 'email';
  purpose?: 'signup' | 'login' | 'reset_password' | 'booking_verification';
}

export interface VerifyOtpInput {
  phone?: string;
  email?: string;
  otp: string;
  purpose?: 'signup' | 'login' | 'reset_password' | 'booking_verification';
}

export interface CustomerSignupInput {
  name: string;
  phone: string;
  password: string;
  email?: string;
  otp: string;
  otpChannel?: 'sms' | 'email';
}

export interface CustomerLoginInput {
  identifier: string;
  password: string;
}

export interface CustomerResetPasswordInput {
  identifier: string;
  otp: string;
  newPassword: string;
  otpChannel?: 'sms' | 'email';
}

/** Send OTP to phone/email */
export async function sendOtp(input: SendOtpInput): Promise<{ expiresAt: string; devOtp?: string }> {
  const res = await api.post('/otp/send', input);
  return res.data.data;
}

/** Verify 6-digit OTP */
export async function verifyOtp(input: VerifyOtpInput): Promise<{ isVerified: boolean }> {
  const res = await api.post('/otp/verify', input);
  return res.data.data;
}

/** Customer signup */
export async function customerSignup(input: CustomerSignupInput): Promise<{ customer: CustomerUser; token?: string }> {
  const res = await api.post('/auth/customer/signup', input);
  return res.data.data;
}

/** Customer login */
export async function customerLogin(input: CustomerLoginInput): Promise<{ customer: CustomerUser; token?: string }> {
  const res = await api.post('/auth/customer/login', input);
  return res.data.data;
}

/** Reset customer password */
export async function customerResetPassword(input: CustomerResetPasswordInput): Promise<{ message: string }> {
  const res = await api.post('/auth/customer/reset-password', input);
  return res.data;
}

/** Customer logout */
export async function customerLogout(): Promise<void> {
  await api.post('/auth/customer/logout');
}

/** Fetch logged-in customer profile */
export async function getCustomerMe(): Promise<CustomerUser> {
  return getData<CustomerUser>('/auth/customer/me');
}

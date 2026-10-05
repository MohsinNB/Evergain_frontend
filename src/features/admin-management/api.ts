import { getData, api, type ApiResponse } from '@/lib/api';
import type { AdminUser, AdminRole } from '../admin-auth/api';
import type { CustomerUser } from '../customer-auth/api';

export interface AuditLogItem {
  _id: string;
  actorId?: string;
  actorName?: string;
  actorRole: string;
  action: string;
  targetId?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface MonthlyAnalyticsData {
  year: number;
  month: number;
  totalBookings: number;
  totalRevenue: number;
  dailyBreakdown: Array<{ date: string; day: number; bookings: number; revenue: number }>;
}

export interface YearlyAnalyticsData {
  year: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyBreakdown: Array<{ month: number; monthName: string; bookings: number; revenue: number }>;
}

export interface GroundSettings {
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

/** Get monthly analytics breakdown */
export async function getMonthlyAnalytics(year: number, month: number): Promise<MonthlyAnalyticsData> {
  return getData<MonthlyAnalyticsData>('/analytics/monthly', { year, month });
}

/** Get yearly analytics breakdown */
export async function getYearlyAnalytics(year: number): Promise<YearlyAnalyticsData> {
  return getData<YearlyAnalyticsData>('/analytics/yearly', { year });
}

/** Get audit logs list */
export async function getAuditLogs(): Promise<{ logs: AuditLogItem[]; total: number }> {
  const res = await api.get<ApiResponse<AuditLogItem[]>>('/audit-logs');
  return {
    logs: res.data.data || [],
    total: res.data.meta?.total ?? (res.data.data?.length || 0),
  };
}

/** Get admin list of customers */
export async function getAdminCustomersList(): Promise<CustomerUser[]> {
  return getData<CustomerUser[]>('/customers');
}

/** Get list of admins (super admin) */
export async function getAdminsList(): Promise<AdminUser[]> {
  return getData<AdminUser[]>('/admins');
}

/** Create admin user (super admin) */
export async function createAdminUser(input: { name: string; phone: string; password: string; role: AdminRole }): Promise<AdminUser> {
  const res = await api.post('/admins', input);
  return res.data.data;
}

/** Update admin user (super admin) */
export async function updateAdminUser(id: string, input: { name?: string; role?: AdminRole; isActive?: boolean }): Promise<AdminUser> {
  const res = await api.patch(`/admins/${id}`, input);
  return res.data.data;
}

/** Get ground settings */
export async function getGroundSettingsData(): Promise<GroundSettings[]> {
  return getData<GroundSettings[]>('/ground/settings');
}

/** Update ground settings & closures (super admin) */
export async function updateGroundSettingsData(id: string, data: Partial<GroundSettings>): Promise<GroundSettings> {
  const res = await api.patch(`/ground/settings/${id}`, data);
  return res.data.data;
}

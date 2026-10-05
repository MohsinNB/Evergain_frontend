import { getData, api } from '@/lib/api';

export type AdminRole = 'super_admin' | 'admin' | 'staff';

export interface AdminUser {
  _id: string;
  name: string;
  phone: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

export interface AdminLoginInput {
  phone: string;
  password: string;
}

/** Admin login */
export async function adminLogin(input: AdminLoginInput): Promise<{ admin: AdminUser; token?: string }> {
  const res = await api.post('/auth/admin/login', input);
  return res.data.data;
}

/** Admin logout */
export async function adminLogout(): Promise<void> {
  await api.post('/auth/admin/logout');
}

/** Get logged in admin me */
export async function getAdminMe(): Promise<AdminUser> {
  return getData<AdminUser>('/auth/admin/me');
}

import axios, { AxiosError } from 'axios';

/**
 * Shared API client.
 * Uses relative `/api/v1` as baseURL so all browser requests are same-origin.
 * - In production: Vercel edge reverse proxy forwards `/api/*` to the Render backend,
 *   completely hiding the Render backend URL from the browser Network tab.
 * - In development: Vite dev server proxies `/api/*` to http://localhost:5000.
 */
export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 20_000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const customerToken = localStorage.getItem('customerToken');
  const adminToken = localStorage.getItem('adminToken');

  const url = config.url || '';
  const isAdminRoute =
    url.startsWith('/admin') ||
    url.includes('/admin/') ||
    url.startsWith('/ground/settings') ||
    url.includes('/ground/settings') ||
    url === '/ground' ||
    (url.startsWith('/ground') && !url.startsWith('/grounds')) ||
    url.startsWith('/calendar') ||
    url.includes('/calendar') ||
    url.startsWith('/analytics') ||
    url.includes('/analytics') ||
    url.startsWith('/audit-logs') ||
    url.includes('/audit-logs');

  const token = isAdminRoute ? adminToken : customerToken;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Every backend endpoint responds with this shape. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiFieldError {
  field: string;
  message: string;
}

interface ApiErrorBody {
  success?: false;
  message?: string;
  errors?: ApiFieldError[];
}

/** Normalized error used across the UI (toasts, form errors). */
export class AppError extends Error {
  readonly status: number;
  readonly fieldErrors: ApiFieldError[];

  constructor(message: string, status: number, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof AxiosError) {
    if (!error.response) {
      return new AppError('Network problem — please check your internet and try again.', 0);
    }
    const body = error.response.data as ApiErrorBody | undefined;
    const status = error.response.status;
    const fallback =
      status === 429
        ? 'Too many attempts. Please wait a few minutes and try again.'
        : status >= 500
          ? 'Something went wrong on our side. Please try again.'
          : 'Request failed.';
    return new AppError(body?.message ?? fallback, status, body?.errors ?? []);
  }

  if (error instanceof Error) return new AppError(error.message, 0);
  return new AppError('Unexpected error.', 0);
}

/** Convert axios errors to AppError so every caller gets a clean message. */
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toAppError(error)),
);

/** Helper: GET and unwrap `data`. */
export async function getData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, { params });
  return res.data.data;
}

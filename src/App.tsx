import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/queryClient';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { SlotBookingPage } from './features/public-slots/pages/SlotBookingPage';

import { MockCheckoutPage } from './features/payment-result/pages/MockCheckoutPage';
import { BookingSuccessPage } from './features/payment-result/pages/BookingSuccessPage';
import { BookingFailedPage } from './features/payment-result/pages/BookingFailedPage';
import { BookingCancelledPage } from './features/payment-result/pages/BookingCancelledPage';

import { GalleryPage } from './features/gallery/pages/GalleryPage';

import { CustomerAuthProvider } from './features/customer-auth/context/CustomerAuthContext';
import { LoginPage } from './features/customer-auth/pages/LoginPage';
import { SignupPage } from './features/customer-auth/pages/SignupPage';

import { AccountPage } from './features/customer-account/pages/AccountPage';
import { AdminAuthProvider } from './features/admin-auth/context/AdminAuthContext';
import { AdminRouteGuard } from './features/admin-auth/components/AdminRouteGuard';
import { AdminLoginPage } from './features/admin-auth/pages/AdminLoginPage';
import { AdminDashboardPage } from './features/admin-dashboard/pages/AdminDashboardPage';
import { AdminBookingsPage } from './features/admin-booking-management/pages/AdminBookingsPage';
import { AdminManualBookingPage } from './features/admin-booking-management/pages/AdminManualBookingPage';
import { AdminCalendarPage } from './features/admin-booking-management/pages/AdminCalendarPage';
import { AdminGalleryPage } from './features/admin-gallery-management/pages/AdminGalleryPage';
import { AdminAnalyticsPage } from './features/admin-management/pages/AdminAnalyticsPage';
import { AdminAuditLogsPage } from './features/admin-management/pages/AdminAuditLogsPage';
import { AdminCustomersPage } from './features/admin-management/pages/AdminCustomersPage';
import { AdminUsersPage } from './features/admin-management/pages/AdminUsersPage';
import { AdminSettingsPage } from './features/admin-management/pages/AdminSettingsPage';
import { PermanentBookingPage } from './features/permanent-booking/pages/PermanentBookingPage';
import { AdminPermanentBookingsPage } from './features/permanent-booking/pages/AdminPermanentBookingsPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <CustomerAuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public customer routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<SlotBookingPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/plans" element={<PermanentBookingPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/booking/success" element={<BookingSuccessPage />} />
                <Route path="/booking/failed" element={<BookingFailedPage />} />
                <Route path="/booking/cancelled" element={<BookingCancelledPage />} />
                <Route path="/mock-checkout" element={<MockCheckoutPage />} />
              </Route>

              {/* Admin protected routes */}
              <Route element={<AdminRouteGuard />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                  <Route path="/admin/bookings/new" element={<AdminManualBookingPage />} />
                  <Route path="/admin/calendar" element={<AdminCalendarPage />} />
                  <Route path="/admin/permanent" element={<AdminPermanentBookingsPage />} />
                  <Route path="/admin/gallery" element={<AdminGalleryPage />} />
                  <Route path="/admin/customers" element={<AdminCustomersPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                  <Route path="/admin/admins" element={<AdminUsersPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                </Route>
              </Route>
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Routes>
          </BrowserRouter>
        </CustomerAuthProvider>
      </AdminAuthProvider>
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}

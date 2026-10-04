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

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
      <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>{title}</h2>
      <p className="muted">This page will be implemented in the upcoming phase.</p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public customer routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<SlotBookingPage />} />
            <Route path="/gallery" element={<PlaceholderPage title="🖼 Photo & Video Gallery" />} />
            <Route path="/plans" element={<PlaceholderPage title="📅 Permanent Booking Plans" />} />
            <Route path="/account" element={<PlaceholderPage title="👤 My Account & Profile" />} />
            <Route path="/login" element={<PlaceholderPage title="Customer Login" />} />
            <Route path="/signup" element={<PlaceholderPage title="Customer Registration" />} />
            <Route path="/booking/success" element={<BookingSuccessPage />} />
            <Route path="/booking/failed" element={<BookingFailedPage />} />
            <Route path="/booking/cancelled" element={<BookingCancelledPage />} />
            <Route path="/mock-checkout" element={<MockCheckoutPage />} />
          </Route>

          {/* Admin protected routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<PlaceholderPage title="📊 Admin Dashboard" />} />
            <Route path="/admin/bookings" element={<PlaceholderPage title="📋 Bookings List" />} />
            <Route path="/admin/calendar" element={<PlaceholderPage title="🗓 Calendar View" />} />
            <Route path="/admin/permanent" element={<PlaceholderPage title="🔄 Permanent Plans" />} />
            <Route path="/admin/gallery" element={<PlaceholderPage title="🖼 Gallery Management" />} />
            <Route path="/admin/customers" element={<PlaceholderPage title="👥 Customers List" />} />
            <Route path="/admin/analytics" element={<PlaceholderPage title="📈 Analytics & Reports" />} />
            <Route path="/admin/audit-logs" element={<PlaceholderPage title="📜 System Audit Logs" />} />
            <Route path="/admin/admins" element={<PlaceholderPage title="🛡 Admin Management" />} />
            <Route path="/admin/settings" element={<PlaceholderPage title="⚙ Ground Settings" />} />
          </Route>
          <Route path="/admin/login" element={<PlaceholderPage title="Admin Login" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}

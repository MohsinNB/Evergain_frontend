import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, RefreshCw, ShieldCheck } from 'lucide-react';
import { formatDateLong } from '@/lib/date';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState, Badge } from '@/components/ui/primitives';
import { getAdminCustomersList } from '../api';
import styles from './AdminManagement.module.css';

export function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: getAdminCustomersList,
  });

  const filtered = customers?.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customer Directory</h1>
          <p className={styles.subtitle}>List of all guest and registered customers in the system.</p>
        </div>
        <Button variant="secondary" size="md" iconLeft={<RefreshCw size={16} />} onClick={() => refetch()}>
          Refresh List
        </Button>
      </div>

      <Card className={styles.card}>
        <div className={styles.cardHeadRow}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className={styles.totalBadge}>{filtered?.length ?? 0} customers</span>
        </div>

        {isLoading ? (
          <Skeleton height="300px" radius="var(--radius-lg)" />
        ) : !filtered || filtered.length === 0 ? (
          <EmptyState icon={<Users size={32} />} title="No customers found" description="Customer records will appear as bookings occur." />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Mobile Number</th>
                  <th>Email</th>
                  <th>Account Type</th>
                  <th>Total Bookings</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer._id}>
                    <td><strong>{customer.name}</strong></td>
                    <td>{customer.phone}</td>
                    <td>{customer.email || '-'}</td>
                    <td>
                      {customer.isRegistered ? (
                        <Badge tone="pitch" icon={<ShieldCheck size={12} />}>Registered</Badge>
                      ) : (
                        <Badge tone="neutral">Guest</Badge>
                      )}
                    </td>
                    <td><strong>{customer.totalBookings}</strong></td>
                    <td>{formatDateLong(customer.createdAt.slice(0, 10))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

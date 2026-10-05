import { useQuery } from '@tanstack/react-query';
import { ScrollText, RefreshCw } from 'lucide-react';
import { formatDateLong } from '@/lib/date';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState, Badge } from '@/components/ui/primitives';
import { getAuditLogs } from '../api';
import styles from './AdminManagement.module.css';

export function AdminAuditLogsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: getAuditLogs,
  });

  return (
    <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>System Audit Logs</h1>
          <p className={styles.subtitle}>Traceability record of all admin, customer, and booking mutations.</p>
        </div>
        <Button variant="secondary" size="md" iconLeft={<RefreshCw size={16} />} onClick={() => refetch()}>
          Refresh Logs
        </Button>
      </div>

      <Card className={styles.card}>
        <div className={styles.cardHeadRow}>
          <h2 className={styles.cardTitle}>Audit Records</h2>
          <span className={styles.totalBadge}>{data?.total ?? 0} entries</span>
        </div>

        {isLoading ? (
          <Skeleton height="300px" radius="var(--radius-lg)" />
        ) : !data || data.logs.length === 0 ? (
          <EmptyState icon={<ScrollText size={32} />} title="No audit logs recorded" description="System actions will appear here." />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Target Ref</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr key={log._id}>
                    <td>{formatDateLong(log.createdAt.slice(0, 10))} {log.createdAt.slice(11, 16)}</td>
                    <td><strong>{log.actorName || log.actorId || 'System'}</strong></td>
                    <td><Badge tone="neutral">{log.actorRole}</Badge></td>
                    <td><code className={styles.actionCode}>{log.action}</code></td>
                    <td><code className={styles.code}>{log.targetId || '-'}</code></td>
                    <td>{log.ipAddress || '127.0.0.1'}</td>
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

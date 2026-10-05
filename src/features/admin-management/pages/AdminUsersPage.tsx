import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, UserPlus, RefreshCw, CheckCircle, XCircle, X } from 'lucide-react';
import { useAdminAuth } from '../../admin-auth/context/AdminAuthContext';
import type { AdminRole } from '../../admin-auth/api';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState, Badge } from '@/components/ui/primitives';
import { getAdminsList, createAdminUser, updateAdminUser } from '../api';
import styles from './AdminManagement.module.css';

export function AdminUsersPage() {
  const { admin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    role: 'staff' as AdminRole,
  });

  const isSuperAdmin = admin?.role === 'super_admin';

  const { data: admins, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminsList,
    enabled: isSuperAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', password: '', role: 'staff' });
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create admin user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { role?: AdminRole; isActive?: boolean } }) =>
      updateAdminUser(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      setFormError('Please fill in all required fields');
      return;
    }
    setFormError('');
    createMutation.mutate(formData);
  };

  if (!isSuperAdmin) {
    return (
      <div style={{ paddingTop: 'var(--space-8)' }}>
        <Card className={styles.card}>
          <EmptyState
            icon={<ShieldAlert size={40} style={{ color: 'var(--color-accent-amber)' }} />}
            title="Access Restricted"
            description="Only Super Admin accounts are permitted to manage system admin users and permissions."
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>System Admin Users</h1>
          <p className={styles.subtitle}>Manage system staff, admin roles, and active permissions.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" size="md" iconLeft={<RefreshCw size={16} />} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button variant="primary" size="md" iconLeft={<UserPlus size={16} />} onClick={() => setIsModalOpen(true)}>
            Add Admin User
          </Button>
        </div>
      </div>

      <Card className={styles.card}>
        <div className={styles.cardHeadRow}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
            Active Personnel ({admins?.length ?? 0})
          </h3>
        </div>

        {isLoading ? (
          <Skeleton height="250px" radius="var(--radius-lg)" />
        ) : !admins || admins.length === 0 ? (
          <EmptyState title="No admin users found" description="Click 'Add Admin User' to create a staff or admin account." />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((adm) => (
                  <tr key={adm._id}>
                    <td>
                      <strong>{adm.name}</strong>
                      {adm._id === admin?._id && (
                        <span style={{ fontSize: '11px', color: 'var(--color-pitch-emerald)', marginLeft: '8px' }}>
                          (You)
                        </span>
                      )}
                    </td>
                    <td>{adm.phone}</td>
                    <td>
                      <select
                        className={styles.searchInput}
                        value={adm.role}
                        disabled={adm._id === admin?._id || updateMutation.isPending}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          updateMutation.mutate({
                            id: adm._id,
                            input: { role: e.target.value as AdminRole },
                          })
                        }
                        style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td>
                      {adm.isActive ? (
                        <Badge tone="pitch" icon={<CheckCircle size={12} />}>
                          Active
                        </Badge>
                      ) : (
                        <Badge tone="neutral" icon={<XCircle size={12} />}>
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td>
                      {adm._id !== admin?._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() =>
                            updateMutation.mutate({
                              id: adm._id,
                              input: { isActive: !adm.isActive },
                            })
                          }
                        >
                          {adm.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal for adding new admin */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }}>
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Create New Admin Account</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {formError && (
                <div style={{ color: 'var(--color-accent-rose)', fontSize: 'var(--font-size-sm)', background: 'rgba(239,68,68,0.1)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  {formError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Tanvir Ahmed"
                  className={styles.searchInput}
                  value={formData.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Mobile Phone Number *</label>
                <input
                  type="tel"
                  placeholder="01712345678"
                  className={styles.searchInput}
                  value={formData.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Password *</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  className={styles.searchInput}
                  value={formData.password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Role Permission *</label>
                <select
                  className={styles.searchInput}
                  value={formData.role}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                >
                  <option value="staff">Staff (Booking View & Operations)</option>
                  <option value="admin">Admin (Full Booking & Gallery Control)</option>
                  <option value="super_admin">Super Admin (Full System Access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={createMutation.isPending}>
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

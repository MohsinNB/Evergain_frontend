import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, Trash2, CalendarOff, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../../admin-auth/context/AdminAuthContext';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, Badge } from '@/components/ui/primitives';
import { getGroundSettingsData, updateGroundSettingsData, type GroundSettings } from '../api';
import styles from './AdminManagement.module.css';

export function AdminSettingsPage() {
  const { admin } = useAdminAuth();
  const queryClient = useQueryClient();
  const isSuperAdmin = admin?.role === 'super_admin';

  const [settingsForm, setSettingsForm] = useState<Partial<GroundSettings>>({});
  const [closures, setClosures] = useState<Array<{ date: string; reason: string }>>([]);
  const [newClosureDate, setNewClosureDate] = useState('');
  const [newClosureReason, setNewClosureReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: grounds, isLoading } = useQuery({
    queryKey: ['ground-settings'],
    queryFn: getGroundSettingsData,
  });

  const ground = grounds?.[0];

  useEffect(() => {
    if (ground) {
      setSettingsForm({
        name: ground.name,
        location: ground.location,
        openingTime: ground.openingTime,
        closingTime: ground.closingTime,
        slotDurationMinutes: ground.slotDurationMinutes,
        pricePerSlot: ground.pricePerSlot,
        isActive: ground.isActive,
      });
      setClosures(ground.closures || []);
    }
  }, [ground]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<GroundSettings>) => {
      if (!ground?._id) throw new Error('No ground ID found');
      return updateGroundSettingsData(ground._id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ground-settings'] });
      setSuccessMsg('Ground settings and closures saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
  });

  const handleAddClosure = () => {
    if (!newClosureDate || !newClosureReason) return;
    setClosures([...closures, { date: newClosureDate, reason: newClosureReason }]);
    setNewClosureDate('');
    setNewClosureReason('');
  };

  const handleRemoveClosure = (index: number) => {
    setClosures(closures.filter((_, i) => i !== index));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      ...settingsForm,
      closures,
    });
  };

  if (isLoading) {
    return (
      <div style={{ paddingTop: 'var(--space-8)' }}>
        <Skeleton height="400px" radius="var(--radius-lg)" />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ground & System Settings</h1>
          <p className={styles.subtitle}>Configure operating hours, pricing rules, and closure dates.</p>
        </div>
        {isSuperAdmin && (
          <Button
            variant="primary"
            size="md"
            iconLeft={<Save size={16} />}
            loading={updateMutation.isPending}
            onClick={handleSave}
          >
            Save All Settings
          </Button>
        )}
      </div>

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-pitch-emerald)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-pitch-emerald)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      {!isSuperAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent-amber)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--color-accent-amber)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
          <ShieldAlert size={18} />
          <span style={{ fontSize: 'var(--font-size-sm)' }}>
            Read-only mode: Only Super Admin users can modify ground settings and holiday closures.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Core Settings Card */}
        <Card className={styles.card}>
          <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
            Ground Configuration
          </h3>

          <form onSubmit={handleSave} className={styles.formGrid}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Ground Name
              </label>
              <input
                type="text"
                className={styles.searchInput}
                disabled={!isSuperAdmin}
                value={settingsForm.name || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSettingsForm({ ...settingsForm, name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Location Address
              </label>
              <input
                type="text"
                className={styles.searchInput}
                disabled={!isSuperAdmin}
                value={settingsForm.location || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSettingsForm({ ...settingsForm, location: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Opening Time (24h)
              </label>
              <input
                type="text"
                placeholder="08:00"
                className={styles.searchInput}
                disabled={!isSuperAdmin}
                value={settingsForm.openingTime || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSettingsForm({ ...settingsForm, openingTime: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Closing Time (24h)
              </label>
              <input
                type="text"
                placeholder="23:00"
                className={styles.searchInput}
                disabled={!isSuperAdmin}
                value={settingsForm.closingTime || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSettingsForm({ ...settingsForm, closingTime: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Slot Duration (Minutes)
              </label>
              <input
                type="number"
                className={styles.searchInput}
                disabled={!isSuperAdmin}
                value={settingsForm.slotDurationMinutes || 60}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSettingsForm({ ...settingsForm, slotDurationMinutes: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Base Price Per Slot (৳)
              </label>
              <input
                type="number"
                className={styles.searchInput}
                disabled={!isSuperAdmin}
                value={settingsForm.pricePerSlot || 0}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSettingsForm({ ...settingsForm, pricePerSlot: Number(e.target.value) })}
              />
            </div>
          </form>
        </Card>

        {/* Holiday / Maintenance Closures Card */}
        <Card className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarOff size={20} /> Ground Closures & Maintenance
            </h3>
            <Badge tone="neutral">{closures.length} Dates Blocked</Badge>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
            Blocked dates will show as unavailable for customer bookings (holidays, turf repairs, special events).
          </p>

          {isSuperAdmin && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <input
                type="date"
                className={styles.searchInput}
                style={{ width: '180px' }}
                value={newClosureDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewClosureDate(e.target.value)}
              />
              <input
                type="text"
                placeholder="Closure reason (e.g. Eid Holiday)"
                className={styles.searchInput}
                style={{ flex: 1, minWidth: '200px' }}
                value={newClosureReason}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewClosureReason(e.target.value)}
              />
              <Button type="button" variant="secondary" iconLeft={<Plus size={16} />} onClick={handleAddClosure}>
                Add Closure
              </Button>
            </div>
          )}

          <div className={styles.closureList}>
            {closures.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontStyle: 'italic', margin: 0 }}>
                No active ground closures scheduled.
              </p>
            ) : (
              closures.map((closure, index) => (
                <div key={index} className={styles.closureItem}>
                  <div className={styles.closureInfo}>
                    <span className={styles.closureDate}>{closure.date}</span>
                    <span className={styles.closureReason}>{closure.reason}</span>
                  </div>
                  {isSuperAdmin && (
                    <Button
                      variant="danger"
                      size="sm"
                      iconLeft={<Trash2 size={14} />}
                      onClick={() => handleRemoveClosure(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

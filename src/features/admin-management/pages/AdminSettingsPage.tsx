import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, Trash2, CalendarOff, ShieldAlert, CheckCircle2, MapPin, X } from 'lucide-react';
import { useAdminAuth } from '../../admin-auth/context/AdminAuthContext';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, Badge } from '@/components/ui/primitives';
import {
  getGroundSettingsData,
  updateGroundSettingsData,
  createGroundData,
  type GroundSettings,
} from '../api';
import styles from './AdminManagement.module.css';

export function AdminSettingsPage() {
  const { admin } = useAdminAuth();
  const queryClient = useQueryClient();
  const isSuperAdmin = admin?.role === 'super_admin';

  const [selectedGroundIndex, setSelectedGroundIndex] = useState(0);
  const [settingsForm, setSettingsForm] = useState<Partial<GroundSettings>>({});
  const [closures, setClosures] = useState<Array<{ date: string; reason: string }>>([]);
  const [newClosureDate, setNewClosureDate] = useState('');
  const [newClosureReason, setNewClosureReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // New Ground Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGroundName, setNewGroundName] = useState('');
  const [newGroundLocation, setNewGroundLocation] = useState('');
  const [newGroundOpening, setNewGroundOpening] = useState('06:00');
  const [newGroundClosing, setNewGroundClosing] = useState('24:00');
  const [newGroundDuration, setNewGroundDuration] = useState(60);
  const [newGroundPrice, setNewGroundPrice] = useState(1000);
  const [addError, setAddError] = useState('');

  const { data: grounds = [], isLoading } = useQuery({
    queryKey: ['ground-settings'],
    queryFn: getGroundSettingsData,
  });

  const activeGround = grounds[selectedGroundIndex] || grounds[0];

  useEffect(() => {
    if (activeGround) {
      setSettingsForm({
        name: activeGround.name,
        location: activeGround.location,
        openingTime: activeGround.openingTime,
        closingTime: activeGround.closingTime,
        slotDurationMinutes: activeGround.slotDurationMinutes,
        pricePerSlot: activeGround.pricePerSlot,
        isActive: activeGround.isActive,
      });
      setClosures(activeGround.closures || []);
    }
  }, [activeGround]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<GroundSettings>) => {
      if (!activeGround?._id) throw new Error('No ground ID found');
      return updateGroundSettingsData(activeGround._id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ground-settings'] });
      setSuccessMsg('Ground settings and closures saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
  });

  const createMutation = useMutation({
    mutationFn: createGroundData,
    onSuccess: (newGround) => {
      queryClient.invalidateQueries({ queryKey: ['ground-settings'] });
      setShowAddModal(false);
      setSuccessMsg(`Ground "${newGround.name}" created successfully!`);
      setSelectedGroundIndex(grounds.length); // Switch to newly created ground
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setAddError(err?.message || 'Failed to create ground.');
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

  const handleCreateGroundSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!newGroundName.trim() || !newGroundLocation.trim()) {
      setAddError('Ground name and location address are required.');
      return;
    }
    createMutation.mutate({
      name: newGroundName.trim(),
      location: newGroundLocation.trim(),
      openingTime: newGroundOpening,
      closingTime: newGroundClosing,
      slotDurationMinutes: Number(newGroundDuration),
      pricePerSlot: Number(newGroundPrice),
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
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ground & System Settings</h1>
          <p className={styles.subtitle}>Configure operating hours, pricing rules, and closure dates for your grounds.</p>
        </div>
        {isSuperAdmin && (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              variant="secondary"
              size="md"
              iconLeft={<Plus size={16} />}
              onClick={() => {
                setAddError('');
                setShowAddModal(true);
              }}
            >
              Add New Ground
            </Button>
            <Button
              variant="primary"
              size="md"
              iconLeft={<Save size={16} />}
              loading={updateMutation.isPending}
              onClick={handleSave}
            >
              Save All Settings
            </Button>
          </div>
        )}
      </div>

      {/* Ground Selector Tabs */}
      {grounds.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflowX: 'auto', paddingBottom: '4px' }}>
          {grounds.map((g, idx) => (
            <button
              key={g._id || idx}
              type="button"
              onClick={() => setSelectedGroundIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: selectedGroundIndex === idx ? '2px solid var(--color-pitch-emerald)' : '1px solid var(--color-border)',
                background: selectedGroundIndex === idx ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface)',
                color: selectedGroundIndex === idx ? 'var(--color-pitch-emerald)' : 'var(--color-text-secondary)',
                fontWeight: selectedGroundIndex === idx ? 700 : 500,
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <MapPin size={14} />
              {g.name}
            </button>
          ))}
        </div>
      )}

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
            Read-only mode: Only Super Admin users can modify ground settings, add new grounds, and configure closures.
          </span>
        </div>
      )}

      {activeGround ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Core Settings Card */}
          <Card className={styles.card}>
            <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
              Ground Configuration — {activeGround.name}
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
                  placeholder="06:00"
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
                  placeholder="24:00"
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
      ) : (
        <Card className={styles.card}>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: 0 }}>
            No grounds registered in system. Click "Add New Ground" above to create one.
          </p>
        </Card>
      )}

      {/* Add New Ground Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '520px', padding: 'var(--space-6)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Add New Football Ground</h2>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {addError && (
              <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateGroundSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px' }}>Ground Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evergain Avenue Ground 2"
                  className={styles.searchInput}
                  value={newGroundName}
                  onChange={(e) => setNewGroundName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px' }}>Location Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 11, Uttara, Dhaka"
                  className={styles.searchInput}
                  value={newGroundLocation}
                  onChange={(e) => setNewGroundLocation(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px' }}>Opening Time (HH:mm)</label>
                  <input
                    type="text"
                    required
                    placeholder="06:00"
                    className={styles.searchInput}
                    value={newGroundOpening}
                    onChange={(e) => setNewGroundOpening(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px' }}>Closing Time (HH:mm)</label>
                  <input
                    type="text"
                    required
                    placeholder="24:00"
                    className={styles.searchInput}
                    value={newGroundClosing}
                    onChange={(e) => setNewGroundClosing(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px' }}>Slot Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    className={styles.searchInput}
                    value={newGroundDuration}
                    onChange={(e) => setNewGroundDuration(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px' }}>Base Price (৳)</label>
                  <input
                    type="number"
                    required
                    className={styles.searchInput}
                    value={newGroundPrice}
                    onChange={(e) => setNewGroundPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={createMutation.isPending}>
                  Create Ground
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

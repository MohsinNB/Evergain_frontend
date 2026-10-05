import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, Trash2, Edit2, Play, Images, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, EmptyState } from '@/components/ui/primitives';
import { toast } from 'sonner';
import { getPublicGallery, type GalleryItem } from '@/features/gallery/api';
import { uploadGalleryMedia, updateGalleryItem, deleteGalleryItem } from '../api';
import styles from './AdminGallery.module.css';

export function AdminGalleryPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [captionInput, setCaptionInput] = useState('');
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editCaption, setEditCaption] = useState('');

  // Fetch gallery items
  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: getPublicGallery,
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: () => uploadGalleryMedia(selectedFiles, captionInput),
    onSuccess: () => {
      toast.success('Media uploaded successfully to Cloudinary!');
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
      setSelectedFiles([]);
      setCaptionInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err: any) => {
      toast.error(err.message || 'Upload failed');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, caption }: { id: string; caption: string }) => updateGalleryItem(id, { caption }),
    onSuccess: () => {
      toast.success('Caption updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
      setEditingItem(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Update failed');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => {
      toast.success('Gallery item deleted!');
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Delete failed');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one photo or video');
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <div style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gallery Management</h1>
          <p className={styles.subtitle}>Upload, edit captions, and manage ground photos & videos.</p>
        </div>
      </div>

      {/* Upload Box Card */}
      <Card className={styles.uploadCard}>
        <h2 className={styles.sectionTitle}>Upload New Photos / Videos</h2>
        <form onSubmit={handleUploadSubmit} className={styles.uploadForm}>
          <div className={styles.dropZone} onClick={() => fileInputRef.current?.click()}>
            <UploadCloud size={40} className={styles.uploadIcon} />
            <div>
              <strong>Click to browse files</strong>
              <p className={styles.dropText}>Supports PNG, JPG, WEBP, MP4, MOV (max 10MB per file)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className={styles.hiddenInput}
              onChange={handleFileSelect}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className={styles.fileList}>
              <span className={styles.fileCount}>{selectedFiles.length} file(s) selected:</span>
              <ul className={styles.fileNameList}>
                {selectedFiles.map((f, i) => (
                  <li key={i}>{f.name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="upload-caption" className={styles.label}>
              Caption (Optional)
            </label>
            <input
              id="upload-caption"
              type="text"
              placeholder="e.g. Night match under floodlights..."
              className={styles.input}
              value={captionInput}
              onChange={(e) => setCaptionInput(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="cta"
            size="lg"
            loading={uploadMutation.isPending}
            iconLeft={<UploadCloud size={20} />}
          >
            Upload to Gallery
          </Button>
        </form>
      </Card>

      {/* Gallery Items Grid */}
      <div className={styles.gallerySection}>
        <h2 className={styles.sectionTitle}>Uploaded Gallery Items ({items?.length ?? 0})</h2>

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="200px" radius="var(--radius-lg)" />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={<Images size={32} />}
            title="No gallery items found"
            description="Upload your first ground photos above!"
          />
        ) : (
          <div className={styles.grid}>
            {items.map((item) => {
              const isVideo = item.mediaType === 'video' || Boolean(item.videoUrl);

              return (
                <Card key={item._id} className={styles.itemCard}>
                  <div className={styles.thumbWrapper}>
                    <img src={item.imageUrl} alt={item.caption || 'Gallery thumbnail'} className={styles.thumb} />
                    {isVideo && (
                      <div className={styles.videoBadge}>
                        <Play size={16} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  <div className={styles.itemContent}>
                    <p className={styles.itemCaption}>{item.caption || 'No caption set'}</p>

                    <div className={styles.itemActions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => {
                          setEditingItem(item);
                          setEditCaption(item.caption || '');
                        }}
                      >
                        <Edit2 size={16} /> Edit
                      </button>

                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.btnDanger}`}
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this gallery item?')) {
                            deleteMutation.mutate(item._id);
                          }
                        }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Caption Edit Modal */}
      {editingItem && (
        <div className={styles.modalOverlay} onClick={() => setEditingItem(null)}>
          <div className={`${styles.modal} rise-in`} onClick={(e) => e.stopPropagation()} role="dialog">
            <div className={styles.modalHead}>
              <h3>Edit Caption</h3>
              <button type="button" className={styles.closeBtn} onClick={() => setEditingItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label htmlFor="edit-caption-input" className={styles.label}>
                  Caption
                </label>
                <input
                  id="edit-caption-input"
                  type="text"
                  className={styles.input}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                />
              </div>

              <div className={styles.modalActions}>
                <Button variant="secondary" size="md" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={updateMutation.isPending}
                  iconLeft={<CheckCircle2 size={18} />}
                  onClick={() => updateMutation.mutate({ id: editingItem._id, caption: editCaption })}
                >
                  Save Caption
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

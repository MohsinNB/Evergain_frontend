import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, ZoomIn, Images, Sparkles } from 'lucide-react';
import { Skeleton, EmptyState } from '@/components/ui/primitives';
import { getPublicGallery } from '../api';
import { GalleryLightbox } from '../components/GalleryLightbox';
import styles from './GalleryPage.module.css';

export function GalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['public-gallery'],
    queryFn: getPublicGallery,
  });

  return (
    <div className="container">
      {/* Header Banner */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Sparkles size={14} />
          <span>Ground Highlights</span>
        </div>
        <h1 className={styles.title}>Photo & Video Gallery</h1>
        <p className={styles.subtitle}>Get a glimpse of the turf, lighting, and action at Evergain Avenue.</p>
      </section>

      {/* Gallery Grid */}
      <section className={styles.gallerySection}>
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="240px" radius="var(--radius-lg)" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Could not load gallery"
            description={error instanceof Error ? error.message : 'Please check your connection.'}
          />
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={<Images size={32} />}
            title="No media uploaded yet"
            description="Our photos and video highlights will appear here soon!"
          />
        ) : (
          <div className={styles.grid}>
            {items.map((item, index) => {
              const isVideo = item.mediaType === 'video' || Boolean(item.videoUrl);

              return (
                <div
                  key={item._id}
                  className={`${styles.card} rise-in`}
                  onClick={() => setLightboxIndex(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(index)}
                >
                  <img src={item.imageUrl} alt={item.caption || 'Gallery photo'} className={styles.thumbnail} loading="lazy" />

                  {/* Video Play Badge */}
                  {isVideo && (
                    <div className={styles.videoBadge}>
                      <Play size={18} fill="currentColor" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className={styles.overlay}>
                    <div className={styles.zoomBtn}>
                      <ZoomIn size={22} />
                    </div>
                    {item.caption && <p className={styles.captionSnippet}>{item.caption}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {items && (
        <GalleryLightbox
          items={items}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIndex) => setLightboxIndex(newIndex)}
        />
      )}
    </div>
  );
}

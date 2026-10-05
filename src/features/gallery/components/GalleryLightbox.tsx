import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import type { GalleryItem } from '../api';
import styles from './GalleryLightbox.module.css';

interface GalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export function GalleryLightbox({ items, currentIndex, onClose, onNavigate }: GalleryLightboxProps) {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < items.length;
  const currentItem = isOpen ? items[currentIndex] : null;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < items.length - 1) onNavigate(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  if (!isOpen || !currentItem) return null;

  const isVideo = currentItem.mediaType === 'video' || Boolean(currentItem.videoUrl);
  const mediaSrc = isVideo ? currentItem.videoUrl || currentItem.imageUrl : currentItem.imageUrl;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.topBar} onClick={(e) => e.stopPropagation()}>
        <span className={styles.counter}>
          {currentIndex + 1} / {items.length}
        </span>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>
      </div>

      <div className={styles.mediaContainer} onClick={(e) => e.stopPropagation()}>
        {/* Nav Prev */}
        {currentIndex > 0 && (
          <button
            type="button"
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={() => onNavigate(currentIndex - 1)}
            aria-label="Previous item"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        {/* Media content */}
        <div className={styles.mediaFrame}>
          {isVideo ? (
            <video src={mediaSrc} controls autoPlay className={styles.mediaVideo} poster={currentItem.imageUrl}>
              Your browser does not support HTML5 video playback.
            </video>
          ) : (
            <img src={currentItem.imageUrl} alt={currentItem.caption || 'Gallery photo'} className={styles.mediaImg} />
          )}
        </div>

        {/* Nav Next */}
        {currentIndex < items.length - 1 && (
          <button
            type="button"
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={() => onNavigate(currentIndex + 1)}
            aria-label="Next item"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Caption footer */}
      {currentItem.caption && (
        <div className={styles.captionBar} onClick={(e) => e.stopPropagation()}>
          <p className={styles.captionText}>
            {isVideo && <PlayCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />}
            {currentItem.caption}
          </p>
        </div>
      )}
    </div>
  );
}

import { getData } from '@/lib/api';

export interface GalleryItem {
  _id: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  cloudinaryPublicId?: string;
  caption?: string;
  displayOrder: number;
  uploadedAt: string;
}

/** Fetch public gallery items (ordered by displayOrder & uploadedAt) */
export async function getPublicGallery(): Promise<GalleryItem[]> {
  return getData<GalleryItem[]>('/gallery');
}

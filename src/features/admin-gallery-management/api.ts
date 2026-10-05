import { api } from '@/lib/api';
import type { GalleryItem } from '@/features/gallery/api';

/** Upload media files to Cloudinary & create gallery records */
export async function uploadGalleryMedia(files: FileList | File[], caption?: string): Promise<GalleryItem[]> {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('media', file);
  });
  if (caption) {
    formData.append('caption', caption);
  }

  const res = await api.post('/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

/** Update gallery item caption or display order */
export async function updateGalleryItem(id: string, data: { caption?: string; displayOrder?: number }): Promise<GalleryItem> {
  const res = await api.patch(`/gallery/${id}`, data);
  return res.data.data;
}

/** Delete gallery item */
export async function deleteGalleryItem(id: string): Promise<void> {
  await api.delete(`/gallery/${id}`);
}

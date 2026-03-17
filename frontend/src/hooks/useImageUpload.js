import { useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function useImageUpload({ onCode, onError }) {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    onError('', '');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${BACKEND_URL}/upload`, { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || 'Failed to process image.';
        onError(msg, data.code);
        return;
      }

      onCode(data.javaCode || '');
    } catch {
      onError('Network error during upload.');
    } finally {
      setUploading(false);
    }
  };

  return { uploading, uploadFile };
}

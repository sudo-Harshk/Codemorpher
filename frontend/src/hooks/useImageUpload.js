import { useState } from 'react';

export default function useImageUpload({ onCode, onError }) {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    onError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        onError(data.error || 'Failed to process image.');
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

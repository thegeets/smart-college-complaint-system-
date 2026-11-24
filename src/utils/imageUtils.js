/**
 * Image processing utilities for student avatar / profile photo handling.
 * Automatically resizes and compresses user-uploaded images in the browser
 * to an optimized square thumbnail (max 300x300, JPEG 85%), keeping data size
 * under ~35KB so it saves and loads instantly without server bloat.
 */

export function processAvatarFile(file, maxWidth = 300, maxHeight = 300, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (JPEG, PNG, or WebP).'));
    }

    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('Image size must be smaller than 10 MB.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image file.'));
      img.onload = () => {
        // Calculate square crop dimensions centered on the image
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = Math.min(maxWidth, minDim);
        canvas.height = Math.min(maxHeight, minDim);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context not available.'));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw centered square crop
        ctx.drawImage(
          img,
          startX,
          startY,
          minDim,
          minDim,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Convert to lightweight JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

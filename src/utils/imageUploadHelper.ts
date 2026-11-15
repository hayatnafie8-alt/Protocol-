/**
 * Utility for uploading and optimizing clinical photos
 * Reads file from camera or photo library, scales to ultra-high-definition 4K (max 2560px),
 * and compresses as high-quality JPEG so full anatomical details and labels remain crystal clear.
 */
export async function processAndOptimizeImage(file: File, maxWidth = 2560, maxHeight = 2160, quality = 0.92): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المحدد ليس صورة صالحة. يرجى اختيار صورة بصيغة JPG أو PNG أو WebP.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('فشل معالجة أبعاد الصورة.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw data url if canvas unavailable
          resolve(reader.result as string);
          return;
        }

        // High quality image smoothing and preserved transparent alpha layer
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const isAlphaFormat = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/svg+xml';
        const outputMime = isAlphaFormat ? (file.type === 'image/svg+xml' ? 'image/png' : file.type) : 'image/jpeg';
        const optimizedDataUrl = canvas.toDataURL(outputMime, isAlphaFormat ? 0.95 : quality);
        resolve(optimizedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

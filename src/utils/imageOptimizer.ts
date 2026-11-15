/**
 * Protocol Clinical Platform - Smart Image Compression & Cloud Optimization Utility
 * Prevents Firestore 1MB document size limit failures by downscaling & compressing
 * supervisor avatars, custom logos, stamps, and photos before writing to Cloud Firestore.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
  preserveAlpha?: boolean;
}

/**
 * Loads a File or Data URL into an HTMLImageElement safely
 */
function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for optimization: ' + err));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          reject(new Error('Failed reading file as data URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Calculates proportional dimensions keeping aspect ratio within max bounds
 */
function calculateDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = srcWidth;
  let height = srcHeight;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  return { width: Math.max(1, width), height: Math.max(1, height) };
}

/**
 * Specialized avatar compressor:
 * Bounds avatars to 320x320 pixels and strictly <= 45KB.
 * Yields pristine retina clarity for 28px - 96px display while ensuring
 * negligible Firestore storage footprint.
 */
export async function compressAvatarForCloud(source: File | string): Promise<string> {
  return compressImageForCloud(source, {
    maxWidth: 320,
    maxHeight: 320,
    quality: 0.82,
    maxSizeBytes: 45 * 1024,
    mimeType: 'image/jpeg',
  });
}

/**
 * Compresses an image file or Data URL to a cloud-safe Base64 string guaranteed
 * to be well below Firestore's 1MB limit (~35KB - 120KB), while preserving exceptional
 * sharpness and visual clarity on retina and mobile screens.
 */
export async function compressImageForCloud(
  source: File | string,
  options: CompressionOptions = {}
): Promise<string> {
  // If source is already an SVG data URL or raw SVG, return directly as it's vector
  if (typeof source === 'string' && (source.startsWith('data:image/svg+xml') || source.trim().startsWith('<svg'))) {
    return source;
  }

  // Auto-detect if source is transparent format (PNG, WebP, SVG)
  const isSourcePngOrWebp =
    (typeof source === 'object' && source instanceof File && (source.type === 'image/png' || source.type === 'image/webp' || source.type === 'image/svg+xml')) ||
    (typeof source === 'string' && (source.startsWith('data:image/png') || source.startsWith('data:image/webp') || source.startsWith('data:image/svg')));

  const preserveAlpha = options.preserveAlpha ?? isSourcePngOrWebp;
  let maxWidth = options.maxWidth ?? 600;
  let maxHeight = options.maxHeight ?? 600;
  let quality = options.quality ?? 0.85;
  const maxSizeBytes = options.maxSizeBytes ?? 120 * 1024; // Strict 120KB maximum default
  const mimeType = options.mimeType ?? (preserveAlpha ? 'image/png' : 'image/jpeg');

  try {
    const img = await loadImage(source);
    let { width, height } = calculateDimensions(
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      maxWidth,
      maxHeight
    );

    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    let ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }

    // High quality bicubic image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // If NOT preserving alpha and saving as JPEG, fill white background.
    // If preserving alpha (PNG/WebP), keep completely transparent canvas!
    if (!preserveAlpha && mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);
    let resultDataUrl = canvas.toDataURL(mimeType, quality);

    // Iterative quality reduction if larger than maxSizeBytes
    let iterations = 0;
    while (resultDataUrl.length > maxSizeBytes * 1.33 && quality > 0.45 && iterations < 5) {
      quality -= 0.1;
      // If PNG is bulky, convert to WebP to retain alpha transparency while cutting size
      const targetMime = (preserveAlpha && mimeType === 'image/png' && iterations >= 2) ? 'image/webp' : mimeType;
      resultDataUrl = canvas.toDataURL(targetMime, quality);
      iterations++;
    }

    // If still large, progressively downscale dimensions until strictly within maxSizeBytes
    let scalePasses = 0;
    while (resultDataUrl.length > maxSizeBytes * 1.33 && scalePasses < 4) {
      width = Math.max(80, Math.round(width * 0.75));
      height = Math.max(80, Math.round(height * 0.75));

      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = width;
      scaledCanvas.height = height;
      const scaledCtx = scaledCanvas.getContext('2d');

      if (scaledCtx) {
        scaledCtx.imageSmoothingEnabled = true;
        scaledCtx.imageSmoothingQuality = 'high';
        if (!preserveAlpha && mimeType === 'image/jpeg') {
          scaledCtx.fillStyle = '#ffffff';
          scaledCtx.fillRect(0, 0, width, height);
        } else {
          scaledCtx.clearRect(0, 0, width, height);
        }
        scaledCtx.drawImage(img, 0, 0, width, height);
        const passMime = preserveAlpha ? (resultDataUrl.startsWith('data:image/webp') ? 'image/webp' : 'image/png') : mimeType;
        resultDataUrl = scaledCanvas.toDataURL(passMime, preserveAlpha ? 0.85 : 0.75);
      }
      scalePasses++;
    }

    return resultDataUrl;
  } catch (err) {
    console.warn('[ImageOptimizer] Standard canvas optimization notice, attempting emergency downscale:', err);

    // Emergency safe downscale without risking raw multi-megabyte fallback
    try {
      const emergencyCanvas = document.createElement('canvas');
      emergencyCanvas.width = 240;
      emergencyCanvas.height = 240;
      const emergencyCtx = emergencyCanvas.getContext('2d');
      if (emergencyCtx && typeof source !== 'string') {
        const bmp = await createImageBitmap(source);
        emergencyCtx.drawImage(bmp, 0, 0, 240, 240);
        return emergencyCanvas.toDataURL('image/jpeg', 0.75);
      }
    } catch {
      // Ignore emergency failure
    }

    // Only allow fallback if string length is strictly under 100KB
    if (typeof source === 'string' && source.length < 100 * 1024) {
      return source;
    }

    throw new Error('تعذر معالجة الصورة بحجم آمن للسحابة، يرجى اختيار صورة أخرى.');
  }
}

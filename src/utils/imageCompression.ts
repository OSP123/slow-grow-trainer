/**
 * Client-side image compression using the browser Canvas API.
 * No external dependencies. Resizes to a max dimension and converts to JPEG.
 */

export interface CompressResult {
  file: File;
  originalSizeMB: number;
  compressedSizeMB: number;
  error?: string;
}

/**
 * Validates and compresses an image file in the browser.
 *
 * @param file        - Raw File from an <input type="file">
 * @param maxWidthPx  - Max width/height in pixels (aspect ratio preserved). Default: 1920px
 * @param qualityPct  - JPEG quality 0–1. Default: 0.8 (80%)
 * @param maxSizeMB   - Hard reject limit before compression. Default: 20MB
 * @returns           CompressResult with the compressed File (or original on failure)
 */
export async function compressImage(
  file: File,
  maxWidthPx = 1920,
  qualityPct = 0.8,
  maxSizeMB = 20,
): Promise<CompressResult> {
  const originalSizeMB = file.size / (1024 * 1024);

  if (!file.type.startsWith('image/')) {
    return { file, originalSizeMB, compressedSizeMB: originalSizeMB, error: 'Only image files are accepted.' };
  }

  if (originalSizeMB > maxSizeMB) {
    return {
      file,
      originalSizeMB,
      compressedSizeMB: originalSizeMB,
      error: `File is ${originalSizeMB.toFixed(1)}MB — maximum allowed is ${maxSizeMB}MB.`,
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down proportionally if either dimension exceeds the limit
      if (width > maxWidthPx || height > maxWidthPx) {
        if (width >= height) {
          height = Math.round((height * maxWidthPx) / width);
          width = maxWidthPx;
        } else {
          width = Math.round((width * maxWidthPx) / height);
          height = maxWidthPx;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Canvas not available — pass through original
        resolve({ file, originalSizeMB, compressedSizeMB: originalSizeMB });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ file, originalSizeMB, compressedSizeMB: originalSizeMB });
            return;
          }
          const compressedName = file.name.replace(/\.[^.]+$/, '.jpg');
          const compressed = new File([blob], compressedName, { type: 'image/jpeg' });
          const compressedSizeMB = compressed.size / (1024 * 1024);
          resolve({ file: compressed, originalSizeMB, compressedSizeMB });
        },
        'image/jpeg',
        qualityPct,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ file, originalSizeMB, compressedSizeMB: originalSizeMB, error: 'Could not read image file.' });
    };

    img.src = objectUrl;
  });
}

/**
 * Appends Supabase image transformation parameters to a storage URL.
 * Supabase serves resized/compressed versions from its built-in transform API.
 *
 * @param url     - Original Supabase storage public URL
 * @param width   - Max display width in px. Default: 400
 * @param quality - JPEG quality 1–100. Default: 75
 */
export function getTransformUrl(url: string, width = 400, quality = 75): string {
  if (!url) return url;
  // Only transform Supabase storage URLs
  if (!url.includes('/storage/') && !url.includes('supabase')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}&quality=${quality}`;
}

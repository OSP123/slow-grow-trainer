import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compressImage, getTransformUrl } from './imageCompression';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeFile(name: string, type: string, sizeMB: number): File {
  const bytes = new Uint8Array(sizeMB * 1024 * 1024);
  return new File([bytes], name, { type });
}

// ── getTransformUrl ───────────────────────────────────────────────────────────

describe('getTransformUrl', () => {
  it('appends width and quality params to a Supabase storage URL', () => {
    const url = 'https://abc.supabase.co/storage/v1/object/public/avatars/123/avatar.jpg';
    const result = getTransformUrl(url, 300, 70);
    expect(result).toBe(`${url}?width=300&quality=70`);
  });

  it('uses & separator if URL already has query params', () => {
    const url = 'https://abc.supabase.co/storage/v1/object/public/avatars/avatar.jpg?token=xyz';
    const result = getTransformUrl(url, 200, 60);
    expect(result).toContain('&width=200&quality=60');
  });

  it('returns non-Supabase URLs unchanged', () => {
    const url = 'https://example.com/photo.jpg';
    expect(getTransformUrl(url)).toBe(url);
  });

  it('returns empty string unchanged', () => {
    expect(getTransformUrl('')).toBe('');
  });

  it('defaults to width=400 and quality=75', () => {
    const url = 'https://abc.supabase.co/storage/v1/object/public/avatars/avatar.jpg';
    expect(getTransformUrl(url)).toContain('width=400&quality=75');
  });
});

// ── compressImage ─────────────────────────────────────────────────────────────

describe('compressImage — validation paths', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    });
    // jsdom Image never fires load/error for blob URLs — stub it to auto-fire onerror
    vi.stubGlobal('Image', class {
      onerror: (() => void) | null = null;
      set src(_: string) {
        // Schedule async so the test body finishes setting up first
        setTimeout(() => { if (this.onerror) this.onerror(); }, 0);
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects non-image file types immediately', async () => {
    const pdf = makeFile('doc.pdf', 'application/pdf', 0.1);
    const result = await compressImage(pdf);
    expect(result.error).toMatch(/Only image files/i);
    expect(result.file).toBe(pdf); // passes original through
  });

  it('rejects files exceeding the maxSizeMB hard limit', async () => {
    const huge = makeFile('giant.jpg', 'image/jpeg', 25);
    const result = await compressImage(huge, 1920, 0.8, 20);
    expect(result.error).toMatch(/maximum allowed/i);
    expect(result.originalSizeMB).toBeCloseTo(25, 0);
  });

  it('passes a valid small image through (img.onerror fallback in jsdom)', async () => {
    // jsdom can't load blobs via Image.src; the onerror fires, and compressImage
    // should resolve without a hard-reject error (type/size validations passed).
    const small = makeFile('photo.jpg', 'image/jpeg', 0.1);
    const result = await compressImage(small, 1920, 0.8, 20);
    // Should not be a hard-reject error (type or size failed)
    expect(result.error).not.toMatch(/Only image files|maximum allowed/);
    // File is returned (either compressed or pass-through)
    expect(result.file).toBeDefined();
    expect(result.originalSizeMB).toBeCloseTo(0.1, 1);
  }, 10000);
});

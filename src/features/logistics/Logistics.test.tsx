import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Logistics from './Logistics';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    storage: { from: vi.fn() },
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }) }
  },
}));

// Bypass canvas/Image APIs — just pass the file through unchanged
vi.mock('../../utils/imageCompression', () => ({
  compressImage: vi.fn(async (file: File) => ({ file, originalSizeMB: 0.1, compressedSizeMB: 0.05 })),
  getTransformUrl: (url: string) => url,
}));

describe('Logistics & Deployment Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders standard milestones empty natively without mock history', async () => {
    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null });
    (supabase.from as import("vitest").Mock).mockReturnValue({ select: mockSelect });

    render(<Logistics />);

    // Fast assertion for empty state or native default thresholds
    expect(await screen.findByText(/500 Points Built/i)).toBeInTheDocument();
    
    // Ensure "fake uploaded photo data" doesn't exist
    expect(screen.queryByAltText(/Uploaded visual analysis/i)).not.toBeInTheDocument();
  });

  it('reveals upload portal when checking off a new milestone', async () => {
    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null });
    (supabase.from as import("vitest").Mock).mockReturnValue({ select: mockSelect });

    render(<Logistics />);

    const checkbox = await screen.findByRole('checkbox', { name: /500 Points Built/i });
    fireEvent.click(checkbox);

    // It should now demand photo upload proof before saving
    expect(screen.getByText(/Attach Photographic Proof/i)).toBeInTheDocument();
  });

  it('triggers storage upload when file is submitted', async () => {
    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as import("vitest").Mock).mockReturnValue({ select: mockSelect, insert: mockInsert });

    const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'test/path.png' }, error: null });
    (supabase.storage.from as import("vitest").Mock).mockReturnValue({ upload: mockUpload, getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'url' } }) });

    render(<Logistics />);

    // Select milestone
    const checkbox = await screen.findByRole('checkbox', { name: /500 Points Built/i });
    fireEvent.click(checkbox);

    // Provide a file to the input
    const file = new File(['dummy content'], 'cool_models.png', { type: 'image/png' });
    const uploader = screen.getByLabelText(/Attach Photographic Proof/i);
    fireEvent.change(uploader, { target: { files: [file] } });

    // Click save
    const saveButton = screen.getByRole('button', { name: /Submit Clearance Request/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(supabase.storage.from).toHaveBeenCalledWith('hobby_photos');
      expect(mockUpload).toHaveBeenCalled();
    });
  });
});

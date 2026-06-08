import { test, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUnitRegistry } from './useUnitRegistry';

// This test verifies the pagination logic directly against the database
// to prove that the 1000-row limit is successfully bypassed.
test('useUnitRegistry bypasses 1000-row limit and fetches all World Eaters', async () => {
    // We can use the actual supabase client because it reads the anonymous key.
    // The hook will perform the paginated fetch.
    const { result } = renderHook(() => useUnitRegistry());

    // Wait for the hook to finish loading
    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    }, { timeout: 10000 });

    // Ensure we didn't hit an error
    expect(result.current.error).toBeNull();

    // Verify the total units exceed the default 1000-row limit
    expect(result.current.rawRegistry.length).toBeGreaterThan(1000);

    // Verify World Eaters faction was successfully grouped
    const worldEaters = result.current.unitsByFaction['World Eaters'];
    expect(worldEaters).toBeDefined();
    expect(worldEaters.length).toBeGreaterThan(0);
    
    // Specifically check for Angron
    expect(worldEaters).toContain('Angron');
});

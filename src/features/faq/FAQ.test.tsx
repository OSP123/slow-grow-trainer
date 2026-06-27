import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FAQ from './FAQ';

describe('FAQ Component', () => {
  it('renders standard FAQ items', () => {
    render(<FAQ />);
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/When does the campaign start/i)).toBeInTheDocument();
  });

  it('renders the question and guidelines for games under 2000 points', () => {
    render(<FAQ />);
    expect(screen.getByText(/What mission rules and board sizes should we use for games under 2000 points\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Combat Patrol/i)).toBeInTheDocument();
    expect(screen.getByText(/full-sized boards/i)).toBeInTheDocument();
  });
});

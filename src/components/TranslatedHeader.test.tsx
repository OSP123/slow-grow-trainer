import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TranslatedHeader from './TranslatedHeader';

describe('TranslatedHeader Component', () => {
  beforeEach(() => {
    // Reset any document body attributes
    document.body.removeAttribute('data-theme');
  });

  it('renders default component and text when theme does not match specific alien factions', () => {
    render(<TranslatedHeader text="Imperium Network" theme="imperium" />);
    const heading = screen.getByText('Imperium Network');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1'); // default 'as' prop
  });

  it('renders binary terminal wrapper for adeptus_mechanicus theme', () => {
    render(<TranslatedHeader text="Admech Network" theme="adeptus_mechanicus" />);
    // "Admech Network" in binary should be in the document
    // We'll just verify the English translation appears in brackets
    expect(screen.getByText('[ ADMECH NETWORK ]')).toBeInTheDocument();
    // And check for the blinking cursor or the binary structure
    expect(screen.getByText('_')).toBeInTheDocument();
  });

  it('renders NecronCrypt font and English translation for necrons theme', () => {
    render(<TranslatedHeader text="Necrons Network" theme="necrons" />);
    // Should render two elements containing the text
    const elements = screen.getAllByText(/necrons network/i);
    expect(elements).toHaveLength(2);
    // The translation div should be visible
    expect(elements[1]).toHaveStyle({ textTransform: 'uppercase' });
  });

  it('renders Tau40k font and English translation for tau theme', () => {
    render(<TranslatedHeader text="Tau Empire Network" theme="tau" />);
    // Should render the alien lowercase text and the english text
    expect(screen.getByText('tau empire network')).toBeInTheDocument();
    expect(screen.getByText('Tau Empire Network')).toBeInTheDocument();
  });
});

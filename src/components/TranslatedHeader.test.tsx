import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TranslatedHeader from './TranslatedHeader';

describe('TranslatedHeader Component', () => {
  beforeEach(() => {
    document.body.removeAttribute('data-theme');
  });

  it('renders as h1 by default with the given text', () => {
    render(<TranslatedHeader text="Imperium Network" theme="imperium" />);
    const heading = screen.getByText('Imperium Network');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });

  it('renders with a custom heading level via the "as" prop', () => {
    render(<TranslatedHeader text="Sub Heading" theme="imperium" as="h3" />);
    const heading = screen.getByText('Sub Heading');
    expect(heading.tagName).toBe('H3');
  });

  it('renders binary terminal wrapper for adeptus_mechanicus theme', () => {
    render(<TranslatedHeader text="Admech Network" theme="adeptus_mechanicus" />);
    // English translation appears in brackets
    expect(screen.getByText('[ ADMECH NETWORK ]')).toBeInTheDocument();
    // Blinking cursor
    expect(screen.getByText('_')).toBeInTheDocument();
  });

  it('renders plain heading for necrons theme (CSS handles alien font + translation)', () => {
    render(<TranslatedHeader text="Necrons Network" theme="necrons" />);
    // Should render a single heading element — CSS ::after handles translation
    const heading = screen.getByText('Necrons Network');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });

  it('renders plain heading for tau theme (CSS handles alien font + translation)', () => {
    render(<TranslatedHeader text="Tau Empire Network" theme="tau" />);
    // Should render a single heading element — CSS ::after handles translation
    const heading = screen.getByText('Tau Empire Network');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });

  it('renders plain heading for chaos theme', () => {
    render(<TranslatedHeader text="Chaos Network" theme="chaos" />);
    const heading = screen.getByText('Chaos Network');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useEffect } from 'react';

// A minimal wrapper matching App.tsx's MutationObserver implementation
function TranslationTestComponent({ activeTheme, textContent, hasNested }: { activeTheme: string; textContent: string; hasNested?: boolean }) {
  useEffect(() => {
    const isAlienTheme = activeTheme === 'necrons' || activeTheme === 'tau';
    const SKIP_TAGS = new Set(['INPUT','SELECT','TEXTAREA','OPTION','SCRIPT','STYLE','NOSCRIPT','IFRAME','CANVAS','VIDEO','AUDIO','IMG','BR','HR','SVG','PATH','CIRCLE','LINE','RECT','POLYGON','POLYLINE','ELLIPSE','G','DEFS','USE','SYMBOL','CLIPPATH']);

    const clearDataText = () => {
      document.querySelectorAll('[data-text]').forEach(el => {
        el.removeAttribute('data-text');
      });
    };

    if (!isAlienTheme) {
      clearDataText();
      return;
    }

    const updateTextElements = () => {
      document.querySelectorAll('.translatable').forEach(el => {
        if (SKIP_TAGS.has(el.tagName)) return;

        // Check if it is a leaf element: all of its children are in SKIP_TAGS
        const isLeaf = Array.from(el.children).every(child => SKIP_TAGS.has(child.tagName));
        if (!isLeaf) {
          el.removeAttribute('data-text');
          return;
        }

        const text = (el.textContent || '').trim();
        if (!text) {
          el.removeAttribute('data-text');
          return;
        }

        if (el.getAttribute('data-text') !== text) {
          el.setAttribute('data-text', text);
        }
      });
    };

    updateTextElements();

    let rafId: number;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateTextElements);
    });
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      characterData: true
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      clearDataText();
    };
  }, [activeTheme]);

  return (
    <div data-testid="container">
      {hasNested ? (
        <div className="translatable" data-testid="parent">
          Hello <span className="translatable" data-testid="child">{textContent}</span>
        </div>
      ) : (
        <p className="translatable" data-testid="target">{textContent}</p>
      )}
    </div>
  );
}

describe('Alien Translation Mechanism', () => {
  it('stamps data-text on translatable elements when theme is necrons', async () => {
    const { rerender } = render(
      <TranslationTestComponent activeTheme="imperium" textContent="Welcome" />
    );

    const target = screen.getByTestId('target');
    expect(target.getAttribute('data-text')).toBeNull();

    // Switch to necrons theme
    rerender(<TranslationTestComponent activeTheme="necrons" textContent="Welcome" />);
    expect(target.getAttribute('data-text')).toBe('Welcome');
  });

  it('updates data-text when text content changes dynamically', async () => {
    const { rerender } = render(
      <TranslationTestComponent activeTheme="necrons" textContent="Loading..." />
    );

    const target = screen.getByTestId('target');
    expect(target.getAttribute('data-text')).toBe('Loading...');

    // Change text dynamically
    act(() => {
      rerender(<TranslationTestComponent activeTheme="necrons" textContent="Welcome, Commander" />);
    });
    
    // With characterData: true, the observer catches the text update immediately!
    // We wait for the requestAnimationFrame to fire
    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
    });

    expect(target.getAttribute('data-text')).toBe('Welcome, Commander');
  });

  it('isolates translations to leaf nodes to prevent duplicates', async () => {
    render(
      <TranslationTestComponent activeTheme="necrons" textContent="Commander" hasNested={true} />
    );

    const parent = screen.getByTestId('parent');
    const child = screen.getByTestId('child');

    // Parent is not a leaf node (contains child span), so it does NOT get translated.
    expect(parent.getAttribute('data-text')).toBeNull();
    // Child is a leaf node, so it gets translated.
    expect(child.getAttribute('data-text')).toBe('Commander');
  });
});

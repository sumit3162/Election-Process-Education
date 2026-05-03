import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock matchMedia for framer-motion (motion/react) if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />);
    expect(screen.getByText('VoteGuide AI')).toBeInTheDocument();
  });

  it('can toggle a checklist item', () => {
    render(<App />);
    const checklistButton = screen.getByText('Register to vote').closest('button');
    expect(checklistButton).toBeInTheDocument();
    
    // Initially not completed (aria-label starts with "Mark ... as complete")
    expect(checklistButton).toHaveAttribute('aria-label', 'Mark Register to vote as complete');
    
    // Click to toggle
    if (checklistButton) {
      fireEvent.click(checklistButton);
    }
    
    // After click, it should be marked as incomplete
    expect(checklistButton).toHaveAttribute('aria-label', 'Mark Register to vote as incomplete');
  });

  it('updates input value on change', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Ask about registration, deadlines, or requirements...');
    fireEvent.change(input, { target: { value: 'How do I vote?' } });
    expect(input).toHaveValue('How do I vote?');
  });
});

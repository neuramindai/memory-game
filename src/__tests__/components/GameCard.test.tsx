// src/__tests__/components/GameCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // Use extend-expect
import GameCard from '@/components/ui/Card';
import { Card } from '@/app/types/game';

// Mock framer-motion to avoid issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('GameCard', () => {
  const mockCard: Card = {
    id: '1',
    value: '🎮',
    isFlipped: false,
    isMatched: false
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<GameCard card={mockCard} onClick={mockOnClick} />);
    
    const questionMark = screen.getByText('?');
    expect(questionMark).toBeInTheDocument();
  });

  it('shows question mark when not flipped', () => {
    render(<GameCard card={mockCard} onClick={mockOnClick} />);
    
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('shows card value when flipped', () => {
    const flippedCard = { ...mockCard, isFlipped: true };
    render(<GameCard card={flippedCard} onClick={mockOnClick} />);
    
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });

  it('calls onClick when clicked and not disabled', () => {
    const { container } = render(<GameCard card={mockCard} onClick={mockOnClick} />);
    
    // Click on the card container (first motion.div)
    const cardElement = container.firstChild as HTMLElement;
    fireEvent.click(cardElement);
    
    expect(mockOnClick).toHaveBeenCalledWith('1');
  });

  it('does not call onClick when disabled', () => {
    const { container } = render(<GameCard card={mockCard} onClick={mockOnClick} disabled />);
    
    const cardElement = container.firstChild as HTMLElement;
    fireEvent.click(cardElement);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when already flipped', () => {
    const flippedCard = { ...mockCard, isFlipped: true };
    const { container } = render(<GameCard card={flippedCard} onClick={mockOnClick} />);
    
    const cardElement = container.firstChild as HTMLElement;
    fireEvent.click(cardElement);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies matched styling when matched', () => {
    const matchedCard = { ...mockCard, isMatched: true, isFlipped: true };
    const { container } = render(<GameCard card={matchedCard} onClick={mockOnClick} />);
    
    // Check if the matched card has the correct styling class
    const cardFront = container.querySelector('.border-emerald-400');
    expect(cardFront).toBeInTheDocument();
  });
});
// src/lib/game-logic.ts
import { Card } from '../app/types/game';
import { v4 as uuidv4 } from 'uuid';

// Card values with enhanced emoji selection
const cardValues = {
  easy: ['🎮', '🎨', '🎯', '🎪', '🎭', '🎪'],
  medium: ['🎮', '🎨', '🎯', '🎪', '🎭', '🎸', '🎺', '🎻'],
  hard: ['🎮', '🎨', '🎯', '🎪', '🎭', '🎸', '🎺', '🎻', '🎬', '🎤', '🎧', '🎲']
};

export function generateCards(difficulty: 'easy' | 'medium' | 'hard'): Card[] {
  const values = cardValues[difficulty];
  const cards: Card[] = [];

  // Create pairs of cards
  values.forEach(value => {
    // Create two cards with the same value (pair)
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: uuidv4(),
        value,
        isFlipped: false,
        isMatched: false
      });
    }
  });

  // Shuffle cards using Fisher-Yates algorithm
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export function checkForMatch(card1: Card, card2: Card): boolean {
  return card1.value === card2.value;
}

export function calculateScore(
  moves: number, 
  timeElapsed: number, 
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  // Base score based on difficulty
  const baseScore = {
    easy: 1000,
    medium: 2000,
    hard: 3000
  }[difficulty];

  // Time bonus (lose points for taking longer)
  const timeInSeconds = Math.floor(timeElapsed / 1000);
  const timeBonus = Math.max(0, 500 - timeInSeconds * 2);

  // Move bonus (fewer moves = higher score)
  const optimalMoves = {
    easy: 12,
    medium: 16,
    hard: 24
  }[difficulty];
  
  const moveBonus = Math.max(0, 500 - (moves - optimalMoves) * 20);

  return baseScore + timeBonus + moveBonus;
}
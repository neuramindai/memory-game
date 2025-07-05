import { Card } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';

const CARD_SETS = {
  easy: 6,    // 3x4 grid
  medium: 8,  // 4x4 grid  
  hard: 12    // 4x6 grid
};

const EMOJI_THEMES = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', 
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🦆', '🐧', '🐦', '🦅', '🦉', '🐺', '🐗', '🐴'
];

export function generateCards(difficulty: keyof typeof CARD_SETS): Card[] {
  const pairCount = CARD_SETS[difficulty];
  const selectedEmojis = EMOJI_THEMES.slice(0, pairCount);
  
  // Create pairs
  const cardValues = [...selectedEmojis, ...selectedEmojis];
  
  // Shuffle and create card objects
  const shuffled = cardValues.sort(() => Math.random() - 0.5);
  
  return shuffled.map(value => ({
    id: uuidv4(),
    value,
    isFlipped: false,
    isMatched: false
  }));
}

export function checkForMatch(card1: Card, card2: Card): boolean {
  return card1.value === card2.value;
}

export function calculateScore(moves: number, timeElapsed: number, difficulty: string): number {
  const baseScore = 1000;
  const movePenalty = moves * 5;
  const timePenalty = Math.floor(timeElapsed / 1000) * 2;
  const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty] || 1;
  
  return Math.max(0, Math.floor((baseScore - movePenalty - timePenalty) * difficultyMultiplier));
}
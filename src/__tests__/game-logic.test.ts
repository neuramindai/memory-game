// src/__tests__/game-logic.test.ts
import { generateCards, checkForMatch, calculateScore } from '@/lib/game-logic';
import { Card } from '@/app/types/game';

describe('Game Logic', () => {
  describe('generateCards', () => {
    it('should generate correct number of cards', () => {
      expect(generateCards('easy').length).toBe(12);
      expect(generateCards('medium').length).toBe(16);
      expect(generateCards('hard').length).toBe(24);
    });

    it('should create pairs of cards', () => {
      const cards = generateCards('easy');
      const values = cards.map(c => c.value);
      const uniqueValues = [...new Set(values)];
      
      uniqueValues.forEach(value => {
        expect(values.filter(v => v === value).length).toBe(2);
      });
    });

    it('should initialize cards as not flipped and not matched', () => {
      const cards = generateCards('easy');
      cards.forEach(card => {
        expect(card.isFlipped).toBe(false);
        expect(card.isMatched).toBe(false);
      });
    });

    it('should generate unique IDs for each card', () => {
      const cards = generateCards('medium');
      const ids = cards.map(c => c.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(cards.length);
    });
  });

  describe('checkForMatch', () => {
    it('should return true for matching cards', () => {
      const card1: Card = { id: '1', value: '🎮', isFlipped: true, isMatched: false };
      const card2: Card = { id: '2', value: '🎮', isFlipped: true, isMatched: false };
      expect(checkForMatch(card1, card2)).toBe(true);
    });

    it('should return false for non-matching cards', () => {
      const card1: Card = { id: '1', value: '🎮', isFlipped: true, isMatched: false };
      const card2: Card = { id: '2', value: '🎯', isFlipped: true, isMatched: false };
      expect(checkForMatch(card1, card2)).toBe(false);
    });

    it('should return false for the same card', () => {
      const card1: Card = { id: '1', value: '🎮', isFlipped: true, isMatched: false };
      expect(checkForMatch(card1, card1)).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('should calculate score correctly for easy difficulty', () => {
      const moves = 10;
      const timeElapsed = 30000; // 30 seconds
      const score = calculateScore(moves, timeElapsed, 'easy');
      
      // Base score: 1000
      // Moves penalty: 10 * 10 = 100
      // Time penalty: 30 * 2 = 60
      // Expected: 1000 - 100 - 60 = 840
      expect(score).toBe(840);
    });

    it('should apply difficulty multiplier correctly', () => {
      const moves = 10;
      const timeElapsed = 30000;
      
      const easyScore = calculateScore(moves, timeElapsed, 'easy');
      const mediumScore = calculateScore(moves, timeElapsed, 'medium');
      const hardScore = calculateScore(moves, timeElapsed, 'hard');
      
      expect(mediumScore).toBeGreaterThan(easyScore);
      expect(hardScore).toBeGreaterThan(mediumScore);
    });

    it('should never return negative score', () => {
      const moves = 1000;
      const timeElapsed = 600000; // 10 minutes
      const score = calculateScore(moves, timeElapsed, 'easy');
      
      expect(score).toBe(0);
    });

    it('should round scores to nearest integer', () => {
      const moves = 15;
      const timeElapsed = 45500; // 45.5 seconds
      const score = calculateScore(moves, timeElapsed, 'medium');
      
      expect(Number.isInteger(score)).toBe(true);
    });
  });
});
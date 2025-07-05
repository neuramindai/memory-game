// src/app/types/game.ts

export interface Player {
  id: string;
  name: string;
  score: number;
  moves: number;
  timeElapsed: number;
}

export interface Card {
  id: string;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  imageUrl?: string;
}

export interface GameState {
  cards: Card[];
  players: Player[];
  currentPlayer: number;
  gameStatus: 'setup' | 'playing' | 'paused' | 'finished';
  difficulty: 'easy' | 'medium' | 'hard';
  startTime: number | null;
  gameMode: 'single' | 'multiplayer';
}

export interface GameScore {
  id: string;
  playerName: string;
  score: number;
  moves: number;
  timeElapsed: number;
  difficulty: string;
  timestamp: number;
  gameMode?: string;
}
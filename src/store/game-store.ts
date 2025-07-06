import { create } from 'zustand';
import { GameState, Card, Player } from '../app/types/game';
import { generateCards, checkForMatch } from '../lib/game-logic';
import confetti from 'canvas-confetti';

interface GameStore extends GameState {
  initializeGame: (difficulty: 'easy' | 'medium' | 'hard', players: string[], gameMode: 'single' | 'multiplayer') => void;
  flipCard: (cardId: string) => void;
  resetGame: () => void;
  updateScore: (playerId: string, points: number) => void;
  nextPlayer: () => void;
  endGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state from GameState interface
  cards: [],
  players: [],
  currentPlayer: 0,
  gameStatus: 'setup',
  difficulty: 'medium',
  startTime: null,
  gameMode: 'single',

  initializeGame: (difficulty, playerNames, gameMode) => {
    const cards = generateCards(difficulty);
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      score: 0,
      moves: 0,
      timeElapsed: 0
    }));

    set({
      cards,
      players,
      currentPlayer: 0,
      gameStatus: 'playing',
      difficulty,
      startTime: Date.now(),
      gameMode
    });
  },

  flipCard: (cardId) => {
    const state = get();
    if (state.gameStatus !== 'playing') return;

    const flippedCards = state.cards.filter((card: Card) => card.isFlipped && !card.isMatched);
    if (flippedCards.length >= 2) return;

    const newCards = state.cards.map((card: Card) => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    );

    set({ cards: newCards });

    // Check for match after a delay
    setTimeout(() => {
      const currentState = get();
      const flippedCards = currentState.cards.filter((card: Card) => card.isFlipped && !card.isMatched);
      
      if (flippedCards.length === 2) {
        const isMatch = checkForMatch(flippedCards[0], flippedCards[1]);
        
        if (isMatch) {
          // Match found - trigger confetti!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          set({
            cards: currentState.cards.map((card: Card) => 
              flippedCards.includes(card) ? { ...card, isMatched: true } : card
            )
          });
          
          // Update score
          const currentPlayer = currentState.players[currentState.currentPlayer];
          get().updateScore(currentPlayer.id, 10);

          // Check if game is complete
          const updatedCards = get().cards;
          if (updatedCards.every(card => card.isMatched)) {
            // Bigger celebration for game completion!
            confetti({
              particleCount: 200,
              angle: 60,
              spread: 55,
              origin: { x: 0 }
            });
            confetti({
              particleCount: 200,
              angle: 120,
              spread: 55,
              origin: { x: 1 }
            });
          }
        } else {
          // No match - flip cards back
          set({
            cards: currentState.cards.map((card: Card) => 
              flippedCards.includes(card) ? { ...card, isFlipped: false } : card
            )
          });
        }

        // Update moves and switch player if multiplayer
        if (currentState.gameMode === 'multiplayer' && !isMatch) {
          get().nextPlayer();
        }
      }
    }, 1000);
  },

  updateScore: (playerId, points) => {
    set((state) => ({
      ...state,
      players: state.players.map((player: Player) => 
        player.id === playerId 
          ? { ...player, score: player.score + points, moves: player.moves + 1 }
          : player
      )
    }));
  },

  nextPlayer: () => {
    set((state) => ({
      ...state,
      currentPlayer: (state.currentPlayer + 1) % state.players.length
    }));
  },

  resetGame: () => {
    set({
      cards: [],
      players: [],
      currentPlayer: 0,
      gameStatus: 'setup',
      difficulty: 'medium',
      startTime: null,
      gameMode: 'single'
    });
  },

  endGame: () => {
    set((state) => ({ ...state, gameStatus: 'finished' }));
  }
}));
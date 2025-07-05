import { create } from 'zustand';
import { GameState, Card, Player } from '@/types/game';
import { generateCards, checkForMatch } from '@/lib/game-logic';

interface GameStore extends GameState {
  initializeGame: (difficulty: string, players: string[], gameMode: string) => void;
  flipCard: (cardId: string) => void;
  resetGame: () => void;
  updateScore: (playerId: string, points: number) => void;
  nextPlayer: () => void;
  endGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  cards: [],
  players: [],
  currentPlayer: 0,
  gameStatus: 'setup',
  difficulty: 'medium',
  startTime: null,
  gameMode: 'single',

  initializeGame: (difficulty, playerNames, gameMode) => {
    const cards = generateCards(difficulty);
    const players = playerNames.map((name, index) => ({
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
      difficulty: difficulty as any,
      startTime: Date.now(),
      gameMode: gameMode as any
    });
  },

  flipCard: (cardId) => {
    const state = get();
    if (state.gameStatus !== 'playing') return;

    const flippedCards = state.cards.filter(card => card.isFlipped && !card.isMatched);
    if (flippedCards.length >= 2) return;

    const newCards = state.cards.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    );

    set({ cards: newCards });

    // Check for match after a delay
    setTimeout(() => {
      const currentState = get();
      const flippedCards = currentState.cards.filter(card => card.isFlipped && !card.isMatched);
      
      if (flippedCards.length === 2) {
        const isMatch = checkForMatch(flippedCards[0], flippedCards[1]);
        
        if (isMatch) {
          // Match found
          set({
            cards: currentState.cards.map(card => 
              flippedCards.includes(card) ? { ...card, isMatched: true } : card
            )
          });
          
          // Update score
          const currentPlayer = currentState.players[currentState.currentPlayer];
          get().updateScore(currentPlayer.id, 10);
        } else {
          // No match - flip cards back
          set({
            cards: currentState.cards.map(card => 
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
    set(state => ({
      players: state.players.map(player => 
        player.id === playerId 
          ? { ...player, score: player.score + points, moves: player.moves + 1 }
          : player
      )
    }));
  },

  nextPlayer: () => {
    set(state => ({
      currentPlayer: (state.currentPlayer + 1) % state.players.length
    }));
  },

  resetGame: () => {
    set({
      cards: [],
      players: [],
      currentPlayer: 0,
      gameStatus: 'setup',
      startTime: null
    });
  },

  endGame: () => {
    set({ gameStatus: 'finished' });
  }
}));
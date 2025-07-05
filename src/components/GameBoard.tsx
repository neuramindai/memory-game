'use client'

import { useEffect } from 'react';
import { useGameStore } from '../store/game-store';
import GameCard from './ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameBoard() {
  const { cards, gameStatus, flipCard, players, currentPlayer, endGame } = useGameStore();

  // Check if game is complete
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setTimeout(() => {
        endGame();
      }, 1500); // Longer delay to enjoy the completion
    }
  }, [cards, endGame]);

  if (gameStatus !== 'playing') {
    return null;
  }

  // Determine grid layout based on number of cards
  const getGridConfig = () => {
    const cardCount = cards.length;
    if (cardCount <= 12) return { 
      cols: 'grid-cols-3 md:grid-cols-4', 
      gap: 'gap-4 md:gap-6',
      maxWidth: 'max-w-2xl'
    };
    if (cardCount <= 16) return { 
      cols: 'grid-cols-4', 
      gap: 'gap-3 md:gap-5',
      maxWidth: 'max-w-3xl'
    };
    return { 
      cols: 'grid-cols-4 md:grid-cols-6', 
      gap: 'gap-2 md:gap-4',
      maxWidth: 'max-w-4xl'
    };
  };

  const { cols, gap, maxWidth } = getGridConfig();

  // Check if any cards are currently flipped (to disable clicking during matching check)
  const flippedCards = cards.filter(card => card.isFlipped && !card.isMatched);
  const isCheckingMatch = flippedCards.length === 2;

  // Calculate completion percentage
  const matchedCards = cards.filter(card => card.isMatched).length;
  const completionPercentage = cards.length > 0 ? (matchedCards / cards.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center space-y-8 p-4">
      {/* Current Player Indicator with enhanced styling */}
      <AnimatePresence mode="wait">
        {players.length > 1 && (
          <motion.div
            key={currentPlayer}
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl px-8 py-4 text-white">
              <div className="text-center">
                <div className="text-sm opacity-90 font-medium">Current Player</div>
                <div className="text-xl font-bold flex items-center justify-center space-x-2">
                  <span>👤</span>
                  <span>{players[currentPlayer]?.name}</span>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs">⭐</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <motion.div 
        className="w-full max-w-md bg-gray-200 rounded-full h-3 shadow-inner"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full shadow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <div className="text-center mt-2 text-sm text-gray-600 font-medium">
          {Math.round(completionPercentage)}% Complete
        </div>
      </motion.div>

      {/* Game Board Grid with enhanced container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`
          grid ${cols} ${gap} ${maxWidth} mx-auto p-6 md:p-8
          bg-gradient-to-br from-white via-gray-50 to-blue-50
          rounded-3xl shadow-2xl border border-white/50
          backdrop-blur-sm
        `}
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e0f2fe 100%)
          `
        }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30, rotateY: -90 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ 
              delay: index * 0.05, 
              duration: 0.4,
              type: "spring",
              stiffness: 200
            }}
          >
            <GameCard
              card={card}
              onClick={flipCard}
              disabled={isCheckingMatch}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Game Status with better feedback */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`${isCheckingMatch}-${flippedCards.length}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center"
        >
          <div className={`
            px-6 py-3 rounded-2xl font-medium text-lg shadow-lg
            ${isCheckingMatch 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
              : flippedCards.length === 1 
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }
          `}>
            {isCheckingMatch && (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                <span>Checking for match...</span>
              </div>
            )}
            {!isCheckingMatch && flippedCards.length === 1 && (
              <div className="flex items-center justify-center space-x-2">
                <span>🎯</span>
                <span>Pick another card to match!</span>
              </div>
            )}
            {!isCheckingMatch && flippedCards.length === 0 && (
              <div className="flex items-center justify-center space-x-2">
                <span>🚀</span>
                <span>Click a card to start matching!</span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating celebration particles when cards match */}
      {cards.some(card => card.isMatched) && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                rotate: 0,
                opacity: 0
              }}
              animate={{ 
                y: -50,
                rotate: 360,
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 3,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 4
              }}
            >
              {['🎉', '⭐', '🎊', '✨', '🌟'][i]}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
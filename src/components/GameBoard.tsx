'use client'

import { useEffect } from 'react';
import { useGameStore } from '../store/game-store';
import GameCard from './ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import GameStats from '../components/GameStats';

export default function GameBoard() {
  const { cards, gameStatus, flipCard, players, currentPlayer, endGame } = useGameStore();

  // Check if game is complete
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setTimeout(() => {
        endGame();
      }, 1500);
    }
  }, [cards, endGame]);

  if (gameStatus !== 'playing') {
    return null;
  }

  // Determine grid layout based on number of cards
  const getGridConfig = () => {
    const cardCount = cards.length;
    
    // Mobile-first responsive grid configurations
    if (cardCount <= 12) {
      return {
        className: 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6',
        containerClass: 'max-w-2xl',
        gap: 'gap-2 sm:gap-3 md:gap-4'
      };
    } else if (cardCount <= 16) {
      return {
        className: 'grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4',
        containerClass: 'max-w-3xl',
        gap: 'gap-2 sm:gap-3 md:gap-4'
      };
    } else {
      return {
        className: 'grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8',
        containerClass: 'max-w-5xl',
        gap: 'gap-2 sm:gap-3'
      };
    }
  };

  const { className, containerClass, gap } = getGridConfig();

  // Check if any cards are currently flipped (to disable clicking during matching check)
  const flippedCards = cards.filter(card => card.isFlipped && !card.isMatched);
  const isCheckingMatch = flippedCards.length === 2;

  // Calculate completion percentage
  const matchedCards = cards.filter(card => card.isMatched).length;
  const completionPercentage = cards.length > 0 ? (matchedCards / cards.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4 py-6 sm:py-8">
      {/* Game table surface */}
      <div className="max-w-7xl mx-auto">
        <GameStats />
        
        {/* Current Player Indicator for multiplayer */}
        <AnimatePresence mode="wait">
          {players.length > 1 && (
            <motion.div
              key={currentPlayer}
              initial={{ scale: 0.8, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-center mb-6"
            >
              <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl px-6 py-3 text-white">
                <div className="text-sm opacity-90 font-medium">Current Turn</div>
                <div className="text-lg font-bold flex items-center justify-center space-x-2">
                  <span>👤</span>
                  <span>{players[currentPlayer]?.name}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <motion.div 
          className="max-w-md mx-auto mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-gray-200 rounded-full h-3 shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full shadow-sm"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="text-center mt-2 text-sm text-gray-600 font-medium">
            {Math.round(completionPercentage)}% Complete
          </div>
        </motion.div>

        {/* Game Table */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`${containerClass} mx-auto`}
        >
          {/* Table surface */}
          <div className="relative bg-gradient-to-br from-green-800 to-green-900 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-8 border-amber-900"
            style={{
              boxShadow: `
                inset 0 2px 4px rgba(0,0,0,0.5),
                0 20px 40px rgba(0,0,0,0.4),
                0 10px 20px rgba(0,0,0,0.3)
              `,
              background: `
                radial-gradient(ellipse at center, #2d5a2d 0%, #1a3a1a 100%),
                linear-gradient(135deg, #2d5a2d 0%, #1a3a1a 100%)
              `
            }}
          >
            {/* Felt texture overlay */}
            <div className="absolute inset-0 opacity-30 rounded-2xl"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' result='noisy' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`
              }}
            ></div>

            {/* Cards grid */}
            <div className={`${className} ${gap} relative z-10`}>
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
                  className="w-full"
                  style={{
                    // Maintain aspect ratio for cards
                    maxWidth: '120px'
                  }}
                >
                  <GameCard
                    card={card}
                    onClick={flipCard}
                    disabled={isCheckingMatch}
                  />
                </motion.div>
              ))}
            </div>

            {/* Table edge highlight */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.1), inset 0 -2px 0 rgba(0,0,0,0.3)'
              }}
            ></div>
          </div>
        </motion.div>

        {/* Game Status */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${isCheckingMatch}-${flippedCards.length}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mt-6"
          >
            <div className={`
              inline-block px-6 py-3 rounded-2xl font-medium text-lg shadow-lg
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
                  <span>Pick another card!</span>
                </div>
              )}
              {!isCheckingMatch && flippedCards.length === 0 && (
                <div className="flex items-center justify-center space-x-2">
                  <span>👆</span>
                  <span>Click any card to start!</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating celebration particles */}
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
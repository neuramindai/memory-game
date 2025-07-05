'use client'

import { motion } from 'framer-motion';
import { Card as CardType } from '../../app/types/game';

interface GameCardProps {
  card: CardType;
  onClick: (cardId: string) => void;
  disabled?: boolean;
}

export default function GameCard({ card, onClick, disabled = false }: GameCardProps) {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onClick(card.id);
    }
  };

  return (
    <motion.div
      className={`
        relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28
        cursor-pointer rounded-xl shadow-lg
        transform transition-all duration-300
        ${disabled || card.isMatched ? 'cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'}
        ${card.isMatched ? 'opacity-90' : ''}
      `}
      onClick={handleClick}
      whileHover={!disabled && !card.isFlipped && !card.isMatched ? { 
        scale: 1.05,
        rotateY: 5,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!disabled && !card.isFlipped && !card.isMatched ? { 
        scale: 0.95,
        transition: { duration: 0.1 }
      } : {}}
      layout
    >
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        animate={{ rotateY: (card.isFlipped || card.isMatched) ? 180 : 0 }}
        transition={{ 
          duration: 0.6, 
          type: "spring", 
          stiffness: 200, 
          damping: 25 
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card Back */}
        <div 
          className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg border-2 border-white/20"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative">
            {/* Sparkle pattern on back */}
            <div className="absolute inset-0 bg-white/10 rounded-lg"></div>
            <div className="text-white text-3xl font-bold drop-shadow-lg">?</div>
            {/* Decorative corners */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-white/30 rounded-full"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/30 rounded-full"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white/30 rounded-full"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white/30 rounded-full"></div>
          </div>
        </div>

        {/* Card Front */}
        <div 
          className={`
            absolute inset-0 backface-hidden rounded-xl flex items-center justify-center text-4xl md:text-5xl shadow-lg border-2
            ${card.isMatched 
              ? 'bg-gradient-to-br from-green-100 to-emerald-200 border-emerald-400 shadow-emerald-200' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-gray-300'
            }
          `}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="relative"
          >
            {card.value}
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20 rounded-lg"></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Matched indicator with celebration animation */}
      {card.isMatched && (
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ 
            delay: 0.4, 
            duration: 0.5,
            type: "spring",
            stiffness: 300
          }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
        >
          <motion.svg 
            className="w-5 h-5 text-white" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </motion.svg>
        </motion.div>
      )}

      {/* Hover glow effect */}
      {!card.isFlipped && !card.isMatched && !disabled && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/0 to-purple-400/0 hover:from-blue-400/20 hover:to-purple-400/20 transition-all duration-300 pointer-events-none"></div>
      )}
    </motion.div>
  );
}
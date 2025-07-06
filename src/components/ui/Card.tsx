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
        relative aspect-[2/3] w-full
        cursor-pointer rounded-lg
        transform transition-all duration-300
        ${disabled || card.isMatched ? 'cursor-not-allowed' : 'hover:scale-105 hover:-translate-y-1'}
        ${card.isMatched ? 'opacity-90' : ''}
      `}
      onClick={handleClick}
      role="button"
      aria-label={`Memory card ${card.isFlipped ? `showing ${card.value}` : 'face down'}`}
      whileHover={!disabled && !card.isFlipped && !card.isMatched ? { 
        scale: 1.05,
        y: -4,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!disabled && !card.isFlipped && !card.isMatched ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      style={{
        perspective: '1000px'
      }}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: (card.isFlipped || card.isMatched) ? 180 : 0 }}
        transition={{ 
          duration: 0.6, 
          type: "spring", 
          stiffness: 200, 
          damping: 25 
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card Back - Traditional Playing Card Design */}
        <div 
          className="absolute inset-0 backface-hidden rounded-lg bg-white flex items-center justify-center shadow-xl border border-gray-300 overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Card back pattern */}
          <div className="absolute inset-2 rounded border-2 border-blue-800 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
            {/* Traditional card back pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px),
                repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 16px)
              `
            }}></div>
            
            {/* Center ornament */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Decorative diamond shape */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-600 to-red-800 transform rotate-45 shadow-lg">
                  <div className="absolute inset-1 bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 transform scale-75"></div>
                  </div>
                </div>
                {/* Center symbol */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-2xl md:text-3xl font-bold transform -rotate-45 drop-shadow-lg">♠</span>
                </div>
              </div>
            </div>
            
            {/* Corner decorations */}
            <div className="absolute top-2 left-2 text-white text-xs md:text-sm font-bold">♦</div>
            <div className="absolute top-2 right-2 text-white text-xs md:text-sm font-bold">♦</div>
            <div className="absolute bottom-2 left-2 text-white text-xs md:text-sm font-bold rotate-180">♦</div>
            <div className="absolute bottom-2 right-2 text-white text-xs md:text-sm font-bold rotate-180">♦</div>
          </div>
        </div>

        {/* Card Front - Clean Playing Card Design */}
        <div 
          className={`
            absolute inset-0 backface-hidden rounded-lg flex flex-col shadow-xl border overflow-hidden
            ${card.isMatched 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-400' 
              : 'bg-white border-gray-300'
            }
          `}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            boxShadow: card.isMatched 
              ? '0 10px 30px rgba(16, 185, 129, 0.3), 0 1px 2px rgba(0, 0, 0, 0.1)'
              : '0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Card value corners */}
          <div className="absolute top-1 left-1 md:top-2 md:left-2 flex flex-col items-center">
            <span className="text-xs md:text-sm font-bold text-gray-800">A</span>
            <span className="text-xs md:text-sm text-gray-800">♠</span>
          </div>
          <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 flex flex-col items-center rotate-180">
            <span className="text-xs md:text-sm font-bold text-gray-800">A</span>
            <span className="text-xs md:text-sm text-gray-800">♠</span>
          </div>
          
          {/* Center content */}
          <div className="flex-1 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <span className={`text-4xl md:text-5xl lg:text-6xl ${card.isMatched ? 'animate-bounce' : ''}`}>
                {card.value}
              </span>
              
              {/* Shine effect for matched cards */}
              {card.isMatched && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"
                  animate={{ 
                    opacity: [0, 1, 0],
                    transform: ['translateX(-100%) translateY(100%)', 'translateX(100%) translateY(-100%)']
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              )}
            </motion.div>
          </div>

          {/* Subtle pattern on matched cards */}
          {card.isMatched && (
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}></div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Matched indicator */}
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
          className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
        >
          <motion.svg 
            className="w-3 h-3 md:w-4 md:h-4 text-white" 
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

      {/* Shadow effect for depth */}
      <div className="absolute inset-0 rounded-lg pointer-events-none" 
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1)'
        }}
      ></div>
    </motion.div>
  );
}
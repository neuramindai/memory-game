// src/components/GameStats.tsx
'use client'

import { useGameStore } from '../store/game-store';
import { motion } from 'framer-motion';

export default function GameStats() {
  const { players, currentPlayer, gameMode, gameStatus, cards } = useGameStore();

  if (gameStatus !== 'playing') return null;

  const matchedPairs = cards.filter(card => card.isMatched).length / 2;
  const totalPairs = cards.length / 2;
  const progress = (matchedPairs / totalPairs) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-4 mb-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {/* Progress */}
        <div>
          <p className="text-sm text-gray-600">Progress</p>
          <div className="mt-1 bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs mt-1">{matchedPairs}/{totalPairs} pairs</p>
        </div>

        {/* Current Player */}
        {gameMode === 'multiplayer' && (
          <div>
            <p className="text-sm text-gray-600">Current Turn</p>
            <p className="text-lg font-bold text-blue-600">
              {players[currentPlayer]?.name}
            </p>
          </div>
        )}

        {/* Scores */}
        {players.map((player, index) => (
          <div key={player.id}>
            <p className="text-sm text-gray-600">{player.name}</p>
            <p className="text-lg font-bold">
              {player.score} pts
            </p>
            <p className="text-xs text-gray-500">
              {player.moves} moves
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
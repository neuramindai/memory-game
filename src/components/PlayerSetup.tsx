'use client'

import { useState } from 'react';
import { useGameStore } from '../store/game-store';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlayerSetup() {
  const { gameStatus, initializeGame } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameMode, setGameMode] = useState<'single' | 'multiplayer'>('single');

  if (gameStatus !== 'setup') {
    return null;
  }

  const handleAddPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, '']);
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const handleStartGame = () => {
    let playerNames: string[];
    
    if (gameMode === 'single') {
      playerNames = [playerName || 'Player 1'];
    } else {
      playerNames = players
        .map((name, index) => name.trim() || `Player ${index + 1}`)
        .filter(name => name.length > 0);
    }

    if (playerNames.length > 0) {
      initializeGame(difficulty, playerNames, gameMode);
    }
  };

  const isValid = gameMode === 'single' 
    ? true 
    : players.some(name => name.trim().length > 0);

  const difficultyOptions = [
    { key: 'easy', label: 'Easy', desc: '6 pairs', emoji: '😊', color: 'green' },
    { key: 'medium', label: 'Medium', desc: '8 pairs', emoji: '🤔', color: 'yellow' },
    { key: 'hard', label: 'Hard', desc: '12 pairs', emoji: '🔥', color: 'red' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
      className="max-w-lg mx-auto"
    >
      <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-8 m-4 border border-white/50 backdrop-blur-sm">
        {/* Header with floating animation */}
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div 
            className="text-6xl mb-4"
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 2, repeatDelay: 3 },
              scale: { repeat: Infinity, duration: 2, repeatDelay: 3 }
            }}
          >
            🧠
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Memory Game
          </h1>
          <p className="text-gray-600 font-medium">Match pairs of cards to win!</p>
        </motion.div>

        {/* Game Mode Selection with enhanced styling */}
        <motion.div 
          className="mb-8"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🎮 Game Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'single', label: 'Single Player', emoji: '👤', desc: 'Play solo' },
              { key: 'multiplayer', label: 'Multiplayer', emoji: '👥', desc: 'Play with friends' }
            ].map(({ key, label, emoji, desc }) => (
              <motion.button
                key={key}
                onClick={() => setGameMode(key as any)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  px-4 py-4 rounded-xl font-medium transition-all duration-200 border-2
                  ${gameMode === key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400 shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow-md'
                  }
                `}
              >
                <div className="text-xl mb-1">{emoji}</div>
                <div className="text-sm font-bold">{label}</div>
                <div className="text-xs opacity-80">{desc}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Player Setup with animations */}
        <motion.div 
          className="mb-8"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {gameMode === 'single' ? (
              <motion.div
                key="single"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  👤 Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white shadow-sm"
                />
              </motion.div>
            ) : (
              <motion.div
                key="multiplayer"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    👥 Players ({players.length}/4)
                  </label>
                  {players.length < 4 && (
                    <motion.button
                      onClick={handleAddPlayer}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm text-blue-500 hover:text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg border border-blue-200"
                    >
                      + Add Player
                    </motion.button>
                  )}
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {players.map((player, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3"
                      >
                        <input
                          type="text"
                          value={player}
                          onChange={(e) => updatePlayerName(index, e.target.value)}
                          placeholder={`Player ${index + 1}`}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white shadow-sm"
                        />
                        {players.length > 1 && (
                          <motion.button
                            onClick={() => handleRemovePlayer(index)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl border-2 border-red-200 transition-colors"
                          >
                            ✕
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Difficulty Selection */}
        <motion.div 
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ⚡ Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {difficultyOptions.map(({ key, label, desc, emoji, color }) => (
              <motion.button
                key={key}
                onClick={() => setDifficulty(key as any)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  px-3 py-4 rounded-xl text-center transition-all duration-200 border-2
                  ${difficulty === key
                    ? `bg-gradient-to-br ${
                        color === 'green' ? 'from-green-400 to-emerald-500 border-green-400' :
                        color === 'yellow' ? 'from-yellow-400 to-orange-500 border-yellow-400' :
                        'from-red-400 to-pink-500 border-red-400'
                      } text-white shadow-lg`
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow-md'
                  }
                `}
              >
                <div className="text-2xl mb-1">{emoji}</div>
                <div className="font-bold text-sm">{label}</div>
                <div className="text-xs opacity-80">{desc}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Start Game Button */}
        <motion.button
          onClick={handleStartGame}
          disabled={!isValid}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={isValid ? { scale: 1.02 } : {}}
          whileTap={isValid ? { scale: 0.98 } : {}}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 border-2
            ${isValid
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-green-400 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
            }
          `}
        >
          <span className="flex items-center justify-center space-x-2">
            <span>🚀</span>
            <span>Start Game</span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
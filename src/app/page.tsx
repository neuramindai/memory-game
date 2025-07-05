'use client'

import { useEffect, useState } from 'react';
import { useGameStore } from '../store/game-store';
import PlayerSetup from '../components/PlayerSetup';
import GameBoard from '../components/GameBoard';
import { FirebaseService } from '../lib/firebase-service';
import { calculateScore } from '../lib/game-logic';
import { motion } from 'framer-motion';
import { Player } from './types/game';

interface FinalPlayerScore extends Player {
  finalScore: number;
  timeElapsed: number;
}

export default function Home() {
  const { 
    gameStatus, 
    players, 
    currentPlayer, 
    difficulty, 
    startTime, 
    resetGame,
    cards 
  } = useGameStore();

  const [gameTime, setGameTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [finalScores, setFinalScores] = useState<FinalPlayerScore[]>([]);

  // Update game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStatus === 'playing' && startTime) {
      interval = setInterval(() => {
        setGameTime(Date.now() - startTime);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStatus, startTime]);

  // Handle game completion
  useEffect(() => {
    if (gameStatus === 'finished') {
      handleGameComplete();
    }
  }, [gameStatus]);

  const handleGameComplete = async () => {
    const endTime = Date.now();
    const totalTime = startTime ? endTime - startTime : 0;
    
    // Calculate final scores
    const finalPlayerScores: FinalPlayerScore[] = players.map((player: Player) => {
      const calculatedScore = calculateScore(player.moves, totalTime, difficulty);
      return {
        ...player,
        finalScore: calculatedScore,
        timeElapsed: totalTime
      };
    });

    // Sort by score for ranking
    finalPlayerScores.sort((a: FinalPlayerScore, b: FinalPlayerScore) => b.finalScore - a.finalScore);
    setFinalScores(finalPlayerScores);
    setShowResults(true);

    // Save scores to Firebase
    try {
      for (const player of finalPlayerScores) {
        await FirebaseService.saveGameScore({
          playerName: player.name,
          score: player.finalScore,
          moves: player.moves,
          timeElapsed: totalTime,
          difficulty,
          timestamp: endTime
        });
      }
      console.log('Scores saved to Firebase!');
    } catch (error) {
      console.error('Error saving scores:', error);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  const handleNewGame = () => {
    setShowResults(false);
    setGameTime(0);
    setFinalScores([]);
    resetGame();
  };

  // Game Results Modal
  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800">Game Complete!</h2>
            <p className="text-gray-600">Final Results</p>
          </div>

          <div className="space-y-3 mb-6">
            {finalScores.map((player: FinalPlayerScore, index: number) => (
              <div
                key={player.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  ${index === 0 
                    ? 'bg-yellow-100 border-2 border-yellow-400' 
                    : 'bg-gray-50 border border-gray-200'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${index === 0 ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-700'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-gray-600">
                      {player.moves} moves • {formatTime(player.timeElapsed)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{player.finalScore.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleNewGame}
              className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              New Game
            </button>
            <button
              onClick={() => window.location.reload()}
              className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Main Menu
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with game info */}
      {gameStatus === 'playing' && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white shadow-sm p-4"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Time</div>
                <div className="font-bold text-lg">{formatTime(gameTime)}</div>
              </div>
              
              {players.length === 1 ? (
                <div className="text-center">
                  <div className="text-sm text-gray-600">Moves</div>
                  <div className="font-bold text-lg">{players[0]?.moves || 0}</div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  {players.map((player: Player, index: number) => (
                    <div
                      key={player.id}
                      className={`text-center px-3 py-1 rounded-lg ${
                        index === currentPlayer 
                          ? 'bg-blue-100 border-2 border-blue-400' 
                          : 'bg-gray-100'
                      }`}
                    >
                      <div className="text-xs text-gray-600">{player.name}</div>
                      <div className="font-bold">{player.score}</div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-center">
                <div className="text-sm text-gray-600">Difficulty</div>
                <div className="font-bold text-lg capitalize">{difficulty}</div>
              </div>
            </div>

            <button
              onClick={handleNewGame}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Quit Game
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Game Content */}
      <div className="container mx-auto py-8">
        {gameStatus === 'setup' && <PlayerSetup />}
        {gameStatus === 'playing' && <GameBoard />}
      </div>
    </div>
  );
}
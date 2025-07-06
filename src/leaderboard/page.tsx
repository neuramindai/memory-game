'use client'

import { useEffect, useState } from 'react';
import { FirebaseService } from '@/lib/firebase-service';
import { GameScore } from '@/app/types/game';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, [filter]);

  const loadScores = async () => {
    setLoading(true);
    try {
      const topScores = await FirebaseService.getTopScores(filter, 20);
      setScores(topScores);
    } catch (error) {
      console.error('Error loading scores:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🏆 Leaderboard
          </h1>
        </motion.div>

        {/* Filter buttons */}
        <div className="flex justify-center gap-2 mb-6">
          {(['all', 'easy', 'medium', 'hard'] as const).map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === level
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {/* Scores table */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Moves</th>
                  <th className="px-4 py-3 text-center">Time</th>
                  <th className="px-4 py-3 text-center">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <motion.tr
                    key={score.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-4 py-3">
                      {index < 3 ? (
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        `#${index + 1}`
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{score.playerName}</td>
                    <td className="px-4 py-3 text-center font-bold">{score.score}</td>
                    <td className="px-4 py-3 text-center">{score.moves}</td>
                    <td className="px-4 py-3 text-center">
                      {Math.floor(score.timeElapsed / 1000)}s
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        score.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        score.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {score.difficulty}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Back to Game
          </Link>
        </div>
      </div>
    </div>
  );
}
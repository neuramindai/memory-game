import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { GameScore } from '../app/types/game';

export class FirebaseService {
  
  /**
   * Save a game score to Firestore
   */
  static async saveGameScore(scoreData: Omit<GameScore, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'gameScores'), {
        ...scoreData,
        timestamp: Date.now()
      });
      console.log('Score saved with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving score: ', error);
      throw new Error('Failed to save score');
    }
  }

  /**
   * Get top scores for leaderboard
   */
  static async getTopScores(
    difficulty: string = 'all', 
    limitCount: number = 10
  ): Promise<GameScore[]> {
    try {
      let q;
      
      if (difficulty === 'all') {
        // Simple query that doesn't require indexes
        q = query(
          collection(db, 'gameScores'),
          orderBy('score', 'desc'),
          limit(limitCount)
        );
      } else {
        // This query requires the index we're creating
        q = query(
          collection(db, 'gameScores'),
          where('difficulty', '==', difficulty),
          orderBy('score', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const scores: GameScore[] = [];

      querySnapshot.forEach((doc) => {
        scores.push({
          id: doc.id,
          ...doc.data()
        } as GameScore);
      });

      return scores;
    } catch (error) {
      console.error('Error fetching scores: ', error);
      // Return empty array instead of throwing to handle gracefully
      return [];
    }
  }

  /**
   * Get today's top scores (simplified to avoid index requirements)
   */
  static async getTodaysTopScores(limitCount: number = 5): Promise<GameScore[]> {
    try {
      // Simplified query - just get recent scores by timestamp
      const q = query(
        collection(db, 'gameScores'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const scores: GameScore[] = [];

      querySnapshot.forEach((doc) => {
        scores.push({
          id: doc.id,
          ...doc.data()
        } as GameScore);
      });

      return scores;
    } catch (error) {
      console.error('Error fetching today\'s scores: ', error);
      return [];
    }
  }

  /**
   * Get player's personal best scores
   */
  static async getPlayerBestScores(playerName: string): Promise<GameScore[]> {
    try {
      const q = query(
        collection(db, 'gameScores'),
        where('playerName', '==', playerName),
        orderBy('score', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const scores: GameScore[] = [];

      querySnapshot.forEach((doc) => {
        scores.push({
          id: doc.id,
          ...doc.data()
        } as GameScore);
      });

      return scores;
    } catch (error) {
      console.error('Error fetching player scores: ', error);
      return [];
    }
  }
}
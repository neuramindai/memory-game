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
import { GameScore } from '@/types/game';

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
        q = query(
          collection(db, 'gameScores'),
          orderBy('score', 'desc'),
          limit(limitCount)
        );
      } else {
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
      return [];
    }
  }

  /**
   * Get today's top scores
   */
  static async getTodaysTopScores(limitCount: number = 5): Promise<GameScore[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();

      const q = query(
        collection(db, 'gameScores'),
        where('timestamp', '>=', todayTimestamp),
        orderBy('timestamp', 'desc'),
        orderBy('score', 'desc'),
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
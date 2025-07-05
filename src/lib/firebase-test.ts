import { FirebaseService } from './firebase-service';

export async function testFirebaseConnection(): Promise<boolean> {
  try {
    // Test saving a score
    const testScore = {
      playerName: 'Test Player',
      score: 100,
      moves: 10,
      timeElapsed: 30000,
      difficulty: 'easy',
      timestamp: Date.now()
    };

    const scoreId = await FirebaseService.saveGameScore(testScore);
    console.log('✅ Firebase connection successful! Score ID:', scoreId);

    // Test fetching scores
    const scores = await FirebaseService.getTopScores('easy', 1);
    console.log('✅ Firebase read successful! Found scores:', scores.length);

    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
}
// src/lib/preferences.ts
interface GamePreferences {
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  cardStyle: 'emoji' | 'numbers' | 'letters';
}

const STORAGE_KEY = 'memory-game-preferences';

export const preferences = {
  get(): GamePreferences {
    if (typeof window === 'undefined') return this.getDefaults();
    
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : this.getDefaults();
  },

  set(prefs: Partial<GamePreferences>) {
    if (typeof window === 'undefined') return;
    
    const current = this.get();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getDefaults(): GamePreferences {
    return {
      soundEnabled: true,
      theme: 'light',
      cardStyle: 'emoji'
    };
  }
};
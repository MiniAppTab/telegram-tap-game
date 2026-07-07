import { useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { authenticateTelegram, getStoredAuth, clearAuth } from './lib/auth';
import { useTapGame } from './hooks/useTapGame';

interface UserData {
  id: string;
  telegram_id: number;
  username?: string;
  first_name: string;
  membership_level: string;
  photo_url?: string;
}

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { stats, handleTap, error: tapError } = useTapGame();

  useEffect(() => {
    const init = async () => {
      try {
        const { initData } = retrieveLaunchParams();
        if (!initData || !initData.user) throw new Error('Not in Telegram Mini App');
        const authResult = await authenticateTelegram(initData.raw);
        setUser(authResult.user);
      } catch (e: any) {
        const stored = getStoredAuth();
        if (stored) {
          setUser(stored.user);
        } else {
          setAuthError(e.message);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-darker">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-darker text-center p-6">
        <div className="text-red-400 text-xl mb-4">⚠️ Error</div>
        <p className="text-gray-400">{authError}</p>
        <button onClick={() => { clearAuth(); window.location.reload(); }} className="mt-6 bg-gold text-dark px-6 py-3 rounded-xl font-bold">
          Retry
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-darker p-4 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {user.photo_url && (
            <img src={user.photo_url} alt="avatar" className="w-10 h-10 rounded-full border-2 border-gold" />
          )}
          <div>
            <p className="text-light font-bold">{user.first_name}</p>
            <p className="text-xs text-gray-400 capitalize">{user.membership_level} level</p>
          </div>
        </div>
        <div className="bg-accent/30 px-4 py-2 rounded-full">
          <span className="text-gold font-bold text-lg">{stats.earnedPoints}</span>
          <span className="text-xs text-gray-300 ml-1">pts</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-between mb-4 text-sm text-gray-400">
        <span>Tap limit: {stats.remainingTaps} left</span>
        <span>Multiplier: {stats.multiplier}x</span>
      </div>

      {/* Tap area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <button
          onClick={handleTap}
          disabled={stats.remainingTaps <= 0}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-gold to-yellow-600 shadow-2xl flex items-center justify-center transform active:scale-90 transition-transform disabled:opacity-50 disabled:active:scale-100"
        >
          <span className="text-6xl">🪙</span>
        </button>
        <p className="mt-6 text-lg text-light font-bold">
          Tap the coin!
        </p>
        {tapError && (
          <p className="mt-2 text-red-400 text-xs">{tapError}</p>
        )}
      </div>
    </div>
  );
}

export default App;

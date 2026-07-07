import { useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { authenticateTelegram, getStoredAuth, clearAuth } from './lib/auth';
import { supabase } from './lib/supabase';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { initData } = retrieveLaunchParams();
        if (!initData || !initData.user) {
          throw new Error('Not in Telegram Mini App');
        }

        const authResult = await authenticateTelegram(initData.raw);
        setUser(authResult.user);
      } catch (e: any) {
        const stored = getStoredAuth();
        if (stored) {
          setUser(stored.user);
        } else {
          setError(e.message);
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-darker text-center p-6">
        <div className="text-red-400 text-xl mb-4">⚠️ Error</div>
        <p className="text-gray-400">{error}</p>
        <button
          onClick={() => { clearAuth(); window.location.reload(); }}
          className="mt-6 bg-gold text-dark px-6 py-3 rounded-xl font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-darker p-4">
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
          <span className="text-gold font-bold text-lg">0</span>
          <span className="text-xs text-gray-300 ml-1">pts</span>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl text-center">
        <div className="text-5xl mb-4">🪙</div>
        <h2 className="text-2xl font-bold text-gold mb-2">Welcome!</h2>
        <p className="text-gray-300">Your tap-to-earn game is ready.</p>
        <p className="text-xs text-gray-500 mt-4">Next steps: Build tap mechanics, wallet, membership, and more.</p>
      </div>
    </div>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk';

function App() {
  const [initData, setInitData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const { initData: data } = retrieveLaunchParams();
      setInitData(data);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gold">Telegram Tap Game</h1>
      {initData ? (
        <pre className="mt-4 text-xs text-green-400">
          {JSON.stringify(initData.user, null, 2)}
        </pre>
      ) : error ? (
        <p className="text-red-400">Error: {error}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;

import { useState, useEffect, useCallback, useRef } from 'react';
import { getStoredAuth } from '../lib/auth';

const TAP_FUNCTION_URL = 'https://<your-project>.supabase.co/functions/v1/tap'; // 🔁 REPLACE

export interface TapStats {
  earnedPoints: number;
  totalTapsToday: number;
  remainingTaps: number;
  multiplier: number;
}

export function useTapGame() {
  const [stats, setStats] = useState<TapStats>({
    earnedPoints: 0,
    totalTapsToday: 0,
    remainingTaps: 5000,
    multiplier: 1,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tapBatchRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTapsRef = useRef(0);
  const auth = getStoredAuth();

  const sendTapBatch = useCallback(async (count: number) => {
    if (!auth || count <= 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch(TAP_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Bearer ${auth.token},
        },
        body: JSON.stringify({ tapCount: count }),
      });
      const data = await res.json();
      if (data.success) {
        setStats(prev => ({
          ...prev,
          earnedPoints: prev.earnedPoints + data.earnedPoints,
          totalTapsToday: data.totalTapsToday,
          remainingTaps: data.remainingTaps,
          multiplier: data.multiplier,
        }));
        setError(null);
      } else {
        setError(data.message || 'Tap failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsProcessing(false);
    }
  }, [auth]);

  const handleTap = useCallback(() => {
    if (stats.remainingTaps <= 0 || !auth) return;
    // Add to pending batch
    pendingTapsRef.current += 1;
    // Schedule sending batch after 500ms of inactivity
    if (tapBatchRef.current) clearTimeout(tapBatchRef.current);
    tapBatchRef.current = setTimeout(() => {
      const count = pendingTapsRef.current;
      pendingTapsRef.current = 0;
      sendTapBatch(count);
    }, 500);
  }, [stats.remainingTaps, auth, sendTapBatch]);

  // Fetch initial stats on mount
  useEffect(() => {
    if (!auth) return;
    // We could fetch today's stats from a dedicated edge function, but for now let's just start with defaults.
    // Later we'll sync on app start.
  }, [auth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tapBatchRef.current) clearTimeout(tapBatchRef.current);
    };
  }, []);

  return {
    stats,
    isProcessing,
    error,
    handleTap,
  };
}

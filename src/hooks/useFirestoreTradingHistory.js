import { useCallback, useEffect, useRef, useState } from 'react';
import { collection, doc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';
import { TRADING_HISTORY_Q1_2026 } from '../data/tradingHistoryQ1.js';

// Each season's trading-history points live in their own Firestore
// collection (mirrors earnings_q1_2026 vs earnings), so it's physically
// impossible for edits made under one season to touch the other's chart.
// Q1 seeds from the real historical baseline so /q1report never renders an
// empty chart; Q2 starts empty until its live chart is greenlit.
const SEASON_CONFIG = {
  'Q1-2026': { collection: 'trading_history_q1_2026', cacheKey: 'cached_trading_history_q1_2026', seed: TRADING_HISTORY_Q1_2026 },
  'Q2-2026': { collection: 'trading_history_q2_2026', cacheKey: 'cached_trading_history_q2_2026', seed: [] },
};

function readCache(config) {
  try {
    const cached = window.localStorage.getItem(config.cacheKey);
    return cached ? JSON.parse(cached) : config.seed;
  } catch {
    return config.seed;
  }
}

export function useFirestoreTradingHistory(season) {
  const config = SEASON_CONFIG[season];
  const [points, setPointsState] = useState(() => readCache(config));
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const seededRef = useRef(false);

  useEffect(() => {
    seededRef.current = false;
    setPointsState(readCache(config));
    const unsubscribe = onSnapshot(
      collection(db, config.collection),
      async (snapshot) => {
        if (snapshot.empty && !seededRef.current) {
          seededRef.current = true;
          if (config.seed.length === 0) return;
          const batch = writeBatch(db);
          config.seed.forEach((point) => batch.set(doc(db, config.collection, point.id), point));
          try {
            await batch.commit();
          } catch (err) {
            console.error(`Не удалось инициализировать торговую историю (${season}) в Firestore:`, err);
          }
          return;
        }
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPointsState(docs);
        try {
          window.localStorage.setItem(config.cacheKey, JSON.stringify(docs));
        } catch {
          // best-effort cache, see newsCache.js
        }
      },
      (err) => console.error(`Не удалось получить торговую историю (${season}) из Firestore:`, err),
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season]);

  const setPoints = useCallback(
    (updater) => {
      const prev = pointsRef.current;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const nextIds = new Set(next.map((p) => p.id));
      const batch = writeBatch(db);
      next.forEach((point) => batch.set(doc(db, config.collection, point.id), point));
      prev.forEach((point) => {
        if (!nextIds.has(point.id)) batch.delete(doc(db, config.collection, point.id));
      });
      batch.commit().catch((err) => console.error(`Не удалось сохранить торговую историю (${season}) в Firestore:`, err));
      setPointsState(next);
    },
    [config.collection, season],
  );

  return [points, setPoints];
}

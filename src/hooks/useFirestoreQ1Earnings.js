import { useCallback, useEffect, useRef, useState } from 'react';
import { collection, doc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';
import { Q1_2026_EARNINGS } from '../data/q1Earnings.js';

const COLLECTION = 'earnings_q1_2026';
const CACHE_KEY = 'cached_q1_2026_earnings_data';

// Q1 2026 is a frozen archive season, kept in its own Firestore collection
// (not a `season` field on the live `earnings` collection) so it's
// physically impossible for admin edits here to touch live Q2 data.
// Otherwise mirrors useFirestoreEarnings.js exactly: seed-once-if-empty,
// localStorage cache for instant first paint, live onSnapshot sync.
export function useFirestoreQ1Earnings() {
  const [earnings, setEarningsState] = useState(() => {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : Q1_2026_EARNINGS;
    } catch {
      return Q1_2026_EARNINGS;
    }
  });
  const earningsRef = useRef(earnings);
  earningsRef.current = earnings;
  const seededRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION),
      async (snapshot) => {
        if (snapshot.empty && !seededRef.current) {
          seededRef.current = true;
          const batch = writeBatch(db);
          Q1_2026_EARNINGS.forEach((earning) => batch.set(doc(db, COLLECTION, earning.id), earning));
          try {
            await batch.commit();
          } catch (err) {
            console.error('Не удалось инициализировать архив Q1 2026 в Firestore:', err);
          }
          return;
        }
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEarningsState(docs);
        try {
          window.localStorage.setItem(CACHE_KEY, JSON.stringify(docs));
        } catch {
          // best-effort cache, see newsCache.js
        }
      },
      (err) => console.error('Не удалось получить архив Q1 2026 из Firestore:', err),
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setEarnings = useCallback((updater) => {
    const prev = earningsRef.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    const nextIds = new Set(next.map((e) => e.id));
    const batch = writeBatch(db);
    next.forEach((earning) => batch.set(doc(db, COLLECTION, earning.id), earning));
    prev.forEach((earning) => {
      if (!nextIds.has(earning.id)) batch.delete(doc(db, COLLECTION, earning.id));
    });
    batch.commit().catch((err) => console.error('Не удалось сохранить изменения архива Q1 2026 в Firestore:', err));
    setEarningsState(next);
  }, []);

  return [earnings, setEarnings];
}

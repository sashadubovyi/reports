import { useCallback, useEffect, useRef, useState } from 'react';
import { collection, doc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';

const COLLECTION = 'earnings';
const CACHE_KEY = 'cached_earnings_data';

// Firestore is the shared source of truth across all visitors (replacing the
// old per-browser localStorage store, which never synced admin edits to
// anyone else). localStorage is kept only as a cache for an instant first
// paint before the live snapshot arrives.
export function useFirestoreEarnings(seedEarnings) {
  const [earnings, setEarningsState] = useState(() => {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : seedEarnings;
    } catch {
      return seedEarnings;
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
          seedEarnings.forEach((earning) => batch.set(doc(db, COLLECTION, earning.id), earning));
          try {
            await batch.commit();
          } catch (err) {
            console.error('Не удалось инициализировать данные в Firestore:', err);
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
      (err) => console.error('Не удалось получить данные из Firestore:', err),
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
    batch.commit().catch((err) => console.error('Не удалось сохранить изменения в Firestore:', err));
    setEarningsState(next);
  }, []);

  return [earnings, setEarnings];
}

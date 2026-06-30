import { useCallback, useEffect, useRef, useState } from 'react';
import { collection, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';
import { COMPANIES } from '../data/companies.js';

const COLLECTION = 'companies';
const CACHE_KEY = 'cached_companies_data';

// Build a map for fast lookup by ticker when patching Firestore docs.
const SEED_BY_TICKER = new Map(COMPANIES.map((c) => [c.ticker, c]));

function seedDoc(company) {
  return {
    ticker: company.ticker,
    name: company.name,
    domain: company.domain || '',
    logoUrl: '',
    foundedYear: company.foundedYear || '',
    industry: company.industry || '',
    description: company.description || '',
  };
}

// Mirrors useFirestoreEarnings: Firestore is the shared source of truth for
// company profiles (name/logoUrl), seeded once from the static company list
// so existing tickers/logos keep working until an admin overrides them.
export function useFirestoreCompanies() {
  const [companies, setCompaniesState] = useState(() => {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : COMPANIES.map(seedDoc);
    } catch {
      return COMPANIES.map(seedDoc);
    }
  });
  const companiesRef = useRef(companies);
  companiesRef.current = companies;
  const seededRef = useRef(false);
  const patchedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION),
      async (snapshot) => {
        if (snapshot.empty && !seededRef.current) {
          seededRef.current = true;
          const batch = writeBatch(db);
          COMPANIES.forEach((company) => batch.set(doc(db, COLLECTION, company.ticker), seedDoc(company)));
          try {
            await batch.commit();
          } catch (err) {
            console.error('Не удалось инициализировать компании в Firestore:', err);
          }
          return;
        }

        // One-time patch: fill in description/foundedYear/industry for existing
        // docs that are missing them (e.g. seeded before these fields existed).
        // Only writes to docs where description is absent or empty so admin edits
        // are never overwritten.
        if (!patchedRef.current) {
          patchedRef.current = true;
          const needsPatch = snapshot.docs.filter((d) => !d.data().description);
          if (needsPatch.length > 0) {
            const patchPromises = needsPatch.map((d) => {
              const seed = SEED_BY_TICKER.get(d.id);
              if (!seed) return Promise.resolve();
              return setDoc(
                doc(db, COLLECTION, d.id),
                { description: seed.description || '', foundedYear: seed.foundedYear || '', industry: seed.industry || '' },
                { merge: true },
              );
            });
            Promise.all(patchPromises).catch((err) =>
              console.error('Не удалось дополнить данные компаний в Firestore:', err),
            );
          }
        }

        const docs = snapshot.docs.map((d) => d.data());
        setCompaniesState(docs);
        try {
          window.localStorage.setItem(CACHE_KEY, JSON.stringify(docs));
        } catch {
          // best-effort cache, see newsCache.js
        }
      },
      (err) => console.error('Не удалось получить компании из Firestore:', err),
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCompany = useCallback((company) => {
    return writeBatch(db).set(doc(db, COLLECTION, company.ticker), company).commit();
  }, []);

  const deleteCompany = useCallback((ticker) => {
    return writeBatch(db).delete(doc(db, COLLECTION, ticker)).commit();
  }, []);

  return { companies, saveCompany, deleteCompany };
}

/**
 * useExchangeRates — Kur verilerini module-level cache ile saklar.
 * Tüm bileşenler tek bir fetch ile ortak veriyi kullanır.
 * Cache süresi: 10 dakika (yenileme API kotasını korur).
 */
import { useState, useEffect } from 'react';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 dakika

// Module-level cache — bileşen unmount/remount'tan etkilenmez
let _cache = null;       // { rates: {...}, fetchedAt: timestamp }
let _pending = null;     // devam eden Promise (çift fetch önleme)

async function fetchRates() {
  if (_pending) return _pending; // zaten istek gönderilmişse bekle
  _pending = fetch('https://api.exchangerate-api.com/v4/latest/TRY')
    .then(res => res.json())
    .then(data => {
      _cache = { rates: data.rates, fetchedAt: Date.now() };
      _pending = null;
      return data.rates;
    })
    .catch(err => {
      _pending = null;
      throw err;
    });
  return _pending;
}

export function useExchangeRates() {
  const [rates, setRates] = useState(() => {
    // Cache geçerliyse anında dön (re-render olmadan)
    if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
      return _cache.rates;
    }
    return null;
  });
  const [loading, setLoading] = useState(!rates);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cache hâlâ geçerliyse fetch atma
    if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
      setRates(_cache.rates);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchRates()
      .then(r => { if (!cancelled) { setRates(r); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e); setLoading(false); } });

    return () => { cancelled = true; };
  }, []);

  /**
   * Fiyatı TRY'den hedef dövize çevirir.
   * @param {number} tryAmount — TL cinsinden tutar
   * @param {'EUR'|'USD'|'GBP'} currency
   * @returns {string} — biçimlendirilmiş değer veya '—'
   */
  const convert = (tryAmount, currency) => {
    if (!rates || !tryAmount) return '—';
    const converted = tryAmount * rates[currency];
    return converted.toFixed(2);
  };

  return { rates, loading, error, convert };
}

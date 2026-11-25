import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchQuotes, fetchHistory } from '../api.js';
import { MAX_SAVED, DEFAULT_CONFIG } from '../catalog.js';
import { getSaved, setSaved, getConfig } from '../store.js';

const hasChrome = typeof chrome !== 'undefined' && chrome.storage;

/** Ativos salvos, sincronizados com o storage (e com o que o fundo altera). */
export function useSaved() {
  const [saved, setState] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    getSaved().then((v) => {
      if (alive) {
        setState(v);
        setReady(true);
      }
    });
    if (!hasChrome) return () => { alive = false; };
    const onChange = (changes, area) => {
      if (area === 'sync' && changes.saved) setState(changes.saved.newValue || []);
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => {
      alive = false;
      chrome.storage.onChanged.removeListener(onChange);
    };
  }, []);

  /** Devolve 'added', 'removed' ou 'limit'. */
  const toggle = useCallback(
    (id) => {
      if (saved.includes(id)) {
        const next = saved.filter((x) => x !== id);
        setState(next);
        setSaved(next);
        return 'removed';
      }
      if (saved.length >= MAX_SAVED) return 'limit';
      const next = saved.concat([id]);
      setState(next);
      setSaved(next);
      return 'added';
    },
    [saved]
  );

  return { saved, ready, toggle };
}

export function useConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  useEffect(() => {
    getConfig().then(setConfig);
  }, []);
  return config;
}

/** Cotações dos ids, atualizadas a cada 30 s enquanto o painel está aberto. */
export function useQuotes(ids) {
  const key = ids.join(',');
  const [state, setState] = useState({ quotes: {}, errors: [], loaded: false });

  useEffect(() => {
    if (!ids.length) {
      setState((s) => ({ ...s, loaded: true }));
      return undefined;
    }
    let alive = true;
    const load = async () => {
      const r = await fetchQuotes(ids);
      if (alive) setState((s) => ({ quotes: { ...s.quotes, ...r.quotes }, errors: r.errors, loaded: true }));
    };
    load();
    const timer = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}

const historyCache = new Map();
const TTL = 60000;

/** Histórico para o gráfico, com cache de 1 min. */
export function useHistory(asset, range) {
  const [state, setState] = useState({ series: null, loading: true, error: null });
  const cacheKey = `${asset.id}|${range}`;

  useEffect(() => {
    let alive = true;
    const hit = historyCache.get(cacheKey);
    let promise;
    if (hit && Date.now() - hit.at < TTL) {
      promise = hit.promise;
    } else {
      promise = fetchHistory(asset, range);
      historyCache.set(cacheKey, { at: Date.now(), promise });
      promise.catch(() => historyCache.delete(cacheKey));
    }
    setState((s) => ({ series: s.series, loading: true, error: null }));
    promise.then(
      (series) => alive && setState({ series, loading: false, error: null }),
      (e) => alive && setState({ series: null, loading: false, error: String(e?.message || e) })
    );
    return () => {
      alive = false;
    };
  }, [cacheKey]);

  return state;
}

/** Valor anterior de uma variável, para saber se o preço subiu ou caiu. */
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

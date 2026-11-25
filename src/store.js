// Armazenamento. Na extensão usa chrome.storage; fora dela (testes e prévia no navegador) usa localStorage.
import { DEFAULT_CONFIG, MAX_SAVED } from './catalog.js';

const hasChrome = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync;

const area = (name) => (hasChrome ? chrome.storage[name] : null);

async function read(areaName, key, fallback) {
  const a = area(areaName);
  if (a) {
    const r = await a.get(key);
    return r[key] ?? fallback;
  }
  try {
    const raw = localStorage.getItem(`${areaName}:${key}`);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function write(areaName, key, value) {
  const a = area(areaName);
  if (a) return a.set({ [key]: value });
  try {
    localStorage.setItem(`${areaName}:${key}`, JSON.stringify(value));
  } catch {
    /* sem armazenamento: segue sem salvar */
  }
}

// Ativos salvos e configurações ficam no sync (acompanham o usuário entre computadores).
export async function getSaved() {
  const v = await read('sync', 'saved', []);
  return Array.isArray(v) ? v.slice(0, MAX_SAVED) : [];
}
export const setSaved = (ids) => write('sync', 'saved', ids.slice(0, MAX_SAVED));

export async function getConfig() {
  return { ...DEFAULT_CONFIG, ...(await read('sync', 'config', {})) };
}
export const setConfig = (c) => write('sync', 'config', c);

// Histórico curto de cotações e último aviso ficam só neste computador.
export const getSamples = () => read('local', 'samples', {});
export const setSamples = (s) => write('local', 'samples', s);
export const getLastAlert = () => read('local', 'lastAlert', {});
export const setLastAlert = (s) => write('local', 'lastAlert', s);

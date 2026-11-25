// Service worker (Manifest V3). Não guarda estado em variáveis: tudo vai para o storage,
// porque o Chrome encerra o service worker quando ele fica parado.
import { BY_ID, thresholdFor } from './catalog.js';
import { fetchQuotes } from './api.js';
import { pushSample, evaluate, alertText } from './alerts.js';
import { getSaved, getConfig, getSamples, setSamples, getLastAlert, setLastAlert } from './store.js';

const ALARM = 'poll';

async function ensureAlarm() {
  const existing = await chrome.alarms.get(ALARM);
  if (!existing) chrome.alarms.create(ALARM, { delayInMinutes: 0.1, periodInMinutes: 1 });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  ensureAlarm();
});
chrome.runtime.onStartup.addListener(ensureAlarm);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM) poll();
});

// Ao mudar a lista de ativos salvos, já coleta uma amostra.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.saved) poll();
});

async function poll() {
  const [saved, config] = await Promise.all([getSaved(), getConfig()]);
  if (!saved.length) return;

  const { quotes } = await fetchQuotes(saved);
  const [allSamples, lastAlerts] = await Promise.all([getSamples(), getLastAlert()]);
  const nowSec = Math.round(Date.now() / 1000);
  const next = {};

  for (const id of saved) {
    const q = quotes[id];
    let samples = allSamples[id] || [];
    if (q) samples = pushSample(samples, q.ts, q.price);
    next[id] = samples;

    if (!config.alertsEnabled || !q) continue;
    const asset = BY_ID[id];
    const move = evaluate(
      { samples, lastAlert: lastAlerts[id] || 0 },
      {
        threshold: thresholdFor(asset, config),
        windowSec: config.windowMin * 60,
        cooldownSec: config.cooldownMin * 60
      },
      nowSec
    );
    if (move) {
      lastAlerts[id] = nowSec;
      notify(asset, move);
    }
  }

  // Só mantém amostras dos ativos que ainda estão salvos.
  await Promise.all([setSamples(next), setLastAlert(lastAlerts)]);
}

function notify(asset, move) {
  const { title, message } = alertText(asset, move);
  chrome.notifications.create(`alert-${asset.id}-${Date.now()}`, {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message,
    priority: 2
  });
}

chrome.notifications.onClicked.addListener(async (notificationId) => {
  chrome.notifications.clear(notificationId);
  const id = notificationId.split('-')[1];
  await chrome.storage.session.set({ openAsset: id });
  try {
    const win = await chrome.windows.getLastFocused();
    await chrome.sidePanel.open({ windowId: win.id });
  } catch {
    /* o Chrome só abre o painel após um gesto do usuário; o ativo fica guardado para a próxima abertura */
  }
});

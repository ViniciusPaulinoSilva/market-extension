// Tira as capturas da loja (1280x800) com o Chrome sem interface, em tempo real.
// Uso: iniciar `npm run dev` (porta 5173) e rodar `node tools/shots/take.mjs`.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const OUT = new URL('../../store/screenshots/', import.meta.url);
const SCREENS = ['home', 'moedas', 'cripto', 'detail', 'indices', 'config'];
mkdirSync(OUT, { recursive: true });

const prof = path.join(os.tmpdir(), 'shotprof-cdp');
rmSync(prof, { recursive: true, force: true });
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${prof}`,
  `--remote-debugging-port=${PORT}`, '--window-size=1280,800', 'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  try {
    target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page');
  } catch { /* ainda subindo */ }
  if (!target) await sleep(300);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const pend = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) pend.get(m.id)(m);
};
const send = (method, params = {}) => new Promise((r) => { const id = ++n; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
for (const s of SCREENS) {
  await send('Page.navigate', { url: `http://localhost:5173/tools/shots/shot.html?s=${s}` });
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    const r = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
    if (r.result?.result?.value === 'pronto') break;
  }
  await sleep(1500);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(new URL(`${s}.png`, OUT), Buffer.from(shot.result.data, 'base64'));
  console.log('ok', s);
}
ws.close();
chrome.kill();

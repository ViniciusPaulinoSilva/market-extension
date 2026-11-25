// Gera o tile pequeno (440x280) e o marquee (1400x560) da loja. Precisa do `npm run dev` ligado.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9334;
const OUT = new URL('../../store/promo/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const JOBS = [
  { k: 'tile', w: 440, h: 280, file: 'tile-440x280.png' },
  { k: 'marquee', w: 1400, h: 560, file: 'marquee-1400x560.png' }
];

const prof = path.join(os.tmpdir(), 'shotprof-promo');
rmSync(prof, { recursive: true, force: true });
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${prof}`, `--remote-debugging-port=${PORT}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* subindo */ }
  if (!target) await sleep(300);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) pend.get(m.id)(m); };
const send = (method, params = {}) => new Promise((r) => { const id = ++n; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });

await send('Page.enable');
for (const j of JOBS) {
  await send('Emulation.setDeviceMetricsOverride', { width: j.w, height: j.h, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `http://localhost:5173/tools/shots/promo.html?k=${j.k}` });
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    const r = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
    if (r.result?.result?.value === 'pronto') break;
  }
  await sleep(800);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(new URL(j.file, OUT), Buffer.from(shot.result.data, 'base64'));
  console.log('ok', j.file);
}
ws.close();
chrome.kill();

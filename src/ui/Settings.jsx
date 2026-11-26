import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DEFAULT_CONFIG } from '../catalog.js';
import { getConfig, setConfig } from '../store.js';
import { APP_NAME, UPDATED, SOURCES, HOW, DISCLAIMERS, PRIVACY } from './legal.js';
import { L } from '../i18n.js';

const hasChrome = typeof chrome !== 'undefined' && chrome.storage;
const VERSION = typeof chrome !== 'undefined' && chrome.runtime?.getManifest ? chrome.runtime.getManifest().version : '0.1.0';

function useConfig() {
  const [config, setState] = useState(DEFAULT_CONFIG);
  useEffect(() => {
    let alive = true;
    getConfig().then((c) => alive && setState(c));
    if (!hasChrome) return () => { alive = false; };
    const onChange = (changes, area) => {
      if (area === 'sync' && changes.config) setState({ ...DEFAULT_CONFIG, ...changes.config.newValue });
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => {
      alive = false;
      chrome.storage.onChanged.removeListener(onChange);
    };
  }, []);
  const update = (patch) => {
    const next = { ...config, ...patch };
    setState(next);
    setConfig(next);
  };
  return [config, update];
}

function Choice({ label, hint, value, options, format, onChange, disabled }) {
  return (
    <div className={`set-item col ${disabled ? 'off' : ''}`}>
      <div className="set-label">
        <b>{label}</b>
        {hint && <span>{hint}</span>}
      </div>
      <div className="seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            disabled={disabled}
            className={value === o ? 'on' : ''}
            onClick={() => onChange(o)}
          >
            {format(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="set-sec">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function Settings() {
  const [config, update] = useConfig();
  const off = !config.alertsEnabled;
  const min = (n) => `${n} min`;
  const pct = (n) => `${n}%`;

  return (
    <>
      <div className="head">
        <div className="grow">
          <h1>{L('Settings', 'Config')}</h1>
          <div className="sub">{L('Alerts, sources and privacy', 'Alertas, fontes e privacidade')}</div>
        </div>
      </div>
      <div className="scroll set-body">
        <Section title={L('Alerts', 'Alertas')}>
          <div className="set-item">
            <div className="set-label">
              <b>{L('Alert me on fast moves', 'Avisar sobre movimento rápido')}</b>
              <span>{L('Chrome notification when a saved asset moves fast.', 'Notificação do Chrome quando um ativo salvo se move rápido.')}</span>
            </div>
            <motion.button
              type="button"
              role="switch"
              aria-checked={config.alertsEnabled}
              aria-label={L('Turn alerts on or off', 'Ligar ou desligar os alertas')}
              className={`switch ${config.alertsEnabled ? 'on' : ''}`}
              onClick={() => update({ alertsEnabled: !config.alertsEnabled })}
              whileTap={{ scale: 0.94 }}
            >
              <motion.i layout transition={{ type: 'spring', stiffness: 600, damping: 34 }} />
            </motion.button>
          </div>
          <Choice label={L('Minimum move: currencies and indices', 'Variação mínima: moedas e índices')} hint={L('How much the price must move to alert.', 'Quanto o preço precisa mexer para avisar.')} value={config.otherPct} options={[1, 2, 3, 5]} format={pct} disabled={off} onChange={(v) => update({ otherPct: v })} />
          <Choice label={L('Minimum move: crypto', 'Variação mínima: cripto')} hint={L('Crypto swings more, so the limit is higher.', 'Cripto oscila mais, por isso o limite é maior.')} value={config.cryptoPct} options={[2, 3, 5, 8, 10]} format={pct} disabled={off} onChange={(v) => update({ cryptoPct: v })} />
          <Choice label={L('Time window', 'Janela de análise')} hint={L('How fast the move has to happen.', 'Em quanto tempo a variação precisa acontecer.')} value={config.windowMin} options={[2, 5, 10, 15, 30]} format={min} disabled={off} onChange={(v) => update({ windowMin: v })} />
          <Choice label={L('Time between alerts', 'Intervalo entre avisos')} hint={L('Minimum time between two alerts for the same asset.', 'Tempo mínimo entre dois avisos do mesmo ativo.')} value={config.cooldownMin} options={[5, 10, 15, 30, 60]} format={min} disabled={off} onChange={(v) => update({ cooldownMin: v })} />
        </Section>

        <Section title={L('How it works', 'Como funciona')}>
          <ol className="how">
            {HOW.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </Section>

        <Section title={L('Where prices come from', 'De onde vêm os preços')}>
          {SOURCES.map((s) => (
            <div key={s.name} className="src">
              <b>{s.name}</b>
              <span>{s.what}</span>
              <code>{s.host}</code>
            </div>
          ))}
        </Section>

        <Section title={L('Important notices', 'Avisos importantes')}>
          <ul className="legal">
            {DISCLAIMERS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Section>

        <Section title={L('Privacy policy', 'Política de privacidade')}>
          <p className="upd">{L('Updated', 'Atualizada em')} {UPDATED}</p>
          {PRIVACY.map((s) => (
            <details key={s.h} className="fold">
              <summary>{s.h}</summary>
              <div className="fold-body">
                {s.p.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </details>
          ))}
        </Section>

        <p className="about">
          {APP_NAME} · {L('version', 'versão')} {VERSION}
        </p>
      </div>
    </>
  );
}

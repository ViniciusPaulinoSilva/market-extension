import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import AssetRow from './AssetRow.jsx';
import Detail from './Detail.jsx';
import { useSaved, useQuotes } from './hooks.js';
import { ASSETS, BY_ID, MAX_SAVED, assetsOf } from '../catalog.js';

const TABS = [
  { key: 'home', label: 'Home', icon: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> },
  {
    key: 'moedas',
    label: 'Moedas',
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.6" />
      </>
    )
  },
  {
    key: 'cripto',
    label: 'Cripto',
    icon: (
      <>
        <path d="M12 3 20 7.5v9L12 21 4 16.5v-9z" />
        <circle cx="12" cy="12" r="2.4" />
      </>
    )
  },
  {
    key: 'indices',
    label: 'Índices',
    icon: (
      <>
        <path d="M3 17 9 11l4 4 8-9" />
        <path d="M15 6h6v6" />
      </>
    )
  }
];

const TITLES = { home: 'Meus ativos', moedas: 'Moedas', cripto: 'Cripto', indices: 'Índices' };
const PLACEHOLDERS = { moedas: 'Buscar moeda ou par', cripto: 'Buscar cripto', indices: 'Buscar índice' };

function useToast() {
  const [msg, setMsg] = useState('');
  const timer = useRef();
  const show = useCallback((text) => {
    setMsg(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 2600);
  }, []);
  return [msg, show];
}

function EmptyHome({ onAdd }) {
  return (
    <motion.div className="empty" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <motion.div
        className="ring"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#8c99ad" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z" />
        </svg>
      </motion.div>
      <h2>Nenhum ativo salvo no momento</h2>
      <p>Adicione o primeiro para acompanhar aqui. Você pode salvar até {MAX_SAVED} entre moedas, cripto e índices.</p>
      <motion.button type="button" className="btn-primary" whileTap={{ scale: 0.96 }} onClick={onAdd}>
        Adicionar o primeiro ativo
      </motion.button>
    </motion.div>
  );
}

function ListScreen({ tab, saved, toggle, onOpen, onAdd, showToast }) {
  const [query, setQuery] = useState('');
  const isHome = tab === 'home';

  const list = useMemo(() => {
    if (isHome) return saved.map((id) => BY_ID[id]).filter(Boolean);
    const q = query.toLowerCase().trim();
    return assetsOf(tab).filter((a) => !q || `${a.name} ${a.ticker}`.toLowerCase().includes(q));
  }, [isHome, saved, tab, query]);

  const ids = isHome ? saved : assetsOf(tab).map((a) => a.id);
  const { quotes, errors, loaded } = useQuotes(ids);

  const onToggle = (id) => {
    const r = toggle(id);
    if (r === 'limit') showToast(`Limite de ${MAX_SAVED} ativos. Remova um para adicionar outro.`);
  };

  const subtitle = isHome
    ? `${saved.length} de ${MAX_SAVED} ativos · variação em 24h`
    : `${list.length} ${list.length === 1 ? 'ativo' : 'ativos'} · variação em 24h`;

  return (
    <>
      <div className="head">
        <div className="grow">
          <h1>{TITLES[tab]}</h1>
          <div className="sub">{subtitle}</div>
        </div>
        {isHome && typeof chrome !== 'undefined' && chrome.runtime?.sendMessage && (
          <motion.button
            type="button"
            className="btn-add"
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              chrome.runtime.sendMessage({ type: 'test-alert' }).then(
                (r) =>
                  showToast(
                    r?.ok
                      ? `Alertas de teste enviados (${r.count}). Permissão: ${r.level}.`
                      : `Falhou: ${(r?.errors || []).join('; ') || 'sem resposta'} (permissão: ${r?.level ?? '?'})`
                  ),
                (e) => showToast(`Falhou ao falar com o fundo: ${e?.message || e}`)
              );
            }}
          >
            Testar alertas
          </motion.button>
        )}
        {isHome && (
          <motion.button type="button" className="btn-add" whileTap={{ scale: 0.94 }} onClick={onAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7ab2ff" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Adicionar
          </motion.button>
        )}
      </div>
      {!isHome && (
        <label className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a3afc2" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={PLACEHOLDERS[tab]} aria-label="Buscar ativo" />
        </label>
      )}
      {errors.length > 0 && <div className="error">Não foi possível atualizar todas as cotações. Mostrando o que foi carregado.</div>}
      <div className="scroll">
        {isHome && saved.length === 0 && <EmptyHome onAdd={onAdd} />}
        {!isHome && list.length === 0 && <div className="note">Nenhum resultado para “{query}”.</div>}
        <AnimatePresence initial>
          {list.map((a, i) => (
            <AssetRow
              key={a.id}
              index={i}
              asset={a}
              quote={quotes[a.id]}
              starred={saved.includes(a.id)}
              onOpen={onOpen}
              onToggle={onToggle}
            />
          ))}
        </AnimatePresence>
        {isHome && saved.length > 0 && !loaded && <div className="note">Carregando cotações…</div>}
        <div style={{ height: 16 }} />
      </div>
    </>
  );
}

function DetailScreen({ id, saved, toggle, onBack, showToast }) {
  const asset = BY_ID[id];
  const { quotes } = useQuotes([id]);
  const onToggle = (aid) => {
    if (toggle(aid) === 'limit') showToast(`Limite de ${MAX_SAVED} ativos. Remova um para adicionar outro.`);
  };
  return <Detail asset={asset} quote={quotes[id]} starred={saved.includes(id)} onBack={onBack} onToggle={onToggle} />;
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [detail, setDetail] = useState(null);
  const { saved, ready, toggle } = useSaved();
  const [toast, showToast] = useToast();

  // Ao clicar numa notificação, o fundo guarda qual ativo abrir.
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.session) return;
    chrome.storage.session.get('openAsset').then((r) => {
      if (r.openAsset && BY_ID[r.openAsset]) setDetail(r.openAsset);
      chrome.storage.session.remove('openAsset');
    });
  }, []);

  const goTab = (key) => {
    setTab(key);
    setDetail(null);
  };

  const screenKey = detail ? `detail-${detail}` : `tab-${tab}`;

  return (
    <div className="app">
      <div className="screen">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screenKey}
            className="screen"
            initial={detail ? { opacity: 0, x: 28 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: detail ? 0 : 0, y: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            {ready &&
              (detail ? (
                <DetailScreen id={detail} saved={saved} toggle={toggle} onBack={() => setDetail(null)} showToast={showToast} />
              ) : (
                <ListScreen tab={tab} saved={saved} toggle={toggle} onOpen={setDetail} onAdd={() => goTab('moedas')} showToast={showToast} />
              ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="nav" aria-label="Navegação principal">
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button key={t.key} type="button" className="nav-btn" aria-current={on ? 'page' : undefined} onClick={() => goTab(t.key)}>
              {on && <motion.span layoutId="nav-ind" className="nav-ind" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {t.icon}
              </svg>
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

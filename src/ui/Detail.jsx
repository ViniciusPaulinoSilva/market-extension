import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import Icon from './Icon.jsx';
import Chart from './Chart.jsx';
import { StarIcon, Price } from './AssetRow.jsx';
import { useHistory, useConfig } from './hooks.js';
import { CATEGORIES, thresholdFor } from '../catalog.js';
import { money, pctText, fmt } from '../format.js';

const RANGES = [
  ['24h', '24h', 'nas últimas 24 horas'],
  ['7d', '7 dias', 'nos últimos 7 dias'],
  ['30d', '30 dias', 'nos últimos 30 dias']
];

const item = (i) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.05 + i * 0.05, duration: 0.3 }
});

export default function Detail({ asset, quote, starred, onBack, onToggle }) {
  const [range, setRange] = useState('24h');
  const config = useConfig();
  const hist = useHistory(asset, range);
  const day = useHistory(asset, '24h');

  const series = useMemo(() => {
    if (!hist.series || hist.series.length < 2) return null;
    // O último ponto do gráfico é a cotação atual.
    const s = hist.series.slice();
    if (quote) s[s.length - 1] = { t: Math.max(s[s.length - 1].t, quote.ts), p: quote.price };
    return s;
  }, [hist.series, quote]);

  const first = series ? series[0].p : null;
  const last = quote?.price ?? (series ? series[series.length - 1].p : null);
  const frac = first && last ? last / first - 1 : null;
  const up = (frac ?? 0) >= 0;
  const diff = first && last ? last - first : null;

  const dayPs = day.series ? day.series.map((x) => x.p) : [];
  const hi = quote?.hi ?? (dayPs.length ? Math.max(...dayPs) : null);
  const lo = quote?.lo ?? (dayPs.length ? Math.min(...dayPs) : null);
  const open = quote?.open ?? (dayPs.length ? dayPs[0] : null);
  const perPs = series ? series.map((x) => x.p) : [];
  const periodLabel = RANGES.find((r) => r[0] === range)[2];
  const thresholdPct = thresholdFor(asset, config) * 100;

  const stats = [
    ['Máxima do dia', money(asset, hi), ''],
    ['Mínima do dia', money(asset, lo), ''],
    ['Abertura', money(asset, open), ''],
    ['Fechamento anterior', money(asset, quote?.prev), ''],
    ['Máxima no período', perPs.length ? money(asset, Math.max(...perPs)) : '—', 'up'],
    ['Mínima no período', perPs.length ? money(asset, Math.min(...perPs)) : '—', 'down']
  ];
  const info = [
    ['Fonte dos dados', asset.src],
    ['Mercado', asset.market],
    ['Alerta', `±${fmt(thresholdPct, 0)}% em ${config.windowMin} min`]
  ];

  return (
    <>
      <div className="dhead">
        <motion.button type="button" className="iconbtn" aria-label="Voltar" onClick={onBack} whileTap={{ scale: 0.85 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2f5f9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5 8 12l7 7" />
          </svg>
        </motion.button>
        <Icon asset={asset} size={40} />
        <div className="t">
          <b>{asset.name}</b>
          <span>
            {asset.ticker} · {CATEGORIES[asset.cat]}
          </span>
        </div>
        <motion.button
          type="button"
          className="iconbtn"
          whileTap={{ scale: 0.8 }}
          aria-label={starred ? `Remover ${asset.name} dos salvos` : `Salvar ${asset.name}`}
          aria-pressed={starred}
          onClick={() => onToggle(asset.id)}
        >
          <StarIcon on={starred} size={24} />
        </motion.button>
      </div>

      <div className="scroll dbody">
        <motion.div {...item(0)} className="price">
          {quote ? <Price asset={asset} value={quote.price} /> : <b>—</b>}
          {asset.unit && <span>{asset.unit}</span>}
        </motion.div>
        <motion.div {...item(1)} className={`dchg ${frac == null ? '' : up ? 'up' : 'down'}`}>
          {frac != null && <i className="tri" />}
          {pctText(frac)}
          {diff != null && <span>({(diff >= 0 ? '+' : '−') + (asset.pre || '') + fmt(Math.abs(diff), asset.dec)})</span>}
          <span className="per">{periodLabel}</span>
        </motion.div>

        <motion.div {...item(2)} className="pills" role="group" aria-label="Período do gráfico">
          {RANGES.map(([k, label]) => (
            <button key={k} type="button" className="pill" aria-pressed={range === k} onClick={() => setRange(k)}>
              {range === k && <motion.span layoutId="pill-bg" className="pill-bg" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
              <span className="pill-label">{label}</span>
            </button>
          ))}
        </motion.div>

        <motion.div {...item(3)} className="chart">
          {series ? (
            <Chart
              series={series}
              up={up}
              range={range}
              formatPrice={(v) => money(asset, v)}
              drawKey={`${asset.id}-${range}-${series.length}`}
              label={`Gráfico de ${asset.name} ${periodLabel}, ${pctText(frac)}`}
            />
          ) : (
            <div className="loading">{hist.loading ? 'Carregando gráfico…' : hist.error ? 'Não foi possível carregar o gráfico.' : 'Sem dados para este período.'}</div>
          )}
        </motion.div>

        <div className="stats">
          {stats.map(([l, v, tone], i) => (
            <motion.div key={l} {...item(4 + i * 0.5)} className="stat">
              <div className="l">{l}</div>
              <div className={`v ${tone}`}>{v}</div>
            </motion.div>
          ))}
        </div>

        <motion.div {...item(8)} className="info">
          {info.map(([l, v]) => (
            <div key={l}>
              <span className="l">{l}</span>
              <span className="v">{v}</span>
            </div>
          ))}
        </motion.div>

        {asset.proxy && (
          <motion.div {...item(9)} className="proxy">
            Este valor vem de um contrato negociado 24 horas que acompanha o índice. Ele indica a variação, mas <strong>não é o valor oficial</strong> do índice.
          </motion.div>
        )}
      </div>
    </>
  );
}

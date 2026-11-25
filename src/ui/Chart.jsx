import React, { useId, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { makeTicks, pointLabel, isDaily, nearestIndex } from '../ticks.js';
import { pctText } from '../format.js';

const W = 340;
const H = 170;

const GREEN = '#34d399';
const RED = '#ff6b6b';

const AGO = { '24h': 'Há 24h', '7d': 'Há 7 dias', '30d': 'Há 30 dias' };

export function buildPaths(series) {
  const n = series.length;
  const ps = series.map((s) => s.p);
  const mn = Math.min(...ps);
  const mx = Math.max(...ps);
  const span = mx - mn || mx * 0.001 || 1;
  const tMin = series[0].t;
  const tSpan = series[n - 1].t - tMin || 1;
  const pts = series.map((s) => [((s.t - tMin) / tSpan) * W, 10 + (1 - (s.p - mn) / span) * 140]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return { line, area: `${line} L${W} 160 L0 160 Z`, pts, last: pts[n - 1] };
}

/**
 * Gráfico com linha animada, marcações de data no eixo e leitura do valor ao passar o mouse
 * (ou tocar e arrastar). A cor segue a variação do período: verde = alta, vermelho = queda.
 */
export default function Chart({ series, up, range, label, drawKey, formatPrice }) {
  const id = useId();
  const wrap = useRef(null);
  const [hover, setHover] = useState(null);
  const color = up ? GREEN : RED;
  const { line, area, pts, last } = useMemo(() => buildPaths(series), [series]);
  const ticks = useMemo(() => makeTicks(range, series[0].t, series[series.length - 1].t), [range, series]);
  const daily = useMemo(() => isDaily(series), [series]);

  const onMove = (e) => {
    const r = wrap.current.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(nearestIndex(series, f));
  };

  const h = hover != null ? series[hover] : null;
  const hp = hover != null ? pts[hover] : null;
  const tipLeft = hp ? Math.min(82, Math.max(18, (hp[0] / W) * 100)) : 0;
  const sinceStart = h ? h.p / series[0].p - 1 : 0;

  return (
    <div>
      <div
        ref={wrap}
        className="chart-wrap"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        onPointerCancel={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
          <defs>
            <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.32" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[10, 85, 160].map((y) => (
            <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#1e2634" strokeDasharray="3 4" />
          ))}
          {ticks.map((t) => (
            <line key={t.t} x1={t.x * W} y1="160" x2={t.x * W} y2="165" stroke="#586377" />
          ))}
          <motion.path
            key={`a-${drawKey}`}
            d={area}
            fill={`url(#g${id})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          />
          <motion.path
            key={`l-${drawKey}`}
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {hp ? (
            <g pointerEvents="none">
              <line x1={hp[0]} y1="10" x2={hp[0]} y2="160" stroke="#a3afc2" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={hp[0]} cy={hp[1]} r="5" fill={color} stroke="#0f141d" strokeWidth="2" />
            </g>
          ) : (
            <motion.circle
              key={`c-${drawKey}`}
              cx={last[0]}
              cy={last[1]}
              r="4.5"
              fill={color}
              stroke="#0f141d"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.75, type: 'spring', stiffness: 400, damping: 14 }}
              style={{ transformOrigin: `${last[0]}px ${last[1]}px` }}
            />
          )}
        </svg>
        {h && (
          <div className="tip" style={{ left: `${tipLeft}%` }} role="status">
            <b>{formatPrice(h.p)}</b>
            <span className={sinceStart >= 0 ? 'up' : 'down'}>{pctText(sinceStart)}</span>
            <small>{pointLabel(h.t, daily)}</small>
          </div>
        )}
      </div>
      <div className="axis2" aria-hidden="true">
        <span style={{ left: 0, transform: 'none' }}>{AGO[range]}</span>
        {ticks.map((t) => (
          <span key={t.t} style={{ left: `${t.x * 100}%` }}>
            {t.label}
          </span>
        ))}
        <span style={{ right: 0, left: 'auto', transform: 'none' }}>Agora</span>
      </div>
    </div>
  );
}

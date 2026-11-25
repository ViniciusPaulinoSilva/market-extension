import React from 'react';
import { motion } from 'motion/react';
import Icon from './Icon.jsx';
import { money, pctText } from '../format.js';
import { usePrevious } from './hooks.js';

export function StarIcon({ on, size = 22 }) {
  return (
    <motion.svg
      key={String(on)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      initial={{ scale: on ? 0.55 : 1 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 12 }}
    >
      <path
        d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z"
        fill={on ? '#f5c451' : 'none'}
        stroke={on ? '#f5c451' : '#8c99ad'}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

/** Preço que pisca em verde ou vermelho quando muda. */
export function Price({ asset, value, className, as: Tag = 'b' }) {
  const prev = usePrevious(value);
  const flash = prev != null && value != null && prev !== value ? (value > prev ? '#34d399' : '#ff6b6b') : null;
  const M = motion[Tag];
  return (
    <M
      key={flash ? value : 'static'}
      className={className}
      initial={flash ? { color: flash } : false}
      animate={{ color: '#f2f5f9' }}
      transition={{ duration: 1.1 }}
    >
      {money(asset, value)}
    </M>
  );
}

export function changeClass(f) {
  if (f == null || !Number.isFinite(f)) return 'flat';
  return f >= 0 ? 'up' : 'down';
}

export default function AssetRow({ asset, quote, starred, onOpen, onToggle, index }) {
  const cls = changeClass(quote?.change24h);
  return (
    <motion.div
      layout="position"
      className="row"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.25 }}
    >
      <button type="button" className="row-main" onClick={() => onOpen(asset.id)}>
        <Icon asset={asset} size={44} />
        <span className="row-name">
          <b>{asset.name}</b>
          <span>
            {asset.ticker}
            {asset.proxy && <i className="tag">Contrato 24h</i>}
          </span>
        </span>
        <span className="row-val">
          {quote ? <Price asset={asset} value={quote.price} /> : <b className="skel">carregando</b>}
          <span className={`chg ${cls}`}>
            {cls !== 'flat' && <i className="tri" />}
            {quote ? pctText(quote.change24h) : ''}
          </span>
        </span>
      </button>
      <motion.button
        type="button"
        className="star"
        whileTap={{ scale: 0.8 }}
        aria-label={starred ? `Remover ${asset.name} dos salvos` : `Salvar ${asset.name}`}
        aria-pressed={starred}
        onClick={() => onToggle(asset.id)}
      >
        <StarIcon on={starred} />
      </motion.button>
    </motion.div>
  );
}

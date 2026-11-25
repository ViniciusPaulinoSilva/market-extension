import React from 'react';

// Os símbolos (bandeiras e moedas) ficam em sidepanel/index.html, num sprite SVG.
function Disc({ href, size, style }) {
  return (
    <div className="disc" style={{ width: size, height: size, ...style }}>
      <svg className="fill" viewBox="0 0 24 24" aria-hidden="true">
        <use href={href} width="24" height="24" />
      </svg>
    </div>
  );
}

export default function Icon({ asset, size = 44 }) {
  if (asset.kind === 'pair') {
    const big = Math.round(size * 0.7);
    return (
      <div className="ico" style={{ width: size, height: size }}>
        <Disc href={`#f-${asset.a}`} size={big} style={{ left: 0, top: 0 }} />
        <Disc href={`#f-${asset.b}`} size={big} style={{ right: 0, bottom: 0 }} />
      </div>
    );
  }
  if (asset.kind === 'crypto') {
    return (
      <div className="ico" style={{ width: size, height: size }}>
        <Disc href={`#c-${asset.a}`} size={size} style={{ boxShadow: 'none' }} />
      </div>
    );
  }
  const flag = Math.round(size * 0.42);
  return (
    <div className="ico" style={{ width: size, height: size }}>
      <div
        className="sq"
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          background: asset.tint,
          fontSize: Math.max(9, Math.round(size * 0.27))
        }}
      >
        {asset.code}
      </div>
      <div className="corner" style={{ width: flag, height: flag }}>
        <svg className="fill" viewBox="0 0 24 24" aria-hidden="true">
          <use href={`#f-${asset.a}`} width="24" height="24" />
        </svg>
      </div>
    </div>
  );
}

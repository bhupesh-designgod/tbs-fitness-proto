// ── TBS Logo (official mark) ──
export default function TbsLogo({ width = 240, className = '', style }) {
  return (
    <img
      src="/assets/brand/tbs-logo.png"
      alt="TBS — Train by Biki Singh"
      width={width}
      className={className}
      style={{ display: 'block', ...style }}
    />
  );
}

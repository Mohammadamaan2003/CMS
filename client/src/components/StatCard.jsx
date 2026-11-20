import React from 'react';
import CountUpNumber from './CountUpNumber';

export default function StatCard({ label, value, subtext, icon, color = 'blue' }) {
  const colorClass = {
    blue: 'stat-icon-blue',
    green: 'stat-icon-green',
    purple: 'stat-icon-purple',
    amber: 'stat-icon-amber',
  }[color] || 'stat-icon-blue';

  const isDark =
    typeof document !== 'undefined'
      ? (document.documentElement.getAttribute('data-theme') !== 'light')
      : true;

  const numericValue = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  const isNumeric = !isNaN(numericValue) && typeof value !== 'object';

  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">
          {isDark && isNumeric ? (
            <CountUpNumber endValue={numericValue} duration={300} />
          ) : (
            value
          )}
        </div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
      <div className={`stat-icon-wrapper ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
}


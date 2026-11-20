import React from 'react';
import { IconClose } from './Icons';

/**
 * ApexActiveFilterBanner
 * Renders the active column/row filter indicator chip matching Oracle APEX interactive report design:
 * Filter: [ Column = "Value" (x) ]                   Clear Filter
 */
export default function ApexActiveFilterBanner({ filter, columns = [], onClear, onRemoveFilter }) {
  if (!filter) return null;

  const filtersList = Array.isArray(filter)
    ? filter.filter(Boolean)
    : (filter.filters && Array.isArray(filter.filters))
      ? filter.filters.filter(Boolean)
      : [filter];

  const activeFilters = filtersList.filter((f) => {
    if (!f) return false;
    if (f.type === 'row' || f.expression) {
      return Boolean(String(f.expression || f.value || '').trim());
    }
    const op = (f.operator || '=').toLowerCase();
    if (op === 'is null' || op === 'is not null') return Boolean(f.column || f.key);
    return Boolean((f.column || f.key) && f.value !== undefined && f.value !== null && String(f.value).trim() !== '');
  });

  if (activeFilters.length === 0) return null;

  const renderFilterLabel = (f) => {
    if (f.type === 'row' || (f.expression && !f.column && !f.key)) {
      return `Row: "${f.expression || f.value}"`;
    }

    const colKey = f.column || f.key;
    const colObj = columns.find((c) => (c.key || c.id) === colKey);
    const colLabel = colObj?.label || colObj?.title || colObj?.name || colKey;
    const op = (f.operator || '=').toLowerCase().trim();

    if (op === 'is null') return `${colLabel} is null`;
    if (op === 'is not null') return `${colLabel} is not null`;
    if (op === 'contains') return `${colLabel} contains "${f.value}"`;
    if (op === 'starts with') return `${colLabel} starts with "${f.value}"`;
    if (op === 'ends with') return `${colLabel} ends with "${f.value}"`;
    return `${colLabel} ${f.operator || '='} "${f.value}"`;
  };

  return (
    <div
      className="apex-active-filter-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        marginBottom: '0.65rem',
        fontSize: '0.8rem',
      }}
    >
      <span style={{ fontWeight: 600, color: '#475569' }}>Filter:</span>
      {activeFilters.map((f, idx) => (
        <div
          key={f.id || f.key || f.column || idx}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            borderRadius: '4px',
            padding: '2px 8px',
            fontWeight: 500,
            fontSize: '0.785rem',
          }}
        >
          <span>{renderFilterLabel(f)}</span>
          <button
            type="button"
            onClick={() => {
              if (onRemoveFilter) onRemoveFilter(f, idx);
              else onClear();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
            title="Remove filter"
            aria-label="Remove filter"
          >
            <IconClose size={12} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onClear}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ef4444',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.75rem',
          marginLeft: 'auto',
          textDecoration: 'underline',
        }}
      >
        Clear Filter
      </button>
    </div>
  );
}

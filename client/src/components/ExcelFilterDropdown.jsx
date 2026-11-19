import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IconSearch, IconChevronDown, IconX, IconCheck } from './Icons';

/**
 * ExcelFilterDropdown
 *
 * Implements Microsoft Excel / Oracle APEX Interactive Grid style column filtering:
 * - Search input at the top to filter available options in real time.
 * - "(Select All)" checkbox (or "Select All Search Results" when searching).
 * - "(Blanks)" checkbox to match rows with NULL, empty, or missing data.
 * - Multi-select checkboxes for distinct values.
 * - One-click Clear and Apply actions.
 * - Inline clear (x) button on the trigger field.
 */
export default function ExcelFilterDropdown({
  label = '',
  options = [],
  value = [],
<<<<<<< HEAD
  selected = [],
=======
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
  onChange,
  placeholder = '-',
  allowBlank = true,
  disabled = false,
  className = '',
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  
<<<<<<< HEAD
  // Normalize value prop to array of strings (supports value or selected alias)
  const currentSelected = useMemo(() => {
    const activeVal = (value !== undefined && (!Array.isArray(value) || value.length > 0)) ? value : (selected || []);
    if (!activeVal) return [];
    if (Array.isArray(activeVal)) return activeVal.map(String);
    if (typeof activeVal === 'string' && activeVal.trim() !== '' && activeVal.trim() !== '-') return [activeVal];
    return [];
  }, [value, selected]);
=======
  // Normalize value prop to array of strings
  const currentSelected = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string' && value.trim() !== '' && value.trim() !== '-') return [value];
    return [];
  }, [value]);
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83

  const [staged, setStaged] = useState(currentSelected);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

<<<<<<< HEAD
  // Sync staged selection when prop changes
=======
  // Sync staged selection when prop changes or opens
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
  useEffect(() => {
    setStaged(currentSelected);
  }, [currentSelected]);

<<<<<<< HEAD
  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
=======
  useEffect(() => {
    if (isOpen) {
      setStaged(currentSelected);
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
      setSearchText('');
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 50);
    }
<<<<<<< HEAD
  }, [isOpen]);
=======
  }, [isOpen, currentSelected]);
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
<<<<<<< HEAD
=======
        // Commit staged on outside click
        onChange(staged);
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
<<<<<<< HEAD
  }, [isOpen]);
=======
  }, [isOpen, staged, onChange]);
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83

  // Clean options: unique strings sorted
  const cleanOptions = useMemo(() => {
    const set = new Set();
    options.forEach((opt) => {
      if (opt !== undefined && opt !== null) {
        const s = String(opt).trim();
        if (s !== '' && s !== '-' && s.toLowerCase() !== 'all' && s.toLowerCase() !== '(select all)' && s.toLowerCase() !== '(blanks)') {
          set.add(s);
        }
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [options]);

  // Filtered options based on search input
  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return cleanOptions;
    const q = searchText.trim().toLowerCase();
    return cleanOptions.filter((opt) => opt.toLowerCase().includes(q));
  }, [cleanOptions, searchText]);

  const isBlankSelected = staged.includes('(Blanks)') || staged.includes('__BLANK__');

  // Check if all filtered options are checked
  const areAllFilteredSelected = useMemo(() => {
    if (filteredOptions.length === 0) return false;
    return filteredOptions.every((opt) => staged.includes(opt));
  }, [filteredOptions, staged]);

  const isIndeterminate = useMemo(() => {
    if (filteredOptions.length === 0) return false;
    const someSelected = filteredOptions.some((opt) => staged.includes(opt));
    return someSelected && !areAllFilteredSelected;
  }, [filteredOptions, staged, areAllFilteredSelected]);

  // Toggle (Select All)
  const handleToggleSelectAll = () => {
<<<<<<< HEAD
    let next;
    if (areAllFilteredSelected) {
      // Unselect all filtered items
      next = staged.filter((item) => !filteredOptions.includes(item));
    } else {
      // Select all filtered items
      const nextSet = new Set(staged);
      filteredOptions.forEach((opt) => nextSet.add(opt));
      next = Array.from(nextSet);
    }
    setStaged(next);
    if (onChange) onChange(next);
=======
    if (areAllFilteredSelected) {
      // Unselect all filtered items
      setStaged((prev) => prev.filter((item) => !filteredOptions.includes(item)));
    } else {
      // Select all filtered items
      setStaged((prev) => {
        const nextSet = new Set(prev);
        filteredOptions.forEach((opt) => nextSet.add(opt));
        return Array.from(nextSet);
      });
    }
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
  };

  // Toggle (Blanks)
  const handleToggleBlanks = () => {
<<<<<<< HEAD
    let next;
    if (isBlankSelected) {
      next = staged.filter((v) => v !== '(Blanks)' && v !== '__BLANK__');
    } else {
      next = [...staged, '(Blanks)'];
    }
    setStaged(next);
    if (onChange) onChange(next);
=======
    setStaged((prev) => {
      if (isBlankSelected) {
        return prev.filter((v) => v !== '(Blanks)' && v !== '__BLANK__');
      } else {
        return [...prev, '(Blanks)'];
      }
    });
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
  };

  // Toggle single option
  const handleToggleOption = (opt) => {
<<<<<<< HEAD
    let next;
    if (staged.includes(opt)) {
      next = staged.filter((v) => v !== opt);
    } else {
      next = [...staged, opt];
    }
    setStaged(next);
    if (onChange) onChange(next);
  };

  // Commit Apply (close flyout)
  const handleApply = () => {
    if (onChange) onChange(staged);
=======
    setStaged((prev) => {
      if (prev.includes(opt)) {
        return prev.filter((v) => v !== opt);
      } else {
        return [...prev, opt];
      }
    });
  };

  // Commit Apply
  const handleApply = () => {
    onChange(staged);
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
    setIsOpen(false);
  };

  // Clear all
  const handleClear = (e) => {
    if (e) e.stopPropagation();
    setStaged([]);
<<<<<<< HEAD
    if (onChange) onChange([]);
=======
    onChange([]);
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
  };

  // Summary label for trigger
  const triggerLabel = useMemo(() => {
    if (currentSelected.length === 0) return placeholder;
    if (currentSelected.length === 1 && currentSelected[0] === '(Blanks)') {
      return '(Blanks)';
    }
    const nonBlanks = currentSelected.filter((v) => v !== '(Blanks)' && v !== '__BLANK__');
    const hasB = isBlankSelected;

    let parts = [];
    if (hasB) parts.push('(Blanks)');
    parts.push(...nonBlanks);

    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]}, ${parts[1]}`;
    return `${parts.length} selected`;
  }, [currentSelected, placeholder, isBlankSelected]);

  const hasActiveValue = currentSelected.length > 0;

  return (
    <div
      ref={dropdownRef}
      className={`excel-filter-dropdown-container ${className}`}
      style={{ position: 'relative', width: '100%', userSelect: 'none', ...style }}
    >
      {/* TRIGGER INPUT */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        style={{
          width: '100%',
          height: '34px',
<<<<<<< HEAD
          backgroundColor: disabled ? 'var(--bg-muted, #f8fafc)' : 'var(--bg-input, #ffffff)',
          border: isOpen ? '1px solid var(--primary-accent, #0284c7)' : (hasActiveValue ? '1px solid var(--primary-accent, #0284c7)' : '1px solid var(--border, #cbd5e1)'),
=======
          backgroundColor: disabled ? '#f8fafc' : '#ffffff',
          border: isOpen ? '1px solid #0284c7' : (hasActiveValue ? '1px solid #0284c7' : '1px solid #cbd5e1'),
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
          borderRadius: '4px',
          padding: '0 8px 0 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '12px',
<<<<<<< HEAD
          color: hasActiveValue ? 'var(--text-main, #0f172a)' : 'var(--text-muted, #94a3b8)',
=======
          color: hasActiveValue ? '#0f172a' : '#94a3b8',
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
          fontWeight: hasActiveValue ? 600 : 400,
          boxShadow: isOpen ? '0 0 0 2px rgba(2, 132, 199, 0.15)' : 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
        title={hasActiveValue ? currentSelected.join(', ') : 'Click to filter'}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: '6px',
            fontStyle: hasActiveValue && currentSelected[0] === '(Blanks)' && currentSelected.length === 1 ? 'italic' : 'normal',
          }}
        >
          {triggerLabel}
        </span>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {hasActiveValue && (
            <span
              onClick={handleClear}
              title="Clear this filter"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
<<<<<<< HEAD
                backgroundColor: 'var(--bg-muted, #e2e8f0)',
                color: 'var(--text-muted, #475569)',
                cursor: 'pointer',
                transition: 'background-color 0.1s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--border, #cbd5e1)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted, #e2e8f0)')}
=======
                backgroundColor: '#e2e8f0',
                color: '#475569',
                cursor: 'pointer',
                transition: 'background-color 0.1s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#cbd5e1')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
            >
              <IconX size={10} />
            </span>
          )}
          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
            <IconChevronDown size={13} />
          </span>
        </div>
      </div>

      {/* FLYOUT EXCEL FILTER MENU */}
      {isOpen && (
        <div
          className="excel-filter-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: '240px',
            maxWidth: '340px',
            width: 'max-content',
            backgroundColor: 'var(--bg-dropdown, var(--bg-surface, #ffffff))',
            border: '1px solid var(--border, #cbd5e1)',
            borderRadius: '6px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease',
            color: 'var(--text-main, #1e293b)',
          }}
        >
          {/* 1. SEARCH INPUT WITH ICON */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border, #f1f5f9)', backgroundColor: 'var(--bg-dropdown, #f8fafc)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '8px',
                  color: 'var(--text-muted, #94a3b8)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconSearch size={13} />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: '100%',
                  height: '30px',
                  paddingLeft: '28px',
                  paddingRight: searchText ? '24px' : '8px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border, #cbd5e1)',
                  backgroundColor: 'var(--bg-input, #ffffff)',
                  color: 'var(--text-main, #1e293b)',
                  outline: 'none',
                }}
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText('')}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <IconX size={12} />
                </button>
              )}
            </div>
          </div>

          {/* 2. SELECT ALL & BLANKS ACTION BAR */}
          <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--border, #e2e8f0)', backgroundColor: 'var(--bg-dropdown, #ffffff)' }}>
            {/* (Select All) */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-main, #1e293b)',
                cursor: 'pointer',
                padding: '3px 4px',
                borderRadius: '3px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted, #f1f5f9)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <input
                type="checkbox"
                checked={areAllFilteredSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={handleToggleSelectAll}
                style={{ cursor: 'pointer', width: '14px', height: '14px' }}
              />
              <span>{searchText ? '(Select All Search Results)' : '(Select All)'}</span>
            </label>

            {/* (Blanks) */}
            {allowBlank && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: isBlankSelected ? 'var(--primary-accent, #38bdf8)' : 'var(--text-muted, #94a3b8)',
                  fontWeight: isBlankSelected ? 600 : 400,
                  cursor: 'pointer',
                  padding: '3px 4px',
                  borderRadius: '3px',
                  marginTop: '2px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted, #f1f5f9)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <input
                  type="checkbox"
                  checked={isBlankSelected}
                  onChange={handleToggleBlanks}
                  style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                />
                <span style={{ fontStyle: 'italic' }}>(Blanks)</span>
              </label>
            )}
          </div>

          {/* 3. SCROLLABLE OPTIONS LIST */}
          <div
            style={{
              maxHeight: '190px',
              overflowY: 'auto',
              padding: '4px 6px',
              backgroundColor: 'var(--bg-dropdown, #ffffff)',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px 10px', fontSize: '12px', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic', textAlign: 'center' }}>
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = staged.includes(opt);
                return (
                  <label
                    key={opt}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: isSelected ? 'var(--primary-accent, #38bdf8)' : 'var(--text-main, #334155)',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '3px',
                      backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-muted, #f8fafc)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleOption(opt)}
                      style={{ cursor: 'pointer', width: '14px', height: '14px', flexShrink: 0 }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {opt}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* 4. FOOTER STATUS AND ACTIONS */}
          <div
            style={{
              padding: '8px 10px',
<<<<<<< HEAD
              borderTop: '1px solid var(--border, #e2e8f0)',
              backgroundColor: 'var(--bg-muted, #f8fafc)',
=======
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setStaged([]);
<<<<<<< HEAD
                if (onChange) onChange([]);
=======
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
<<<<<<< HEAD
                color: 'var(--text-muted, #64748b)',
=======
                color: '#64748b',
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '3px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
<<<<<<< HEAD
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted, #64748b)')}
=======
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
            >
              Clear
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
<<<<<<< HEAD
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
=======
              <span style={{ fontSize: '11px', color: '#64748b' }}>
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
                {staged.length} selected
              </span>
              <button
                type="button"
                onClick={handleApply}
                style={{
<<<<<<< HEAD
                  backgroundColor: 'var(--primary-blue, #2563eb)',
=======
                  backgroundColor: '#0b1a3d',
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

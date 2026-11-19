/**
 * filterHelper.js
 * Universal multi-select, select-all, blanks, and search filtering helper
 * for PostgreSQL queries and in-memory stores.
 */

function normalizeFilterValue(val) {
  if (val === undefined || val === null) return [];
  if (Array.isArray(val)) {
    return val
      .map((s) => (s !== null && s !== undefined ? String(s).trim() : ''))
      .filter((s) => s !== '');
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.includes(',') && !trimmed.startsWith('(')) {
      return trimmed
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');
    }
    return [trimmed];
  }
  return [String(val).trim()];
}

function isBlankKeyword(s) {
  if (!s) return false;
  const l = String(s).trim().toLowerCase();
  return l === '(blanks)' || l === '(blank)' || l === 'blanks' || l === 'blank' || l === '__blank__';
}

function isSelectAllKeyword(s) {
  if (!s) return false;
  const l = String(s).trim().toLowerCase();
  return l === '(select all)' || l === 'select all' || l === 'all';
}

/**
 * Builds PostgreSQL WHERE condition for a single column with multi-select and blanks support.
 * @param {string} columnExpr SQL expression for the column (e.g. "c.technology" or "c.country")
 * @param {any} val Filter value (array, comma-separated string, or scalar)
 * @param {Array} params Query parameter array (mutated by pushing new parameters)
 * @returns {string|null} SQL clause or null if no filtering needed
 */
function buildMultiFilter(columnExpr, val, params) {
  const arr = normalizeFilterValue(val);
  if (arr.length === 0) return null;

  const hasSelectAll = arr.some(isSelectAllKeyword);
  if (hasSelectAll && arr.length === 1) return null;

  const hasBlank = arr.some(isBlankKeyword);
  const nonBlankValues = arr.filter((v) => !isBlankKeyword(v) && !isSelectAllKeyword(v));

  const blankCondition = `(${columnExpr} IS NULL OR TRIM(CAST(${columnExpr} AS TEXT)) = '' OR TRIM(CAST(${columnExpr} AS TEXT)) = '-' OR LOWER(TRIM(CAST(${columnExpr} AS TEXT))) = 'undefined' OR LOWER(TRIM(CAST(${columnExpr} AS TEXT))) = 'null')`;

  if (hasBlank && nonBlankValues.length === 0) {
    return blankCondition;
  }

  if (!hasBlank && nonBlankValues.length > 0) {
    params.push(nonBlankValues.map((v) => v.toLowerCase()));
    return `LOWER(TRIM(COALESCE(CAST(${columnExpr} AS TEXT), ''))) = ANY($${params.length})`;
  }

  if (hasBlank && nonBlankValues.length > 0) {
    params.push(nonBlankValues.map((v) => v.toLowerCase()));
    return `(LOWER(TRIM(COALESCE(CAST(${columnExpr} AS TEXT), ''))) = ANY($${params.length}) OR ${blankCondition})`;
  }

  return null;
}

/**
 * Dual column filter (e.g. comp_name OR name)
 */
function buildMultiFilterDual(expr1, expr2, val, params) {
  const arr = normalizeFilterValue(val);
  if (arr.length === 0) return null;

  const hasSelectAll = arr.some(isSelectAllKeyword);
  if (hasSelectAll && arr.length === 1) return null;

  const hasBlank = arr.some(isBlankKeyword);
  const nonBlankValues = arr.filter((v) => !isBlankKeyword(v) && !isSelectAllKeyword(v));

  const blankCondition = `(
    (${expr1} IS NULL OR TRIM(CAST(${expr1} AS TEXT)) = '' OR TRIM(CAST(${expr1} AS TEXT)) = '-') AND
    (${expr2} IS NULL OR TRIM(CAST(${expr2} AS TEXT)) = '' OR TRIM(CAST(${expr2} AS TEXT)) = '-')
  )`;

  if (hasBlank && nonBlankValues.length === 0) {
    return blankCondition;
  }

  if (!hasBlank && nonBlankValues.length > 0) {
    params.push(nonBlankValues.map((v) => v.toLowerCase()));
    const pIdx = params.length;
    return `(LOWER(TRIM(COALESCE(CAST(${expr1} AS TEXT), ''))) = ANY($${pIdx}) OR LOWER(TRIM(COALESCE(CAST(${expr2} AS TEXT), ''))) = ANY($${pIdx}))`;
  }

  if (hasBlank && nonBlankValues.length > 0) {
    params.push(nonBlankValues.map((v) => v.toLowerCase()));
    const pIdx = params.length;
    return `(
      LOWER(TRIM(COALESCE(CAST(${expr1} AS TEXT), ''))) = ANY($${pIdx}) OR
      LOWER(TRIM(COALESCE(CAST(${expr2} AS TEXT), ''))) = ANY($${pIdx}) OR
      ${blankCondition}
    )`;
  }

  return null;
}

/**
 * In-memory filter matcher for localStore.js and client filtering
 */
function matchesMultiFilter(rowValue, filterVal) {
  const arr = normalizeFilterValue(filterVal);
  if (arr.length === 0) return true;

  const hasSelectAll = arr.some(isSelectAllKeyword);
  if (hasSelectAll && arr.length === 1) return true;

  const hasBlank = arr.some(isBlankKeyword);
  const nonBlankValues = arr
    .filter((v) => !isBlankKeyword(v) && !isSelectAllKeyword(v))
    .map((v) => v.toLowerCase());

  const isRowBlank =
    rowValue === null ||
    rowValue === undefined ||
    String(rowValue).trim() === '' ||
    String(rowValue).trim() === '-' ||
    String(rowValue).trim().toLowerCase() === 'undefined' ||
    String(rowValue).trim().toLowerCase() === 'null';

  if (isRowBlank) {
    return hasBlank;
  }

  const rowStr = String(rowValue).trim().toLowerCase();
  const matchNonBlank = nonBlankValues.some((v) => rowStr === v || rowStr.includes(v));

  if (hasBlank) {
    return matchNonBlank || isRowBlank;
  }

  return matchNonBlank;
}

module.exports = {
  normalizeFilterValue,
  isBlankKeyword,
  isSelectAllKeyword,
  buildMultiFilter,
  buildMultiFilterDual,
  matchesMultiFilter,
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../api/client';
import ApexInteractiveReport from '../../components/ApexInteractiveReport';
import ValidationRulesModal from '../../components/ValidationRulesModal';
import { IconGitMerge, IconBuilding, IconX } from '../../components/Icons';

export default function DuplicateCompanyReportPage({ onNavigate, onShowToast }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [viewingCompany, setViewingCompany] = useState(null);
  const [showValidationRules, setShowValidationRules] = useState(false);

  // Filter state matching Oracle APEX aligned report design
  const initialFilterState = {
    company_name: '',
    website: '',
    country: '',
    duplicate_type: '',
  };
  const [filters, setFilters] = useState(initialFilterState);
  const [appliedFilters, setAppliedFilters] = useState(initialFilterState);
  const [filterOptions, setFilterOptions] = useState({
    companyNames: [],
    duplicateTypes: ['WEBSITE', 'COMPANY NAME'],
  });

  // Load distinct filter options on mount
  useEffect(() => {
    let isMounted = true;
    api.getDuplicateCompanyFilters?.()
      .then((res) => {
        if (isMounted && res && res.success && res.data) {
          setFilterOptions({
            companyNames: res.data.companyNames || [],
            duplicateTypes: res.data.duplicateTypes || ['WEBSITE', 'COMPANY NAME'],
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to load duplicate company filter options:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const loadReport = useCallback(async (curPage, curLimit, curSearch, curFilters) => {
    setIsLoading(true);
    const activeFilters = curFilters !== undefined ? curFilters : appliedFilters;
    try {
      const res = await api.getDuplicateCompanyReport({
        page: curPage,
        limit: curLimit,
        search: curSearch || '',
        company_name: activeFilters.company_name || '',
        website: activeFilters.website || '',
        country: activeFilters.country || '',
        duplicate_type: activeFilters.duplicate_type || '',
      });
      if (res && res.success) {
        setData(res.data || []);
        setTotal(res.total || 0);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Failed to load duplicate company report:', err);
      onShowToast?.(`Failed to load duplicate company report: ${err.message}`, 'error');
      setData([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, onShowToast]);

  useEffect(() => {
    loadReport(page, pageSize, search, appliedFilters);
  }, [page, pageSize, loadReport, appliedFilters]);

  const handleApplyFilter = () => {
    setAppliedFilters(filters);
    setPage(1);
    loadReport(1, pageSize, search, filters);
    onShowToast?.('Filters applied', 'info');
  };

  const handleClearFilter = () => {
    setFilters(initialFilterState);
    setAppliedFilters(initialFilterState);
    setPage(1);
    loadReport(1, pageSize, search, initialFilterState);
    onShowToast?.('Filters cleared', 'info');
  };

  const handleSelectAll = async () => {
    try {
      setIsLoading(true);
      const res = await api.getDuplicateCompanyReport({
        page: 1,
        limit: 100000,
        search: search || '',
        company_name: appliedFilters.company_name || '',
        website: appliedFilters.website || '',
        country: appliedFilters.country || '',
        duplicate_type: appliedFilters.duplicate_type || '',
      });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const allKeys = res.data.map((r, idx) => String(r.id || r.company_id || idx));
        setSelectedRowKeys(allKeys);
        onShowToast?.(`Selected all ${allKeys.length} records throughout report.`, 'info');
      } else {
        setSelectedRowKeys(data.map((r, idx) => String(r.id || r.company_id || idx)));
      }
    } catch (e) {
      setSelectedRowKeys(data.map((r, idx) => String(r.id || r.company_id || idx)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeselectAll = () => {
    setSelectedRowKeys([]);
    onShowToast?.('Deselected all records.', 'info');
  };

  const handleDownloadCsv = async () => {
    try {
      setIsLoading(true);
      const res = await api.getDuplicateCompanyReport({
        page: 1,
        limit: 100000,
        search: search || '',
        company_name: appliedFilters.company_name || '',
        website: appliedFilters.website || '',
        country: appliedFilters.country || '',
        duplicate_type: appliedFilters.duplicate_type || '',
      });
      const rowsToExport = res && res.success && Array.isArray(res.data) && res.data.length > 0 ? res.data : data;
      if (!rowsToExport || rowsToExport.length === 0) {
        onShowToast?.('No records to download.', 'warning');
        return;
      }
      const exportCols = [
        { label: 'Company Name', key: 'company_name' },
        { label: 'Website', key: 'website' },
        { label: 'Country', key: 'country' },
        { label: 'City', key: 'city' },
        { label: 'Industry', key: 'industry' },
        { label: 'Duplicate Type', key: 'duplicate_type' },
      ];
      const headers = exportCols.map((c) => `"${c.label}"`).join(',');
      const csvRows = rowsToExport.map((row) =>
        exportCols.map((c) => `"${String(row[c.key] || row[c.key === 'company_name' ? 'comp_name' : c.key] || '').replace(/"/g, '""')}"`).join(',')
      );
      const csvContent = [headers, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `duplicate_company_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast?.(`Exported ${rowsToExport.length} records to CSV.`, 'success');
    } catch (err) {
      console.error('Download failed:', err);
      onShowToast?.(`Download failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(() => [
    {
      key: 'company_id',
      label: 'Company ID',
      width: '120px',
      sortable: true,
      getValue: (r) => r.company_id,
      render: (r) => (
        <span className="apex-table-id-cell" style={{ fontWeight: 700 }}>
          {r.company_id}
        </span>
      ),
    },
    {
      key: 'company_name',
      label: 'Company Name',
      minWidth: '200px',
      sortable: true,
      getValue: (r) => r.company_name || '',
      render: (r) => (
        <span style={{ fontWeight: 600, color: '#0284c7' }}>
          {r.company_name}
        </span>
      ),
    },
    {
      key: 'industry',
      label: 'Industry',
      minWidth: '160px',
      sortable: true,
      getValue: (r) => r.industry || '—',
    },
    {
      key: 'website',
      label: 'Website',
      minWidth: '180px',
      sortable: true,
      getValue: (r) => r.website || '—',
      render: (r) => (
        r.website && r.website !== '—' ? (
          <a
            href={r.website.startsWith('http') ? r.website : `https://${r.website}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#0284c7', textDecoration: 'none' }}
          >
            {r.website}
          </a>
        ) : '—'
      ),
    },
    {
      key: 'country',
      label: 'Country',
      width: '120px',
      sortable: true,
      getValue: (r) => r.country || '—',
    },
    {
      key: 'city',
      label: 'City',
      width: '120px',
      sortable: true,
      getValue: (r) => r.city || '—',
    },
    {
      key: 'technology',
      label: 'Technology',
      minWidth: '150px',
      sortable: true,
      getValue: (r) => r.technology || '—',
    },
    {
      key: 'contact_count',
      label: 'Contact Count',
      width: '120px',
      align: 'right',
      sortable: true,
      getValue: (r) => r.contact_count || 0,
      render: (r) => (
        <span style={{ fontWeight: 600 }}>
          {r.contact_count || 0}
        </span>
      ),
    },
    {
      key: 'duplicate_type',
      label: 'Duplicate Reason',
      minWidth: '180px',
      sortable: true,
      getValue: (r) => r.duplicate_type || r.duplicate_reason || '',
      render: (r) => (
        <span className="duplicate-reason-badge">
          {r.duplicate_type || r.duplicate_reason}
        </span>
      ),
    },
    {
      key: 'view_form',
      label: 'View Form',
      width: '110px',
      render: (r) => (
        <button
          type="button"
          onClick={() => setViewingCompany(r)}
          className="btn-apex-view-form"
        >
          View Form
        </button>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      width: '130px',
      render: (r) => (
        <button
          type="button"
          onClick={() => {
            if (onNavigate) {
              onNavigate('merge_companies', { selectedGroupId: r.duplicate_group_id });
            } else {
              window.location.hash = '#/duplicate-merger/companies';
            }
          }}
          className="btn-apex-merge"
        >
          <IconGitMerge size={12} color="#ffffff" />
          <span>Merge</span>
        </button>
      ),
    },
  ], [onNavigate]);

  return (
    <div className="duplicate-company-report-page" style={{ padding: '0 0.5rem 1.5rem 0.5rem' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--apex-border, #e2e8f0)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconBuilding size={20} className="apex-header-icon" />
          <h2 className="apex-page-heading" style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
            Duplicate Company Report
          </h2>
          <span className="apex-badge-count">
            {total} records
          </span>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate('merge_companies');
              else window.location.hash = '#/duplicate-merger/companies';
            }}
            className="btn-duplicate-nav"
          >
            <IconGitMerge size={14} color="#ffffff" />
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Go to Merge Companies</span>
          </button>
        </div>
      </div>

      {/* Aligned Filter Bar matching Oracle APEX Design */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleApplyFilter();
        }}
        className="duplicate-report-filters-card"
      >
        <div className="duplicate-report-filters-row">
          {/* Company Name */}
          <div className="duplicate-report-filter-item">
            <label className="duplicate-report-filter-label" htmlFor="filter-company-name">
              Company Name
            </label>
            <select
              id="filter-company-name"
              className="duplicate-report-filter-control"
              value={filters.company_name}
              onChange={(e) => setFilters((prev) => ({ ...prev, company_name: e.target.value }))}
            >
              <option value="">All Company Names</option>
              {filters.company_name && !filterOptions.companyNames.includes(filters.company_name) && (
                <option value={filters.company_name}>{filters.company_name}</option>
              )}
              {filterOptions.companyNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Website */}
          <div className="duplicate-report-filter-item">
            <label className="duplicate-report-filter-label" htmlFor="filter-company-website">
              Website
            </label>
            <input
              id="filter-company-website"
              type="text"
              className="duplicate-report-filter-control"
              value={filters.website}
              onChange={(e) => setFilters((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="Website"
            />
          </div>

          {/* Country */}
          <div className="duplicate-report-filter-item">
            <label className="duplicate-report-filter-label" htmlFor="filter-company-country">
              Country
            </label>
            <input
              id="filter-company-country"
              type="text"
              className="duplicate-report-filter-control"
              value={filters.country}
              onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value }))}
              placeholder="Country"
            />
          </div>

          {/* Duplicate Type */}
          <div className="duplicate-report-filter-item">
            <label className="duplicate-report-filter-label" htmlFor="filter-company-dup-type">
              Duplicate Type
            </label>
            <select
              id="filter-company-dup-type"
              className="duplicate-report-filter-control"
              value={filters.duplicate_type}
              onChange={(e) => setFilters((prev) => ({ ...prev, duplicate_type: e.target.value }))}
            >
              <option value="">All Duplicate Types</option>
              {filterOptions.duplicateTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons: Apply Filter & Clear Filter */}
          <div className="duplicate-report-btn-group">
            <button
              type="submit"
              className="btn-duplicate-filter-navy"
            >
              Apply Filter
            </button>
            <button
              type="button"
              onClick={handleClearFilter}
              className="btn-duplicate-filter-navy"
            >
              Clear Filter
            </button>
          </div>
        </div>
      </form>

      {/* Interactive Report */}
      <ApexInteractiveReport
        columns={columns}
        data={data}
        rowKey={(r) => String(r.id || r.company_id)}
        total={total}
        page={page}
        onPageChange={(p) => setPage(p)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        search={search}
        onSearchChange={(v) => setSearch(v)}
        onSearchSubmit={() => {
          setPage(1);
          loadReport(1, pageSize, search, appliedFilters);
        }}
        isServerSide={true}
        isLoading={isLoading}
        selectable={true}
        selectedKeys={selectedRowKeys}
        onSelectionChange={setSelectedRowKeys}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onRefresh={() => loadReport(page, pageSize, search, appliedFilters)}
        toolbarRight={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowValidationRules(true)}
              className="btn-duplicate-toolbar-navy"
            >
              Validation Rules
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="btn-duplicate-toolbar-navy"
            >
              Download
            </button>
          </div>
        }
      />

      {/* Validation Rules Modal */}
      <ValidationRulesModal
        isOpen={showValidationRules}
        onClose={() => setShowValidationRules(false)}
        type="company"
      />

      {/* View Form Modal (matching Apex DUPLICATE_COMPANY_REPORT View Form) */}
      {viewingCompany && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="apex-modal-card" style={{
            borderRadius: '8px',
            maxWidth: '600px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
          }}>
            <div className="apex-modal-header" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--apex-border, #e2e8f0)'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                Company Form: {viewingCompany.company_id} {viewingCompany.company_name}
              </h3>
              <button
                type="button"
                onClick={() => setViewingCompany(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <IconX size={18} />
              </button>
            </div>
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Company ID</span>
                <span className="apex-table-id-cell" style={{ fontWeight: 700 }}>{viewingCompany.company_id}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Company Name</span>
                <span style={{ fontWeight: 600 }}>{viewingCompany.company_name || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Industry</span>
                <span>{viewingCompany.industry || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Website</span>
                <span>{viewingCompany.website ? <a href={viewingCompany.website.startsWith('http') ? viewingCompany.website : `https://${viewingCompany.website}`} target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>{viewingCompany.website}</a> : '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Country</span>
                <span>{viewingCompany.country || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>City</span>
                <span>{viewingCompany.city || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Technology</span>
                <span>{viewingCompany.technology || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Contact Count</span>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>{viewingCompany.contact_count ?? 0}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Duplicate Reason</span>
                <span className="duplicate-reason-badge">{viewingCompany.duplicate_reason || '—'}</span>
              </div>
            </div>
            <div className="apex-modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid var(--apex-border, #e2e8f0)', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setViewingCompany(null)}
                className="btn-apex-view-form"
                style={{ padding: '6px 18px', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

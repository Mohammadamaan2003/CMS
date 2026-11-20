import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../api/client';
import ApexInteractiveReport from '../../components/ApexInteractiveReport';
import ValidationRulesModal from '../../components/ValidationRulesModal';
import { IconGitMerge, IconUsers, IconX } from '../../components/Icons';

export default function DuplicateContactReportPage({ onNavigate, onShowToast }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [viewingContact, setViewingContact] = useState(null);
  const [showValidationRules, setShowValidationRules] = useState(false);

  // Filter state matching screenshot
  const initialFilterState = {
    contact_name: '',
    linkedin_url: '',
    email: '',
    duplicate_type: '',
  };
  const [filters, setFilters] = useState(initialFilterState);
  const [appliedFilters, setAppliedFilters] = useState(initialFilterState);
  const [filterOptions, setFilterOptions] = useState({
    contactNames: [],
    duplicateTypes: ['CONTACT NAME + COMPANY', 'EMAIL', 'LINKEDIN URL'],
  });

  // Load distinct filter options on mount
  useEffect(() => {
    let isMounted = true;
    api.getDuplicateContactFilters?.()
      .then((res) => {
        if (isMounted && res && res.success && res.data) {
          setFilterOptions({
            contactNames: res.data.contactNames || [],
            duplicateTypes: res.data.duplicateTypes || ['CONTACT NAME + COMPANY', 'EMAIL', 'LINKEDIN URL'],
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to load duplicate contact filter options:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const loadReport = useCallback(async (curPage, curLimit, curSearch, curFilters) => {
    setIsLoading(true);
    const activeFilters = curFilters !== undefined ? curFilters : appliedFilters;
    try {
      const res = await api.getDuplicateContactReport({
        page: curPage,
        limit: curLimit,
        search: curSearch || '',
        contact_name: activeFilters.contact_name || '',
        linkedin_url: activeFilters.linkedin_url || '',
        email: activeFilters.email || '',
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
      console.error('Failed to load duplicate contact report:', err);
      onShowToast?.(`Failed to load duplicate contact report: ${err.message}`, 'error');
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
      const res = await api.getDuplicateContactReport({
        page: 1,
        limit: 100000,
        search: search || '',
        contact_name: appliedFilters.contact_name || '',
        linkedin_url: appliedFilters.linkedin_url || '',
        email: appliedFilters.email || '',
        duplicate_type: appliedFilters.duplicate_type || '',
      });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const allKeys = res.data.map((r, idx) => String(r.id || r.contact_id || idx));
        setSelectedRowKeys(allKeys);
        onShowToast?.(`Selected all ${allKeys.length} records throughout report.`, 'info');
      } else {
        setSelectedRowKeys(data.map((r, idx) => String(r.id || r.contact_id || idx)));
      }
    } catch (e) {
      setSelectedRowKeys(data.map((r, idx) => String(r.id || r.contact_id || idx)));
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
      const res = await api.getDuplicateContactReport({
        page: 1,
        limit: 100000,
        search: search || '',
        contact_name: appliedFilters.contact_name || '',
        linkedin_url: appliedFilters.linkedin_url || '',
        email: appliedFilters.email || '',
        duplicate_type: appliedFilters.duplicate_type || '',
      });
      const rowsToExport = res && res.success && Array.isArray(res.data) && res.data.length > 0 ? res.data : data;
      if (!rowsToExport || rowsToExport.length === 0) {
        onShowToast?.('No records to download.', 'warning');
        return;
      }
      const exportCols = [
        { label: 'Contact Name', key: 'contact_name' },
        { label: 'Comp Name', key: 'company_name' },
        { label: 'Linkedin Url', key: 'linkedin_url' },
        { label: 'Comp Email', key: 'email' },
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
      link.setAttribute('download', `duplicate_contact_report_${new Date().toISOString().slice(0, 10)}.csv`);
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
      key: 'contact_name',
      label: 'Contact Name',
      minWidth: '180px',
      sortable: true,
      getValue: (r) => r.contact_name || '',
      render: (r) => (
        <span style={{ fontWeight: 600, color: '#0284c7' }}>
          {r.contact_name}
        </span>
      ),
    },
    {
      key: 'company_name',
      label: 'Comp Name',
      minWidth: '180px',
      sortable: true,
      getValue: (r) => r.comp_name || r.company_name || '—',
      render: (r) => <span>{r.comp_name || r.company_name || '—'}</span>,
    },
    {
      key: 'linkedin_url',
      label: 'Linkedin Url',
      minWidth: '160px',
      sortable: true,
      getValue: (r) => r.linkedin_url || '',
      render: (r) => (
        r.linkedin_url && r.linkedin_url !== '—' ? (
          <a
            href={r.linkedin_url.startsWith('http') ? r.linkedin_url : `https://${r.linkedin_url}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#0284c7', textDecoration: 'none' }}
          >
            {r.linkedin_url}
          </a>
        ) : ''
      ),
    },
    {
      key: 'email',
      label: 'Comp Email',
      minWidth: '180px',
      sortable: true,
      getValue: (r) => r.comp_email || r.email || '',
      render: (r) => {
        const mail = r.comp_email || r.email;
        return mail && mail !== '—' ? (
          <a
            href={`mailto:${mail}`}
            style={{ color: '#0284c7', textDecoration: 'none' }}
          >
            {mail}
          </a>
        ) : '';
      },
    },
    {
      key: 'duplicate_type',
      label: 'Duplicate Type',
      minWidth: '220px',
      sortable: true,
      getValue: (r) => r.duplicate_type || r.duplicate_reason || '',
      render: (r) => (
        <span style={{ fontWeight: 600 }}>
          {r.duplicate_type || r.duplicate_reason || ''}
        </span>
      ),
    },
    {
      key: 'contact_id',
      label: 'Contact ID',
      width: '110px',
      sortable: true,
      getValue: (r) => r.contact_id || r.id,
      render: (r) => (
        <span className="apex-table-id-cell" style={{ fontWeight: 700 }}>
          {r.contact_id || r.id}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone / Mobile',
      minWidth: '140px',
      sortable: true,
      getValue: (r) => r.phone || '—',
    },
    {
      key: 'designation',
      label: 'Designation',
      minWidth: '150px',
      sortable: true,
      getValue: (r) => r.designation || '—',
    },
    {
      key: 'pos_type',
      label: 'Position Type',
      minWidth: '140px',
      sortable: true,
      getValue: (r) => r.pos_type || '—',
    },
    {
      key: 'country',
      label: 'Country',
      width: '120px',
      sortable: true,
      getValue: (r) => r.country || '—',
    },
    {
      key: 'view_form',
      label: 'View Form',
      width: '110px',
      render: (r) => (
        <button
          type="button"
          onClick={() => setViewingContact(r)}
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
              onNavigate('merge_contacts', { selectedGroupId: r.duplicate_group_id });
            } else {
              window.location.hash = '#/duplicate-merger/contacts';
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
    <div className="duplicate-contact-report-page" style={{ padding: '0 0.5rem 1.5rem 0.5rem' }}>
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
          <IconUsers size={20} className="apex-header-icon" />
          <h2 className="apex-page-heading" style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
            Duplicate Contact Report
          </h2>
          <span className="apex-badge-count">
            {total} records
          </span>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate('merge_contacts');
              else window.location.hash = '#/duplicate-merger/contacts';
            }}
            className="btn-duplicate-nav"
          >
            <IconGitMerge size={14} color="#ffffff" />
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Go to Merge Contacts</span>
          </button>
        </div>
      </div>

      {/* Interactive Report */}
      {/* Aligned Filters Bar Matching Screenshot */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleApplyFilter();
        }}
        className="duplicate-report-filters-card"
      >
        <div className="duplicate-report-filters-row">
          {/* Contact Name */}
          <div className="duplicate-report-filter-item">
            <label className="duplicate-report-filter-label" htmlFor="filter-contact-name">
              Contact Name
            </label>
            <select
              id="filter-contact-name"
              className="duplicate-report-filter-control"
              value={filters.contact_name}
              onChange={(e) => setFilters((prev) => ({ ...prev, contact_name: e.target.value }))}
            >
              <option value="">All Contact Names</option>
              {filters.contact_name && !filterOptions.contactNames.includes(filters.contact_name) && (
                <option value={filters.contact_name}>{filters.contact_name}</option>
              )}
              {filterOptions.contactNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Linkedin Url */}
          <div className="duplicate-report-filter-item">
            <label className="duplicate-report-filter-label" htmlFor="filter-linkedin-url">
              Linkedin Url
            </label>
            <input
              id="filter-linkedin-url"
              type="text"
              className="duplicate-report-filter-control"
              value={filters.linkedin_url}
              onChange={(e) => setFilters((prev) => ({ ...prev, linkedin_url: e.target.value }))}
              placeholder="LinkedIn URL"
            />
          </div>

          {/* Email */}
          <div className="duplicate-report-filter-item">
            <label className="duplicate-report-filter-label" htmlFor="filter-email">
              Email
            </label>
            <input
              id="filter-email"
              type="text"
              className="duplicate-report-filter-control"
              value={filters.email}
              onChange={(e) => setFilters((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
            />
          </div>

          {/* Duplicate Type */}
          <div className="duplicate-report-filter-item">
            <label className="duplicate-report-filter-label" htmlFor="filter-duplicate-type">
              Duplicate Type
            </label>
            <select
              id="filter-duplicate-type"
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

          {/* Action Buttons: Apply Filter & Clear Filter */}
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
        rowKey={(r) => String(r.id || r.contact_id)}
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
        type="contact"
      />

      {/* View Contact Form Modal */}
      {viewingContact && (
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
                Contact Form: {viewingContact.contact_id} {viewingContact.contact_name}
              </h3>
              <button
                type="button"
                onClick={() => setViewingContact(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <IconX size={18} />
              </button>
            </div>
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Contact ID</span>
                <span className="apex-table-id-cell" style={{ fontWeight: 700 }}>{viewingContact.contact_id}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Contact Name</span>
                <span style={{ fontWeight: 600 }}>{viewingContact.contact_name || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Company Name</span>
                <span>{viewingContact.company_name || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Designation</span>
                <span>{viewingContact.designation || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Email</span>
                <span>{viewingContact.email ? <a href={`mailto:${viewingContact.email}`} style={{ color: '#0284c7' }}>{viewingContact.email}</a> : '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Phone</span>
                <span>{viewingContact.phone || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Country</span>
                <span>{viewingContact.country || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Position Type</span>
                <span>{viewingContact.pos_type || '—'}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', fontWeight: 600 }}>Duplicate Reason</span>
                <span className="duplicate-reason-badge">{viewingContact.duplicate_reason || '—'}</span>
              </div>
            </div>
            <div className="apex-modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid var(--apex-border, #e2e8f0)', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setViewingContact(null)}
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

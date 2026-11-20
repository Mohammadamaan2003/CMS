import React, { useState, useMemo } from 'react';
import {
  IconBullhorn,
  IconMail,
  IconUsers,
  IconSearch,
  IconPlus,
  IconCheckCircle,
  IconDownload,
  IconRefreshCw,
  IconTrendingUp,
} from '../../components/Icons';

export default function CampaignsPage({ onShowToast, initialTab = 'email' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'email' | 'outreach'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Simulated live campaign sequences matching modern CRM standards
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Q4 Enterprise Tech Outreach',
      subject: 'Custom AI & Cloud Architecture Consultation',
      audience: 'Enterprise Technology Directors',
      sent: 2450,
      delivered: 2418,
      opened: 1380,
      clicked: 492,
      status: 'Active',
      createdDate: '2026-11-10',
      lastSent: '2026-11-19 14:30',
    },
    {
      id: 2,
      name: 'Banking & FinTech Executive Brief',
      subject: 'Modernizing Core Banking CRM Integration',
      audience: 'Banking CXOs & VP Technology',
      sent: 1200,
      delivered: 1192,
      opened: 742,
      clicked: 310,
      status: 'Active',
      createdDate: '2026-11-05',
      lastSent: '2026-11-18 10:15',
    },
    {
      id: 3,
      name: 'Global SaaS Growth Partnership',
      subject: 'Accelerate Cloud Revenue with IQRA Technology',
      audience: 'SaaS Founders & Marketing Leads',
      sent: 3800,
      delivered: 3755,
      opened: 1840,
      clicked: 625,
      status: 'Completed',
      createdDate: '2026-10-15',
      lastSent: '2026-10-28 17:00',
    },
    {
      id: 4,
      name: 'Healthcare Provider Digital Migration',
      subject: 'HIPAA-Compliant Healthcare CRM Solutions',
      audience: 'Hospital Operations & IT Heads',
      sent: 850,
      delivered: 842,
      opened: 412,
      clicked: 138,
      status: 'Scheduled',
      createdDate: '2026-11-16',
      lastSent: 'Upcoming: 2026-11-25',
    },
    {
      id: 5,
      name: 'UAE & Middle East Expansion Drive',
      subject: 'Digital Transformation in the GCC Region',
      audience: 'Dubai & Riyadh Corporate Accounts',
      sent: 1600,
      delivered: 1588,
      opened: 920,
      clicked: 388,
      status: 'Active',
      createdDate: '2026-11-12',
      lastSent: '2026-11-19 18:45',
    },
  ]);

  // Outreach targeted lists
  const [outreachLists, setOutreachLists] = useState([
    {
      id: 1,
      name: 'Fortune 500 US Technology Executives',
      segment: 'Technology / Cloud / AI',
      totalContacts: 1420,
      verifiedRate: '98.5%',
      lastSync: '2026-11-19',
      owner: 'Amaan',
    },
    {
      id: 2,
      name: 'UK Financial Services Decision Makers',
      segment: 'FinTech / Asset Management',
      totalContacts: 850,
      verifiedRate: '99.1%',
      lastSync: '2026-11-18',
      owner: 'Heena Naaz',
    },
    {
      id: 3,
      name: 'APAC Enterprise Manufacturers',
      segment: 'Industrial & Manufacturing',
      totalContacts: 2100,
      verifiedRate: '96.8%',
      lastSync: '2026-11-17',
      owner: 'Tariq Mansoor',
    },
    {
      id: 4,
      name: 'GCC Healthcare & Pharma Leadership',
      segment: 'Healthcare & Life Sciences',
      totalContacts: 640,
      verifiedRate: '97.4%',
      lastSync: '2026-11-15',
      owner: 'Rifah Sheikh',
    },
  ]);

  const [showNewModal, setShowNewModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignSubject, setNewCampaignSubject] = useState('');
  const [newCampaignAudience, setNewCampaignAudience] = useState('');

  // Summary Metrics
  const totalSent = useMemo(() => campaigns.reduce((acc, c) => acc + c.sent, 0), [campaigns]);
  const totalDelivered = useMemo(() => campaigns.reduce((acc, c) => acc + c.delivered, 0), [campaigns]);
  const totalOpened = useMemo(() => campaigns.reduce((acc, c) => acc + c.opened, 0), [campaigns]);
  const totalClicked = useMemo(() => campaigns.reduce((acc, c) => acc + c.clicked, 0), [campaigns]);
  const avgOpenRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0';
  const avgClickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0';

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.audience.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || c.status.toUpperCase() === statusFilter.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  const filteredLists = useMemo(() => {
    return outreachLists.filter((l) => {
      return (
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.segment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.owner.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [outreachLists, searchQuery]);

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!newCampaignName.trim()) {
      if (onShowToast) onShowToast('error', 'Campaign name is required');
      return;
    }
    const created = {
      id: Date.now(),
      name: newCampaignName,
      subject: newCampaignSubject || 'Special Announcement from IQRA Technology',
      audience: newCampaignAudience || 'Corporate Target Segment',
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      status: 'Scheduled',
      createdDate: new Date().toISOString().split('T')[0],
      lastSent: 'Pending Send',
    };
    setCampaigns([created, ...campaigns]);
    setShowNewModal(false);
    setNewCampaignName('');
    setNewCampaignSubject('');
    setNewCampaignAudience('');
    if (onShowToast) onShowToast('success', `Campaign "${created.name}" created successfully.`);
  };

  const handleExport = () => {
    const csvContent =
      activeTab === 'email'
        ? 'Name,Subject,Audience,Sent,Delivered,Opened,Clicked,Status\n' +
          campaigns.map((c) => `"${c.name}","${c.subject}","${c.audience}",${c.sent},${c.delivered},${c.opened},${c.clicked},"${c.status}"`).join('\n')
        : 'List Name,Segment,Contacts,Verified,Last Sync,Owner\n' +
          outreachLists.map((l) => `"${l.name}","${l.segment}",${l.totalContacts},"${l.verifiedRate}","${l.lastSync}","${l.owner}"`).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeTab}_campaigns_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('info', 'Campaign export downloaded.');
  };

  return (
    <div className="apex-page-container" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center' }}>
              <IconBullhorn size={22} />
            </span>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
              Campaigns Management
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
            Design, monitor and analyze outbound email campaigns and targeted outreach lists across corporate accounts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-apex-outline"
            onClick={handleExport}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <IconDownload size={14} /> Export CSV
          </button>
          <button
            type="button"
            className="btn-apex-primary"
            onClick={() => setShowNewModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <IconPlus size={14} /> New Campaign
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="stat-card" style={{ padding: '16px 20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>Total Campaigns</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main, #ffffff)', margin: '4px 0' }}>
            {campaigns.length}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconTrendingUp size={12} /> 3 Active running now
          </div>
        </div>

        <div className="stat-card" style={{ padding: '16px 20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>Emails Delivered</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main, #ffffff)', margin: '4px 0' }}>
            {totalDelivered.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #94a3b8)' }}>
            98.8% delivery success rate
          </div>
        </div>

        <div className="stat-card" style={{ padding: '16px 20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>Average Open Rate</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38bdf8', margin: '4px 0' }}>
            {avgOpenRate}%
          </div>
          <div style={{ fontSize: '0.725rem', color: '#34d399' }}>
            +4.2% above industry baseline
          </div>
        </div>

        <div className="stat-card" style={{ padding: '16px 20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>Click-Through Rate</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#a855f7', margin: '4px 0' }}>
            {avgClickRate}%
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #94a3b8)' }}>
            {totalClicked.toLocaleString()} total inquiries generated
          </div>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div
        className="apex-table-card"
        style={{
          borderRadius: '12px',
          border: '1px solid var(--border, #26364f)',
          background: 'var(--bg-card, #111c2e)',
          padding: '16px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
            paddingBottom: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Sub Navigation Pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'email' ? 'var(--btn-primary, #2563eb)' : 'transparent',
                color: activeTab === 'email' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                fontWeight: activeTab === 'email' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <IconMail size={14} /> Email Campaigns ({campaigns.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('outreach')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'outreach' ? 'var(--btn-primary, #2563eb)' : 'transparent',
                color: activeTab === 'outreach' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                fontWeight: activeTab === 'outreach' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <IconUsers size={14} /> Outreach Lists ({outreachLists.length})
            </button>
          </div>

          {/* Search & Status Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-input, #0d1728)',
                border: '1px solid var(--border, #26364f)',
                borderRadius: '6px',
                padding: '4px 10px',
                gap: '6px',
              }}
            >
              <IconSearch size={14} style={{ color: 'var(--text-muted, #64748b)' }} />
              <input
                type="text"
                placeholder={activeTab === 'email' ? 'Search campaigns...' : 'Search lists...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main, #ffffff)',
                  fontSize: '0.825rem',
                  outline: 'none',
                  width: '180px',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  &times;
                </button>
              )}
            </div>

            {activeTab === 'email' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: 'var(--bg-input, #0d1728)',
                  color: 'var(--text-main, #ffffff)',
                  border: '1px solid var(--border, #26364f)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            )}
          </div>
        </div>

        {/* Content Table: Email Campaigns */}
        {activeTab === 'email' ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="apex-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-table-header, #152238)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Campaign Name</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Audience Segment</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Sent</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Delivered</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Open %</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Click %</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((c) => {
                  const openPct = c.delivered > 0 ? ((c.opened / c.delivered) * 100).toFixed(1) : '0';
                  const clickPct = c.opened > 0 ? ((c.clicked / c.opened) * 100).toFixed(1) : '0';
                  const statusBg =
                    c.status === 'Active'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : c.status === 'Scheduled'
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'rgba(148, 163, 184, 0.15)';
                  const statusColor =
                    c.status === 'Active' ? '#22c55e' : c.status === 'Scheduled' ? '#38bdf8' : '#94a3b8';

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: '1px solid var(--border, rgba(255,255,255,0.06))',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover, rgba(255,255,255,0.04))')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main, #ffffff)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #94a3b8)' }}>{c.subject}</div>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary, #cbd5e1)' }}>{c.audience}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{c.sent.toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#34d399' }}>{c.delivered.toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>{openPct}%</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#c084fc' }}>{clickPct}%</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: statusBg,
                            color: statusColor,
                            border: `1px solid ${statusColor}40`,
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem' }}>
                        {c.lastSent}
                      </td>
                    </tr>
                  );
                })}
                {filteredCampaigns.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                      No campaigns found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Content Table: Outreach Lists */
          <div style={{ overflowX: 'auto' }}>
            <table className="apex-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-table-header, #152238)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>List Name</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Industry / Segment</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Total Contacts</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'center' }}>Verified Rate</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>List Owner</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Last Synchronized</th>
                </tr>
              </thead>
              <tbody>
                {filteredLists.map((l) => (
                  <tr
                    key={l.id}
                    style={{
                      borderBottom: '1px solid var(--border, rgba(255,255,255,0.06))',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover, rgba(255,255,255,0.04))')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main, #ffffff)' }}>{l.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary, #cbd5e1)' }}>{l.segment}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                      {l.totalContacts.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#22c55e',
                          border: '1px solid rgba(34, 197, 94, 0.4)',
                        }}
                      >
                        {l.verifiedRate}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-main, #ffffff)' }}>{l.owner}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem' }}>
                      {l.lastSync}
                    </td>
                  </tr>
                ))}
                {filteredLists.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                      No outreach lists found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Campaign Modal */}
      {showNewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px',
          }}
          onClick={() => setShowNewModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-modal, #111c2e)',
              border: '1px solid var(--border, #26364f)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: 'var(--text-main, #ffffff)' }}>
              Create New Campaign
            </h3>
            <form onSubmit={handleCreateCampaign}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px' }}>
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q1 Global Enterprise Outreach"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border, #26364f)',
                    background: 'var(--bg-input, #0d1728)',
                    color: 'var(--text-main, #ffffff)',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px' }}>
                  Email Subject Line
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accelerate Digital Growth with IQRA"
                  value={newCampaignSubject}
                  onChange={(e) => setNewCampaignSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border, #26364f)',
                    background: 'var(--bg-input, #0d1728)',
                    color: 'var(--text-main, #ffffff)',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px' }}>
                  Target Audience / Segment
                </label>
                <input
                  type="text"
                  placeholder="e.g. Middle East & GCC Technology Directors"
                  value={newCampaignAudience}
                  onChange={(e) => setNewCampaignAudience(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border, #26364f)',
                    background: 'var(--bg-input, #0d1728)',
                    color: 'var(--text-main, #ffffff)',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-apex-outline"
                  onClick={() => setShowNewModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-apex-primary"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

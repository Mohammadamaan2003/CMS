import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  IconHome,
  IconSparkles,
  IconUsers,
  IconBuilding,
  IconUploadCloud,
  IconLightbulb,
  IconGitMerge,
  IconBarChart,
  IconUserCheck,
  IconBullhorn,
  IconMail,
  IconFolder,
  IconCalendar,
  IconMessageSquare,
  IconChevronDown,
  IconChevronRight,
  IconGlobe,
  IconBriefcase,
  IconUser,
  IconTable,
  IconMap,
  IconBookOpen,
  IconFactory,
  IconShare2,
  IconMonitor,
  IconTarget,
  IconArrowUpDown,
  IconShield,
  IconCreditCard,
  IconCircle,
  IconOrbitGlobe,
  IconGlassmorphism,
  IconSearch,
  IconMoon,
  IconSun,
} from './Icons';
import './ApexSidebar.css';

// Pin Icon Component
function IconPin({ size = 15, isPinned = true, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isPinned ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ transform: isPinned ? 'rotate(-45deg)' : 'none', transition: 'transform 0.2s ease' }}
    >
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  );
}

// Lumina Gem Logo Icon
function IconLuminaGemMini({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="luminaMiniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <polygon points="12,2 21,7.5 17.5,21.5 6.5,21.5 3,7.5" fill="url(#luminaMiniGrad)" />
      <polygon points="12,2 17.5,7.5 12,13 6.5,7.5" fill="#ffffff" opacity="0.45" />
    </svg>
  );
}

// Complete Master Items list with full, un-truncated labels
const MASTER_ITEMS = [
  { id: 'master_company_size', label: 'Company Size', icon: IconBuilding },
  { id: 'master_company_type', label: 'Company Type', icon: IconGitMerge },
  { id: 'master_country', label: 'Country', icon: IconGlobe },
  { id: 'master_country_city_mapping', label: 'Country & City Mapping', icon: IconMap },
  { id: 'master_designation_position', label: 'Designation & Position', icon: IconBookOpen },
  { id: 'master_industry', label: 'Industry', icon: IconFactory },
  { id: 'master_linkedin_accounts', label: 'LinkedIn Accounts & Countries', icon: IconShare2 },
  { id: 'master_position_type', label: 'Position Type', icon: IconBriefcase },
  { id: 'master_sales_person', label: 'Sales Person', icon: IconUser },
  { id: 'master_source', label: 'Source', icon: IconBookOpen },
  { id: 'master_technology', label: 'Technology', icon: IconMonitor },
  { id: 'master_lead_source', label: 'Lead Source', icon: IconTarget },
  { id: 'master_range_master', label: 'Range Master', icon: IconArrowUpDown },
  { id: 'master_registration_status', label: 'Registration Status', icon: IconShield },
  { id: 'master_company_categories', label: 'Company Categories', icon: IconTable },
  { id: 'master_account_manager', label: 'Account Manager', icon: IconCreditCard },
  { id: 'master_technology_role', label: 'Technology Role', icon: IconCircle },
];

export default function ApexSidebar({
  activeTab,
  onTabChange,
  isCollapsed = false,
  currentUser,
  theme = 'dark',
  onToggleTheme,
  dashboardStats,
}) {
  // Sidebar Pinning state: persisted in localStorage (defaults to true)
  const [isPinned, setIsPinned] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_sidebar_pinned');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true;
  });

  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Group open state
  const [openGroup, setOpenGroup] = useState(null);

  const toggleGroup = (groupName) => {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  };

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('apex_sidebar_pinned', String(next));
      } catch (e) {}
      return next;
    });
  };

  const role = (currentUser?.role || 'admin').toLowerCase();

  // Role Access Rules
  const canViewMasters = role === 'admin' || role === 'sales';
  const canViewUpload = role === 'admin' || role === 'sales';
  const canViewLeads = role === 'admin' || role === 'sales';
  const canViewMerger = role === 'admin' || role === 'sales';
  const canViewCampaigns = role === 'admin' || role === 'sales';
  const canViewUsers = role === 'admin';

  // Effective collapsed state: if not pinned and not hovered, icon-only mode
  const effectiveCollapsed = isCollapsed || (!isPinned && !isHovered);

  // Auto expand group if active item is inside it
  const isMasterActive = activeTab && activeTab.startsWith('master_');
  const isCrmActive = activeTab === 'companies' || activeTab === 'contacts';
  const isUploadActive =
    activeTab === 'upload_companies' ||
    activeTab === 'company_invalid_data' ||
    activeTab === 'upload_contacts' ||
    activeTab === 'contact_incorrect_data';
  const isMergerActive =
    activeTab === 'duplicate_company_report' ||
    activeTab === 'merge_companies' ||
    activeTab === 'duplicate_contact_report' ||
    activeTab === 'merge_contacts';
  const isSuggestedActive =
    activeTab === 'merge_companies_suggested' ||
    activeTab === 'merge_contacts_suggested';
  const isDashboardActive =
    activeTab === 'dashboards' ||
    activeTab === 'crm_analytics' ||
    activeTab === 'sales_performance' ||
    activeTab === 'lead_dashboard' ||
    activeTab === 'company_dashboard' ||
    activeTab === 'glass_dashboard' ||
    activeTab === 'glass' ||
    activeTab === 'lumina' ||
    activeTab === 'lumina_dashboard' ||
    activeTab === 'orbit_dashboard' ||
    activeTab === 'orbit';

  const isCampaignsActive =
    activeTab === 'email_campaigns' ||
    activeTab === 'outreach_lists' ||
    activeTab === 'campaigns';
  const isWorkspaceActive =
    activeTab === 'projects' ||
    activeTab === 'calendar' ||
    activeTab === 'messages';

  const mastersOpen = openGroup === 'masters' || (openGroup === null && isMasterActive);
  const crmOpen = openGroup === 'crm' || (openGroup === null && isCrmActive);
  const uploadOpen = openGroup === 'upload' || (openGroup === null && isUploadActive);
  const mergerOpen = openGroup === 'merger' || (openGroup === null && isMergerActive);
  const mergerSuggestedOpen = openGroup === 'merger_suggested' || (openGroup === null && isSuggestedActive);
  const dashboardsOpen = openGroup === 'dashboards' || (openGroup === null && isDashboardActive);
  const campaignsOpen = openGroup === 'campaigns' || (openGroup === null && isCampaignsActive);
  const workspaceOpen = openGroup === 'workspace' || (openGroup === null && isWorkspaceActive);

  // Search items database for instant jump
  const searchablePages = useMemo(() => {
    const list = [
      { id: 'dashboard', label: 'Home', section: 'Main', icon: IconHome, color: '#60a5fa' },
      { id: 'company_dashboard', label: 'Company Dashboard', section: 'Main', icon: IconBarChart, color: '#c084fc' },
      { id: 'lead_dashboard', label: 'Lead Dashboard', section: 'Main', icon: IconBarChart, color: '#c084fc' },
      { id: 'glass_dashboard', label: 'Glassmorphism Dashboard', section: 'Main', icon: IconGlassmorphism, color: '#ff7a18' },
      { id: 'lumina', label: 'Lumina Glass Dashboard', section: 'Main', icon: IconSparkles, color: '#ec4899' },
      { id: 'orbit_dashboard', label: 'Orbit Planetary Dashboard', section: 'Main', icon: IconOrbitGlobe, color: '#06b6d4' },
      { id: 'companies', label: 'Company Report', section: 'CRM', icon: IconBuilding, color: '#34d399' },
      { id: 'contacts', label: 'Contact Report', section: 'CRM', icon: IconUsers, color: '#34d399' },
      { id: 'leads', label: 'Leads Management', section: 'Data', icon: IconLightbulb, color: '#a855f7' },
      { id: 'email_campaigns', label: 'Email Campaigns', section: 'Campaigns', icon: IconMail, color: '#f43f5e' },
      { id: 'outreach_lists', label: 'Outreach Lists', section: 'Campaigns', icon: IconUsers, color: '#f43f5e' },
      { id: 'projects', label: 'Projects Portfolio', section: 'Workspace', icon: IconFolder, color: '#8b5cf6' },
      { id: 'calendar', label: 'Calendar & Milestones', section: 'Workspace', icon: IconCalendar, color: '#06b6d4' },
      { id: 'messages', label: 'Notifications & Messages', section: 'Workspace', icon: IconMessageSquare, color: '#ec4899' },
      { id: 'duplicate_company_report', label: 'Duplicate Company Report', section: 'Merger', icon: IconGitMerge, color: '#fb923c' },
      { id: 'merge_companies', label: 'Merge Companies', section: 'Merger', icon: IconGitMerge, color: '#fb923c' },
      { id: 'duplicate_contact_report', label: 'Duplicate Contact Report', section: 'Merger', icon: IconGitMerge, color: '#fb923c' },
      { id: 'merge_contacts', label: 'Merge Contacts', section: 'Merger', icon: IconGitMerge, color: '#fb923c' },
      { id: 'merge_companies_suggested', label: 'Merge Companies (Suggested)', section: 'Merger', icon: IconGitMerge, color: '#ec4899' },
      { id: 'merge_contacts_suggested', label: 'Merge Contacts (Suggested)', section: 'Merger', icon: IconGitMerge, color: '#ec4899' },
      { id: 'upload_companies', label: 'Upload Companies', section: 'Upload', icon: IconUploadCloud, color: '#22d3ee' },
      { id: 'company_invalid_data', label: 'Company Invalid Data', section: 'Upload', icon: IconUploadCloud, color: '#22d3ee' },
      { id: 'upload_contacts', label: 'Upload Contacts', section: 'Upload', icon: IconUploadCloud, color: '#22d3ee' },
      { id: 'contact_incorrect_data', label: 'Contact Incorrect Data', section: 'Upload', icon: IconUploadCloud, color: '#22d3ee' },
    ];

    if (canViewUsers) {
      list.push({ id: 'user_management', label: 'Users Management', section: 'Admin', icon: IconUserCheck, color: '#2dd4bf' });
    }

    if (canViewMasters) {
      MASTER_ITEMS.forEach((m) => {
        list.push({ id: m.id, label: m.label, section: 'Masters', icon: m.icon, color: '#fbbf24' });
      });
    }

    return list;
  }, [canViewUsers, canViewMasters]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchablePages.filter(
      (item) => item.label.toLowerCase().includes(q) || item.section.toLowerCase().includes(q)
    );
  }, [searchQuery, searchablePages]);

  // Formatted count badges
  const leadsBadge = dashboardStats?.totalLeads ? dashboardStats.totalLeads.toLocaleString() : '769';
  const companiesBadge = dashboardStats?.totalCompanies
    ? dashboardStats.totalCompanies >= 1000
      ? `${(dashboardStats.totalCompanies / 1000).toFixed(0)}k`
      : dashboardStats.totalCompanies
    : '35k';

  // Get active theme display info for the bottom user card
  const themeInfo = useMemo(() => {
    switch (theme) {
      case 'lumina':
        return { name: 'Lumina', icon: <IconLuminaGemMini size={14} />, color: '#ec4899' };
      case 'orbit':
        return { name: 'Orbit', icon: <IconOrbitGlobe size={14} style={{ color: '#06b6d4' }} />, color: '#06b6d4' };
      case 'glass':
        return { name: 'Glass', icon: <IconGlassmorphism size={14} style={{ color: '#ff7a18' }} />, color: '#ff7a18' };
      case 'blue':
        return { name: 'Blue', icon: <span style={{ fontSize: '11px', lineHeight: 1 }}>🔷</span>, color: '#38bdf8' };
      case 'light':
        return { name: 'Light', icon: <IconSun size={14} style={{ color: '#f59e0b' }} />, color: '#f59e0b' };
      default:
        return { name: 'Default', icon: <IconMoon size={14} style={{ color: '#818cf8' }} />, color: '#818cf8' };
    }
  }, [theme]);

  const userName = currentUser?.full_name || currentUser?.name || 'Amaan';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside
      className={`apex-sidebar apex-sidebar-${theme} ${effectiveCollapsed ? 'collapsed' : ''} ${isHovered && !isPinned ? 'hover-expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="navigation"
      aria-label="Main Navigation Sidebar"
    >
      {/* 1. Top Bar: Search Input & Collapsible Pin Toggle */}
      <div className="apex-sidebar-top-bar">
        {effectiveCollapsed ? (
          <button
            type="button"
            className="apex-sidebar-pin-btn"
            onClick={() => {
              setIsPinned(true);
              setTimeout(() => searchInputRef.current?.focus(), 150);
            }}
            title="Search pages (Click to expand)"
            aria-label="Search"
          >
            <IconSearch size={16} />
          </button>
        ) : (
          <div className="apex-sidebar-search-box">
            <IconSearch size={14} style={{ color: '#64748b', flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              className="apex-sidebar-search-input"
              placeholder="Jump to page... (e.g. Leads, CRM)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchQuery('');
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="apex-sidebar-search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        )}

        {/* Pin Sidebar Toggle Button */}
        <button
          type="button"
          className={`apex-sidebar-pin-btn ${isPinned ? 'pinned' : ''}`}
          onClick={togglePin}
          title={isPinned ? 'Unpin sidebar (auto-collapse to icons)' : 'Pin sidebar open'}
          aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
        >
          <IconPin size={15} isPinned={isPinned} />
        </button>
      </div>

      {/* Instant Search Results Dropdown Overlay */}
      {searchQuery && (
        <div className="apex-sidebar-search-results">
          {searchResults.length > 0 ? (
            searchResults.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={`search-${item.id}`}
                  type="button"
                  className="apex-sidebar-search-item"
                  onClick={() => {
                    onTabChange(item.id);
                    setSearchQuery('');
                  }}
                >
                  <span style={{ color: item.color, display: 'flex', alignItems: 'center' }}>
                    <ItemIcon size={15} />
                  </span>
                  <span>{item.label}</span>
                  <span className="apex-sidebar-search-badge">{item.section}</span>
                </button>
              );
            })
          ) : (
            <div style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
              No pages matching "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* 2. Scrollable Navigation List */}
      <nav className="apex-sidebar-nav">
        {/* ================= SECTION: MAIN ================= */}
        {!effectiveCollapsed ? (
          <div className="apex-sidebar-section-heading">Main</div>
        ) : (
          <div className="apex-sidebar-section-divider" />
        )}

        {/* Home */}
        <button
          type="button"
          className={`apex-nav-item ${activeTab === 'dashboard' || activeTab === 'home' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
          title="Home"
        >
          <span className="apex-nav-icon" style={{ color: '#60a5fa' }}>
            <IconHome size={17} />
          </span>
          {!effectiveCollapsed && <span className="apex-nav-text">Home</span>}
        </button>

        {/* Dashboards (Collapsible) */}
        <div className="apex-nav-group">
          <button
            type="button"
            className={`apex-nav-item has-sub ${isDashboardActive ? 'active-group' : ''}`}
            onClick={() => toggleGroup('dashboards')}
            title="Dashboards"
          >
            <span className="apex-nav-icon" style={{ color: '#c084fc' }}>
              <IconBarChart size={17} />
            </span>
            {!effectiveCollapsed && (
              <>
                <span className="apex-nav-text">Dashboards</span>
                <span className="apex-nav-arrow">
                  {dashboardsOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                </span>
              </>
            )}
          </button>

          {!effectiveCollapsed && (
            <div className={`apex-sub-menu-grid ${dashboardsOpen ? 'open' : ''}`}>
              <div className="apex-sub-menu-inner">
                <button
                  type="button"
                  className={`apex-sub-item ${activeTab === 'lead_dashboard' || activeTab === 'sales_performance' ? 'active' : ''}`}
                  onClick={() => onTabChange('lead_dashboard')}
                >
                  Lead Dashboard
                </button>
                <button
                  type="button"
                  className={`apex-sub-item ${activeTab === 'company_dashboard' || activeTab === 'crm_analytics' || activeTab === 'dashboards' ? 'active' : ''}`}
                  onClick={() => onTabChange('company_dashboard')}
                >
                  Company Dashboard
                </button>
                <button
                  type="button"
                  className={`apex-sub-item ${activeTab === 'glass_dashboard' || activeTab === 'glass' ? 'active' : ''}`}
                  onClick={() => onTabChange('glass_dashboard')}
                  title="Glassmorphism Dashboard"
                >
                  <span className="apex-sub-icon">
                    <IconGlassmorphism size={14} style={{ color: '#ff7a18' }} />
                  </span>
                  <span>Glass Dashboard</span>
                </button>
                <button
                  type="button"
                  className={`apex-sub-item ${activeTab === 'lumina' || activeTab === 'lumina_dashboard' ? 'active' : ''}`}
                  onClick={() => onTabChange('lumina')}
                  title="Lumina Glassmorphism Dashboard"
                >
                  <span className="apex-sub-icon">
                    <IconSparkles size={14} style={{ color: '#ec4899' }} />
                  </span>
                  <span>Lumina Glass</span>
                </button>
                <button
                  type="button"
                  className={`apex-sub-item ${activeTab === 'orbit_dashboard' || activeTab === 'orbit' ? 'active' : ''}`}
                  onClick={() => onTabChange('orbit_dashboard')}
                  title="Orbit Planetary Dashboard"
                >
                  <span className="apex-sub-icon">
                    <IconOrbitGlobe size={14} style={{ color: '#06b6d4' }} />
                  </span>
                  <span>Orbit Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION: DATA & CRM ================= */}
        {!effectiveCollapsed ? (
          <div className="apex-sidebar-section-heading">Data & CRM</div>
        ) : (
          <div className="apex-sidebar-section-divider" />
        )}

        {/* CRM (Company & Contact) */}
        <div className="apex-nav-group">
          <button
            type="button"
            className={`apex-nav-item has-sub ${isCrmActive ? 'active-group' : ''}`}
            onClick={() => toggleGroup('crm')}
            title="CRM (Companies & Contacts)"
          >
            <span className="apex-nav-icon" style={{ color: '#34d399' }}>
              <IconUsers size={17} />
            </span>
            {!effectiveCollapsed && (
              <>
                <span className="apex-nav-text">CRM</span>
                <span className="apex-nav-badge apex-nav-badge-cyan">{companiesBadge}</span>
                <span className="apex-nav-arrow" style={{ marginLeft: '0.4rem' }}>
                  {crmOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                </span>
              </>
            )}
          </button>

          {!effectiveCollapsed && (
            <div className={`apex-sub-menu-grid ${crmOpen ? 'open' : ''}`}>
              <div className="apex-sub-menu-inner">
                <button
                  type="button"
                  className={`apex-sub-item ${activeTab === 'companies' ? 'active' : ''}`}
                  onClick={() => onTabChange('companies')}
                  title="Company Report"
                >
                  <span className="apex-sub-icon"><IconBuilding size={14} /></span>
                  <span>Company</span>
                </button>
                <button
                  type="button"
                  className={`apex-sub-item ${activeTab === 'contacts' ? 'active' : ''}`}
                  onClick={() => onTabChange('contacts')}
                  title="Contact Report"
                >
                  <span className="apex-sub-icon"><IconUsers size={14} /></span>
                  <span>Contact</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lead */}
        {canViewLeads && (
          <button
            type="button"
            className={`apex-nav-item ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => onTabChange('leads')}
            title="Leads Management"
          >
            <span className="apex-nav-icon" style={{ color: '#a855f7' }}>
              <IconLightbulb size={17} />
            </span>
            {!effectiveCollapsed && (
              <>
                <span className="apex-nav-text">Lead</span>
                <span className="apex-nav-badge">{leadsBadge}</span>
              </>
            )}
          </button>
        )}

        {/* Campaigns */}
        {canViewCampaigns && (
          <div className="apex-nav-group">
            <button
              type="button"
              className={`apex-nav-item has-sub ${isCampaignsActive ? 'active-group' : ''}`}
              onClick={() => toggleGroup('campaigns')}
              title="Campaigns"
            >
              <span className="apex-nav-icon" style={{ color: '#f43f5e' }}>
                <IconBullhorn size={17} />
              </span>
              {!effectiveCollapsed && (
                <>
                  <span className="apex-nav-text">Campaigns</span>
                  <span className="apex-nav-arrow">
                    {campaignsOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                  </span>
                </>
              )}
            </button>
            {!effectiveCollapsed && (
              <div className={`apex-sub-menu-grid ${campaignsOpen ? 'open' : ''}`}>
                <div className="apex-sub-menu-inner">
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'email_campaigns' || activeTab === 'campaigns' ? 'active' : ''}`}
                    onClick={() => onTabChange('email_campaigns')}
                  >
                    Email Campaigns
                  </button>
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'outreach_lists' ? 'active' : ''}`}
                    onClick={() => onTabChange('outreach_lists')}
                  >
                    Outreach Lists
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Workspace & Collaboration */}
        <div className="apex-nav-group">
          <button
            type="button"
            className={`apex-nav-item has-sub ${isWorkspaceActive ? 'active-group' : ''}`}
            onClick={() => toggleGroup('workspace')}
            title="Workspace"
          >
            <span className="apex-nav-icon" style={{ color: '#8b5cf6' }}>
              <IconFolder size={17} />
            </span>
            {!effectiveCollapsed && (
              <>
                <span className="apex-nav-text">Workspace</span>
                <span className="apex-nav-arrow">
                  {workspaceOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                </span>
              </>
            )}
          </button>
          {!effectiveCollapsed && (
            <div className={`apex-sub-menu-grid ${workspaceOpen ? 'open' : ''}`}>
              <div className="apex-sub-menu-inner">
                <button
                  type="button"
                  className={`apex-sub-item ${activeTab === 'projects' ? 'active' : ''}`}
                  onClick={() => onTabChange('projects')}
                >
                  Projects
                </button>
                <button
                  type="button"
                  className={`apex-sub-item ${activeTab === 'calendar' ? 'active' : ''}`}
                  onClick={() => onTabChange('calendar')}
                >
                  Calendar
                </button>
                <button
                  type="button"
                  className={`apex-sub-item ${activeTab === 'messages' ? 'active' : ''}`}
                  onClick={() => onTabChange('messages')}
                >
                  Messages
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION: MERGER & TOOLS ================= */}
        {!effectiveCollapsed ? (
          <div className="apex-sidebar-section-heading">Merger & Tools</div>
        ) : (
          <div className="apex-sidebar-section-divider" />
        )}

        {/* Duplicate Merger */}
        {canViewMerger && (
          <div className="apex-nav-group">
            <button
              type="button"
              className={`apex-nav-item has-sub ${isMergerActive ? 'active-group' : ''}`}
              onClick={() => toggleGroup('merger')}
              title="Duplicate Merger"
            >
              <span className="apex-nav-icon" style={{ color: '#fb923c' }}>
                <IconGitMerge size={17} />
              </span>
              {!effectiveCollapsed && (
                <>
                  <span className="apex-nav-text">Duplicate Merger</span>
                  <span className="apex-nav-badge apex-nav-badge-amber">1.2k</span>
                  <span className="apex-nav-arrow" style={{ marginLeft: '0.4rem' }}>
                    {mergerOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                  </span>
                </>
              )}
            </button>
            {!effectiveCollapsed && (
              <div className={`apex-sub-menu-grid ${mergerOpen ? 'open' : ''}`}>
                <div className="apex-sub-menu-inner">
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'duplicate_company_report' ? 'active' : ''}`}
                    onClick={() => onTabChange('duplicate_company_report')}
                  >
                    Duplicate Company Report
                  </button>
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'merge_companies' ? 'active' : ''}`}
                    onClick={() => onTabChange('merge_companies')}
                  >
                    Merge Companies
                  </button>
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'duplicate_contact_report' ? 'active' : ''}`}
                    onClick={() => onTabChange('duplicate_contact_report')}
                  >
                    Duplicate Contact Report
                  </button>
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'merge_contacts' ? 'active' : ''}`}
                    onClick={() => onTabChange('merge_contacts')}
                  >
                    Merge Contacts
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Duplicate Merger Suggested — Full Un-truncated Label */}
        {canViewMerger && (
          <div className="apex-nav-group">
            <button
              type="button"
              className={`apex-nav-item has-sub ${isSuggestedActive ? 'active-group' : ''}`}
              onClick={() => toggleGroup('merger_suggested')}
              title="Duplicate Merger Suggested"
            >
              <span className="apex-nav-icon" style={{ color: '#ec4899' }}>
                <IconGitMerge size={17} />
              </span>
              {!effectiveCollapsed && (
                <>
                  <span className="apex-nav-text">Duplicate Merger Suggested</span>
                  <span className="apex-nav-arrow">
                    {mergerSuggestedOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                  </span>
                </>
              )}
            </button>
            {!effectiveCollapsed && (
              <div className={`apex-sub-menu-grid ${mergerSuggestedOpen ? 'open' : ''}`}>
                <div className="apex-sub-menu-inner">
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'merge_companies_suggested' ? 'active' : ''}`}
                    onClick={() => onTabChange('merge_companies_suggested')}
                  >
                    Merge Companies
                  </button>
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'merge_contacts_suggested' ? 'active' : ''}`}
                    onClick={() => onTabChange('merge_contacts_suggested')}
                  >
                    Merge Contacts
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CRM Upload */}
        {canViewUpload && (
          <div className="apex-nav-group">
            <button
              type="button"
              className={`apex-nav-item has-sub ${isUploadActive ? 'active-group' : ''}`}
              onClick={() => toggleGroup('upload')}
              title="CRM Upload"
            >
              <span className="apex-nav-icon" style={{ color: '#22d3ee' }}>
                <IconUploadCloud size={17} />
              </span>
              {!effectiveCollapsed && (
                <>
                  <span className="apex-nav-text">CRM Upload</span>
                  <span className="apex-nav-arrow">
                    {uploadOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                  </span>
                </>
              )}
            </button>
            {!effectiveCollapsed && (
              <div className={`apex-sub-menu-grid ${uploadOpen ? 'open' : ''}`}>
                <div className="apex-sub-menu-inner">
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'upload_companies' ? 'active' : ''}`}
                    onClick={() => onTabChange('upload_companies')}
                  >
                    Upload Companies
                  </button>
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'company_invalid_data' ? 'active' : ''}`}
                    onClick={() => onTabChange('company_invalid_data')}
                  >
                    Company Invalid Data
                  </button>
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'upload_contacts' ? 'active' : ''}`}
                    onClick={() => onTabChange('upload_contacts')}
                  >
                    Upload Contacts
                  </button>
                  <button
                    type="button"
                    className={`apex-sub-item ${activeTab === 'contact_incorrect_data' ? 'active' : ''}`}
                    onClick={() => onTabChange('contact_incorrect_data')}
                  >
                    Contact Incorrect Data
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION: ADMINISTRATION ================= */}
        {!effectiveCollapsed ? (
          <div className="apex-sidebar-section-heading">Administration</div>
        ) : (
          <div className="apex-sidebar-section-divider" />
        )}

        {/* Masters (17 Standard Reference Items with full un-truncated labels) */}
        {canViewMasters && (
          <div className="apex-nav-group">
            <button
              type="button"
              className={`apex-nav-item has-sub ${isMasterActive ? 'active-group' : ''}`}
              onClick={() => toggleGroup('masters')}
              title="Masters Configuration"
            >
              <span className="apex-nav-icon" style={{ color: '#fbbf24' }}>
                <IconSparkles size={17} />
              </span>
              {!effectiveCollapsed && (
                <>
                  <span className="apex-nav-text">Masters</span>
                  <span className="apex-nav-arrow">
                    {mastersOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                  </span>
                </>
              )}
            </button>
            {!effectiveCollapsed && (
              <div className={`apex-sub-menu-grid ${mastersOpen ? 'open' : ''}`}>
                <div className="apex-sub-menu-inner">
                  {MASTER_ITEMS.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`apex-sub-item ${isActive ? 'active' : ''}`}
                        onClick={() => onTabChange(item.id)}
                        title={item.label}
                      >
                        <span className="apex-sub-icon">
                          <ItemIcon size={14} />
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Management (Admin Only) */}
        {canViewUsers && (
          <button
            type="button"
            className={`apex-nav-item ${activeTab === 'user_management' ? 'active' : ''}`}
            onClick={() => onTabChange('user_management')}
            title="Users Management"
          >
            <span className="apex-nav-icon" style={{ color: '#2dd4bf' }}>
              <IconUserCheck size={17} />
            </span>
            {!effectiveCollapsed && <span className="apex-nav-text">Users Management</span>}
          </button>
        )}
      </nav>

      {/* 3. Bottom User Card & Theme Switcher */}
      <div className="apex-sidebar-user-card">
        <div className="apex-sidebar-user-info" title={`${userName} (${role.toUpperCase()})`}>
          <div className="apex-sidebar-avatar">
            {userInitial}
            <span className="apex-sidebar-online-dot" />
          </div>
          {!effectiveCollapsed && (
            <div className="apex-sidebar-user-meta">
              <span className="apex-sidebar-username">{userName}</span>
              <span className="apex-sidebar-role-badge">{role}</span>
            </div>
          )}
        </div>

        {/* Theme Switcher Button inside User Card */}
        {onToggleTheme && (
          <button
            type="button"
            className="apex-sidebar-theme-toggle"
            onClick={() => onToggleTheme()}
            title={`Active theme: ${themeInfo.name}. Click to switch theme.`}
            aria-label="Switch Theme"
          >
            {themeInfo.icon}
            {!effectiveCollapsed && <span>{themeInfo.name}</span>}
          </button>
        )}
      </div>
    </aside>
  );
}

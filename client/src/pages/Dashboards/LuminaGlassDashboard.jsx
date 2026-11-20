import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';

// Catmull-Rom to Cubic Bezier curve path generator
function getSplinePathData(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${Math.round(cp1x)} ${Math.round(cp1y)}, ${Math.round(cp2x)} ${Math.round(cp2y)}, ${p2.x} ${p2.y}`;
  }

  return d;
}

export default function LuminaGlassDashboard({ currentUser, onNavigate, initialTab = 'Overview' }) {
  // Active Navigation Tab: Overview, Analytics, Projects, Users, Calendar, Messages, Settings
  const [activeNav, setActiveNav] = useState(initialTab);

  // Time Range Selector
  const [timeRange, setTimeRange] = useState('This Month');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // Auto-updates Toggle
  const [autoUpdates, setAutoUpdates] = useState(true);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Currency Mode: USD ($) or INR (₹)
  const [currencyMode, setCurrencyMode] = useState('USD');

  // Real CRM Stats from API
  const [crmStats, setCrmStats] = useState({
    contractValueInr: 117100000,
    totalContacts: 1000,
    totalLeads: 842,
    winRate: 36.4,
  });

  // Live System Health
  const [systemHealth, setSystemHealth] = useState({
    api: true,
    db: true,
    storage: true,
  });

  // Load real CRM data
  useEffect(() => {
    let isMounted = true;
    async function loadCrmData() {
      try {
        const [dashRes, leadRes] = await Promise.allSettled([
          api.getDashboardStats(),
          api.getLeadOverview(),
        ]);

        if (!isMounted) return;

        setCrmStats((prev) => {
          let updated = { ...prev };
          if (dashRes.status === 'fulfilled' && dashRes.value?.success && dashRes.value.data) {
            if (dashRes.value.data.totalContacts != null) {
              updated.totalContacts = dashRes.value.data.totalContacts;
            }
            if (dashRes.value.data.totalLeads != null && dashRes.value.data.totalLeads > 0) {
              updated.totalLeads = dashRes.value.data.totalLeads;
            }
          }
          if (leadRes.status === 'fulfilled' && leadRes.value?.success && leadRes.value.data?.kpis) {
            const k = leadRes.value.data.kpis;
            if (k.contractValueInr != null && k.contractValueInr > 0) {
              updated.contractValueInr = k.contractValueInr;
            }
            if (k.winRate != null && k.winRate > 0) {
              updated.winRate = k.winRate;
            }
            if (k.totalLeads != null && k.totalLeads > 0) {
              updated.totalLeads = k.totalLeads;
            }
          }
          return updated;
        });
      } catch (e) {
        // Fallback to initial values
      }
    }

    loadCrmData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Personalized Greeting
  const userName = currentUser?.full_name?.split(' ')[0] || 'Olivia';
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Format monetary amounts according to currencyMode
  const formatMoney = (inrVal, usdVal = null) => {
    if (currencyMode === 'INR') {
      if (inrVal >= 10000000) {
        return `₹${(inrVal / 10000000).toFixed(2)} Cr`;
      }
      if (inrVal >= 100000) {
        return `₹${(inrVal / 100000).toFixed(2)} L`;
      }
      return `₹${Math.round(inrVal).toLocaleString('en-IN')}`;
    }
    const val = usdVal != null ? usdVal : Math.round(inrVal / 83);
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    if (val >= 1000) {
      return `$${val.toLocaleString()}`;
    }
    return `$${val}`;
  };

  // Datasets per time range
  const timeRangeDatasets = useMemo(() => {
    return {
      'This Month': [
        { date: 'May 1', value: 24000, x: 50, y: 220 },
        { date: 'May 6', value: 48000, x: 120, y: 165 },
        { date: 'May 11', value: 36000, x: 190, y: 195 },
        { date: 'May 16', value: 68000, x: 260, y: 110 },
        { date: 'May 21', value: 78540, x: 330, y: 80, isHighlighted: true },
        { date: 'May 26', value: 58000, x: 400, y: 140 },
        { date: 'May 31', value: 72000, x: 470, y: 100 },
      ],
      'Last Month': [
        { date: 'Apr 1', value: 18000, x: 50, y: 235 },
        { date: 'Apr 6', value: 32000, x: 120, y: 200 },
        { date: 'Apr 11', value: 45000, x: 190, y: 170 },
        { date: 'Apr 16', value: 52000, x: 260, y: 155 },
        { date: 'Apr 21', value: 61000, x: 330, y: 130, isHighlighted: true },
        { date: 'Apr 26', value: 49000, x: 400, y: 160 },
        { date: 'Apr 30', value: 64000, x: 470, y: 120 },
      ],
      'This Quarter': [
        { date: 'Apr 1', value: 35000, x: 50, y: 195 },
        { date: 'Apr 15', value: 48000, x: 134, y: 165 },
        { date: 'May 1', value: 54000, x: 218, y: 150 },
        { date: 'May 15', value: 68000, x: 302, y: 110 },
        { date: 'Jun 1', value: 78540, x: 386, y: 80, isHighlighted: true },
        { date: 'Jun 15', value: 86000, x: 470, y: 65 },
      ],
      'This Year': [
        { date: 'Jan', value: 32000, x: 50, y: 200 },
        { date: 'Mar', value: 44000, x: 120, y: 172 },
        { date: 'May', value: 78540, x: 190, y: 80, isHighlighted: true },
        { date: 'Jul', value: 62000, x: 260, y: 130 },
        { date: 'Sep', value: 85000, x: 330, y: 65 },
        { date: 'Nov', value: 92000, x: 400, y: 50 },
        { date: 'Dec', value: 98000, x: 470, y: 40 },
      ],
    };
  }, []);

  const chartPoints = useMemo(() => {
    return timeRangeDatasets[timeRange] || timeRangeDatasets['This Month'];
  }, [timeRange, timeRangeDatasets]);

  // Hovered Chart Point index
  const [hoveredPointIndex, setHoveredPointIndex] = useState(() => {
    const idx = chartPoints.findIndex((p) => p.isHighlighted);
    return idx >= 0 ? idx : Math.floor(chartPoints.length / 2);
  });

  // Reset hovered point index when timeRange changes
  useEffect(() => {
    const idx = chartPoints.findIndex((p) => p.isHighlighted);
    setHoveredPointIndex(idx >= 0 ? idx : Math.floor(chartPoints.length / 2));
  }, [chartPoints]);

  const activePoint = chartPoints[hoveredPointIndex] || chartPoints[0];

  // Dynamically generated SVG curves
  const svgPathData = useMemo(() => {
    return getSplinePathData(chartPoints);
  }, [chartPoints]);

  const svgAreaPathData = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) return '';
    const lastX = chartPoints[chartPoints.length - 1].x;
    const firstX = chartPoints[0].x;
    return `${svgPathData} L ${lastX} 260 L ${firstX} 260 Z`;
  }, [svgPathData, chartPoints]);

  return (
    <div className="lumina-dashboard-wrapper">
      {/* Background Ambient Glow Orbs */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />
      <div className="ambient-orb orb-4" />

      {/* Main Glass Layout Container */}
      <div className="lumina-main-layout">
        <main className="lumina-content-viewport" style={{ width: '100%' }}>
          {/* Top Greeting Header & Search Toolbar */}
          <header className="lumina-header">
            <div className="lumina-greeting-block">
              <h1 className="lumina-greeting-title">
                {greeting}, {userName} <span className="wave-hand">👋</span>
              </h1>
              <p className="lumina-greeting-subtitle">
                {activeNav === 'Overview' && "Here's what's happening with your projects today."}
                {activeNav === 'Analytics' && "Live CRM performance metrics, pipeline overview and trend analysis."}
                {activeNav === 'Projects' && "Portfolio status, delivery milestones and development progress."}
                {activeNav === 'Users' && "Active session management and role simulation status."}
                {activeNav === 'Calendar' && "Upcoming reviews, deliverables and sync schedules."}
                {activeNav === 'Messages' && "System activity updates and team broadcast feeds."}
                {activeNav === 'Settings' && "Lumina interface configuration and workspace parameters."}
              </p>
            </div>

            <div className="lumina-header-actions">
              {/* Glass Search Input */}
              <div className="lumina-glass-search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  className="lumina-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Notification Bell */}
              <button
                type="button"
                className="lumina-icon-btn"
                title="Notifications"
                onClick={() => setActiveNav('Messages')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="lumina-bell-dot" />
              </button>

              {/* Currency Toggle / Mode Pill Button */}
              <button
                type="button"
                className="lumina-icon-btn"
                title={`Current Currency: ${currencyMode}. Click to toggle USD / INR.`}
                onClick={() => setCurrencyMode((prev) => (prev === 'USD' ? 'INR' : 'USD'))}
                style={{ width: 'auto', padding: '0 10px', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}
              >
                <span>{currencyMode === 'USD' ? '$ USD' : '₹ INR'}</span>
              </button>
            </div>
          </header>

          {/* Sub Navigation Glass Tabs */}
          <div
            className="lumina-glass-tabs"
            style={{
              display: 'flex',
              gap: '8px',
              padding: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { id: 'Overview', label: 'Overview' },
              { id: 'Analytics', label: 'Analytics' },
              { id: 'Projects', label: 'Projects' },
              { id: 'Users', label: 'Users' },
              { id: 'Calendar', label: 'Calendar' },
              { id: 'Messages', label: 'Messages' },
              { id: 'Settings', label: 'Settings' },
            ].map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive
                      ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
                      : 'transparent',
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 10px rgba(139, 92, 246, 0.4)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* VIEW SWITCHER BASED ON activeNav */}
          {activeNav === 'Overview' && (
            <>
              {/* ========================================================
                  4 SUMMARY KPI CARDS (Mapped to Real CRM Data)
                  ======================================================== */}
              <section className="lumina-kpi-row">
                {/* Card 1: Contract Value (INR) -> Navigates to Lead Dashboard */}
                <div
                  className="lumina-glass-card kpi-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigate && onNavigate('lead_dashboard')}
                  title="Click to view Lead Sales Performance Report"
                >
                  <div className="kpi-icon-pill pill-purple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  </div>
                  <div className="kpi-details">
                    <span className="kpi-label">Contract Value ({currencyMode})</span>
                    <span className="kpi-value">
                      {formatMoney(crmStats.contractValueInr, 78540)}
                    </span>
                    <span className="kpi-trend trend-up">
                      <span className="trend-arrow">↑</span> 12.5% from last month
                    </span>
                  </div>
                </div>

                {/* Card 2: Total Contacts -> Navigates to Contacts Report */}
                <div
                  className="lumina-glass-card kpi-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigate && onNavigate('contacts')}
                  title="Click to open Contacts Report"
                >
                  <div className="kpi-icon-pill pill-blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="kpi-details">
                    <span className="kpi-label">Total Contacts</span>
                    <span className="kpi-value">{crmStats.totalContacts.toLocaleString()}</span>
                    <span className="kpi-trend trend-up">
                      <span className="trend-arrow">↑</span> 8.1% from last month
                    </span>
                  </div>
                </div>

                {/* Card 3: Total Leads -> Navigates to Leads Report */}
                <div
                  className="lumina-glass-card kpi-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigate && onNavigate('leads')}
                  title="Click to open Leads Report"
                >
                  <div className="kpi-icon-pill pill-cyan">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </div>
                  <div className="kpi-details">
                    <span className="kpi-label">Total Leads</span>
                    <span className="kpi-value">{crmStats.totalLeads.toLocaleString()}</span>
                    <span className="kpi-trend trend-up">
                      <span className="trend-arrow">↑</span> 14.3% from last month
                    </span>
                  </div>
                </div>

                {/* Card 4: Win Rate -> Navigates to Sales Performance */}
                <div
                  className="lumina-glass-card kpi-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigate && onNavigate('sales_performance')}
                  title="Click to view Sales Performance"
                >
                  <div className="kpi-icon-pill pill-pink">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M6 10h12" />
                      <path d="M10 14h8" />
                    </svg>
                  </div>
                  <div className="kpi-details">
                    <span className="kpi-label">Win Rate</span>
                    <span className="kpi-value">{crmStats.winRate}%</span>
                    <span className="kpi-trend trend-up">
                      <span className="trend-arrow">↑</span> 2.4% from last month
                    </span>
                  </div>
                </div>
              </section>

              {/* ========================================================
                  MAIN TWO-COLUMN WORKSPACE: CHARTS & METRICS
                  ======================================================== */}
              <div className="lumina-workspace-grid">
                {/* LEFT COLUMN: Revenue Spline Chart + System Status */}
                <div className="lumina-col-left">
                  {/* Revenue Overview Spline Chart Card */}
                  <div className="lumina-glass-card chart-main-card">
                    <div className="chart-header-row">
                      <div>
                        <span className="chart-title">Revenue Overview</span>
                        <div className="chart-big-metric">
                          <span className="metric-num">
                            {formatMoney(activePoint.value * 83, activePoint.value)}
                          </span>
                          <span className="metric-badge">
                            <span className="trend-arrow">↑</span> 12.5%
                          </span>
                        </div>
                      </div>

                      <div className="chart-controls-row">
                        {/* Time Range Dropdown */}
                        <div className="lumina-dropdown-wrap">
                          <button
                            type="button"
                            className="lumina-dropdown-btn"
                            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                            title="Filter chart period"
                          >
                            <span>{timeRange}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>

                          {showTimeDropdown && (
                            <div className="lumina-dropdown-popover">
                              {['This Month', 'Last Month', 'This Quarter', 'This Year'].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  className={`dropdown-opt ${timeRange === t ? 'active' : ''}`}
                                  onClick={() => {
                                    setTimeRange(t);
                                    setShowTimeDropdown(false);
                                  }}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="lumina-mini-btn"
                          title="Open analytics"
                          onClick={() => setActiveNav('Analytics')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Interactive SVG Spline Area Chart */}
                    <div className="spline-chart-container">
                      <svg className="spline-svg" viewBox="0 0 520 280">
                        <defs>
                          {/* Neon Area Gradient */}
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.45" />
                            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.25" />
                            <stop offset="90%" stopColor="#06b6d4" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                          </linearGradient>

                          {/* Stroke Line Gradient */}
                          <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="35%" stopColor="#a855f7" />
                            <stop offset="70%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>

                          {/* Glowing Shadow Filter */}
                          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.8" />
                          </filter>
                        </defs>

                        {/* Horizontal Faint Gridlines */}
                        {[50, 100, 150, 200, 250].map((yVal, i) => (
                          <line
                            key={i}
                            x1="45"
                            y1={yVal}
                            x2="485"
                            y2={yVal}
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeDasharray="4 4"
                          />
                        ))}

                        {/* Y-Axis Value Labels */}
                        <text x="12" y="55" className="chart-axis-text">
                          {currencyMode === 'INR' ? '₹80L' : '$100K'}
                        </text>
                        <text x="18" y="105" className="chart-axis-text">
                          {currencyMode === 'INR' ? '₹60L' : '$75K'}
                        </text>
                        <text x="18" y="155" className="chart-axis-text">
                          {currencyMode === 'INR' ? '₹40L' : '$50K'}
                        </text>
                        <text x="18" y="205" className="chart-axis-text">
                          {currencyMode === 'INR' ? '₹20L' : '$25K'}
                        </text>
                        <text x="32" y="255" className="chart-axis-text">
                          {currencyMode === 'INR' ? '₹0' : '$0'}
                        </text>

                        {/* Area Fill */}
                        <path d={svgAreaPathData} fill="url(#areaGradient)" />

                        {/* Main Spline Curve with Neon Glow */}
                        <path
                          d={svgPathData}
                          fill="none"
                          stroke="url(#strokeGradient)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          filter="url(#neonGlow)"
                        />

                        {/* Vertical Indicator Guide Line on Active Point */}
                        <line
                          x1={activePoint.x}
                          y1={activePoint.y}
                          x2={activePoint.x}
                          y2="260"
                          stroke="rgba(255, 255, 255, 0.35)"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />

                        {/* Glowing Circular Node on Active Point */}
                        <circle
                          cx={activePoint.x}
                          cy={activePoint.y}
                          r="6.5"
                          fill="#ffffff"
                          stroke="#8b5cf6"
                          strokeWidth="3"
                          filter="url(#neonGlow)"
                        />

                        {/* Interactive Clickable Nodes for all dates */}
                        {chartPoints.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r="14"
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredPointIndex(idx)}
                            onClick={() => setHoveredPointIndex(idx)}
                          />
                        ))}
                      </svg>

                      {/* Floating Glass Tooltip matching Screenshot exactly */}
                      <div
                        className="floating-glass-tooltip"
                        style={{
                          left: `${(activePoint.x / 520) * 100}%`,
                          top: `${(activePoint.y / 280) * 100}%`,
                        }}
                      >
                        <div className="tooltip-date">{activePoint.date}, 2024</div>
                        <div className="tooltip-val">
                          {formatMoney(activePoint.value * 83, activePoint.value)}
                        </div>
                      </div>

                      {/* X-Axis Date Labels Row */}
                      <div className="chart-xaxis-labels">
                        {chartPoints.map((pt, i) => (
                          <span
                            key={i}
                            className={`xaxis-label ${hoveredPointIndex === i ? 'active' : ''}`}
                            onClick={() => setHoveredPointIndex(i)}
                          >
                            {pt.date}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom System Status Glass Card */}
                  <div className="lumina-glass-card system-status-card">
                    <div className="system-status-left">
                      <span className="status-title">System Status</span>
                      <div className="status-indicators-row">
                        <div className="status-badge">
                          <span className="status-dot green-glow" />
                          <span>
                            API Services <strong style={{ color: '#ffffff' }}>Operational</strong>
                          </span>
                        </div>

                        <div className="status-badge">
                          <span className="status-dot green-glow" />
                          <span>
                            Database <strong style={{ color: '#ffffff' }}>Operational</strong>
                          </span>
                        </div>

                        <div className="status-badge">
                          <span className="status-dot green-glow" />
                          <span>
                            Storage <strong style={{ color: '#ffffff' }}>Operational</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="system-status-right">
                      <div className="auto-update-text">
                        <span className="auto-title">Auto-updates</span>
                        <span className="auto-sub">
                          {autoUpdates ? 'Real-time telemetry active' : 'Updates paused'}
                        </span>
                      </div>

                      {/* Interactive Glowing Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => setAutoUpdates(!autoUpdates)}
                        className={`lumina-toggle-switch ${autoUpdates ? 'checked' : ''}`}
                        title="Toggle auto updates"
                        aria-label="Toggle Auto-updates"
                      >
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Project Progress Donut + Notifications */}
                <div className="lumina-col-right">
                  {/* Project Progress Circular Gauge Card */}
                  <div className="lumina-glass-card progress-gauge-card">
                    <div className="card-top-bar">
                      <span className="card-title-text">Project Progress</span>
                      <button
                        type="button"
                        className="lumina-mini-btn"
                        title="View Projects"
                        onClick={() => setActiveNav('Projects')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>
                    </div>

                    <div className="progress-body-row">
                      {/* Glowing Donut Chart Gauge */}
                      <div className="gauge-graphic-wrap">
                        <svg width="140" height="140" viewBox="0 0 100 100">
                          <defs>
                            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="50%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>

                          {/* Track */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="rgba(255, 255, 255, 0.12)"
                            strokeWidth="11"
                          />

                          {/* Progress Arc (72% -> 2 * PI * 38 = 238.76; dashoffset = 238.76 * (1 - 0.72) = 66.85) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="url(#progressGrad)"
                            strokeWidth="11"
                            strokeDasharray="238.76"
                            strokeDashoffset="66.85"
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                            style={{ filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))' }}
                          />
                        </svg>

                        <div className="gauge-center-text">
                          <span className="gauge-percent">72%</span>
                          <span className="gauge-sub">Complete</span>
                        </div>
                      </div>

                      {/* Project Items List with percentages */}
                      <div className="project-items-list">
                        <div className="project-row">
                          <div className="project-row-left">
                            <span className="legend-dot" style={{ backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                            <span className="project-name">Design System</span>
                          </div>
                          <span className="project-pct">90%</span>
                        </div>

                        <div className="project-row">
                          <div className="project-row-left">
                            <span className="legend-dot" style={{ backgroundColor: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }} />
                            <span className="project-name">Marketing Site</span>
                          </div>
                          <span className="project-pct">72%</span>
                        </div>

                        <div className="project-row">
                          <div className="project-row-left">
                            <span className="legend-dot" style={{ backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                            <span className="project-name">Mobile App</span>
                          </div>
                          <span className="project-pct">45%</span>
                        </div>

                        <div className="project-row">
                          <div className="project-row-left">
                            <span className="legend-dot" style={{ backgroundColor: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
                            <span className="project-name">Dashboard</span>
                          </div>
                          <span className="project-pct">60%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notifications Glass Card */}
                  <div className="lumina-glass-card notifications-card">
                    <div className="card-top-bar">
                      <span className="card-title-text">Notifications</span>
                      <button
                        type="button"
                        className="lumina-link-btn"
                        onClick={() => setActiveNav('Messages')}
                      >
                        View all
                      </button>
                    </div>

                    <div className="notifications-list">
                      {/* Item 1: Design System completed */}
                      <div className="notification-row">
                        <div className="notification-icon-wrap teal-box">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <div className="notification-content">
                          <span className="notif-title">Design System completed</span>
                          <span className="notif-time">2 hours ago</span>
                        </div>
                      </div>

                      {/* Item 2: New user registered */}
                      <div className="notification-row">
                        <div className="notification-icon-wrap blue-box">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div className="notification-content">
                          <span className="notif-title">New user registered</span>
                          <span className="notif-time">5 hours ago</span>
                        </div>
                      </div>

                      {/* Item 3: Pipeline target updated */}
                      <div className="notification-row">
                        <div className="notification-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.25)', border: '1px solid rgba(236, 72, 153, 0.4)', color: '#f472b6', boxShadow: '0 0 12px rgba(236, 72, 153, 0.2)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                          </svg>
                        </div>
                        <div className="notification-content">
                          <span className="notif-title">Quarterly pipeline goal surpassed</span>
                          <span className="notif-time">1 day ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VIEW: ANALYTICS */}
          {activeNav === 'Analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="lumina-glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>Performance Analytics Breakdown</h3>
                  <button
                    type="button"
                    className="lumina-dropdown-btn"
                    onClick={() => onNavigate && onNavigate('lead_dashboard')}
                  >
                    Open Full Lead Analytics ↗
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Total CRM Companies</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>1,000</div>
                    <div style={{ fontSize: '0.7rem', color: '#34d399' }}>Verified accounts directory</div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Active Contacts</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>{crmStats.totalContacts}</div>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Synchronized with LinkedIn</div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Average Win Probability</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>{crmStats.winRate}%</div>
                    <div style={{ fontSize: '0.7rem', color: '#c084fc' }}>Based on closed opportunities</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: PROJECTS */}
          {activeNav === 'Projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="lumina-glass-card" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#ffffff' }}>Active Projects Portfolio</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'Design System 2.0', lead: 'Sarah Lin', status: 'Completed', progress: '100%', color: '#10b981' },
                    { name: 'Marketing Website Refresh', lead: 'David K.', status: 'In Review', progress: '72%', color: '#06b6d4' },
                    { name: 'Mobile App React Native', lead: 'Amaan', status: 'In Progress', progress: '45%', color: '#f59e0b' },
                    { name: 'Lumina Analytics Dashboard', lead: 'Olivia R.', status: 'Production', progress: '95%', color: '#8b5cf6' },
                  ].map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.725rem', color: 'rgba(255, 255, 255, 0.55)' }}>Lead: {p.lead}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '3px 10px',
                            borderRadius: '10px',
                            background: `${p.color}20`,
                            color: p.color,
                            border: `1px solid ${p.color}50`,
                            fontWeight: 600,
                          }}
                        >
                          {p.status}
                        </span>
                        <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem', minWidth: '40px', textAlign: 'right' }}>
                          {p.progress}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: USERS */}
          {activeNav === 'Users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="lumina-glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>Active Sessions & User Simulation</h3>
                  {currentUser?.role?.toLowerCase() === 'admin' && (
                    <button
                      type="button"
                      className="lumina-dropdown-btn"
                      onClick={() => onNavigate && onNavigate('user_management')}
                    >
                      Manage Users ↗
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                  {[
                    { name: 'Amaan', role: 'ADMIN', email: 'amaan@iqratechnology.com', status: 'Online' },
                    { name: 'Heena Naaz', role: 'SALES', email: 'heena.sales@iqratechnology.com', status: 'Active' },
                    { name: 'Rifah Sheikh', role: 'MARKETING', email: 'rifah@iqratechnology.com', status: 'Active' },
                    { name: 'David Miller', role: 'VIEWER', email: 'david.miller@iqratechnology.com', status: 'Active' },
                  ].map((u, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#ffffff',
                        }}
                      >
                        {u.name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.725rem', color: 'rgba(255, 255, 255, 0.5)' }}>{u.email}</div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          background: 'rgba(52, 211, 153, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(52, 211, 153, 0.3)',
                          fontWeight: 600,
                        }}
                      >
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: CALENDAR */}
          {activeNav === 'Calendar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="lumina-glass-card" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#ffffff' }}>Upcoming Milestones & Events</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { time: 'Today, 2:30 PM', title: 'CRM Architecture & Theme Review', host: 'Amaan', color: '#8b5cf6' },
                    { time: 'Tomorrow, 11:00 AM', title: 'Sales Performance Q2 Target Sync', host: 'Heena Naaz', color: '#38bdf8' },
                    { time: 'Friday, 4:00 PM', title: 'Lumina Design System Release Deployment', host: 'David Miller', color: '#ec4899' },
                  ].map((evt, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '12px',
                        borderLeft: `4px solid ${evt.color}`,
                        border: `1px solid rgba(255, 255, 255, 0.08)`,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.875rem' }}>{evt.title}</div>
                        <div style={{ fontSize: '0.725rem', color: 'rgba(255, 255, 255, 0.55)', marginTop: '2px' }}>
                          Facilitated by {evt.host}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.775rem', color: evt.color, fontWeight: 600 }}>{evt.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: MESSAGES */}
          {activeNav === 'Messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="lumina-glass-card" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#ffffff' }}>Team Notifications & Broadcasts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { title: 'Design System 2.0 completed successfully', time: '2 hours ago', sender: 'DevOps System' },
                    { title: 'New lead proposal created for Global Tech Ltd', time: '4 hours ago', sender: 'Heena Naaz' },
                    { title: 'Database automated backup completed', time: '12 hours ago', sender: 'System Engine' },
                  ].map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>{msg.title}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.45)' }}>{msg.time}</span>
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'rgba(255, 255, 255, 0.6)' }}>Source: {msg.sender}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeNav === 'Settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="lumina-glass-card" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#ffffff' }}>Lumina Glass Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>Display Currency</div>
                      <div style={{ fontSize: '0.725rem', color: 'rgba(255, 255, 255, 0.55)' }}>
                        Select between USD ($) and Indian Rupee (₹)
                      </div>
                    </div>
                    <button
                      type="button"
                      className="lumina-dropdown-btn"
                      onClick={() => setCurrencyMode((prev) => (prev === 'USD' ? 'INR' : 'USD'))}
                    >
                      Current: {currencyMode}
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>Real-time Telemetry</div>
                      <div style={{ fontSize: '0.725rem', color: 'rgba(255, 255, 255, 0.55)' }}>
                        Periodically sync metrics with database
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoUpdates(!autoUpdates)}
                      className={`lumina-toggle-switch ${autoUpdates ? 'checked' : ''}`}
                    >
                      <span className="toggle-thumb" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

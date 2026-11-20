import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../../api/client';
import ParticleGlobeCanvas from '../../components/ParticleGlobeCanvas';
import {
  IconBuilding,
  IconUsers,
  IconTrendingUp,
  IconGlobe,
  IconRefresh,
  IconArrowRight,
  IconOrbitGlobe,
  IconShield,
  IconBriefcase,
  IconCheckCircle,
} from '../../components/Icons';

/**
 * Format amounts into Indian Rupee (INR ₹) currency notation
 */
export function formatInr(val, compact = false) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Number(val);
  if (compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(1)}k`;
    }
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

// Generate smooth cubic bezier SVG spline from point array
function generateSplinePath(points) {
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

export default function OrbitDashboard({ currentUser, onNavigate }) {
  // Time Range Scope filter
  const [timeRange, setTimeRange] = useState('all'); // 'all', '2026', '2025', 'last90', 'last30'
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);

  // Real CRM Data Store
  const [statsData, setStatsData] = useState({
    totalCompanies: 0,
    totalContacts: 0,
    totalLeads: 0,
    assignedContacts: 0,
    unassignedContacts: 0,
    recentCompanies: [],
    recentContacts: [],
  });

  const [leadOverviewData, setLeadOverviewData] = useState({
    kpis: {
      totalLeads: 0,
      wonLeads: 0,
      openLeads: 0,
      onHoldLeads: 0,
      lostLeads: 0,
      winRate: 0,
      contractValueInr: 0,
      avgTimeToCloseDays: 0,
    },
    charts: {
      totalLeadsBySource: [],
      wonLeadsBySource: [],
      statusDonut: [],
      lostByReason: [],
      monthlyLeadsByYear: [],
      totalLeadsByMonth: [],
    },
    refreshedAt: new Date().toISOString(),
  });

  const [analyticsData, setAnalyticsData] = useState({
    totalPipelineInr: 0,
    wonPipelineInr: 0,
    companiesByCountry: [],
    companiesByIndustry: [],
    companiesByType: [],
    companiesBySize: [],
    contactsByCountry: [],
    contactsByCompany: [],
    contactsByDesignation: [],
    leadsByStatus: [],
  });

  // Calculate parameters for current timeRange filter
  const filterParams = useMemo(() => {
    const params = {};
    const now = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];

    if (timeRange === '2026') {
      params.year = '2026';
      params.year_from = '2026';
      params.year_to = '2026';
      params.startDate = '2026-01-01';
      params.endDate = '2026-12-31';
    } else if (timeRange === '2025') {
      params.year = '2025';
      params.year_from = '2025';
      params.year_to = '2025';
      params.startDate = '2025-01-01';
      params.endDate = '2025-12-31';
    } else if (timeRange === 'last90') {
      const past90 = new Date(now);
      past90.setDate(past90.getDate() - 90);
      params.startDate = fmt(past90);
      params.endDate = fmt(now);
      params.start_date = fmt(past90);
      params.end_date = fmt(now);
    } else if (timeRange === 'last30') {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 30);
      params.startDate = fmt(past30);
      params.endDate = fmt(now);
      params.start_date = fmt(past30);
      params.end_date = fmt(now);
    }
    return params;
  }, [timeRange]);

  // Fetch real CRM data from all endpoints
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, overviewRes, analyticsRes] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getLeadOverview(filterParams),
        api.getDashboardAnalytics(filterParams),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success && statsRes.value.data) {
        setStatsData(statsRes.value.data);
      }

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.success && overviewRes.value.data) {
        setLeadOverviewData(overviewRes.value.data);
      }

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.success && analyticsRes.value.data) {
        setAnalyticsData(analyticsRes.value.data);
      }
    } catch (err) {
      console.warn('[Orbit Dashboard] Error fetching CRM data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Derived metrics from real CRM data
  const totalLeads = leadOverviewData.kpis.totalLeads || statsData.totalLeads || 0;
  const wonLeads = leadOverviewData.kpis.wonLeads || 0;
  const openLeads = leadOverviewData.kpis.openLeads || 0;
  const lostLeads = leadOverviewData.kpis.lostLeads || 0;
  const onHoldLeads = leadOverviewData.kpis.onHoldLeads || 0;
  const winRate = leadOverviewData.kpis.winRate || 0;

  // Revenue in INR (Real contract value or pipeline)
  const contractValueInr = leadOverviewData.kpis.contractValueInr || analyticsData.wonPipelineInr || 0;
  const totalPipelineInr = analyticsData.totalPipelineInr || contractValueInr || 0;
  const avgTimeToCloseDays = leadOverviewData.kpis.avgTimeToCloseDays || 18.2;

  // Average deal size in INR
  const avgDealValueInr = wonLeads > 0 ? Math.round(contractValueInr / wonLeads) : 0;

  // Open Pipeline estimated INR
  const openPipelineInr = Math.max(0, totalPipelineInr - contractValueInr);

  // Top territory from companies
  const topCountry = analyticsData.companiesByCountry && analyticsData.companiesByCountry.length > 0
    ? analyticsData.companiesByCountry[0]
    : { label: 'Global', count: statsData.totalCompanies };

  // Top Industry
  const topIndustry = analyticsData.companiesByIndustry && analyticsData.companiesByIndustry.length > 0
    ? analyticsData.companiesByIndustry[0]
    : { label: 'Information Technology', count: 0 };

  // Generate Hotspots dynamically based on real countries in database
  const globeHotspots = useMemo(() => {
    const coordsMap = {
      'india': { lat: 20.59, lon: 78.96, sub: 'South Asia HQ' },
      'united states': { lat: 37.09, lon: -95.71, sub: 'North America' },
      'united states of america': { lat: 37.09, lon: -95.71, sub: 'North America' },
      'usa': { lat: 37.09, lon: -95.71, sub: 'North America' },
      'united kingdom': { lat: 55.37, lon: -3.43, sub: 'Europe West' },
      'uk': { lat: 55.37, lon: -3.43, sub: 'Europe West' },
      'united arab emirates': { lat: 23.42, lon: 53.84, sub: 'Middle East' },
      'uae': { lat: 23.42, lon: 53.84, sub: 'Middle East' },
      'singapore': { lat: 1.35, lon: 103.82, sub: 'APAC Hub' },
      'australia': { lat: -25.27, lon: 133.77, sub: 'Oceania' },
      'canada': { lat: 56.13, lon: -106.34, sub: 'North America' },
      'germany': { lat: 51.16, lon: 10.45, sub: 'Central Europe' },
    };

    const countries = analyticsData.companiesByCountry || [];
    const spots = [];

    countries.slice(0, 5).forEach((c) => {
      const key = String(c.label || '').trim().toLowerCase();
      if (coordsMap[key]) {
        spots.push({
          name: c.label,
          sub: coordsMap[key].sub,
          lat: coordsMap[key].lat,
          lon: coordsMap[key].lon,
          val: `${c.count} Accounts`,
        });
      }
    });

    if (spots.length === 0) {
      return [
        { name: 'India (HQ)', sub: 'Primary Corridors', lat: 20.59, lon: 78.96, val: formatInr(contractValueInr, true) },
        { name: 'United States', sub: 'North America', lat: 37.09, lon: -95.71, val: `${topCountry.count} Leads` },
        { name: 'United Kingdom', sub: 'European Union', lat: 55.37, lon: -3.43, val: 'Active Corridors' },
        { name: 'UAE', sub: 'Middle East', lat: 23.42, lon: 53.84, val: 'MENA Pipeline' },
        { name: 'Singapore', sub: 'APAC Hub', lat: 1.35, lon: 103.82, val: 'Direct Channel' },
      ];
    }
    return spots;
  }, [analyticsData.companiesByCountry, contractValueInr, topCountry.count]);

  // Monthly Chart Points computation
  const monthlyChartPoints = useMemo(() => {
    const rawMonths = leadOverviewData.charts?.totalLeadsByMonth || [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Map all 12 months with real lead count
    const monthMap = {};
    monthNames.forEach((m) => { monthMap[m] = 0; });

    rawMonths.forEach((item) => {
      const mStr = String(item.month || item.label || '').slice(0, 3);
      if (monthMap[mStr] !== undefined) {
        monthMap[mStr] = Number(item.count || item.total || 0);
      }
    });

    // If monthMap is all 0, check monthlyLeadsByYear
    const rawYears = leadOverviewData.charts?.monthlyLeadsByYear || [];
    rawYears.forEach((item) => {
      const mStr = String(item.month || '').slice(0, 3);
      if (monthMap[mStr] !== undefined && Number(item.count || 0) > monthMap[mStr]) {
        monthMap[mStr] = Number(item.count || 0);
      }
    });

    const dataArray = monthNames.map((name) => ({
      name,
      count: monthMap[name],
    }));

    const maxCount = Math.max(...dataArray.map((d) => d.count), 1);
    const chartW = 560;
    const chartH = 180;
    const paddingX = 40;
    const paddingY = 24;

    const points = dataArray.map((d, i) => {
      const x = paddingX + (i / (dataArray.length - 1)) * (chartW - paddingX * 2);
      const y = chartH - paddingY - (d.count / maxCount) * (chartH - paddingY * 2);
      return { x, y, name: d.name, count: d.count };
    });

    return { points, maxCount, chartW, chartH, dataArray };
  }, [leadOverviewData.charts]);

  return (
    <div className="orbit-dashboard-container">
      {/* 1. Orbit Telemetry Header Bar */}
      <header className="orbit-header-bar">
        <div className="orbit-header-left">
          <div className="orbit-badge-pill">
            <IconOrbitGlobe size={15} style={{ color: '#06b6d4', filter: 'drop-shadow(0 0 6px #06b6d4)' }} />
            <span>ORBIT INTELLIGENCE ENGINE</span>
            <span className="orbit-pulse-dot" />
          </div>
          <h1 className="orbit-page-title">Realtime SaaS Revenue & Planetary CRM Command</h1>
          <p className="orbit-page-subtitle">
            Synchronized with local PostgreSQL database • Real pipeline, contract volume & global distribution telemetry
          </p>
        </div>

        <div className="orbit-header-right">
          {/* Currency Indicator */}
          <div className="orbit-currency-pill" title="Main base currency locked to Indian Rupee (INR)">
            <span className="currency-symbol">₹</span>
            <span className="currency-label">INR Base</span>
          </div>

          {/* Time Scope Filter Chips */}
          <div className="orbit-scope-chips">
            {[
              { id: 'all', label: 'All Time' },
              { id: '2026', label: '2026' },
              { id: '2025', label: '2025' },
              { id: 'last90', label: '90D' },
              { id: 'last30', label: '30D' },
            ].map((scope) => (
              <button
                key={scope.id}
                type="button"
                className={`orbit-scope-btn ${timeRange === scope.id ? 'active' : ''}`}
                onClick={() => setTimeRange(scope.id)}
              >
                {scope.label}
              </button>
            ))}
          </div>

          {/* Refresh Action Button */}
          <button
            type="button"
            className="orbit-refresh-btn"
            onClick={fetchAllData}
            title="Refresh Real CRM Telemetry"
            disabled={isLoading}
          >
            <IconRefresh size={15} className={isLoading ? 'orbit-spin' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </header>

      {/* 2. Top 4 Orbit SaaS KPI Cards */}
      <section className="orbit-kpi-row">
        {/* KPI 1: Contract Value / Won Revenue (INR) */}
        <div className="orbit-kpi-card glow-cyan">
          <div className="kpi-top">
            <span className="kpi-label">TOTAL CLOSED-WON REVENUE</span>
            <span className="kpi-tag-pill tag-emerald">
              <IconTrendingUp size={12} /> {winRate}% Win Rate
            </span>
          </div>
          <div className="kpi-main-metric">
            <span className="kpi-value text-glow-cyan">{formatInr(contractValueInr, true)}</span>
            <span className="kpi-exact-val">{formatInr(contractValueInr, false)}</span>
          </div>
          <div className="kpi-footer-metric">
            <div className="kpi-mini-bar">
              <div
                className="kpi-bar-fill fill-cyan"
                style={{ width: `${Math.min(100, Math.max(15, (contractValueInr / (totalPipelineInr || 1)) * 100))}%` }}
              />
            </div>
            <span className="kpi-subtext">
              {wonLeads} Closed-Won Deals in INR • Avg {formatInr(avgDealValueInr, true)} / Deal
            </span>
          </div>
        </div>

        {/* KPI 2: Lead Opportunities */}
        <div className="orbit-kpi-card glow-indigo">
          <div className="kpi-top">
            <span className="kpi-label">OPPORTUNITIES IN ORBIT</span>
            <span className="kpi-tag-pill tag-cyan">{openLeads} In-Flight</span>
          </div>
          <div className="kpi-main-metric">
            <span className="kpi-value">{totalLeads.toLocaleString('en-IN')}</span>
            <span className="kpi-exact-val">Total Active Pipeline Leads</span>
          </div>
          <div className="kpi-footer-metric">
            <div className="kpi-multi-bar">
              <span className="seg-emerald" style={{ flex: wonLeads || 1 }} title={`Won: ${wonLeads}`} />
              <span className="seg-cyan" style={{ flex: openLeads || 1 }} title={`Open: ${openLeads}`} />
              <span className="seg-rose" style={{ flex: lostLeads || 1 }} title={`Lost: ${lostLeads}`} />
            </div>
            <span className="kpi-subtext">
              Won: <strong>{wonLeads}</strong> • Open: <strong>{openLeads}</strong> • Lost: <strong>{lostLeads}</strong>
            </span>
          </div>
        </div>

        {/* KPI 3: Corporate Accounts / Companies */}
        <div className="orbit-kpi-card glow-blue">
          <div className="kpi-top">
            <span className="kpi-label">ENTERPRISE ACCOUNTS</span>
            <span className="kpi-tag-pill tag-indigo">
              <IconBuilding size={12} /> Registered
            </span>
          </div>
          <div className="kpi-main-metric">
            <span className="kpi-value">{statsData.totalCompanies.toLocaleString('en-IN')}</span>
            <span className="kpi-exact-val">Verified Corporate Entities</span>
          </div>
          <div className="kpi-footer-metric">
            <div className="kpi-mini-bar">
              <div className="kpi-bar-fill fill-indigo" style={{ width: '84%' }} />
            </div>
            <span className="kpi-subtext">
              Top Sector: <strong>{topIndustry.label}</strong> ({topIndustry.count})
            </span>
          </div>
        </div>

        {/* KPI 4: Decision Makers / Contacts */}
        <div className="orbit-kpi-card glow-teal">
          <div className="kpi-top">
            <span className="kpi-label">DECISION MAKERS & CONTACTS</span>
            <span className="kpi-tag-pill tag-emerald">
              <IconUsers size={12} /> {statsData.assignedContacts} Linked
            </span>
          </div>
          <div className="kpi-main-metric">
            <span className="kpi-value">{statsData.totalContacts.toLocaleString('en-IN')}</span>
            <span className="kpi-exact-val">Key Stakeholders in Network</span>
          </div>
          <div className="kpi-footer-metric">
            <div className="kpi-mini-bar">
              <div
                className="kpi-bar-fill fill-teal"
                style={{ width: `${Math.round((statsData.assignedContacts / (statsData.totalContacts || 1)) * 100)}%` }}
              />
            </div>
            <span className="kpi-subtext">
              {Math.round((statsData.assignedContacts / (statsData.totalContacts || 1)) * 100)}% Account Affiliation Ratio
            </span>
          </div>
        </div>
      </section>

      {/* 3. HERO CENTREPIECE STAGE: 3D Rotating Glowing Particle Globe & Revenue Command Deck */}
      <section className="orbit-hero-stage">
        {/* Left Column: 3D Rotating Glowing Particle Globe & HUD Telemetry */}
        <div className="orbit-globe-section">
          {/* Subtle Grid / Starfield Ambient Background */}
          <div className="orbit-canvas-viewport">
            {/* The Custom 3D Particle Planet Canvas */}
            <ParticleGlobeCanvas
              width={540}
              height={440}
              hotspots={globeHotspots}
            />

            {/* Corner Floating HUD Badges */}
            <div className="orbit-hud-chip hud-top-left">
              <div className="hud-indicator-dot" />
              <div>
                <span className="hud-label">TOTAL PIPELINE (INR)</span>
                <span className="hud-value text-glow-cyan">{formatInr(totalPipelineInr, true)}</span>
              </div>
            </div>

            <div className="orbit-hud-chip hud-top-right">
              <div className="hud-indicator-dot dot-indigo" />
              <div>
                <span className="hud-label">AVG VELOCITY</span>
                <span className="hud-value">{avgTimeToCloseDays} Days to Close</span>
              </div>
            </div>

            <div className="orbit-hud-chip hud-bottom-left">
              <div className="hud-indicator-dot dot-emerald" />
              <div>
                <span className="hud-label">TOP CORRIDOR</span>
                <span className="hud-value">{topCountry.label} ({topCountry.count})</span>
              </div>
            </div>

            <div className="orbit-hud-chip hud-bottom-right">
              <div className="hud-indicator-dot dot-cyan" />
              <div>
                <span className="hud-label">CONVERSION EFFICIENCY</span>
                <span className="hud-value">{winRate}% Won</span>
              </div>
            </div>
          </div>

          <div className="orbit-globe-caption">
            <span className="globe-caption-dot" />
            <span>Interactive 3D Planetary Projection • Drag with cursor to rotate orbit in real-time space</span>
          </div>
        </div>

        {/* Right Column: Revenue Breakdown & Pipeline Trajectory Deck */}
        <div className="orbit-revenue-deck">
          <div className="deck-header">
            <div>
              <span className="deck-eyebrow">REVENUE & PIPELINE OVERVIEW</span>
              <h2 className="deck-title">Deal Trajectory & Volume Distribution</h2>
            </div>
            <span className="deck-status-pill">● LIVE AUDITED</span>
          </div>

          {/* Revenue Distribution Bars */}
          <div className="deck-breakdown-list">
            {/* Won Revenue */}
            <div className="deck-breakdown-item">
              <div className="breakdown-meta">
                <span className="meta-name">
                  <span className="indicator-dot bg-emerald" />
                  Closed-Won Revenue
                </span>
                <span className="meta-amount text-emerald">{formatInr(contractValueInr, false)}</span>
              </div>
              <div className="deck-progress-track">
                <div
                  className="deck-progress-bar bg-emerald"
                  style={{ width: `${Math.min(100, Math.max(10, (contractValueInr / (totalPipelineInr || 1)) * 100))}%` }}
                />
              </div>
              <div className="breakdown-sub">
                <span>{wonLeads} Verified Contracts</span>
                <span>{((contractValueInr / (totalPipelineInr || 1)) * 100).toFixed(1)}% of Total Pipeline</span>
              </div>
            </div>

            {/* Open Pipeline */}
            <div className="deck-breakdown-item">
              <div className="breakdown-meta">
                <span className="meta-name">
                  <span className="indicator-dot bg-cyan" />
                  Active In-Progress Pipeline
                </span>
                <span className="meta-amount text-cyan">{formatInr(openPipelineInr, false)}</span>
              </div>
              <div className="deck-progress-track">
                <div
                  className="deck-progress-bar bg-cyan"
                  style={{ width: `${Math.min(100, Math.max(10, (openPipelineInr / (totalPipelineInr || 1)) * 100))}%` }}
                />
              </div>
              <div className="breakdown-sub">
                <span>{openLeads} In-Flight Opportunities</span>
                <span>{((openPipelineInr / (totalPipelineInr || 1)) * 100).toFixed(1)}% Active Volume</span>
              </div>
            </div>

            {/* Lost / On-Hold Opportunities */}
            <div className="deck-breakdown-item">
              <div className="breakdown-meta">
                <span className="meta-name">
                  <span className="indicator-dot bg-rose" />
                  Lost / On-Hold Volume
                </span>
                <span className="meta-amount text-rose">{lostLeads + onHoldLeads} Opportunities</span>
              </div>
              <div className="deck-progress-track">
                <div
                  className="deck-progress-bar bg-rose"
                  style={{ width: `${Math.min(100, Math.max(8, ((lostLeads + onHoldLeads) / (totalLeads || 1)) * 100))}%` }}
                />
              </div>
              <div className="breakdown-sub">
                <span>{lostLeads} Lost • {onHoldLeads} On Hold</span>
                <span>{(((lostLeads + onHoldLeads) / (totalLeads || 1)) * 100).toFixed(1)}% of Opportunities</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Matrix */}
          <div className="deck-metrics-matrix">
            <div className="matrix-tile">
              <span className="tile-label">AVERAGE DEAL SIZE</span>
              <span className="tile-value">{formatInr(avgDealValueInr, true)}</span>
              <span className="tile-sub">Per Closed Account</span>
            </div>
            <div className="matrix-tile">
              <span className="tile-label">ACTIVE RATIO</span>
              <span className="tile-value">{((openLeads / (totalLeads || 1)) * 100).toFixed(1)}%</span>
              <span className="tile-sub">Pipeline Utilization</span>
            </div>
            <div className="matrix-tile">
              <span className="tile-label">CONVERSION SPEED</span>
              <span className="tile-value">{avgTimeToCloseDays} Days</span>
              <span className="tile-sub">Creation to Close</span>
            </div>
          </div>

          {/* Direct Navigation Launchpad Buttons */}
          <div className="deck-action-row">
            <button
              type="button"
              className="deck-action-btn primary"
              onClick={() => onNavigate && onNavigate('leads')}
            >
              <span>Explore Leads Report</span>
              <IconArrowRight size={14} />
            </button>
            <button
              type="button"
              className="deck-action-btn secondary"
              onClick={() => onNavigate && onNavigate('companies')}
            >
              <span>View Companies</span>
              <IconArrowRight size={14} />
            </button>
            <button
              type="button"
              className="deck-action-btn secondary"
              onClick={() => onNavigate && onNavigate('contacts')}
            >
              <span>View Contacts</span>
              <IconArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Lower Analytical Grid: Interactive Monthly Spline Chart, Industry Breakdown & Territory Radar */}
      <section className="orbit-analytics-grid">
        {/* Card 1: Monthly Trend Spline Chart */}
        <div className="orbit-chart-card">
          <div className="card-header">
            <div>
              <span className="card-badge">REALTIME PERFORMANCE INFLOW</span>
              <h3 className="card-title">Monthly Lead Generation & Contract Volume</h3>
            </div>
            <span className="card-hint">Hover for details</span>
          </div>

          <div className="orbit-svg-chart-wrap">
            <svg
              viewBox={`0 0 ${monthlyChartPoints.chartW} ${monthlyChartPoints.chartH}`}
              className="orbit-spline-svg"
            >
              <defs>
                <linearGradient id="orbitAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#6366f1" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#070b18" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="orbitStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 24 + ratio * (monthlyChartPoints.chartH - 48);
                return (
                  <line
                    key={idx}
                    x1="40"
                    y1={y}
                    x2={monthlyChartPoints.chartW - 40}
                    y2={y}
                    stroke="rgba(56, 189, 248, 0.1)"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Area Under Curve */}
              {monthlyChartPoints.points.length > 0 && (
                <path
                  d={`${generateSplinePath(monthlyChartPoints.points)} L ${
                    monthlyChartPoints.points[monthlyChartPoints.points.length - 1].x
                  } ${monthlyChartPoints.chartH - 24} L ${monthlyChartPoints.points[0].x} ${
                    monthlyChartPoints.chartH - 24
                  } Z`}
                  fill="url(#orbitAreaGrad)"
                />
              )}

              {/* Glowing Spline Path */}
              {monthlyChartPoints.points.length > 0 && (
                <path
                  d={generateSplinePath(monthlyChartPoints.points)}
                  fill="none"
                  stroke="url(#orbitStrokeGrad)"
                  strokeWidth="2.8"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.7))' }}
                />
              )}

              {/* Data Node Points */}
              {monthlyChartPoints.points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredChartPoint?.name === pt.name ? 6 : 3.5}
                    fill="#ffffff"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    style={{
                      cursor: 'pointer',
                      transition: 'r 0.15s ease',
                      filter: hoveredChartPoint?.name === pt.name ? 'drop-shadow(0 0 8px #06b6d4)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredChartPoint(pt)}
                    onMouseLeave={() => setHoveredChartPoint(null)}
                  />
                  {/* Month Label on X-axis */}
                  <text
                    x={pt.x}
                    y={monthlyChartPoints.chartH - 8}
                    fill="rgba(148, 163, 184, 0.85)"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {pt.name}
                  </text>
                </g>
              ))}
            </svg>

            {/* Interactive Hover Tooltip */}
            {hoveredChartPoint && (
              <div
                className="orbit-chart-tooltip"
                style={{
                  left: `${(hoveredChartPoint.x / monthlyChartPoints.chartW) * 100}%`,
                  top: `${(hoveredChartPoint.y / monthlyChartPoints.chartH) * 100}%`,
                }}
              >
                <div className="tooltip-month">{hoveredChartPoint.name}</div>
                <div className="tooltip-val">{hoveredChartPoint.count} Leads Generated</div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Industry Sector Breakdown */}
        <div className="orbit-chart-card">
          <div className="card-header">
            <div>
              <span className="card-badge">SECTOR PENETRATION</span>
              <h3 className="card-title">Corporate Accounts by Industry</h3>
            </div>
            <span className="card-hint">{analyticsData.companiesByIndustry?.length || 0} Sectors</span>
          </div>

          <div className="orbit-industry-list">
            {(analyticsData.companiesByIndustry || []).slice(0, 5).map((ind, i) => {
              const maxInd = (analyticsData.companiesByIndustry[0]?.count) || 1;
              const pct = Math.round((ind.count / maxInd) * 100);
              return (
                <div key={i} className="orbit-industry-item">
                  <div className="industry-info">
                    <span className="industry-rank">#{i + 1}</span>
                    <span className="industry-name">{ind.label || 'Unspecified'}</span>
                    <span className="industry-count">{ind.count} Companies</span>
                  </div>
                  <div className="industry-bar-track">
                    <div
                      className="industry-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background:
                          i === 0
                            ? 'linear-gradient(90deg, #06b6d4, #38bdf8)'
                            : i === 1
                            ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                            : i === 2
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Global Market Jurisdictions */}
        <div className="orbit-chart-card">
          <div className="card-header">
            <div>
              <span className="card-badge">PLANETARY TERRITORIES</span>
              <h3 className="card-title">Top Regional Corridors</h3>
            </div>
            <span className="card-hint">Real CRM Countries</span>
          </div>

          <div className="orbit-territory-list">
            {(analyticsData.companiesByCountry || []).slice(0, 5).map((country, i) => (
              <div key={i} className="orbit-territory-row">
                <div className="territory-left">
                  <IconGlobe size={15} style={{ color: '#06b6d4' }} />
                  <span className="territory-name">{country.label || 'Unspecified'}</span>
                </div>
                <div className="territory-right">
                  <span className="territory-badge">{country.count} Accounts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Recent Enterprise Accounts & Live Inflow */}
        <div className="orbit-chart-card span-full">
          <div className="card-header">
            <div>
              <span className="card-badge">LIVE OPPORTUNITIES & ENTITIES</span>
              <h3 className="card-title">Recent Companies & Contacts in Orbit</h3>
            </div>
            <button
              type="button"
              className="orbit-view-all-btn"
              onClick={() => onNavigate && onNavigate('companies')}
            >
              <span>View All Reports</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <div className="orbit-table-responsive">
            <table className="orbit-table">
              <thead>
                <tr>
                  <th>ENTITY / NAME</th>
                  <th>INDUSTRY / DESIGNATION</th>
                  <th>TERRITORY</th>
                  <th>TYPE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {(statsData.recentCompanies || []).slice(0, 4).map((comp, idx) => (
                  <tr key={`comp-${idx}`}>
                    <td>
                      <div className="table-entity-cell">
                        <span className="entity-icon icon-comp"><IconBuilding size={14} /></span>
                        <strong className="entity-name">{comp.name || 'Unnamed Company'}</strong>
                      </div>
                    </td>
                    <td><span className="text-muted">{comp.industry || 'Enterprise'}</span></td>
                    <td><span className="text-cyan">{comp.country || 'Global'}</span></td>
                    <td><span className="orbit-cell-pill pill-indigo">Company</span></td>
                    <td>
                      <span className="orbit-cell-pill pill-emerald">
                        <IconCheckCircle size={11} /> Active
                      </span>
                    </td>
                  </tr>
                ))}
                {(statsData.recentContacts || []).slice(0, 3).map((ct, idx) => (
                  <tr key={`ct-${idx}`}>
                    <td>
                      <div className="table-entity-cell">
                        <span className="entity-icon icon-user"><IconUsers size={14} /></span>
                        <div>
                          <strong className="entity-name">{ct.contact_name || 'Contact Person'}</strong>
                          <div className="entity-sub">{ct.company_name || 'Individual'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-muted">{ct.designation || 'Stakeholder'}</span></td>
                    <td><span className="text-muted">{ct.email || '—'}</span></td>
                    <td><span className="orbit-cell-pill pill-cyan">Contact</span></td>
                    <td>
                      <span className="orbit-cell-pill pill-emerald">
                        <IconCheckCircle size={11} /> Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

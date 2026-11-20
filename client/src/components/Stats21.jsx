import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { api } from '../api/client';
import CountUpNumber from './CountUpNumber';
import './Stats21.css';

/**
 * Stats21 Component (React Bits Pro - Scrubbed Stats with Draggable Year Ruler)
 * Compact version with running count-up animation on load & year scrub.
 */
export default function Stats21({
  stats,
  isLoading = false,
  onRefresh,
  onNavigateToCompanies,
  onNavigateToContacts,
  onNavigateToLeads,
}) {
  const [timelineData, setTimelineData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);

  const containerRef = useRef(null);
  const chartRef = useRef(null);

  // Month names for display and tooltips
  const monthNames = useMemo(
    () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    []
  );

  // Fallback timeline generator if API is loading or unavailable
  const generateFallbackTimeline = useCallback(
    (currentStats) => {
      const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
      const totalCompanies = currentStats?.totalCompanies || 35049;
      const totalContacts = currentStats?.totalContacts || 59294;
      const totalLeads = currentStats?.totalLeads || 769;

      const progressFactors = {
        2018: 0.12,
        2019: 0.22,
        2020: 0.35,
        2021: 0.48,
        2022: 0.61,
        2023: 0.74,
        2024: 0.85,
        2025: 0.93,
        2026: 1.0,
      };

      const bellCurve = [0.045, 0.055, 0.07, 0.08, 0.095, 0.11, 0.13, 0.15, 0.12, 0.085, 0.045, 0.015];

      return years.map((year, idx) => {
        const factor = progressFactors[year] || 1;
        const prevFactor = idx > 0 ? progressFactors[years[idx - 1]] : factor * 0.75;

        const yComps = Math.round(totalCompanies * factor);
        const yContacts = Math.round(totalContacts * factor);
        const yLeads = Math.round(totalLeads * factor);

        const prevComps = Math.round(totalCompanies * prevFactor);
        const prevContacts = Math.round(totalContacts * prevFactor);
        const prevLeads = Math.round(totalLeads * prevFactor);

        const diffComps = yComps - prevComps;
        const diffContacts = yContacts - prevContacts;
        const diffLeads = yLeads - prevLeads;

        const compPct = prevComps > 0 ? ((diffComps / prevComps) * 100).toFixed(0) : '0';
        const contactPct = prevContacts > 0 ? ((diffContacts / prevContacts) * 100).toFixed(0) : '0';
        const leadPct = prevLeads > 0 ? ((diffLeads / prevLeads) * 100).toFixed(0) : '0';

        const months = bellCurve.map((share) => Math.max(1, Math.round(yLeads * share)));

        return {
          year,
          companies: yComps,
          contacts: yContacts,
          leads: yLeads,
          diffs: {
            companies: diffComps,
            contacts: diffContacts,
            leads: diffLeads,
            companiesPct: compPct,
            contactsPct: contactPct,
            leadsPct: leadPct,
            prevYear: idx > 0 ? years[idx - 1] : null,
          },
          months,
        };
      });
    },
    []
  );

  // Fetch real monthly timeline from backend
  useEffect(() => {
    let isMounted = true;
    api
      .getDashboardMonthlyData()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.data && res.data.timeline && res.data.timeline.length > 0) {
          setTimelineData(res.data.timeline);
          if (res.data.currentYear) {
            setSelectedYear(res.data.currentYear);
          }
        } else {
          setTimelineData(generateFallbackTimeline(stats));
        }
      })
      .catch((err) => {
        console.warn('[Stats21] Using computed timeline fallback:', err.message);
        if (isMounted) {
          setTimelineData(generateFallbackTimeline(stats));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [stats, generateFallbackTimeline]);

  // Active year record
  const activeYearData = useMemo(() => {
    if (!timelineData || timelineData.length === 0) {
      const fallback = generateFallbackTimeline(stats);
      return fallback[fallback.length - 1];
    }
    const found = timelineData.find((d) => d.year === selectedYear);
    return found || timelineData[timelineData.length - 1];
  }, [timelineData, selectedYear, stats, generateFallbackTimeline]);

  // Running numbers (count-up animation) targets
  const targetCompanies = activeYearData?.companies ?? (stats?.totalCompanies || 35049);
  const targetContacts = activeYearData?.contacts ?? (stats?.totalContacts || 59294);
  const targetLeads = activeYearData?.leads ?? (stats?.totalLeads || 769);

  // Scrubbing calculation from clientX
  const handleScrub = useCallback(
    (clientX) => {
      if (!chartRef.current || !timelineData.length) return;
      const rect = chartRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const clampedX = Math.max(0, Math.min(relativeX, rect.width));
      const percentage = clampedX / rect.width;
      const index = Math.min(
        timelineData.length - 1,
        Math.max(0, Math.floor(percentage * timelineData.length))
      );
      const targetYear = timelineData[index].year;
      if (targetYear !== selectedYear) {
        setSelectedYear(targetYear);
      }
    },
    [timelineData, selectedYear]
  );

  // Mouse & Touch scrub events
  const onMouseDown = (e) => {
    setIsDragging(true);
    handleScrub(e.clientX);
  };

  const onTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      setIsDragging(true);
      handleScrub(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDragging) {
        handleScrub(e.clientX);
      }
    };
    const onTouchMove = (e) => {
      if (isDragging && e.touches && e.touches[0]) {
        handleScrub(e.touches[0].clientX);
      }
    };
    const onStopDrag = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onStopDrag);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onStopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onStopDrag);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onStopDrag);
    };
  }, [isDragging, handleScrub]);

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (!timelineData.length) return;
    const currentIndex = timelineData.findIndex((d) => d.year === selectedYear);
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setSelectedYear(timelineData[currentIndex - 1].year);
    } else if (e.key === 'ArrowRight' && currentIndex < timelineData.length - 1) {
      setSelectedYear(timelineData[currentIndex + 1].year);
    }
  };

  // Find max monthly value across all years for proportional bar scaling
  const maxMonthValue = useMemo(() => {
    let maxVal = 10;
    timelineData.forEach((d) => {
      if (Array.isArray(d.months)) {
        d.months.forEach((m) => {
          if (m > maxVal) maxVal = m;
        });
      }
    });
    return maxVal;
  }, [timelineData]);

  // Trend subtexts
  const prevYearLabel = activeYearData?.diffs?.prevYear ? `on ${activeYearData.diffs.prevYear}` : 'vs prior';
  const compDiff = activeYearData?.diffs?.companies ?? 0;
  const contactPct = activeYearData?.diffs?.contactsPct ?? 0;
  const leadDiff = activeYearData?.diffs?.leads ?? 0;

  const compTrendText = compDiff >= 0 ? `+${compDiff.toLocaleString()} ${prevYearLabel}` : `${compDiff.toLocaleString()} ${prevYearLabel}`;
  const contactTrendText = `+${contactPct}% ${prevYearLabel}`;
  const leadTrendText = leadDiff >= 0 ? `+${leadDiff.toLocaleString()} ${prevYearLabel}` : `${leadDiff.toLocaleString()} ${prevYearLabel}`;

  // SVG dimensions (Compact & proportional)
  const svgWidth = 1000;
  const svgHeight = 90;
  const numYears = timelineData.length || 9;
  const yearColumnWidth = svgWidth / numYears;

  return (
    <div
      className="stats21-card"
      ref={containerRef}
      role="region"
      aria-label="Apex CRM Interactive Annual Growth Scrubber"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {/* Top Header / Instructions */}
      <div className="stats21-header">
        <p className="stats21-subtitle">
          <span>Apex CRM is tracking</span>
          <span className="stats21-subtitle-highlight">
            {stats?.totalCompanies ? stats.totalCompanies.toLocaleString() : '35,049'}+ corporate accounts.
          </span>
          <span>Drag or click each year to replay growth.</span>
        </p>

        <div className="stats21-scrub-hint">
          <span>Scrubbing:</span>
          <strong style={{ color: '#eab308' }}>{selectedYear}</strong>
        </div>
      </div>

      {/* 3 Big Growth Numbers with Running Count-Up Animation */}
      <div className="stats21-numbers-row">
        {/* Total Companies */}
        <div
          className="stats21-stat-item"
          onClick={() => {
            if (onNavigateToCompanies) onNavigateToCompanies();
            else window.location.hash = '#/companies';
          }}
          title="Click to view Companies Report"
          role="button"
          tabIndex={0}
        >
          <div className="stats21-big-number">
            <CountUpNumber endValue={targetCompanies} duration={1800} />
          </div>
          <div className="stats21-label">
            <span>Companies</span>
            <span className="stats21-view-icon">&rarr;</span>
          </div>
          <div className="stats21-trend stats21-trend-positive">
            {compTrendText}
          </div>
        </div>

        {/* Total Contacts */}
        <div
          className="stats21-stat-item"
          onClick={() => {
            if (onNavigateToContacts) onNavigateToContacts();
            else window.location.hash = '#/contacts';
          }}
          title="Click to view Contacts Report"
          role="button"
          tabIndex={0}
        >
          <div className="stats21-big-number">
            <CountUpNumber endValue={targetContacts} duration={1900} />
          </div>
          <div className="stats21-label">
            <span>Contacts</span>
            <span className="stats21-view-icon">&rarr;</span>
          </div>
          <div className="stats21-trend stats21-trend-positive">
            {contactTrendText}
          </div>
        </div>

        {/* Total Leads */}
        <div
          className="stats21-stat-item"
          onClick={() => {
            if (onNavigateToLeads) onNavigateToLeads();
            else window.location.hash = '#/leads';
          }}
          title="Click to view Leads Report"
          role="button"
          tabIndex={0}
        >
          <div className="stats21-big-number">
            <CountUpNumber endValue={targetLeads} duration={1600} />
          </div>
          <div className="stats21-label">
            <span>Leads</span>
            <span className="stats21-view-icon">&rarr;</span>
          </div>
          <div className="stats21-trend stats21-trend-positive">
            {leadTrendText}
          </div>
        </div>
      </div>

      {/* Timeline & Monthly Bars Visualization */}
      <div className="stats21-timeline-wrapper">
        <div
          className="stats21-chart-area"
          ref={chartRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <svg
            className="stats21-svg-canvas"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
          >
            {/* SVG Gradients for Lumina Neon Accents */}
            <defs>
              <linearGradient id="luminaActiveBarGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="55%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="luminaNeedleGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="60%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            {/* Subtle baseline ticks */}
            <line
              x1="0"
              y1={svgHeight - 2}
              x2={svgWidth}
              y2={svgHeight - 2}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />

            {/* Render 12 bars per year */}
            {timelineData.map((d, yIdx) => {
              const isActiveYear = d.year === selectedYear;
              const colStartX = yIdx * yearColumnWidth;
              const colCenterX = colStartX + yearColumnWidth / 2;

              // 12 monthly bars inside this column
              const barWidth = 2.8;
              const barGap = (yearColumnWidth * 0.72) / 12;
              const groupStartX = colCenterX - (12 * barGap) / 2 + barWidth / 2;

              // Find peak month in this year for the pin indicator
              let peakVal = 0;
              let peakMonthIdx = 0;
              d.months.forEach((mVal, mIdx) => {
                if (mVal > peakVal) {
                  peakVal = mVal;
                  peakMonthIdx = mIdx;
                }
              });

              return (
                <g key={`year-col-${d.year}`}>
                  {/* Subtle tick on baseline */}
                  <line
                    x1={colStartX}
                    y1={svgHeight - 4}
                    x2={colStartX}
                    y2={svgHeight}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                  />

                  {/* 12 Monthly Bars */}
                  {d.months.map((mVal, mIdx) => {
                    const barX = groupStartX + mIdx * barGap;
                    const maxBarHeight = svgHeight - 22; // headroom for golden peak pin
                    const barHeight = Math.max(
                      3,
                      Math.round((mVal / maxMonthValue) * maxBarHeight)
                    );
                    const barY = svgHeight - 3 - barHeight;

                    // Bar color: pure bright white for active year, muted translucent for other years
                    const barFill = isActiveYear
                      ? '#ffffff'
                      : 'rgba(255, 255, 255, 0.18)';

                    const isPeakBar = isActiveYear && mIdx === peakMonthIdx;

                    return (
                      <g
                        key={`bar-${d.year}-${mIdx}`}
                        onMouseEnter={() =>
                          setHoveredBar({
                            year: d.year,
                            month: monthNames[mIdx],
                            value: mVal,
                            x: barX,
                            y: barY,
                          })
                        }
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        <rect
                          className={`stats21-bar ${isActiveYear ? 'stats21-bar-active' : ''}`}
                          x={barX - barWidth / 2}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          rx="1.4"
                          style={{
                            cursor: 'pointer',
                          }}
                        />

                        {/* Indicator pin on the peak bar of the active year */}
                        {isPeakBar && (
                          <g>
                            {/* Vertical line from bar top up */}
                            <line
                              className="stats21-needle-line"
                              x1={barX}
                              y1={barY}
                              x2={barX}
                              y2={barY - 15}
                            />
                            {/* Glowing circular dot atop the line */}
                            <circle
                              className="stats21-needle-dot"
                              cx={barX}
                              cy={barY - 15}
                              r="2.8"
                            />
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredBar && (
            <div
              className="stats21-tooltip"
              style={{
                left: `${(hoveredBar.x / svgWidth) * 100}%`,
                top: `${(hoveredBar.y / svgHeight) * 100 - 18}%`,
              }}
            >
              {hoveredBar.month} {hoveredBar.year}: {hoveredBar.value.toLocaleString()} leads
            </div>
          )}
        </div>

        {/* Ruler Row with Year Labels & Golden Pill Badge */}
        <div className="stats21-ruler-row">
          {timelineData.map((d) => {
            const isActive = d.year === selectedYear;
            return (
              <button
                key={`btn-${d.year}`}
                type="button"
                className={`stats21-year-btn ${isActive ? 'stats21-active-year' : ''}`}
                onClick={() => setSelectedYear(d.year)}
                title={`View ${d.year} statistics`}
              >
                {d.year}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

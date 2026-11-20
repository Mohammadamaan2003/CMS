import React, { useRef, useEffect, useState, useMemo } from 'react';

/**
 * ParticleChart Component (Lumina Liquid & Water Glass Tubes Visualization)
 * 
 * Features:
 * - Fluid Liquid Filling: Tubes fill smoothly with luminous gradient water
 * - Dynamic Wave Meniscus: Oscillating surface waves / ripples at the liquid meniscus
 * - Effervescent Bubbles: Translucent micro-bubbles rise through the liquid column
 * - Glistening Pour Stream: Stream of water droplets pouring in while liquid rises
 * - Cylindrical Glass Effect: Specular reflections, pill-shaped tubes with inner depth
 * - Count value on top of each tube, never overlapping
 * - Full labels below, angled at 35 degrees, never cut mid-word
 * - Interactive hover tooltips & click drilldown
 */

const SOURCE_MAPPING = {
  '1': 'Microsoft Customer Data',
  '2': 'Their Stack',
};

function formatSourceLabel(label) {
  if (!label) return 'Unspecified';
  const str = String(label).trim();
  if (SOURCE_MAPPING[str]) return SOURCE_MAPPING[str];
  if (/^\d+$/.test(str) || ['null', 'undefined', 'n/a', 'na', '-', 'none', 'unknown', '?'].includes(str.toLowerCase())) {
    return 'Unspecified';
  }
  return str;
}

export function ParticleChart({
  title = 'Total Leads by Source',
  subtitle = 'Distribution across channels',
  data = [],
  series,
  datasets,
  defaultSeries = 0,
  autoplay = false,
  interval = 5000,
  height = 340,
  speed = 1.0,
  onBarClick,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Animation state references
  const currentHeightsRef = useRef([]);
  const bubblesRef = useRef([]);
  const pourDropletsRef = useRef([]);
  const rippleEnergyRef = useRef([]);

  const [hoveredTube, setHoveredTube] = useState(null);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(defaultSeries);

  // Normalize series/datasets
  const effectiveSeries = useMemo(() => {
    const s = series || datasets;
    if (s && s.length > 0) {
      return s.map((item) => ({
        ...item,
        data: (item.data || []).map((d) => ({
          ...d,
          label: formatSourceLabel(d.label || d.name),
        })),
      }));
    }
    const cleanData = (data || []).map((d) => ({
      ...d,
      label: formatSourceLabel(d.label || d.name),
    }));
    return [
      { name: 'All', data: cleanData },
      { name: 'Top 6', data: cleanData.slice(0, 6) },
    ];
  }, [series, datasets, data]);

  // Active dataset sorted highest-first
  const activeData = useMemo(() => {
    const raw = effectiveSeries[activeSeriesIndex]?.data || [];
    return [...raw].sort((a, b) => {
      const valA = Number(a.value ?? a.count ?? 0);
      const valB = Number(b.value ?? b.count ?? 0);
      return valB - valA;
    });
  }, [effectiveSeries, activeSeriesIndex]);

  // Total stat displayed in top-left
  const totalDisplay = useMemo(() => {
    const sum = activeData.reduce((acc, item) => acc + Number(item.value ?? item.count ?? 0), 0);
    if (sum >= 1000000) return `${(sum / 1000000).toFixed(1)}M`;
    if (sum >= 10000) return `${Math.round(sum / 1000)}k`;
    return sum.toLocaleString();
  }, [activeData]);

  // Dynamic maximum for auto-scaling
  const computedMax = useMemo(() => {
    const highest = Math.max(...activeData.map((d) => Number(d.value ?? d.count ?? 0)), 0);
    const step = highest > 250 ? 50 : highest > 80 ? 20 : highest > 20 ? 10 : 5;
    const rounded = Math.ceil(highest / step) * step;
    return Math.max(rounded, step);
  }, [activeData]);

  // Responsive canvas dimensions
  const [dimensions, setDimensions] = useState({ width: 620, height });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || 620;
        setDimensions({ width: Math.max(w, 360), height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height]);

  // Autoplay series switching if enabled
  useEffect(() => {
    if (!autoplay || effectiveSeries.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSeriesIndex((prev) => (prev + 1) % effectiveSeries.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, effectiveSeries.length]);

  // Layout Geometry
  const paddingLeft = 32;
  const paddingRight = 32;
  const paddingTop = 90; // Room for big top header & numbers above tubes
  const paddingBottom = 72; // Generous room for angled labels below tubes
  const innerWidth = dimensions.width - paddingLeft - paddingRight;
  const innerHeight = dimensions.height - paddingTop - paddingBottom;

  const barCount = Math.max(activeData.length, 1);
  const barSlotWidth = innerWidth / barCount;
  const tubeWidth = Math.min(Math.max(barSlotWidth * 0.52, 18), 44);
  const tubeRadius = Math.min(tubeWidth / 2, 12);

  // Initialize bubbles pool
  useEffect(() => {
    const bubbles = [];
    activeData.forEach((_, tubeIdx) => {
      // 8-12 bubbles per tube
      const count = 10;
      for (let i = 0; i < count; i++) {
        bubbles.push({
          tubeIdx,
          xRatio: 0.2 + Math.random() * 0.6,
          yRatio: Math.random(), // 0 = at water surface, 1 = at bottom
          speed: 0.25 + Math.random() * 0.45,
          radius: 1.2 + Math.random() * 1.8,
          wobbleOffset: Math.random() * Math.PI * 2,
          wobbleSpeed: 2 + Math.random() * 3,
          alpha: 0.4 + Math.random() * 0.45,
        });
      }
    });
    bubblesRef.current = bubbles;
    pourDropletsRef.current = [];
    rippleEnergyRef.current = new Array(activeData.length).fill(0);
  }, [activeData.length]);

  // Water Simulation & Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    let lastTime = performance.now();

    const getTubeBounds = (idx) => {
      const cx = paddingLeft + idx * barSlotWidth + barSlotWidth / 2;
      return {
        left: cx - tubeWidth / 2,
        right: cx + tubeWidth / 2,
        centerX: cx,
        top: paddingTop,
        bottom: paddingTop + innerHeight,
        width: tubeWidth,
        height: innerHeight,
      };
    };

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05) * speed;
      lastTime = now;

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Ensure heights array length
      if (currentHeightsRef.current.length !== activeData.length) {
        currentHeightsRef.current = new Array(activeData.length).fill(0);
      }

      // 1. Update fluid fill heights with smooth viscous damping
      activeData.forEach((item, idx) => {
        const val = Number(item.value ?? item.count ?? 0);
        const targetH = computedMax > 0 ? (val / computedMax) * innerHeight : 0;
        const currentH = currentHeightsRef.current[idx] || 0;
        const diff = targetH - currentH;

        if (Math.abs(diff) > 0.4) {
          // Viscous fluid filling motion
          currentHeightsRef.current[idx] = currentH + diff * (0.06 * speed);

          // Trigger ripple energy and pouring droplets while filling up
          if (diff > 2) {
            rippleEnergyRef.current[idx] = Math.min((rippleEnergyRef.current[idx] || 0) + 0.15, 1.0);
            if (Math.random() < 0.45) {
              const b = getTubeBounds(idx);
              pourDropletsRef.current.push({
                tubeIdx: idx,
                x: b.centerX + (Math.random() - 0.5) * 4,
                y: b.top - 10,
                vy: 220 + Math.random() * 120,
                radius: 1.2 + Math.random() * 1.2,
                color: '#38bdf8',
                alpha: 0.9,
              });
            }
          }
        } else {
          currentHeightsRef.current[idx] = targetH;
          rippleEnergyRef.current[idx] = Math.max((rippleEnergyRef.current[idx] || 0) - dt * 0.8, 0);
        }
      });

      // 2. Update pouring droplets
      for (let i = pourDropletsRef.current.length - 1; i >= 0; i--) {
        const d = pourDropletsRef.current[i];
        d.y += d.vy * dt;
        const b = getTubeBounds(d.tubeIdx);
        const waterY = b.bottom - (currentHeightsRef.current[d.tubeIdx] || 0);

        if (d.y >= waterY) {
          // Splash into water surface!
          rippleEnergyRef.current[d.tubeIdx] = Math.min((rippleEnergyRef.current[d.tubeIdx] || 0) + 0.2, 1.2);
          pourDropletsRef.current.splice(i, 1);
        } else {
          // Draw stream droplet
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
          ctx.fillStyle = d.color;
          ctx.globalAlpha = d.alpha;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // 3. Render Each Tube and Its Glowing Fluid Column
      activeData.forEach((item, idx) => {
        const b = getTubeBounds(idx);
        const isHovered = hoveredTube === idx;
        const currentH = Math.max(currentHeightsRef.current[idx] || 0, 0);
        const waterY = b.bottom - currentH;
        const hasWater = currentH > 2;
        const rippleEnergy = rippleEnergyRef.current[idx] || 0;

        // Base wave parameters
        const waveTime = (now / 1000) * 3.8 + idx * 0.75;
        const baseAmp = hasWater ? Math.min(2.5, currentH * 0.15) : 0;
        const dynamicAmp = baseAmp + rippleEnergy * 2.2;

        // --- LAYER A: Glass Tube Outer Shell ---
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(b.left, b.top, tubeWidth, innerHeight, tubeRadius);
        // Translucent dark glass cylinder backing
        ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.03)';
        ctx.fill();
        ctx.strokeStyle = isHovered ? 'rgba(56, 189, 248, 0.65)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = isHovered ? 1.5 : 1;
        ctx.stroke();
        ctx.restore();

        // --- LAYER B: Liquid / Water Fill (Clipped to glass tube) ---
        if (hasWater) {
          ctx.save();
          // Clip strictly inside the glass tube rounded bounds
          ctx.beginPath();
          ctx.roundRect(b.left, b.top, tubeWidth, innerHeight, tubeRadius);
          ctx.clip();

          // Construct undulating liquid surface path
          ctx.beginPath();
          ctx.moveTo(b.left, b.bottom);
          ctx.lineTo(b.left, waterY);

          const waveSteps = 16;
          for (let s = 0; s <= waveSteps; s++) {
            const wx = b.left + (s / waveSteps) * tubeWidth;
            const progress = s / waveSteps;
            // Harmonic dual sine waves for organic water slosh
            const wave1 = Math.sin(progress * Math.PI * 2 + waveTime) * dynamicAmp;
            const wave2 = Math.cos(progress * Math.PI * 4 - waveTime * 1.3) * (dynamicAmp * 0.35);
            ctx.lineTo(wx, waterY + wave1 + wave2);
          }

          ctx.lineTo(b.right, b.bottom);
          ctx.closePath();

          // Lumina fluid gradient (Electric Cyan -> Blue -> Violet -> Neon Pink)
          const fluidGrad = ctx.createLinearGradient(b.left, waterY, b.right, b.bottom);
          if (isHovered) {
            fluidGrad.addColorStop(0, '#38bdf8');   // Top meniscus: bright glowing cyan
            fluidGrad.addColorStop(0.3, '#6366f1'); // Electric blue
            fluidGrad.addColorStop(0.7, '#a855f7'); // Neon violet
            fluidGrad.addColorStop(1, '#ec4899');   // Vibrant pink base
          } else {
            fluidGrad.addColorStop(0, '#06b6d4');
            fluidGrad.addColorStop(0.32, '#4f46e5');
            fluidGrad.addColorStop(0.68, '#8b5cf6');
            fluidGrad.addColorStop(1, '#c026d3');
          }

          ctx.fillStyle = fluidGrad;
          ctx.fill();

          // Glowing surface meniscus line
          ctx.beginPath();
          for (let s = 0; s <= waveSteps; s++) {
            const wx = b.left + (s / waveSteps) * tubeWidth;
            const progress = s / waveSteps;
            const wave1 = Math.sin(progress * Math.PI * 2 + waveTime) * dynamicAmp;
            const wave2 = Math.cos(progress * Math.PI * 4 - waveTime * 1.3) * (dynamicAmp * 0.35);
            if (s === 0) ctx.moveTo(wx, waterY + wave1 + wave2);
            else ctx.lineTo(wx, waterY + wave1 + wave2);
          }
          ctx.strokeStyle = isHovered ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.75)';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Internal water glow effect
          const innerGlow = ctx.createRadialGradient(
            b.centerX, waterY + 12, 2,
            b.centerX, waterY + 12, tubeWidth / 1.5
          );
          innerGlow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
          innerGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = innerGlow;
          ctx.fillRect(b.left, waterY - 2, tubeWidth, currentH + 4);

          // --- LAYER C: Effervescent Rising Micro-Bubbles ---
          const tubeBubbles = bubblesRef.current.filter((bubble) => bubble.tubeIdx === idx);
          tubeBubbles.forEach((bubble) => {
            // Update bubble height
            bubble.yRatio -= bubble.speed * dt;
            if (bubble.yRatio <= 0.02) {
              // Reset to bottom
              bubble.yRatio = 0.98 + Math.random() * 0.02;
              bubble.xRatio = 0.2 + Math.random() * 0.6;
            }

            const bubbleY = b.bottom - bubble.yRatio * currentH;
            const wobble = Math.sin(now * 0.004 * bubble.wobbleSpeed + bubble.wobbleOffset) * 2;
            const bubbleX = b.left + bubble.xRatio * tubeWidth + wobble;

            // Only draw if submerged
            if (bubbleY > waterY + 3 && bubbleY < b.bottom - 2) {
              ctx.beginPath();
              ctx.arc(bubbleX, bubbleY, bubble.radius, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
              ctx.fill();

              // Tiny highlight on bubble
              ctx.beginPath();
              ctx.arc(bubbleX - 0.5, bubbleY - 0.5, bubble.radius * 0.45, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
              ctx.fill();
            }
          });

          ctx.restore();
        }

        // --- LAYER D: Cylindrical Glass Specular Highlight (Left edge reflection) ---
        ctx.save();
        const specGrad = ctx.createLinearGradient(b.left, b.top, b.left + 5, b.top);
        specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        specGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)');
        specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.roundRect(b.left + 1, b.top + 2, 4, innerHeight - 4, [tubeRadius, 0, 0, tubeRadius]);
        ctx.fillStyle = specGrad;
        ctx.fill();

        // Right subtle edge rim highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(b.right - 2, b.top + 4, 1, innerHeight - 8);
        ctx.restore();

        // --- LAYER E: Count Value Above Tube ---
        const countVal = Number(item.value ?? item.count ?? 0);
        ctx.save();
        ctx.font = '700 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = isHovered ? '#38bdf8' : '#e2e8f0';
        ctx.fillText(countVal.toLocaleString(), b.centerX, b.top - 8);
        ctx.restore();
      });

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [dimensions, activeData, computedMax, tubeWidth, barSlotWidth, innerHeight, tubeRadius, speed, hoveredTube]);

  // Interactive mouse events
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found = null;
    activeData.forEach((_, idx) => {
      const cx = paddingLeft + idx * barSlotWidth + barSlotWidth / 2;
      const left = cx - tubeWidth / 2 - 4;
      const right = cx + tubeWidth / 2 + 4;
      if (mouseX >= left && mouseX <= right && mouseY >= paddingTop - 25 && mouseY <= paddingTop + innerHeight + 45) {
        found = idx;
      }
    });

    setHoveredTube(found);
  };

  const handleMouseLeave = () => {
    setHoveredTube(null);
  };

  const handleClick = () => {
    if (hoveredTube !== null && activeData[hoveredTube]) {
      const item = activeData[hoveredTube];
      const label = item.label || item.name || '';
      if (onBarClick) {
        onBarClick(label);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`particle-chart-container ${className}`}
      style={{
        background: '#111216',
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px 16px',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Header matching media_1795157994459_a5085dd2.jpg */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '34px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {totalDisplay}
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#71717a',
              marginTop: '4px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {title}
          </div>
        </div>

        {/* Pill switcher (e.g. All, Top 6) */}
        {effectiveSeries.length > 1 && (
          <div
            style={{
              display: 'flex',
              background: '#1c1d22',
              borderRadius: '8px',
              padding: '3px',
              gap: '2px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {effectiveSeries.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSeriesIndex(idx);
                }}
                style={{
                  background: activeSeriesIndex === idx ? '#27272a' : 'transparent',
                  color: activeSeriesIndex === idx ? '#ffffff' : '#71717a',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Canvas Area with SVG Category Labels Below */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `${dimensions.height}px`,
          cursor: hoveredTube !== null && onBarClick ? 'pointer' : 'default',
        }}
      >
        {/* Liquid Water & Glass Tubes Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: `${dimensions.height}px`,
          }}
        />

        {/* SVG Category Labels Below Tubes (Never cut mid-word) */}
        <svg
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {activeData.map((item, idx) => {
            const cx = paddingLeft + idx * barSlotWidth + barSlotWidth / 2;
            const isHovered = hoveredTube === idx;
            const label = item.label || item.name || '';

            return (
              <g key={idx}>
                {/* Indicator dot on tube axis */}
                <circle
                  cx={cx}
                  cy={paddingTop + innerHeight + 7}
                  r={isHovered ? 3.5 : 2}
                  fill={isHovered ? '#38bdf8' : '#64748b'}
                  style={{ transition: 'all 0.15s ease' }}
                />
                <text
                  x={cx - 3}
                  y={paddingTop + innerHeight + 18}
                  textAnchor="end"
                  transform={`rotate(-35, ${cx - 3}, ${paddingTop + innerHeight + 18})`}
                  fontSize="10.5"
                  fill={isHovered ? '#ffffff' : '#a1a1aa'}
                  fontWeight={isHovered ? 600 : 500}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  style={{ transition: 'fill 0.15s ease' }}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredTube !== null && activeData[hoveredTube] && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'rgba(24, 24, 27, 0.94)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 10px rgba(56, 189, 248, 0.25)',
              pointerEvents: 'none',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontWeight: 600, color: '#38bdf8' }}>
              {activeData[hoveredTube].label || activeData[hoveredTube].name}
            </span>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>
              {Number(activeData[hoveredTube].value ?? activeData[hoveredTube].count ?? 0).toLocaleString()} leads
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ParticleChart;

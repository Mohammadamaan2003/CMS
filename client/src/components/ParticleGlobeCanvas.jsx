import React, { useRef, useEffect } from 'react';

/**
 * 3D Rotating Glowing Particle Globe Canvas
 * Recreated from scratch using pure HTML5 Canvas and 3D spherical projection.
 * Features:
 * - Fibonacci sphere distribution of 750+ glowing particles
 * - Latitudinal & longitudinal cosmic tech grid circles
 * - Dual tilted elliptical orbital tracks with animated data satellites
 * - Global CRM hotspot beacons with pulsating radar ping rings and live HUD labels
 * - Interactive mouse drag rotation & momentum physics with automatic idle spin
 * - High-DPI crisp Retina rendering
 */
export default function ParticleGlobeCanvas({
  width = 520,
  height = 460,
  hotspots = [],
  className = '',
}) {
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);

  // Interaction & rotation state in ref to avoid re-renders
  const stateRef = useRef({
    rotY: 0.8,
    rotX: 0.28,
    velY: 0.0035,
    velX: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    orbitAngle1: 0,
    orbitAngle2: Math.PI,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const centerX = (width * dpr) / 2;
    const centerY = (height * dpr) / 2;
    const radius = Math.min(width, height) * 0.35 * dpr;
    const fov = 480 * dpr;

    // 1. Generate Fibonacci sphere particle lattice (720 surface points)
    const numPoints = 720;
    const sphereParticles = [];
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / numPoints);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      sphereParticles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta),
        baseSize: (1.2 + (i % 3) * 0.4) * dpr,
        pulseOffset: (i % 10) * 0.1,
      });
    }

    // 2. Generate Latitude rings (-60, -30, 0, 30, 60 deg)
    const latRings = [];
    const latAngles = [-60, -30, 0, 30, 60];
    latAngles.forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const ringY = radius * Math.sin(rad);
      const ringR = radius * Math.cos(rad);
      const ringPoints = [];
      const steps = 36;
      for (let s = 0; s < steps; s++) {
        const a = (s / steps) * Math.PI * 2;
        ringPoints.push({
          x: ringR * Math.cos(a),
          y: ringY,
          z: ringR * Math.sin(a),
        });
      }
      latRings.push(ringPoints);
    });

    // 3. Generate Longitude meridian rings (4 meridians)
    const lonRings = [];
    const lonAngles = [0, 45, 90, 135];
    lonAngles.forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const ringPoints = [];
      const steps = 36;
      for (let s = 0; s < steps; s++) {
        const a = (s / steps) * Math.PI * 2;
        ringPoints.push({
          x: radius * Math.sin(a) * Math.cos(rad),
          y: radius * Math.cos(a),
          z: radius * Math.sin(a) * Math.sin(rad),
        });
      }
      lonRings.push(ringPoints);
    });

    // 4. Global CRM Hotspot Beacons
    // Coordinates [lat, lon] mapped to 3D Cartesian
    const defaultHotspots = [
      { name: 'India (HQ)', sub: 'Primary Corridors', lat: 20.59, lon: 78.96, val: '₹4.8 Cr' },
      { name: 'United States', sub: 'North America', lat: 37.09, lon: -95.71, val: '₹3.9 Cr' },
      { name: 'United Kingdom', sub: 'European Union', lat: 55.37, lon: -3.43, val: '₹1.4 Cr' },
      { name: 'United Arab Emirates', sub: 'Middle East', lat: 23.42, lon: 53.84, val: '₹95 Lakh' },
      { name: 'Singapore', sub: 'APAC Hub', lat: 1.35, lon: 103.82, val: '₹66 Lakh' },
    ];

    const activeHotspots = (hotspots && hotspots.length > 0 ? hotspots : defaultHotspots).map((h) => {
      const phi = (h.lat * Math.PI) / 180;
      const theta = (h.lon * Math.PI) / 180;
      return {
        name: h.name,
        sub: h.sub || 'Active Sector',
        val: h.val || '',
        x: radius * Math.cos(phi) * Math.sin(theta),
        y: -radius * Math.sin(phi),
        z: radius * Math.cos(phi) * Math.cos(theta),
      };
    });

    // 3D Point Rotation Helper
    function rotate3D(point, cosY, sinY, cosX, sinX) {
      // Rotate around Y axis
      const x1 = point.x * cosY + point.z * sinY;
      const y1 = point.y;
      const z1 = -point.x * sinY + point.z * cosY;

      // Rotate around X axis
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      return { x: x2, y: y2, z: z2 };
    }

    let time = 0;

    // Main Render Loop
    function render() {
      if (!isMounted) return;
      time += 0.016;

      const s = stateRef.current;

      // Inertia & slow auto-rotation
      if (!s.isDragging) {
        s.rotY += s.velY;
        s.rotX += s.velX;
        s.velX *= 0.95; // damp pitch
        // Soft pitch limits
        if (s.rotX > 0.8) s.rotX = 0.8;
        if (s.rotX < -0.8) s.rotX = -0.8;
      }

      s.orbitAngle1 += 0.012;
      s.orbitAngle2 += 0.009;

      const cosY = Math.cos(s.rotY);
      const sinY = Math.sin(s.rotY);
      const cosX = Math.cos(s.rotX);
      const sinX = Math.sin(s.rotX);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- 1. Atmospheric Deep Radial Core Glow ---
      const coreGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.1,
        centerX,
        centerY,
        radius * 1.35
      );
      coreGrad.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
      coreGrad.addColorStop(0.35, 'rgba(99, 102, 241, 0.14)');
      coreGrad.addColorStop(0.7, 'rgba(14, 21, 53, 0.08)');
      coreGrad.addColorStop(1, 'rgba(7, 11, 24, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Outer delicate neon halo ring
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2 * dpr, 0, Math.PI * 2);
      ctx.stroke();

      // --- 2. Draw Back-hemisphere Orbital Rings ---
      // Orbit Ring 1 (Tilted ellipse)
      const orbit1R = radius * 1.32;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(0.38); // tilt
      ctx.scale(1, 0.38);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.28)';
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([4 * dpr, 6 * dpr]);
      ctx.beginPath();
      ctx.arc(0, 0, orbit1R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Orbit Ring 2 (Counter-tilted)
      const orbit2R = radius * 1.52;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.32);
      ctx.scale(1, 0.35);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([3 * dpr, 8 * dpr]);
      ctx.beginPath();
      ctx.arc(0, 0, orbit2R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // --- 3. Latitude & Longitude Grid Dots ---
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      [...latRings, ...lonRings].forEach((ring) => {
        ring.forEach((p) => {
          const rot = rotate3D(p, cosY, sinY, cosX, sinX);
          if (rot.z > -radius * 0.2) {
            const scale = fov / (fov + rot.z);
            const sx = centerX + rot.x * scale;
            const sy = centerY + rot.y * scale;
            const alpha = rot.z > 0 ? 0.35 + (rot.z / radius) * 0.35 : 0.12;
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.fillRect(sx - 0.7 * dpr, sy - 0.7 * dpr, 1.4 * dpr, 1.4 * dpr);
          }
        });
      });

      // --- 4. Render 3D Sphere Particles ---
      // Sort points by Z (depth) so front points draw on top
      const transformedParticles = sphereParticles.map((p) => {
        const rot = rotate3D(p, cosY, sinY, cosX, sinX);
        const scale = fov / (fov + rot.z);
        return {
          sx: centerX + rot.x * scale,
          sy: centerY + rot.y * scale,
          z: rot.z,
          scale,
          baseSize: p.baseSize,
        };
      });

      transformedParticles.sort((a, b) => a.z - b.z);

      transformedParticles.forEach((p) => {
        const isFront = p.z > 0;
        const depthRatio = (p.z + radius) / (2 * radius); // 0 to 1

        if (isFront) {
          // Front Hemisphere: Brilliant electric cyan / diamond white
          const brightness = 0.4 + 0.6 * (p.z / radius);
          const pSize = Math.max(1, p.baseSize * p.scale * (1 + (p.z / radius) * 0.5));

          ctx.fillStyle = `rgba(6, 182, 212, ${brightness})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, pSize, 0, Math.PI * 2);
          ctx.fill();

          // Highlight top front points with cyan glow
          if (p.z > radius * 0.6) {
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.75})`;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, pSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Back Hemisphere: Subtle deep cosmic indigo
          const alpha = 0.08 + 0.22 * depthRatio;
          const pSize = Math.max(0.75 * dpr, p.baseSize * p.scale * 0.85);

          ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- 5. Satellites orbiting on the orbital rings ---
      // Satellite 1 on Ring 1
      const s1Angle = s.orbitAngle1;
      const s1LocalX = Math.cos(s1Angle) * orbit1R;
      const s1LocalY = Math.sin(s1Angle) * (orbit1R * 0.38);
      // Un-rotate tilt (0.38 rad)
      const cosT1 = Math.cos(0.38);
      const sinT1 = Math.sin(0.38);
      const s1X = centerX + (s1LocalX * cosT1 - s1LocalY * sinT1);
      const s1Y = centerY + (s1LocalX * sinT1 + s1LocalY * cosT1);

      // Satellite 1 Glow and node
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12 * dpr;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s1X, s1Y, 3.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Small cyan ring around satellite 1
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath();
      ctx.arc(s1X, s1Y, 6 * dpr, 0, Math.PI * 2);
      ctx.stroke();

      // Satellite 2 on Ring 2
      const s2Angle = s.orbitAngle2;
      const s2LocalX = Math.cos(s2Angle) * orbit2R;
      const s2LocalY = Math.sin(s2Angle) * (orbit2R * 0.35);
      const cosT2 = Math.cos(-0.32);
      const sinT2 = Math.sin(-0.32);
      const s2X = centerX + (s2LocalX * cosT2 - s2LocalY * sinT2);
      const s2Y = centerY + (s2LocalX * sinT2 + s2LocalY * cosT2);

      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 10 * dpr;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(s2X, s2Y, 3 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // --- 6. Global CRM Hotspot Beacons & Interactive HUD Badges ---
      activeHotspots.forEach((spot, idx) => {
        const rot = rotate3D(spot, cosY, sinY, cosX, sinX);

        // Only draw when on the visible front hemisphere
        if (rot.z > 0) {
          const scale = fov / (fov + rot.z);
          const sx = centerX + rot.x * scale;
          const sy = centerY + rot.y * scale;

          const pulseProgress = ((time * 0.7 + idx * 0.3) % 1);
          const pulseR = (4 + pulseProgress * 16) * dpr;
          const pulseAlpha = (1 - pulseProgress) * 0.8;

          // Expanding radar pulse ring
          ctx.strokeStyle = `rgba(6, 182, 212, ${pulseAlpha})`;
          ctx.lineWidth = 1.2 * dpr;
          ctx.beginPath();
          ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
          ctx.stroke();

          // Second tighter pulse ring
          const pulse2 = ((time * 0.7 + idx * 0.3 + 0.5) % 1);
          ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - pulse2) * 0.5})`;
          ctx.beginPath();
          ctx.arc(sx, sy, (4 + pulse2 * 12) * dpr, 0, Math.PI * 2);
          ctx.stroke();

          // Glowing Solid Core Node
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 10 * dpr;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy, 3.2 * dpr, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // HUD Callout Vector Line
          const isRight = sx >= centerX;
          const lineEndX = isRight ? sx + 32 * dpr : sx - 32 * dpr;
          const lineEndY = sy - 24 * dpr;

          ctx.strokeStyle = 'rgba(6, 182, 212, 0.55)';
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + (isRight ? 14 : -14) * dpr, lineEndY);
          ctx.lineTo(lineEndX, lineEndY);
          ctx.stroke();

          // Futuristic HUD Badge Pill
          const tagW = 96 * dpr;
          const tagH = 26 * dpr;
          const tagX = isRight ? lineEndX : lineEndX - tagW;
          const tagY = lineEndY - tagH / 2;

          // Badge Background
          ctx.fillStyle = 'rgba(10, 16, 38, 0.88)';
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 1 * dpr;

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(tagX, tagY, tagW, tagH, 4 * dpr);
          } else {
            ctx.rect(tagX, tagY, tagW, tagH);
          }
          ctx.fill();
          ctx.stroke();

          // Badge Text
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${9 * dpr}px 'Plus Jakarta Sans', system-ui, sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(spot.name.length > 14 ? spot.name.slice(0, 13) + '..' : spot.name, tagX + 6 * dpr, tagY + 11 * dpr);

          ctx.fillStyle = '#38bdf8';
          ctx.font = `600 ${8.5 * dpr}px 'Plus Jakarta Sans', system-ui, sans-serif`;
          ctx.fillText(spot.val || spot.sub, tagX + 6 * dpr, tagY + 21 * dpr);
        }
      });

      animFrameId.current = requestAnimationFrame(render);
    }

    render();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [width, height, hotspots]);

  // Mouse Interaction Handlers
  const handleMouseDown = (e) => {
    const s = stateRef.current;
    s.isDragging = true;
    s.lastMouseX = e.clientX;
    s.lastMouseY = e.clientY;
    s.velY = 0;
    s.velX = 0;
  };

  const handleMouseMove = (e) => {
    const s = stateRef.current;
    if (!s.isDragging) return;
    const dx = e.clientX - s.lastMouseX;
    const dy = e.clientY - s.lastMouseY;
    s.rotY += dx * 0.005;
    s.rotX += dy * 0.005;
    s.velY = dx * 0.0015;
    s.velX = dy * 0.0015;
    s.lastMouseX = e.clientX;
    s.lastMouseY = e.clientY;
  };

  const handleMouseUp = () => {
    const s = stateRef.current;
    s.isDragging = false;
    // Keep a gentle forward spin if velocity is too small
    if (Math.abs(s.velY) < 0.002) {
      s.velY = 0.0035;
    }
  };

  return (
    <div
      className={`particle-globe-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        cursor: stateRef.current.isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

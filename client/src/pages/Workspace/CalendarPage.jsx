import React, { useState } from 'react';
import { IconCalendar, IconPlus, IconCheckCircle, IconClock } from '../../components/Icons';

export default function CalendarPage({ onShowToast }) {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'CRM Architecture & Multi-Theme System Review',
      time: 'Today, 2:30 PM - 3:30 PM',
      date: '2026-11-20',
      host: 'Amaan',
      category: 'Architecture',
      color: '#8b5cf6',
      description: 'Review of unified theme design tokens, shared navigation, and filter persistence across instances.',
    },
    {
      id: 2,
      title: 'Sales Performance Q4 Target Sync',
      time: 'Tomorrow, 11:00 AM - 12:00 PM',
      date: '2026-11-21',
      host: 'Heena Naaz',
      category: 'Sales',
      color: '#38bdf8',
      description: 'Monthly closed-won lead analysis and proposal conversion pipeline breakdown with account executives.',
    },
    {
      id: 3,
      title: 'Design System Release & Production Deployment',
      time: 'Monday, 4:00 PM - 5:30 PM',
      date: '2026-11-23',
      host: 'David Miller',
      category: 'Engineering',
      color: '#ec4899',
      description: 'Production rollout of Lumina glass components and Orbit planetary 3D telemetry visualization.',
    },
    {
      id: 4,
      title: 'Middle East Corporate Account Strategy Session',
      time: 'Wednesday, 10:00 AM - 11:30 AM',
      date: '2026-11-25',
      host: 'Tariq Mansoor',
      category: 'Outreach',
      color: '#10b981',
      description: 'Executive briefing for expanding enterprise CRM customer base across UAE and Saudi Arabia.',
    },
    {
      id: 5,
      title: 'Automated Deduplication Engine Validation Run',
      time: 'Thursday, 3:00 PM - 4:00 PM',
      date: '2026-11-26',
      host: 'Amaan',
      category: 'Data Quality',
      color: '#f59e0b',
      description: 'Validating duplicate contact & company detection algorithms on 35k customer database.',
    },
  ]);

  const [filterCategory, setFilterCategory] = useState('ALL');

  const filtered = events.filter((e) => {
    if (filterCategory === 'ALL') return true;
    return e.category.toUpperCase() === filterCategory.toUpperCase();
  });

  return (
    <div className="apex-page-container" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#06b6d4', display: 'flex', alignItems: 'center' }}>
              <IconCalendar size={22} />
            </span>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
              Calendar & Milestones
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
            Scheduled team synchronization meetings, client presentations, and platform deployment release events.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              background: 'var(--bg-input, #0d1728)',
              color: 'var(--text-main, #ffffff)',
              border: '1px solid var(--border, #26364f)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="ARCHITECTURE">Architecture</option>
            <option value="SALES">Sales</option>
            <option value="ENGINEERING">Engineering</option>
            <option value="OUTREACH">Outreach</option>
            <option value="DATA QUALITY">Data Quality</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map((evt) => (
          <div
            key={evt.id}
            className="stat-card"
            style={{
              borderRadius: '12px',
              border: '1px solid var(--border, #26364f)',
              borderLeft: `5px solid ${evt.color}`,
              background: 'var(--bg-card, #111c2e)',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: `${evt.color}20`,
                    color: evt.color,
                    border: `1px solid ${evt.color}40`,
                  }}
                >
                  {evt.category}
                </span>
                <span style={{ fontSize: '0.8rem', color: evt.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {evt.time}
                </span>
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main, #ffffff)' }}>
                {evt.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.4 }}>
                {evt.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'right' }}>
              <div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #94a3b8)' }}>Facilitator</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main, #ffffff)', fontSize: '0.85rem' }}>{evt.host}</div>
              </div>
              <button
                type="button"
                className="btn-apex-outline"
                onClick={() => {
                  if (onShowToast) onShowToast('info', `Joined session: ${evt.title}`);
                }}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                Join Event
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

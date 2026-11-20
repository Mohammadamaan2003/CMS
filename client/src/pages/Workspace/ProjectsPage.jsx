import React, { useState, useMemo } from 'react';
import {
  IconFolder,
  IconSearch,
  IconPlus,
  IconCheckCircle,
  IconTrendingUp,
} from '../../components/Icons';

export default function ProjectsPage({ onShowToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Design System 2.0 & Apex Lumina',
      description: 'Comprehensive cross-platform design token architecture and glassmorphism styling engine.',
      lead: 'Sarah Lin',
      status: 'Completed',
      progress: 100,
      color: '#10b981',
      dueDate: '2026-11-20',
      members: 4,
    },
    {
      id: 2,
      name: 'Marketing Website Refresh & CMS Sync',
      description: 'Automated bi-directional sync between corporate marketing pages and PostgreSQL CRM tables.',
      lead: 'David K.',
      status: 'In Review',
      progress: 72,
      color: '#06b6d4',
      dueDate: '2026-12-05',
      members: 3,
    },
    {
      id: 3,
      name: 'Mobile App React Native CRM Portal',
      description: 'Native iOS & Android mobile application for on-the-go sales lead management and outreach.',
      lead: 'Amaan',
      status: 'In Progress',
      progress: 45,
      color: '#f59e0b',
      dueDate: '2026-12-28',
      members: 6,
    },
    {
      id: 4,
      name: 'Lumina Analytics & Orbit Globe Visualizer',
      description: 'Three-dimensional canvas particle chart with live telemetry tracking 35k corporate accounts.',
      lead: 'Olivia R.',
      status: 'Production',
      progress: 95,
      color: '#8b5cf6',
      dueDate: '2026-11-22',
      members: 5,
    },
    {
      id: 5,
      name: 'Enterprise Deduplication & Merging Engine',
      description: 'Fuzzy logic address & corporate identity matching for cleaning duplicate CRM records.',
      lead: 'Heena Naaz',
      status: 'In Progress',
      progress: 60,
      color: '#ec4899',
      dueDate: '2026-12-15',
      members: 2,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLead, setNewLead] = useState('Amaan');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lead.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.status.toUpperCase() === statusFilter.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item = {
      id: Date.now(),
      name: newTitle,
      description: newDesc || 'Strategic enterprise delivery milestone.',
      lead: newLead,
      status: 'In Progress',
      progress: 10,
      color: '#38bdf8',
      dueDate: '2027-01-15',
      members: 3,
    };
    setProjects([item, ...projects]);
    setShowModal(false);
    setNewTitle('');
    setNewDesc('');
    if (onShowToast) onShowToast('success', `Project "${item.name}" added successfully.`);
  };

  return (
    <div className="apex-page-container" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center' }}>
              <IconFolder size={22} />
            </span>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
              Projects Portfolio
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
            Track cross-functional initiatives, engineering deliverables, and CRM platform feature milestones.
          </p>
        </div>

        <button
          type="button"
          className="btn-apex-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <IconPlus size={14} /> New Project
        </button>
      </div>

      {/* Filter Toolbar */}
      <div
        className="apex-table-card"
        style={{
          borderRadius: '12px',
          border: '1px solid var(--border, #26364f)',
          background: 'var(--bg-card, #111c2e)',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
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
              placeholder="Search projects by name or lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main, #ffffff)',
                fontSize: '0.825rem',
                outline: 'none',
                width: '220px',
              }}
            />
          </div>

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
            <option value="IN PROGRESS">In Progress</option>
            <option value="IN REVIEW">In Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="PRODUCTION">Production</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
          Showing <strong>{filtered.length}</strong> of {projects.length} projects
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {filtered.map((p) => (
          <div
            key={p.id}
            className="stat-card"
            style={{
              borderRadius: '12px',
              border: '1px solid var(--border, #26364f)',
              background: 'var(--bg-card, #111c2e)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: `${p.color}20`,
                    color: p.color,
                    border: `1px solid ${p.color}50`,
                  }}
                >
                  {p.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>Due: {p.dueDate}</span>
              </div>

              <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main, #ffffff)' }}>
                {p.name}
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.4 }}>
                {p.description}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted, #94a3b8)' }}>Lead: <strong style={{ color: 'var(--text-main, #ffffff)' }}>{p.lead}</strong></span>
                <span style={{ fontWeight: 700, color: p.color }}>{p.progress}%</span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-input, rgba(255,255,255,0.08))', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${p.progress}%`,
                    height: '100%',
                    background: p.color,
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-modal, #111c2e)',
              border: '1px solid var(--border, #26364f)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: 'var(--text-main, #ffffff)' }}>New Project</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)', marginBottom: '6px' }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Pipeline Automation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
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
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Strategic scope and milestones..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
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
                  Project Lead
                </label>
                <select
                  value={newLead}
                  onChange={(e) => setNewLead(e.target.value)}
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
                >
                  <option value="Amaan">Amaan (Admin)</option>
                  <option value="Heena Naaz">Heena Naaz (Sales)</option>
                  <option value="Rifah Sheikh">Rifah Sheikh (Marketing)</option>
                  <option value="Sarah Lin">Sarah Lin</option>
                  <option value="David Miller">David Miller</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn-apex-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-apex-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

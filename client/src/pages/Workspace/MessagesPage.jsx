import React, { useState } from 'react';
import { IconMessageSquare, IconCheckCircle, IconSearch, IconBell, IconMail } from '../../components/Icons';

export default function MessagesPage({ onShowToast }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      title: 'Design System 2.0 completed and tested successfully',
      time: '2 hours ago',
      sender: 'DevOps System Engine',
      category: 'System',
      unread: true,
      content: 'All frontend CSS variables and theme tokens compiled with 0 errors across Default, Lumina, and Orbit variants.',
    },
    {
      id: 2,
      title: 'New enterprise lead proposal created for Global Tech Ltd',
      time: '4 hours ago',
      sender: 'Heena Naaz',
      category: 'Sales',
      unread: true,
      content: 'Proposal #PRP-8441 valued at $145,000 sent to VP Technology with 3-year enterprise cloud migration commitment.',
    },
    {
      id: 3,
      title: 'Database automated WAL archive and backup completed',
      time: '12 hours ago',
      sender: 'PostgreSQL Engine (5432)',
      category: 'Database',
      unread: false,
      content: 'Full automated checkpoint and backup snapshot saved to /pgsql/data/wal. Data integrity verified 100%.',
    },
    {
      id: 4,
      title: 'Deduplication scan found 35 duplicate contacts in UAE region',
      time: '1 day ago',
      sender: 'Data Quality Service',
      category: 'Alert',
      unread: false,
      content: '35 company records flagged with matching LinkedIn URLs. Ready for merge review in Duplicate Merger.',
    },
    {
      id: 5,
      title: 'Monthly Q3 outbound lead pipeline exceeded target by 18%',
      time: '2 days ago',
      sender: 'Analytics Service',
      category: 'Performance',
      unread: false,
      content: '842 active sales leads logged this cycle with an average contract value increase of +$12,400.',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const markAllRead = () => {
    setMessages(messages.map((m) => ({ ...m, unread: false })));
    if (onShowToast) onShowToast('success', 'All notifications marked as read.');
  };

  const filtered = messages.filter((m) => {
    return (
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="apex-page-container" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ec4899', display: 'flex', alignItems: 'center' }}>
              <IconMessageSquare size={22} />
            </span>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
              Notifications & Messages
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
            System activity broadcasts, automated lead alerts, and corporate pipeline workflow notifications.
          </p>
        </div>

        <button
          type="button"
          className="btn-apex-outline"
          onClick={markAllRead}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
        >
          Mark All as Read
        </button>
      </div>

      {/* Messages List */}
      <div
        className="apex-table-card"
        style={{
          borderRadius: '12px',
          border: '1px solid var(--border, #26364f)',
          background: 'var(--bg-card, #111c2e)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((msg) => (
            <div
              key={msg.id}
              style={{
                padding: '16px 20px',
                borderRadius: '10px',
                background: msg.unread ? 'var(--bg-input, rgba(255,255,255,0.05))' : 'transparent',
                border: msg.unread
                  ? '1px solid var(--border, rgba(255,255,255,0.15))'
                  : '1px solid var(--border, rgba(255,255,255,0.06))',
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {msg.unread && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ec4899',
                        boxShadow: '0 0 6px #ec4899',
                        display: 'inline-block',
                      }}
                    />
                  )}
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main, #ffffff)' }}>
                    {msg.title}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>{msg.time}</span>
              </div>

              <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary, #cbd5e1)', lineHeight: 1.4 }}>
                {msg.content}
              </p>

              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #94a3b8)' }}>
                Source: <strong style={{ color: 'var(--text-main, #ffffff)' }}>{msg.sender}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

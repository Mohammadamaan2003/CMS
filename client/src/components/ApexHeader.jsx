import React, { useState, useRef, useEffect } from 'react';
import iqraLogo from '../assets/iqra-logo.png';
import {
  IconMenu,
  IconUser,
  IconChevronDown,
  IconShield,
  IconBriefcase,
  IconUsers,
  IconEye,
  IconCheck,
  IconCheckCircle,
  IconAlertTriangle,
  IconSun,
  IconMoon,
  IconOrbitGlobe,
  IconGlassmorphism,
} from './Icons';

export default function ApexHeader({
  onToggleSidebar,
  activeTab,
  onTabChange,
  currentUser,
  onSwitchUser,
  availableUsers = [],
  theme = 'light',
  onToggleTheme,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const themeDropdownRef = useRef(null);

  // Close theme dropdown on click outside or Escape key
  useEffect(() => {
    if (!showThemeDropdown) return;
    const handleClickOutside = (e) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setShowThemeDropdown(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowThemeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showThemeDropdown]);

  const role = (currentUser?.role || 'admin').toLowerCase();

const isDark = theme === 'dark' || theme === 'blue' || theme === 'lumina' || theme === 'orbit' || theme === 'glass';

const IconLuminaGem = ({ size = 14, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <defs>
      <linearGradient id="luminaGemHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    <polygon points="12,2 21,7.5 17.5,21.5 6.5,21.5 3,7.5" fill="url(#luminaGemHeadGrad)" />
    <polygon points="12,2 17.5,7.5 12,13 6.5,7.5" fill="#ffffff" opacity="0.45" />
    <polygon points="6.5,7.5 12,13 6.5,21.5" fill="#ffffff" opacity="0.18" />
    <polygon points="17.5,7.5 12,13 17.5,21.5" fill="#000000" opacity="0.25" />
  </svg>
);

const themeOptions = [
  {
    id: 'dark',
    name: 'Default',
    subtitle: 'Midnight Dark',
    badgeBg: 'rgba(99, 102, 241, 0.15)',
    accentColor: '#818cf8',
    renderIcon: (size = 14) => <IconMoon size={size} className="theme-icon-moon" style={{ color: '#818cf8' }} />,
  },
  {
    id: 'lumina',
    name: 'Lumina',
    subtitle: 'Neon Violet Glass',
    badgeBg: 'rgba(236, 72, 153, 0.18)',
    accentColor: '#ec4899',
    renderIcon: (size = 14) => <IconLuminaGem size={size} style={{ filter: 'drop-shadow(0 0 3px #ec4899)' }} />,
  },
  {
    id: 'orbit',
    name: 'Orbit',
    subtitle: 'Cosmic Cyan / Indigo',
    badgeBg: 'rgba(6, 182, 212, 0.18)',
    accentColor: '#06b6d4',
    renderIcon: (size = 14) => <IconOrbitGlobe size={size} style={{ color: '#06b6d4', filter: 'drop-shadow(0 0 3px #06b6d4)' }} />,
  },
  {
    id: 'glass',
    name: 'Glass',
    subtitle: 'Frosted Glassmorphism',
    badgeBg: 'rgba(255, 122, 24, 0.18)',
    accentColor: '#ff7a18',
    renderIcon: (size = 14) => <IconGlassmorphism size={size} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 122, 24, 0.55))' }} />,
  },
  {
    id: 'blue',
    name: 'Blue',
    subtitle: 'Classic APEX Navy',
    badgeBg: 'rgba(2, 132, 199, 0.18)',
    accentColor: '#38bdf8',
    renderIcon: () => <span style={{ fontSize: '12px', lineHeight: 1 }}>🔷</span>,
  },
  {
    id: 'light',
    name: 'Light',
    subtitle: 'Clean White Minimal',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    accentColor: '#f59e0b',
    renderIcon: (size = 14) => <IconSun size={size} className="theme-icon-sun" style={{ color: '#f59e0b' }} />,
  },
];

const currentThemeObj = themeOptions.find((t) => t.id === theme) || themeOptions[0];

const handleSelectTheme = (themeId) => {
  if (onToggleTheme) {
    onToggleTheme(themeId);
  }
  setShowThemeDropdown(false);
};

  const roleBadgeStyles = theme === 'glass' ? {
    admin: { bg: 'rgba(28, 21, 16, 0.08)', text: '#1c1510', border: 'rgba(28, 21, 16, 0.22)', label: 'Admin', icon: IconShield },
    sales: { bg: 'rgba(194, 65, 12, 0.1)', text: '#c2410c', border: 'rgba(194, 65, 12, 0.25)', label: 'Sales', icon: IconBriefcase },
    marketing: { bg: 'rgba(16, 185, 129, 0.1)', text: '#047857', border: 'rgba(16, 185, 129, 0.25)', label: 'Marketing', icon: IconUsers },
    viewer: { bg: 'rgba(100, 116, 139, 0.12)', text: '#334155', border: 'rgba(100, 116, 139, 0.25)', label: 'Viewer', icon: IconEye },
  }[role] || { bg: 'rgba(28, 21, 16, 0.08)', text: '#1c1510', border: 'rgba(28, 21, 16, 0.22)', label: role, icon: IconUser }
  : isDark ? {
    admin: { bg: 'rgba(99, 102, 241, 0.25)', text: '#e0e7ff', border: 'rgba(129, 140, 248, 0.5)', label: 'Admin', icon: IconShield },
    sales: { bg: 'rgba(56, 189, 248, 0.25)', text: '#e0f2fe', border: 'rgba(56, 189, 248, 0.5)', label: 'Sales', icon: IconBriefcase },
    marketing: { bg: 'rgba(52, 211, 153, 0.25)', text: '#d1fae5', border: 'rgba(52, 211, 153, 0.5)', label: 'Marketing', icon: IconUsers },
    viewer: { bg: 'rgba(148, 163, 184, 0.25)', text: '#f1f5f9', border: 'rgba(148, 163, 184, 0.5)', label: 'Viewer', icon: IconEye },
  }[role] || { bg: 'rgba(148, 163, 184, 0.25)', text: '#f1f5f9', border: 'rgba(148, 163, 184, 0.5)', label: role, icon: IconUser }
  : {
    admin: { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe', label: 'Admin', icon: IconShield },
    sales: { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd', label: 'Sales', icon: IconBriefcase },
    marketing: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', label: 'Marketing', icon: IconUsers },
    viewer: { bg: '#f8fafc', text: '#475569', border: '#cbd5e1', label: 'Viewer', icon: IconEye },
  }[role] || { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1', label: role, icon: IconUser };

  const CurrentRoleIcon = roleBadgeStyles.icon;

  const handleSelectUser = (u) => {
    if (!u.can_login) {
      alert(`Access Denied: User '${u.full_name}' has login disabled (can_login=false) by an administrator.`);
      return;
    }
    if (onSwitchUser) onSwitchUser(u);
    setShowUserMenu(false);
  };

  return (
    <header className="apex-topbar">
      <div className="apex-topbar-left">
        <button
          type="button"
          className="apex-hamburger-btn"
          onClick={onToggleSidebar}
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation"
        >
          <IconMenu size={22} />
        </button>

        {/* Branded IQRA Logo Box */}
        <div
          className="iqra-logo-box"
          onClick={() => onTabChange('dashboard')}
          role="button"
          tabIndex={0}
          title="Home"
        >
          <img
            src={iqraLogo}
            alt="IQRA Technology"
            className="iqra-brand-logo"
          />
        </div>

        {/* System Title */}
        <div className="apex-app-title">
          <span>Customer Management System</span>
        </div>
      </div>

      {/* User Role Switcher, Theme Switcher & Profile Dropdown on the far right */}
      <div className="apex-topbar-right">
        {/* Theme Selection Dropdown (Default, Lumina, Orbit, Blue, Light) */}
        <div className="apex-theme-dropdown-container" ref={themeDropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="apex-theme-toggle-btn"
            onClick={() => {
              setShowThemeDropdown((prev) => !prev);
              setShowUserMenu(false);
            }}
            title={`Active theme: ${currentThemeObj.name}. Click to choose theme.`}
            aria-label="Select theme"
            aria-expanded={showThemeDropdown}
            aria-haspopup="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <span className="apex-theme-toggle-indicator">
              {currentThemeObj.renderIcon(14)}
            </span>
            <span className="apex-theme-toggle-label">{currentThemeObj.name}</span>
            <IconChevronDown
              size={12}
              style={{
                marginLeft: '2px',
                transition: 'transform 0.2s ease',
                transform: showThemeDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {showThemeDropdown && (
            <div
              className="apex-theme-dropdown-menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                zIndex: 1100,
                minWidth: '220px',
                background: 'var(--bg-surface, #111C2E)',
                border: '1px solid var(--border, #26364F)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -3px rgba(0,0,0,0.5)',
                padding: '6px',
              }}
            >
              <div
                style={{
                  padding: '6px 10px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted, #94a3b8)',
                  borderBottom: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
                  marginBottom: '4px',
                }}
              >
                Select Theme
              </div>
              {themeOptions.map((opt) => {
                const isActive = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectTheme(opt.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isActive
                        ? 'var(--bg-hover, rgba(255, 255, 255, 0.12))'
                        : 'transparent',
                      color: isActive ? (theme === 'glass' || theme === 'light' ? '#1a130f' : '#ffffff') : 'var(--text-main, #e2e8f0)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 500,
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '22px',
                          height: '22px',
                          borderRadius: '5px',
                          background: opt.badgeBg,
                        }}
                      >
                        {opt.renderIcon(13)}
                      </span>
                      <div>
                        <div style={{ lineHeight: 1.2 }}>{opt.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.2 }}>
                          {opt.subtitle}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <span style={{ color: opt.accentColor || '#38bdf8', display: 'flex', alignItems: 'center' }}>
                        <IconCheck size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Role Simulation Badge */}
        <div
          className="role-simulator-badge"
          title="Active role and session simulation. Switch user to test role-based access without logging in."
        >
          <span className="role-simulator-label">
            Simulate Role:
          </span>
          <select
            className="role-simulator-select"
            value={currentUser?.id || 1}
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              const target = availableUsers.find((u) => u.id === selectedId);
              if (target) handleSelectUser(target);
            }}
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id} disabled={!u.can_login}>
                {u.full_name} ({u.role.toUpperCase()}) {!u.can_login ? '— BLOCKED' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Profile Dropdown */}
        <div className="user-profile-menu">
          <button
            type="button"
            className="user-profile-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: roleBadgeStyles.bg,
                color: roleBadgeStyles.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.75rem',
                border: `1px solid ${roleBadgeStyles.border}`,
                flexShrink: 0,
              }}
            >
              {(currentUser?.full_name || 'A')[0].toUpperCase()}
            </div>
            <span className="user-name">
              {currentUser?.full_name || 'Amaan'}
            </span>
            <span
              className="user-role-badge"
              style={{
                backgroundColor: roleBadgeStyles.bg,
                color: roleBadgeStyles.text,
                border: `1px solid ${roleBadgeStyles.border}`,
              }}
            >
              {role}
            </span>
            <IconChevronDown size={14} style={{ flexShrink: 0 }} />
          </button>

          {showUserMenu && (
            <div
              className="user-dropdown-card"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: '290px',
                background: 'var(--bg-surface, #111C2E)',
                border: '1px solid var(--border, #26364F)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -3px rgba(0,0,0,0.5)',
                zIndex: 1000,
                padding: '0.75rem 0',
              }}
            >
              {/* User Identity Info */}
              <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border, #26364F)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CurrentRoleIcon size={16} style={{ color: roleBadgeStyles.text }} />
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-main, #F1F5F9)' }}>
                    {currentUser?.full_name || 'Amaan'}
                  </strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94A3B8)', marginTop: '2px' }}>
                  {currentUser?.email || 'amaan@iqratechnology.com'}
                </div>
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: roleBadgeStyles.bg,
                      color: roleBadgeStyles.text,
                      border: `1px solid ${roleBadgeStyles.border}`,
                      fontWeight: 600,
                    }}
                  >
                    Role: {roleBadgeStyles.label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: currentUser?.can_login !== false ? (isDark ? 'rgba(52, 211, 153, 0.2)' : '#dcfce7') : (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'),
                      color: currentUser?.can_login !== false ? (isDark ? '#6ee7b7' : '#15803d') : (isDark ? '#fca5a5' : '#b91c1c'),
                      fontWeight: 600,
                    }}
                  >
                    {currentUser?.can_login !== false ? 'Login Allowed' : 'Login Blocked'}
                  </span>
                </div>
              </div>

              {/* Navigation Shortcuts based on role */}
              <div style={{ padding: '0.4rem 0', borderBottom: '1px solid var(--border, #26364F)' }}>
                <button
                  type="button"
                  className="user-dropdown-item"
                  onClick={() => {
                    onTabChange('dashboard');
                    setShowUserMenu(false);
                  }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.45rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Dashboard Overview
                </button>
                <button
                  type="button"
                  className="user-dropdown-item"
                  onClick={() => {
                    onTabChange('companies');
                    setShowUserMenu(false);
                  }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.45rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Companies Report
                </button>
                <button
                  type="button"
                  className="user-dropdown-item"
                  onClick={() => {
                    onTabChange('contacts');
                    setShowUserMenu(false);
                  }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.45rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Contacts Report
                </button>

                {role === 'admin' && (
                  <button
                    type="button"
                    className="user-dropdown-item"
                    onClick={() => {
                      onTabChange('user_management');
                      setShowUserMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.45rem 1rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: '#4338ca',
                      fontWeight: 600,
                    }}
                  >
                    Users Management
                  </button>
                )}
              </div>

              {/* Theme Selection Section */}
              <div
                className="user-dropdown-theme-row"
                style={{
                  padding: '0.6rem 1rem',
                  borderBottom: '1px solid var(--border, #26364F)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.785rem', fontWeight: 600, color: 'var(--text-main, #F1F5F9)' }}>
                  {theme === 'dark' ? (
                    <IconMoon size={14} style={{ color: '#818cf8' }} />
                  ) : theme === 'lumina' ? (
                    <IconLuminaGem size={14} style={{ filter: 'drop-shadow(0 0 3px #ec4899)' }} />
                  ) : theme === 'orbit' ? (
                    <IconOrbitGlobe size={14} style={{ color: '#06b6d4', filter: 'drop-shadow(0 0 3px #06b6d4)' }} />
                  ) : theme === 'blue' ? (
                    <span style={{ fontSize: '13px' }}>🔷</span>
                  ) : (
                    <IconSun size={14} style={{ color: '#d97706' }} />
                  )}
                  <span>Interface Theme:</span>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'var(--bg-input, #161616)',
                    borderRadius: '6px',
                    padding: '2px',
                    gap: '2px',
                    border: '1px solid var(--border, #2C2C2C)',
                  }}
                  className="theme-switch-pills"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleTheme) onToggleTheme('dark');
                      setShowUserMenu(false);
                    }}
                    style={{
                      border: 'none',
                      background: theme === 'dark' ? 'var(--btn-primary, #2563EB)' : 'transparent',
                      color: theme === 'dark' ? '#ffffff' : 'var(--text-muted, #A3A3A3)',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      fontSize: '0.725rem',
                      fontWeight: theme === 'dark' ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <IconMoon size={12} /> Default
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleTheme) onToggleTheme('lumina');
                      setShowUserMenu(false);
                    }}
                    style={{
                      border: 'none',
                      background: theme === 'lumina' ? 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)' : 'transparent',
                      color: theme === 'lumina' ? '#ffffff' : 'var(--text-muted, #A3A3A3)',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      fontSize: '0.725rem',
                      fontWeight: theme === 'lumina' ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: theme === 'lumina' ? '0 1px 4px rgba(124, 58, 237, 0.4)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <IconLuminaGem size={12} /> Lumina
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleTheme) onToggleTheme('orbit');
                      setShowUserMenu(false);
                    }}
                    style={{
                      border: 'none',
                      background: theme === 'orbit' ? 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)' : 'transparent',
                      color: theme === 'orbit' ? '#ffffff' : 'var(--text-muted, #A3A3A3)',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      fontSize: '0.725rem',
                      fontWeight: theme === 'orbit' ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: theme === 'orbit' ? '0 1px 4px rgba(6, 182, 212, 0.45)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <IconOrbitGlobe size={12} style={{ color: theme === 'orbit' ? '#ffffff' : '#06b6d4' }} /> Orbit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleTheme) onToggleTheme('glass');
                      setShowUserMenu(false);
                    }}
                    style={{
                      border: 'none',
                      background: theme === 'glass' ? 'linear-gradient(135deg, #ff7a18 0%, #ea580c 100%)' : 'transparent',
                      color: theme === 'glass' ? '#ffffff' : 'var(--text-muted, #A3A3A3)',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      fontSize: '0.725rem',
                      fontWeight: theme === 'glass' ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: theme === 'glass' ? '0 1px 4px rgba(255, 122, 24, 0.45)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <IconGlassmorphism size={12} style={{ color: theme === 'glass' ? '#ffffff' : '#ff7a18' }} /> Glass
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleTheme) onToggleTheme('blue');
                      setShowUserMenu(false);
                    }}
                    style={{
                      border: 'none',
                      background: theme === 'blue' ? 'var(--btn-primary, #0284c7)' : 'transparent',
                      color: theme === 'blue' ? '#ffffff' : 'var(--text-muted, #A3A3A3)',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      fontSize: '0.725rem',
                      fontWeight: theme === 'blue' ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: theme === 'blue' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🔷</span> Blue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleTheme) onToggleTheme('light');
                      setShowUserMenu(false);
                    }}
                    style={{
                      border: 'none',
                      background: theme === 'light' ? '#ffffff' : 'transparent',
                      color: theme === 'light' ? '#0f172a' : 'var(--text-muted, #A3A3A3)',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      fontSize: '0.725rem',
                      fontWeight: theme === 'light' ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: theme === 'light' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <IconSun size={12} /> Light
                  </button>
                </div>
              </div>

              {/* Switch Role / User List */}
              <div style={{ padding: '0.5rem 1rem 0.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Simulate Another User:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {availableUsers.map((u) => {
                    const isSelected = u.id === (currentUser?.id || 1);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u)}
                        disabled={!u.can_login}
                        title={!u.can_login ? 'Cannot switch: Login blocked by administrator' : `Switch to ${u.full_name}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '4px',
                          border: isSelected ? '1px solid #2563EB' : '1px solid transparent',
                          background: isSelected ? (isDark ? 'rgba(37, 99, 235, 0.25)' : '#eff6ff') : 'transparent',
                          color: 'var(--text-main, #F1F5F9)',
                          cursor: !u.can_login ? 'not-allowed' : 'pointer',
                          opacity: !u.can_login ? 0.45 : 1,
                          textAlign: 'left',
                          fontSize: '0.775rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1d4ed8' : '#334155' }}>
                            {u.full_name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {u.role.toUpperCase()} • @{u.username}
                          </div>
                        </div>
                        <div>
                          {!u.can_login ? (
                            <span style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 600 }}>BLOCKED</span>
                          ) : isSelected ? (
                            <IconCheckCircle size={14} style={{ color: '#2563eb' }} />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

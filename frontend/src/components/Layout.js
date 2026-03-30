import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './Layout.css';

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/leads', icon: '👥', label: 'Leads' },
  { to: '/activities', icon: '📋', label: 'Activity Log' },
];

export default function Layout() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-icon">⚡</span>
          <div>
            <div className="sidebar-title">EV Power</div>
            <div className="sidebar-sub">CRM System</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{username[0].toUpperCase()}</div>
            <div className="user-name">{username}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">⬅ ออกจากระบบ</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

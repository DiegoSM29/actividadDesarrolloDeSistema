import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ isOpen, onClose }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const socket = getSocket();

    const handleUsers = (users) => {
      // Usar Set para eliminar duplicados por email
      const uniqueEmails = new Set();
      const uniqueUsers = users.filter((u) => {
        if (uniqueEmails.has(u.email)) return false;
        uniqueEmails.add(u.email);
        return true;
      });
      setOnlineUsers(uniqueUsers);
    };

    socket.on('project-users', handleUsers);

    return () => {
      socket.off('project-users', handleUsers);
    };
  }, []);

  const navItems = [
    { to: '/', icon: '🏠', label: 'Dashboard', end: true },
    { to: '/projects', icon: '📋', label: 'Proyectos' },
    { to: '/tasks', icon: '✓', label: 'Mis Tareas' },
    { to: '/reports', icon: '📊', label: 'Reportes' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="app-sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div className="logo-icon">⚡</div>
          <h1>TaskFlow</h1>
        </div>
        <button 
          className="mobile-close-btn" 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer', marginLeft: 'auto' }}
        >
          &times;
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navegación</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-users">
        <h4>Usuarios Online</h4>
        {/* Current user always shown */}
        <div className="online-user">
          <span className="status-dot"></span>
          <span>{user?.nombre || 'Tú'} (tú)</span>
        </div>
        {onlineUsers
          .filter((u) => u.email !== user?.email)
          .map((u, i) => (
            <div className="online-user" key={i}>
              <span className="status-dot"></span>
              <span>{u.nombre}</span>
            </div>
          ))
        }
      </div>
    </aside>
  );
}

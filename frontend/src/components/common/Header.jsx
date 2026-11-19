import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('taskflow-theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('taskflow-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new Event('themechange'));
  };

  return (
    <header className="header" id="app-header">
      <div className="header-search" style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          className="header-btn mobile-menu-btn" 
          onClick={onMenuClick}
          style={{ marginRight: '12px', border: 'none', background: 'transparent' }}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <div style={{ position: 'relative', flex: 1 }}>
          <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar proyectos, tareas..."
          id="global-search"
        />
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="header-btn" 
          onClick={toggleTheme}
          data-tooltip={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          id="btn-theme-toggle"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button className="header-btn" data-tooltip="Notificaciones" id="btn-notifications">
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="header-user" onClick={logout} data-tooltip="Cerrar sesión" id="header-user-menu">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'U')}&background=6C63FF&color=fff`}
            alt={user?.nombre}
            className="header-user-avatar"
          />
          <div className="header-user-info">
            <span className="header-user-name">{user?.nombre || 'Usuario'}</span>
            <span className="header-user-role">{user?.rol || 'miembro'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

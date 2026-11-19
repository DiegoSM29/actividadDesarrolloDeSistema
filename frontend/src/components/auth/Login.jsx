import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import notifications from '../../utils/NotificationSystem';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      notifications.warning('Campos requeridos', 'Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      notifications.success('¡Bienvenido!', 'Has iniciado sesión correctamente');
      navigate('/');
    } catch (error) {
      notifications.error('Error de login', error.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">⚡</div>
          <h2>TaskFlow</h2>
          <p>Gestión de proyectos inteligente</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            id="login-submit"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </div>

        <div style={{ marginTop: '24px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Usuarios de prueba:</strong><br />
          📧 ana@email.com / 🔑 123456<br />
          📧 carlos@email.com / 🔑 123456<br />
          📧 maria@email.com / 🔑 123456
        </div>
      </div>
    </div>
  );
}

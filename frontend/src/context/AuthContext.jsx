import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('taskflow_token'));
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar si hay token
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          connectSocket(res.data);
        } catch {
          localStorage.removeItem('taskflow_token');
          localStorage.removeItem('taskflow_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('taskflow_token', newToken);
    localStorage.setItem('taskflow_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    connectSocket(userData);
    return userData;
  }, []);

  const register = useCallback(async (nombre, email, password) => {
    const res = await api.post('/auth/register', { nombre, email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('taskflow_token', newToken);
    localStorage.setItem('taskflow_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    connectSocket(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

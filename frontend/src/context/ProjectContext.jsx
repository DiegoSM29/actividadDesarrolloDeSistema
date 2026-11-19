import { createContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';

export const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // ─── Proyectos ──────────────────────────────────────
  const fetchProjects = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/proyectos${params ? '?' + params : ''}`);
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/proyectos/${id}`);
      setCurrentProject(res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data) => {
    const res = await api.post('/proyectos', data);
    setProjects((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateProject = useCallback(async (id, data) => {
    const res = await api.put(`/proyectos/${id}`, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...res.data } : p)));
    if (currentProject?.id === id) setCurrentProject(res.data);
    return res.data;
  }, [currentProject]);

  const deleteProject = useCallback(async (id) => {
    await api.delete(`/proyectos/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProject?.id === id) setCurrentProject(null);
  }, [currentProject]);

  // ─── Tareas ──────────────────────────────────────────
  const fetchTasks = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/tareas${params ? '?' + params : ''}`);
      setTasks(res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }, []);

  const createTask = useCallback(async (data) => {
    const res = await api.post('/tareas', data);
    setTasks((prev) => [...prev, res.data]);

    // Notificar vía Socket.IO
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('task-update', { projectId: data.proyectoId, task: res.data });
    }

    return res.data;
  }, []);

  const updateTask = useCallback(async (id, data) => {
    const res = await api.put(`/tareas/${id}`, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));

    const socket = getSocket();
    if (socket.connected && res.data.proyectoId) {
      socket.emit('task-update', { projectId: res.data.proyectoId, task: res.data });
    }

    return res.data;
  }, []);

  const updateTaskStatus = useCallback(async (id, estado) => {
    const res = await api.patch(`/tareas/${id}/estado`, { estado });
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));

    const socket = getSocket();
    if (socket.connected && res.data.proyectoId) {
      socket.emit('task-update', { projectId: res.data.proyectoId, task: res.data });
    }

    return res.data;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tareas/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Stats ──────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/proyectos/stats/general');
      setStats(res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }, []);

  // ─── Socket.IO listeners ────────────────────────────
  useEffect(() => {
    const socket = getSocket();

    const handleTaskUpdated = (task) => {
      setTasks((prev) => {
        const exists = prev.find((t) => t.id === task.id);
        if (exists) return prev.map((t) => (t.id === task.id ? task : t));
        return [...prev, task];
      });
    };

    socket.on('task-updated', handleTaskUpdated);

    return () => {
      socket.off('task-updated', handleTaskUpdated);
    };
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects, currentProject, tasks, stats, loading,
      fetchProjects, fetchProject, createProject, updateProject, deleteProject,
      fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask,
      fetchStats, setCurrentProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import ChartRenderer from '../../utils/ChartRenderer';
import Loading from '../common/Loading';

export default function Reports() {
  const { projects, stats, fetchProjects, fetchStats, loading } = useProjects();
  const { tasks, fetchTasks } = useTasks();
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const priorityRef = useRef(null);
  const [themeTick, setThemeTick] = useState(0);

  useEffect(() => {
    const handleThemeChange = () => setThemeTick((t) => t + 1);
    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchStats();
    fetchTasks();
  }, [fetchProjects, fetchStats, fetchTasks]);

  useEffect(() => {
    if (stats && pieRef.current) {
      const chart = new ChartRenderer('report-pie', 450, 300);
      chart.drawPieChart(stats.tasksByState, 'Tareas por Estado');
      return () => chart.destroy();
    }
  }, [stats, themeTick]);

  useEffect(() => {
    if (projects.length > 0 && barRef.current) {
      const chart = new ChartRenderer('report-bar', 450, 300);
      const data = projects.map((p) => ({ nombre: p.nombre, progreso: p.progreso || 0 }));
      chart.drawBarChart(data, 'Progreso de Proyectos');
      return () => chart.destroy();
    }
  }, [projects, themeTick]);

  useEffect(() => {
    if (stats && priorityRef.current) {
      const chart = new ChartRenderer('report-priority', 450, 300);
      chart.drawPieChart(stats.tasksByPriority, 'Tareas por Prioridad');
      return () => chart.destroy();
    }
  }, [stats, themeTick]);

  if (loading) return <Loading />;

  return (
    <div id="reports-page">
      <div className="section-header">
        <h1 className="section-title">📊 Reportes y Estadísticas</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-widget">
          <div className="stat-icon purple">📋</div>
          <div className="stat-info">
            <h3>{stats?.totalProjects || 0}</h3>
            <p>Proyectos</p>
          </div>
        </div>
        <div className="stat-widget">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{stats?.tasksByState?.completada || 0}</h3>
            <p>Completadas</p>
          </div>
        </div>
        <div className="stat-widget">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-info">
            <h3>{stats?.tasksByState?.en_progreso || 0}</h3>
            <p>En Progreso</p>
          </div>
        </div>
        <div className="stat-widget">
          <div className="stat-icon red">👥</div>
          <div className="stat-info">
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Usuarios</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container" ref={pieRef}>
          <canvas id="report-pie"></canvas>
        </div>
        <div className="chart-container" ref={barRef}>
          <canvas id="report-bar"></canvas>
        </div>
        <div className="chart-container" ref={priorityRef}>
          <canvas id="report-priority"></canvas>
        </div>
      </div>
    </div>
  );
}

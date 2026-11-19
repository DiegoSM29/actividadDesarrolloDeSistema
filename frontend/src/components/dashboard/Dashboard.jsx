import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import StatsWidget from './StatsWidget';
import ProjectCard from './ProjectCard';
import ChartRenderer from '../../utils/ChartRenderer';
import Loading from '../common/Loading';

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, stats, fetchProjects, fetchStats, loading } = useProjects();
  const { tasks, fetchTasks, updateTaskStatus } = useTasks();
  const navigate = useNavigate();
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
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

  // Renderizar gráficos Canvas cuando los datos estén listos
  useEffect(() => {
    if (stats && pieChartRef.current) {
      const pieChart = new ChartRenderer('pie-chart', 400, 260);
      pieChart.drawPieChart(stats.tasksByState, 'Distribución de Tareas');

      return () => pieChart.destroy();
    }
  }, [stats, themeTick]);

  useEffect(() => {
    if (projects.length > 0 && barChartRef.current) {
      const barChart = new ChartRenderer('bar-chart', 400, 260);
      const chartData = projects.slice(0, 5).map((p) => ({
        nombre: p.nombre,
        progreso: p.progreso || 0
      }));
      barChart.drawBarChart(chartData, 'Progreso de Proyectos');

      return () => barChart.destroy();
    }
  }, [projects, themeTick]);

  const activeTasks = tasks.filter((t) => t.estado === 'pendiente' || t.estado === 'en_progreso').slice(0, 5);

  const handleStatusChange = async (e, task, newStatus) => {
    e.stopPropagation(); // Avoid triggering navigation
    await updateTaskStatus(task.id, newStatus);
    fetchProjects(); // Recalculate progress bars
    fetchStats();    // Recalculate pie charts
  };

  if (loading && projects.length === 0) return <Loading />;

  return (
    <div id="dashboard-page">
      <div className="section-header">
        <h1 className="section-title">
          ¡Hola, {user?.nombre?.split(' ')[0] || 'Usuario'}! 👋
        </h1>
      </div>

      {/* Stats Widgets */}
      <div className="stats-grid">
        <StatsWidget
          icon="📋"
          value={stats?.totalProjects || projects.length}
          label="Proyectos Totales"
          colorClass="purple"
        />
        <StatsWidget
          icon="✅"
          value={stats?.tasksByState?.completada || 0}
          label="Tareas Completadas"
          colorClass="green"
        />
        <StatsWidget
          icon="⏳"
          value={stats?.tasksByState?.en_progreso || 0}
          label="En Progreso"
          colorClass="orange"
        />
        <StatsWidget
          icon="📌"
          value={stats?.tasksByState?.pendiente || 0}
          label="Pendientes"
          colorClass="red"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container" ref={pieChartRef}>
          <canvas id="pie-chart"></canvas>
        </div>
        <div className="chart-container" ref={barChartRef}>
          <canvas id="bar-chart"></canvas>
        </div>
      </div>

      {/* Active Projects */}
      <div className="section-header mt-lg">
        <h2 className="section-title">
          Proyectos Activos
          <span className="section-count">({projects.filter((p) => p.estado === 'activo').length})</span>
        </h2>
        <button className="btn btn-primary" onClick={() => navigate('/projects')} id="btn-view-all-projects">
          Ver todos
        </button>
      </div>

      <div className="projects-grid">
        {projects
          .filter((p) => p.estado === 'activo')
          .slice(0, 3)
          .map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        }
      </div>

      {/* Active Tasks */}
      <div className="section-header mt-lg">
        <h2 className="section-title">
          Tus Tareas
          <span className="section-count">({activeTasks.length})</span>
        </h2>
        <button className="btn btn-secondary" onClick={() => navigate('/tasks')} id="btn-view-all-tasks">
          Ver todas
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>¡Todo al día!</h3>
            <p>No tienes tareas pendientes ni en progreso.</p>
          </div>
        ) : (
          activeTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between"
              style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
              onClick={() => navigate(`/projects/${task.proyectoId}`)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex items-center gap-md">
                {task.estado === 'pendiente' ? (
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    onClick={(e) => handleStatusChange(e, task, 'en_progreso')}
                    title="Aceptar y poner en progreso"
                  >
                    ▶️ Aceptar
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
                    onClick={(e) => handleStatusChange(e, task, 'completada')}
                    title="Marcar como completada"
                  >
                    ✅ Completar
                  </button>
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.titulo}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    <span className="badge badge-sm" style={{ padding: '2px 4px', fontSize: '0.65rem', marginRight: '6px' }}>
                      {task.estado.replace('_', ' ')}
                    </span>
                    {task.asignado}
                  </div>
                </div>
              </div>
              <span className={`badge badge-${task.prioridad}`}>
                {task.prioridad === 'alta' ? '🔥' : task.prioridad === 'media' ? '⚡' : '🔵'} {task.prioridad}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import CommentSection from '../comments/CommentSection';
import Loading from '../common/Loading';

export default function MyTasks() {
  const { user } = useAuth();
  const { tasks, fetchTasks, createTask, updateTaskStatus, loading } = useTasks();
  const { projects, fetchProjects } = useProjects();
  const [filters, setFilters] = useState({ search: '', prioridad: '', asignado: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  const myTasks = tasks.filter((t) => {
    let match = true;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      match = t.titulo.toLowerCase().includes(term) || t.descripcion?.toLowerCase().includes(term);
    }
    if (filters.prioridad) match = match && t.prioridad === filters.prioridad;
    return match;
  });

  const getProjectName = (projectId) => {
    const p = projects.find((proj) => proj.id === projectId);
    return p?.nombre || 'Proyecto';
  };

  const grouped = {
    pendiente: myTasks.filter((t) => t.estado === 'pendiente'),
    en_progreso: myTasks.filter((t) => t.estado === 'en_progreso'),
    completada: myTasks.filter((t) => t.estado === 'completada')
  };

  const handleStatusChange = async (e, task, newStatus) => {
    e.stopPropagation();
    await updateTaskStatus(task.id, newStatus);
    fetchProjects(); // Recalculate progress for any dependent context
  };

  if (loading && tasks.length === 0) return <Loading />;

  return (
    <div id="my-tasks-page">
      <div className="section-header">
        <h1 className="section-title">✓ Mis Tareas <span className="section-count">({myTasks.length})</span></h1>
      </div>

      <TaskFilters filters={filters} onChange={setFilters} />

      {Object.entries(grouped).map(([status, statusTasks]) => (
        <div key={status} style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>
            {status === 'pendiente' ? '📌 Pendientes' : status === 'en_progreso' ? '⚡ En Progreso' : '✅ Completadas'}
            <span className="section-count">({statusTasks.length})</span>
          </h3>

          {statusTasks.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', padding: '8px 0' }}>Sin tareas</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
              {statusTasks.map((task) => (
                <div key={task.id} onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer' }}>
                  <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="flex items-center justify-between mb-md">
                      <span className={`badge badge-${task.prioridad}`}>
                        {task.prioridad === 'alta' ? '🔥' : task.prioridad === 'media' ? '⚡' : '🔵'} {task.prioridad}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{getProjectName(task.proyectoId)}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>{task.titulo}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{task.descripcion}</p>
                      {task.fechaLimite && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>📅 {task.fechaLimite}</p>
                      )}
                    </div>
                    <div className="mt-md" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {task.estado === 'pendiente' && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => handleStatusChange(e, task, 'en_progreso')}
                          title="Aceptar y poner en progreso"
                        >
                          ▶️ Aceptar
                        </button>
                      )}
                      {task.estado === 'en_progreso' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          style={{ background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
                          onClick={(e) => handleStatusChange(e, task, 'completada')}
                          title="Marcar como completada"
                        >
                          ✅ Completar
                        </button>
                      )}
                      {task.estado === 'completada' && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                          🎉 ¡Hecho!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Task detail modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedTask.titulo}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedTask.descripcion}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedTask(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="flex gap-md mb-md">
                <span className={`badge badge-${selectedTask.prioridad}`}>{selectedTask.prioridad}</span>
                <span className={`badge badge-${selectedTask.estado}`}>{selectedTask.estado.replace('_', ' ')}</span>
              </div>
              <CommentSection taskId={selectedTask.id} projectId={selectedTask.proyectoId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

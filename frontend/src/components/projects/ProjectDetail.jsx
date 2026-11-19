import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import ProjectMembers from './ProjectMembers';
import ProjectForm from './ProjectForm';
import TaskBoard from '../tasks/TaskBoard';
import TaskForm from '../tasks/TaskForm';
import CommentSection from '../comments/CommentSection';
import Loading from '../common/Loading';
import { exportProject } from '../../utils/ProjectExporter';
import { autoSaveToLocal } from '../../utils/ProjectExporter';
import { joinProject, leaveProject } from '../../services/socket';
import notifications from '../../utils/NotificationSystem';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, fetchProject, updateProject, deleteProject, loading } = useProjects();
  const { tasks, fetchTasks, createTask, updateTaskStatus } = useTasks();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchProject(id);
    fetchTasks({ proyectoId: id });
    joinProject(id);

    return () => {
      leaveProject(id);
    };
  }, [id, fetchProject, fetchTasks]);

  // Auto-save to localStorage
  useEffect(() => {
    if (currentProject) {
      autoSaveToLocal(currentProject);
    }
  }, [currentProject]);

  const handleEdit = async (data) => {
    await updateProject(id, data);
    setShowEditForm(false);
    fetchProject(id);
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto? Se eliminarán todas las tareas asociadas.')) {
      await deleteProject(id);
      notifications.success('Eliminado', 'Proyecto eliminado exitosamente');
      navigate('/projects');
    }
  };

  const handleExport = () => {
    if (currentProject) {
      exportProject({ ...currentProject, tareas: tasks.filter((t) => t.proyectoId === id) });
      notifications.success('Exportado', 'Proyecto exportado como JSON');
    }
  };

  const handleCreateTask = async (data) => {
    await createTask({ ...data, proyectoId: id });
    setShowTaskForm(false);
    fetchTasks({ proyectoId: id });
    fetchProject(id);
  };

  const handleStatusChange = useCallback(async (taskId, newStatus) => {
    await updateTaskStatus(taskId, newStatus);
    fetchTasks({ proyectoId: id });
    fetchProject(id);
  }, [id, updateTaskStatus, fetchTasks, fetchProject]);

  const projectTasks = tasks.filter((t) => t.proyectoId === id);

  if (loading && !currentProject) return <Loading />;
  if (!currentProject) return <div className="empty-state"><h3>Proyecto no encontrado</h3></div>;

  return (
    <div id="project-detail-page">
      {/* Header */}
      <div className="project-detail-header">
        <div>
          <button className="btn btn-secondary btn-sm mb-md" onClick={() => navigate('/projects')}>
            ← Volver
          </button>
          <h1>{currentProject.nombre}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{currentProject.descripcion}</p>
        </div>
        <div className="project-status flex gap-sm">
          <button className="btn btn-secondary btn-sm" onClick={handleExport} id="btn-export">📥 Exportar</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowEditForm(true)} id="btn-edit-project">✏️ Editar</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete} id="btn-delete-project">🗑️ Eliminar</button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="project-detail-info">
        <div className="info-item">
          <label>Estado</label>
          <p><span className={`badge badge-${currentProject.estado}`}>● {currentProject.estado}</span></p>
        </div>
        <div className="info-item">
          <label>Progreso</label>
          <p>{currentProject.progreso || 0}% ({currentProject.tareasCompletadas || 0}/{currentProject.totalTareas || 0} tareas)</p>
          <div className="progress-bar" style={{ marginTop: '8px' }}>
            <div className="progress-bar-fill" style={{ width: `${currentProject.progreso || 0}%` }}></div>
          </div>
        </div>
        <div className="info-item">
          <label>Fecha Inicio</label>
          <p>{currentProject.fechaInicio || 'Sin definir'}</p>
        </div>
        <div className="info-item">
          <label>Fecha Fin</label>
          <p>{currentProject.fechaFin || 'Sin definir'}</p>
        </div>
      </div>

      {/* Members */}
      <div className="card mb-lg">
        <h3 className="card-title" style={{ marginBottom: '12px' }}>👥 Equipo del Proyecto</h3>
        <ProjectMembers members={currentProject.miembros} responsable={currentProject.responsable} />
      </div>

      {/* Task Board */}
      <div className="section-header">
        <h2 className="section-title">
          Tablero de Tareas <span className="section-count">({projectTasks.length})</span>
        </h2>
        <button className="btn btn-primary" onClick={() => setShowTaskForm(true)} id="btn-new-task">
          + Nueva Tarea
        </button>
      </div>

      <TaskBoard
        tasks={projectTasks}
        onStatusChange={handleStatusChange}
        onTaskClick={(task) => setSelectedTask(task)}
      />

      {/* Comment Section for selected task */}
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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Asignado: {selectedTask.asignado}</span>
              </div>
              <CommentSection taskId={selectedTask.id} projectId={id} />
            </div>
          </div>
        </div>
      )}

      {/* Forms */}
      {showEditForm && (
        <ProjectForm project={currentProject} onSubmit={handleEdit} onClose={() => setShowEditForm(false)} />
      )}
      {showTaskForm && (
        <TaskForm onSubmit={handleCreateTask} onClose={() => setShowTaskForm(false)} />
      )}
    </div>
  );
}

import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  const daysLeft = () => {
    if (!project.fechaFin) return null;
    const end = new Date(project.fechaFin);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Vencido';
    if (diff === 0) return 'Hoy';
    return `${diff} días restantes`;
  };

  return (
    <div
      className="card project-card"
      style={{ '--card-accent': project.color || '#6C63FF' }}
      onClick={() => navigate(`/projects/${project.id}`)}
      data-tooltip={`Responsable: ${project.responsable}`}
      id={`project-card-${project.id}`}
    >
      <div className="card-header">
        <div>
          <h3 className="card-title">{project.nombre}</h3>
          <p className="card-subtitle">{project.descripcion}</p>
        </div>
        <span className={`badge badge-${project.estado}`}>
          {project.estado === 'activo' ? '● Activo' : project.estado}
        </span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${project.progreso || 0}%` }}
        ></div>
      </div>

      <div className="progress-text">
        <span>{project.progreso || 0}% completado</span>
        <span>{project.tareasCompletadas || 0}/{project.totalTareas || 0} tareas</span>
      </div>

      <div className="project-meta">
        <span>📅 {daysLeft()}</span>
        <span>👥 {project.miembros?.length || 0} miembros</span>
      </div>
    </div>
  );
}

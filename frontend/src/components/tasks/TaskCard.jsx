export default function TaskCard({ task, onClick, onStatusChange }) {
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(task.asignado?.split('@')[0] || 'U')}&background=6C63FF&color=fff&size=22`;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      className="task-card"
      data-id={task.id}
      data-status={task.estado}
      onClick={() => onClick && onClick(task)}
      data-tooltip={`Prioridad: ${task.prioridad} | Asignado: ${task.asignado}`}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div className="flex items-center justify-between">
        <span className={`badge badge-${task.prioridad}`}>
          {task.prioridad === 'alta' ? '🔥' : task.prioridad === 'media' ? '⚡' : '🔵'} {task.prioridad}
        </span>
      </div>

      <h4 className="task-title">{task.titulo}</h4>

      {task.descripcion && (
        <p className="task-desc">{task.descripcion}</p>
      )}

      <div className="task-footer" style={{ marginTop: 'auto' }}>
        <div className="task-assignee">
          <img src={avatar} alt={task.asignado} />
          <span>{task.asignado?.split('@')[0]}</span>
        </div>
        {task.fechaLimite && (
          <span className="task-date">
            📅 {formatDate(task.fechaLimite)}
          </span>
        )}
      </div>

      {onStatusChange && task.estado !== 'completada' && (
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          {task.estado === 'pendiente' && (
            <button 
              className="btn btn-secondary btn-sm"
              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
              onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'en_progreso'); }}
            >
              ▶️ Aceptar
            </button>
          )}
          {task.estado === 'en_progreso' && (
            <button 
              className="btn btn-primary btn-sm"
              style={{ padding: '2px 8px', fontSize: '0.75rem', background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
              onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'completada'); }}
            >
              ✅ Completar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

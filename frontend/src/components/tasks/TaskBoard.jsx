import { useEffect, useState } from 'react';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import { refreshDraggable } from '../../jquery/kanbanManager';

const COLUMNS = [
  { key: 'pendiente', label: 'Pendientes', dotColor: 'var(--text-secondary)', icon: '📌' },
  { key: 'en_progreso', label: 'En Progreso', dotColor: 'var(--accent-blue)', icon: '⚡' },
  { key: 'completada', label: 'Completadas', dotColor: 'var(--accent-green)', icon: '✅' }
];

export default function TaskBoard({ tasks, onStatusChange, onTaskClick }) {
  const [filters, setFilters] = useState({ search: '', prioridad: '', asignado: '' });

  // Filtrar tareas
  const filteredTasks = tasks.filter((t) => {
    if (filters.search) {
      const term = filters.search.toLowerCase();
      if (!t.titulo.toLowerCase().includes(term) && !t.descripcion?.toLowerCase().includes(term)) {
        return false;
      }
    }
    if (filters.prioridad && t.prioridad !== filters.prioridad) return false;
    if (filters.asignado && t.asignado !== filters.asignado) return false;
    return true;
  });

  // Re-inicializar jQuery drag & drop después de cada render
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshDraggable(onStatusChange);
    }, 200);

    return () => clearTimeout(timer);
  }, [tasks, filteredTasks, onStatusChange]);

  return (
    <div id="kanban-container">
      <TaskFilters filters={filters} onChange={setFilters} />

      <div className="kanban-board" id="kanban-board">
        {COLUMNS.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.estado === col.key);

          return (
            <div
              key={col.key}
              className="kanban-column"
              data-status={col.key}
              id={`column-${col.key}`}
            >
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span className="column-dot" style={{ background: col.dotColor }}></span>
                  {col.icon} {col.label}
                  <span className="column-count">{columnTasks.length}</span>
                </div>
              </div>

              <div className="kanban-column-body" data-status={col.key}>
                {columnTasks.length === 0 ? (
                  <div className="empty-state" style={{ padding: '32px 16px' }}>
                    <p style={{ fontSize: '0.8rem' }}>Sin tareas</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={onTaskClick}
                      onStatusChange={onStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

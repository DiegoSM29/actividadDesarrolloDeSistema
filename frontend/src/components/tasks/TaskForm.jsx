import { useState } from 'react';
import notifications from '../../utils/NotificationSystem';

export default function TaskForm({ task, onSubmit, onClose }) {
  const [form, setForm] = useState({
    titulo: task?.titulo || '',
    descripcion: task?.descripcion || '',
    prioridad: task?.prioridad || 'media',
    asignado: task?.asignado || '',
    fechaLimite: task?.fechaLimite || ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.titulo.trim()) {
      notifications.warning('Campo requerido', 'El título de la tarea es obligatorio');
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} id="task-form">
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Título *</label>
              <input
                name="titulo"
                type="text"
                className="form-input"
                placeholder="Ej: Diseñar mockups"
                value={form.titulo}
                onChange={handleChange}
                id="task-titulo"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                className="form-input"
                placeholder="Describe la tarea..."
                value={form.descripcion}
                onChange={handleChange}
                id="task-descripcion"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select
                  name="prioridad"
                  className="form-input form-select"
                  value={form.prioridad}
                  onChange={handleChange}
                  id="task-prioridad"
                >
                  <option value="alta">🔥 Alta</option>
                  <option value="media">⚡ Media</option>
                  <option value="baja">🔵 Baja</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha límite</label>
                <input
                  name="fechaLimite"
                  type="date"
                  className="form-input"
                  value={form.fechaLimite}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Asignado a (email)</label>
              <input
                name="asignado"
                type="email"
                className="form-input"
                placeholder="email@ejemplo.com"
                value={form.asignado}
                onChange={handleChange}
                id="task-asignado"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" id="task-submit">
              {task ? 'Guardar Cambios' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

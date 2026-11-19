import { useState } from 'react';
import notifications from '../../utils/NotificationSystem';

const COLORS = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FF9F43', '#54A0FF', '#FF6B9D'];

export default function ProjectForm({ project, onSubmit, onClose }) {
  const [form, setForm] = useState({
    nombre: project?.nombre || '',
    descripcion: project?.descripcion || '',
    fechaInicio: project?.fechaInicio || new Date().toISOString().split('T')[0],
    fechaFin: project?.fechaFin || '',
    color: project?.color || '#6C63FF',
    miembros: project?.miembros?.join(', ') || ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      notifications.warning('Campo requerido', 'El nombre del proyecto es obligatorio');
      return;
    }

    const data = {
      ...form,
      miembros: form.miembros ? form.miembros.split(',').map((m) => m.trim()).filter(Boolean) : []
    };

    onSubmit(data);
    notifications.success('¡Listo!', project ? 'Proyecto actualizado' : 'Proyecto creado exitosamente');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{project ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} id="project-form">
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nombre del proyecto *</label>
              <input
                name="nombre"
                type="text"
                className="form-input"
                placeholder="Ej: Desarrollo Web Corporativo"
                value={form.nombre}
                onChange={handleChange}
                id="project-nombre"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                className="form-input"
                placeholder="Describe el proyecto..."
                value={form.descripcion}
                onChange={handleChange}
                id="project-descripcion"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Fecha inicio</label>
                <input
                  name="fechaInicio"
                  type="date"
                  className="form-input"
                  value={form.fechaInicio}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha fin</label>
                <input
                  name="fechaFin"
                  type="date"
                  className="form-input"
                  value={form.fechaFin}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Color del proyecto</label>
              <div className="flex gap-sm">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: 32, height: 32,
                      borderRadius: '50%',
                      background: c,
                      border: form.color === c ? '3px solid white' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Miembros (emails separados por coma)</label>
              <input
                name="miembros"
                type="text"
                className="form-input"
                placeholder="ana@email.com, carlos@email.com"
                value={form.miembros}
                onChange={handleChange}
                id="project-miembros"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" id="project-submit">
              {project ? 'Guardar Cambios' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

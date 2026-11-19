const store = require('../models/DataStore');

/**
 * Controlador de tareas
 * CRUD completo con filtros por proyecto, estado, prioridad
 */
const taskController = {
  // GET /api/tareas
  getAll: (req, res) => {
    try {
      let tasks = store.getAll('tasks');
      const { proyectoId, estado, prioridad, asignado, search } = req.query;

      // Filtros usando sentencias selectivas (if)
      if (proyectoId) {
        tasks = tasks.filter((t) => t.proyectoId === proyectoId);
      }
      if (estado) {
        tasks = tasks.filter((t) => t.estado === estado);
      }
      if (prioridad) {
        tasks = tasks.filter((t) => t.prioridad === prioridad);
      }
      if (asignado) {
        tasks = tasks.filter((t) => t.asignado === asignado);
      }
      if (search) {
        const term = search.toLowerCase();
        tasks = tasks.filter((t) =>
          t.titulo.toLowerCase().includes(term) ||
          t.descripcion.toLowerCase().includes(term)
        );
      }

      // Ordenar por prioridad usando switch
      tasks.sort((a, b) => {
        const getPriorityWeight = (p) => {
          switch (p) {
            case 'alta': return 1;
            case 'media': return 2;
            case 'baja': return 3;
            default: return 4;
          }
        };
        return getPriorityWeight(a.prioridad) - getPriorityWeight(b.prioridad);
      });

      res.json(tasks);
    } catch (error) {
      console.error('Error en getAll tasks:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // GET /api/tareas/:id
  getById: (req, res) => {
    try {
      const task = store.getById('tasks', req.params.id);
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      // Incluir comentarios
      const comments = store.getCommentsByTask(task.id);
      res.json({ ...task, comentarios: comments });
    } catch (error) {
      console.error('Error en getById task:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // POST /api/tareas
  create: (req, res) => {
    try {
      const { proyectoId, titulo, descripcion, prioridad, asignado, fechaLimite } = req.body;

      if (!proyectoId || !titulo) {
        return res.status(400).json({ error: 'proyectoId y titulo son requeridos' });
      }

      // Verificar que el proyecto existe
      const project = store.getById('projects', proyectoId);
      if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }

      const task = store.create('tasks', {
        proyectoId,
        titulo,
        descripcion: descripcion || '',
        prioridad: prioridad || 'media',
        estado: 'pendiente',
        asignado: asignado || req.user.email,
        fechaLimite: fechaLimite || '',
        creadoPor: req.user.email
      });

      res.status(201).json(task);
    } catch (error) {
      console.error('Error en create task:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // PUT /api/tareas/:id
  update: (req, res) => {
    try {
      const updated = store.update('tasks', req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json(updated);
    } catch (error) {
      console.error('Error en update task:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // PATCH /api/tareas/:id/estado
  updateStatus: (req, res) => {
    try {
      const { estado } = req.body;
      const validStates = ['pendiente', 'en_progreso', 'completada'];

      if (!validStates.includes(estado)) {
        return res.status(400).json({ error: `Estado inválido. Debe ser: ${validStates.join(', ')}` });
      }

      const updated = store.update('tasks', req.params.id, { estado });
      if (!updated) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json(updated);
    } catch (error) {
      console.error('Error en updateStatus task:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // DELETE /api/tareas/:id
  delete: (req, res) => {
    try {
      // Eliminar comentarios asociados
      const comments = store.getCommentsByTask(req.params.id);
      comments.forEach((c) => store.delete('comments', c.id));

      const deleted = store.delete('tasks', req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json({ message: 'Tarea eliminada exitosamente' });
    } catch (error) {
      console.error('Error en delete task:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = taskController;

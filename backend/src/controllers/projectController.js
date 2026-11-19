const store = require('../models/DataStore');

/**
 * Controlador de proyectos
 * CRUD completo con filtros y gestión de miembros
 */
const projectController = {
  // GET /api/proyectos
  getAll: (req, res) => {
    try {
      let projects = store.getAll('projects');
      const { estado, responsable, search } = req.query;

      // Filtros con sentencias selectivas
      if (estado) {
        projects = projects.filter((p) => p.estado === estado);
      }
      if (responsable) {
        projects = projects.filter((p) => p.responsable === responsable);
      }
      if (search) {
        const term = search.toLowerCase();
        projects = projects.filter((p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.descripcion.toLowerCase().includes(term)
        );
      }

      // Agregar conteo de tareas a cada proyecto
      const projectsWithStats = projects.map((project) => {
        const tasks = store.getTasksByProject(project.id);
        const completedTasks = tasks.filter((t) => t.estado === 'completada').length;
        return {
          ...project,
          totalTareas: tasks.length,
          tareasCompletadas: completedTasks,
          progreso: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
        };
      });

      res.json(projectsWithStats);
    } catch (error) {
      console.error('Error en getAll projects:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // GET /api/proyectos/:id
  getById: (req, res) => {
    try {
      const project = store.getById('projects', req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }

      const tasks = store.getTasksByProject(project.id);
      const completedTasks = tasks.filter((t) => t.estado === 'completada').length;

      res.json({
        ...project,
        tareas: tasks,
        totalTareas: tasks.length,
        tareasCompletadas: completedTasks,
        progreso: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
      });
    } catch (error) {
      console.error('Error en getById project:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // POST /api/proyectos
  create: (req, res) => {
    try {
      const { nombre, descripcion, fechaInicio, fechaFin, responsable, miembros } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre del proyecto es requerido' });
      }

      const project = store.create('projects', {
        nombre,
        descripcion: descripcion || '',
        fechaInicio: fechaInicio || new Date().toISOString().split('T')[0],
        fechaFin: fechaFin || '',
        estado: 'activo',
        responsable: responsable || req.user.email,
        miembros: miembros || [req.user.email],
        color: req.body.color || '#6C63FF'
      });

      res.status(201).json(project);
    } catch (error) {
      console.error('Error en create project:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // PUT /api/proyectos/:id
  update: (req, res) => {
    try {
      const updated = store.update('projects', req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      res.json(updated);
    } catch (error) {
      console.error('Error en update project:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // DELETE /api/proyectos/:id
  delete: (req, res) => {
    try {
      // Eliminar tareas asociadas
      const tasks = store.getTasksByProject(req.params.id);
      tasks.forEach((task) => {
        // Eliminar comentarios de cada tarea
        const comments = store.getCommentsByTask(task.id);
        comments.forEach((c) => store.delete('comments', c.id));
        store.delete('tasks', task.id);
      });

      const deleted = store.delete('projects', req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      res.json({ message: 'Proyecto eliminado exitosamente' });
    } catch (error) {
      console.error('Error en delete project:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // GET /api/proyectos/stats/general
  getStats: (req, res) => {
    try {
      const stats = store.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = projectController;

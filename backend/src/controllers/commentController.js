const store = require('../models/DataStore');

/**
 * Controlador de comentarios
 * CRUD con emisión de eventos Socket.IO
 */
const commentController = {
  // GET /api/comentarios?tareaId=xxx
  getByTask: (req, res) => {
    try {
      const { tareaId } = req.query;
      if (!tareaId) {
        return res.status(400).json({ error: 'tareaId es requerido' });
      }

      const comments = store.getCommentsByTask(tareaId);

      // Ordenar por fecha de creación (más recientes primero)
      comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json(comments);
    } catch (error) {
      console.error('Error en getByTask comments:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // POST /api/comentarios
  create: (req, res) => {
    try {
      const { tareaId, texto } = req.body;

      if (!tareaId || !texto) {
        return res.status(400).json({ error: 'tareaId y texto son requeridos' });
      }

      // Verificar que la tarea existe
      const task = store.getById('tasks', tareaId);
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      const comment = store.create('comments', {
        tareaId,
        texto,
        autor: req.user.email,
        autorNombre: req.user.nombre
      });

      // Emitir evento Socket.IO si está disponible
      const io = req.app.get('io');
      if (io) {
        io.to(`project-${task.proyectoId}`).emit('new-comment', {
          comment,
          taskId: tareaId,
          projectId: task.proyectoId
        });
      }

      res.status(201).json(comment);
    } catch (error) {
      console.error('Error en create comment:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // PUT /api/comentarios/:id
  update: (req, res) => {
    try {
      const { texto } = req.body;
      if (!texto) {
        return res.status(400).json({ error: 'texto es requerido' });
      }

      const existing = store.getById('comments', req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }

      // Solo el autor puede editar
      if (existing.autor !== req.user.email) {
        return res.status(403).json({ error: 'No tienes permiso para editar este comentario' });
      }

      const updated = store.update('comments', req.params.id, { texto, editado: true });
      res.json(updated);
    } catch (error) {
      console.error('Error en update comment:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // DELETE /api/comentarios/:id
  delete: (req, res) => {
    try {
      const existing = store.getById('comments', req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }

      if (existing.autor !== req.user.email) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este comentario' });
      }

      store.delete('comments', req.params.id);
      res.json({ message: 'Comentario eliminado exitosamente' });
    } catch (error) {
      console.error('Error en delete comment:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = commentController;

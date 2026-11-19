const store = require('../models/DataStore');

/**
 * Socket.IO Handlers
 * Gestión de conexiones en tiempo real para colaboración
 * Usa Map para rastrear usuarios conectados por sala
 */

// Map<projectId, Set<{socketId, email, nombre}>>
const projectRooms = new Map();

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Usuario conectado: ${socket.id}`);

    let currentUser = null;

    // Autenticación del socket
    socket.on('authenticate', (userData) => {
      currentUser = userData;
      console.log(`✅ Socket autenticado: ${userData.nombre} (${userData.email})`);
    });

    // Unirse a sala de proyecto
    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);

      if (!projectRooms.has(projectId)) {
        projectRooms.set(projectId, new Set());
      }

      const userInfo = {
        socketId: socket.id,
        email: currentUser?.email || 'anónimo',
        nombre: currentUser?.nombre || 'Usuario'
      };

      projectRooms.get(projectId).add(JSON.stringify(userInfo));

      // Emitir lista de usuarios conectados
      const users = Array.from(projectRooms.get(projectId)).map((u) => JSON.parse(u));
      io.to(`project-${projectId}`).emit('project-users', users);

      console.log(`📁 ${userInfo.nombre} se unió al proyecto ${projectId}`);
    });

    // Salir de sala de proyecto
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      removeUserFromRoom(projectId, socket.id);

      if (projectRooms.has(projectId)) {
        const users = Array.from(projectRooms.get(projectId)).map((u) => JSON.parse(u));
        io.to(`project-${projectId}`).emit('project-users', users);
      }
    });

    // Notificar actualización de tarea
    socket.on('task-update', (data) => {
      const { projectId, task } = data;
      socket.to(`project-${projectId}`).emit('task-updated', task);
    });

    // Notificar nuevo comentario
    socket.on('comment-added', (data) => {
      const { projectId, comment } = data;
      socket.to(`project-${projectId}`).emit('new-comment', comment);
    });

    // Notificar que alguien está escribiendo
    socket.on('typing', (data) => {
      const { projectId, taskId } = data;
      socket.to(`project-${projectId}`).emit('user-typing', {
        user: currentUser?.nombre || 'Alguien',
        taskId
      });
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`🔌 Usuario desconectado: ${socket.id}`);

      // Limpiar de todas las salas
      for (const [projectId] of projectRooms) {
        removeUserFromRoom(projectId, socket.id);
        const users = Array.from(projectRooms.get(projectId) || []).map((u) => JSON.parse(u));
        io.to(`project-${projectId}`).emit('project-users', users);
      }
    });
  });
}

function removeUserFromRoom(projectId, socketId) {
  if (!projectRooms.has(projectId)) return;

  const room = projectRooms.get(projectId);
  for (const userStr of room) {
    const user = JSON.parse(userStr);
    if (user.socketId === socketId) {
      room.delete(userStr);
      break;
    }
  }

  // Limpiar sala vacía
  if (room.size === 0) {
    projectRooms.delete(projectId);
  }
}

module.exports = setupSocketHandlers;

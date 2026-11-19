const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const setupSocketHandlers = require('./socket/handlers');

// Importar rutas
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');

// Inicializar Express
const app = express();
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Hacer io accesible en controllers
app.set('io', io);

// ─── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rutas API ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/proyectos', projectRoutes);
app.use('/api/tareas', taskRoutes);
app.use('/api/comentarios', commentRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TaskFlow API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// ─── Manejo de errores ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── Socket.IO ──────────────────────────────────────────
setupSocketHandlers(io);

// ─── Iniciar servidor ───────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   🚀 TaskFlow API Server                 ║
  ║   📡 Puerto: ${PORT}                        ║
  ║   🔗 http://localhost:${PORT}/api           ║
  ║   ⚡ Socket.IO activo                     ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };

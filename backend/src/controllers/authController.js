const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../models/DataStore');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Controlador de autenticación
 * Maneja registro, login y obtención de usuario actual
 */
const authController = {
  // POST /api/auth/register
  register: async (req, res) => {
    try {
      const { nombre, email, password, avatar } = req.body;

      // Validaciones
      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      // Verificar email único usando Set
      if (store.emailExists(email)) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Hash de contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = store.create('users', {
        nombre,
        email,
        password: hashedPassword,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=6C63FF&color=fff`,
        rol: 'miembro',
        activo: true
      });

      store.addEmail(email);

      // Generar token
      const token = jwt.sign(
        { id: user.id, email: user.email, nombre: user.nombre },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // No enviar password en respuesta
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error en register:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const user = store.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, nombre: user.nombre },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login exitoso',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // GET /api/auth/me
  getMe: (req, res) => {
    try {
      const user = store.getById('users', req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error en getMe:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = authController;

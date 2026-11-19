const jwt = require('jsonwebtoken');

const JWT_SECRET = 'taskflow_secret_key_2024_proyecto_final';

/**
 * Middleware de autenticación JWT
 * Verifica el token en el header Authorization
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  // Formato: Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * Middleware opcional - no bloquea si no hay token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      // Token inválido, continuar sin usuario
    }
  }
  next();
};

module.exports = { authMiddleware, optionalAuth, JWT_SECRET };

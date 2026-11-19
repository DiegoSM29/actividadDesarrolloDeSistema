const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * DataStore - Clase para gestión de datos en memoria con persistencia JSON
 * Utiliza Map y Set internamente para acceso eficiente (Tipos de referencia)
 */
class DataStore {
  constructor() {
    /** @type {Map<string, object>} */
    this.users = new Map();
    /** @type {Map<string, object>} */
    this.projects = new Map();
    /** @type {Map<string, object>} */
    this.tasks = new Map();
    /** @type {Map<string, object>} */
    this.comments = new Map();
    /** @type {Set<string>} */
    this.activeEmails = new Set();

    this.dataDir = path.join(__dirname, '..', '..', 'data');
    this._ensureDataDir();
    this._loadData();
  }

  _ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  _loadData() {
    this._loadCollection('users');
    this._loadCollection('projects');
    this._loadCollection('tasks');
    this._loadCollection('comments');

    // Track active emails using Set
    this.users.forEach((user) => {
      this.activeEmails.add(user.email);
    });

    console.log(`📦 Datos cargados: ${this.users.size} usuarios, ${this.projects.size} proyectos, ${this.tasks.size} tareas, ${this.comments.size} comentarios`);
  }

  _loadCollection(name) {
    const filePath = path.join(this.dataDir, `${name}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        data.forEach((item) => {
          this[name].set(item.id, item);
        });
      } catch (error) {
        console.error(`Error cargando ${name}:`, error.message);
      }
    }
  }

  _saveCollection(name) {
    const filePath = path.join(this.dataDir, `${name}.json`);
    const data = Array.from(this[name].values());
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // ─── CRUD Genérico ───────────────────────────────────────

  create(collection, data) {
    const id = uuidv4();
    const item = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this[collection].set(id, item);
    this._saveCollection(collection);
    return item;
  }

  getById(collection, id) {
    return this[collection].get(id) || null;
  }

  getAll(collection) {
    return Array.from(this[collection].values());
  }

  update(collection, id, data) {
    const existing = this[collection].get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    this[collection].set(id, updated);
    this._saveCollection(collection);
    return updated;
  }

  delete(collection, id) {
    const existed = this[collection].has(id);
    this[collection].delete(id);
    if (existed) this._saveCollection(collection);
    return existed;
  }

  // ─── Consultas específicas ──────────────────────────────

  findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  emailExists(email) {
    return this.activeEmails.has(email);
  }

  addEmail(email) {
    this.activeEmails.add(email);
  }

  getTasksByProject(projectId) {
    return this.getAll('tasks').filter((t) => t.proyectoId === projectId);
  }

  getTasksByAssignee(email) {
    return this.getAll('tasks').filter((t) => t.asignado === email);
  }

  getCommentsByTask(taskId) {
    return this.getAll('comments').filter((c) => c.tareaId === taskId);
  }

  getProjectsByMember(email) {
    return this.getAll('projects').filter((p) =>
      p.responsable === email || (p.miembros && p.miembros.includes(email))
    );
  }

  getStats() {
    const projects = this.getAll('projects');
    const tasks = this.getAll('tasks');

    const tasksByState = { pendiente: 0, en_progreso: 0, completada: 0 };
    tasks.forEach((t) => {
      if (tasksByState[t.estado] !== undefined) tasksByState[t.estado]++;
    });

    const tasksByPriority = { alta: 0, media: 0, baja: 0 };
    tasks.forEach((t) => {
      if (tasksByPriority[t.prioridad] !== undefined) tasksByPriority[t.prioridad]++;
    });

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.estado === 'activo').length,
      totalTasks: tasks.length,
      tasksByState,
      tasksByPriority,
      totalUsers: this.users.size
    };
  }
}

// Singleton
const store = new DataStore();
module.exports = store;

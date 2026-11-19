/**
 * NotificationSystem - Sistema de notificaciones toast con JavaScript puro
 * Demuestra: POO, manipulación DOM nativa, funciones anónimas, BOM (window)
 */
class NotificationSystem {
  /** @type {NotificationSystem} */
  static instance = null;

  constructor() {
    if (NotificationSystem.instance) {
      return NotificationSystem.instance;
    }

    /** @type {Array<{id: number, element: HTMLElement, timer: number}>} */
    this.queue = [];
    this.maxVisible = 5;
    this.counter = 0;
    this.container = null;

    this._createContainer();

    NotificationSystem.instance = this;
  }

  /**
   * Crear contenedor de toasts en el DOM
   * Manipulación DOM con JavaScript nativo
   */
  _createContainer() {
    // Verificar si ya existe
    let existing = document.getElementById('toast-container');
    if (existing) {
      this.container = existing;
      return;
    }

    // Crear elemento usando DOM API nativo
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  /**
   * Mostrar notificación
   * @param {string} type - success | error | warning | info
   * @param {string} title
   * @param {string} message
   * @param {number} duration - ms
   */
  show(type, title, message, duration = 4000) {
    const id = ++this.counter;

    // Crear toast element usando DOM nativo
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.setProperty('--toast-duration', `${duration}ms`);
    toast.setAttribute('data-toast-id', id);

    // Iconos según tipo usando switch (sentencia selectiva)
    let icon;
    switch (type) {
      case 'success':
        icon = '✓';
        break;
      case 'error':
        icon = '✕';
        break;
      case 'warning':
        icon = '⚠';
        break;
      case 'info':
        icon = 'ℹ';
        break;
      default:
        icon = '•';
        break;
    }

    // Construir HTML del toast
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Cerrar">&times;</button>
    `;

    // Evento de cierre con función anónima
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this._removeToast(id);
    });

    // Evento de mouse - pausar al hover
    toast.addEventListener('mouseenter', () => {
      const item = this.queue.find((q) => q.id === id);
      if (item && item.timer) {
        window.clearTimeout(item.timer);
      }
    });

    toast.addEventListener('mouseleave', () => {
      const item = this.queue.find((q) => q.id === id);
      if (item) {
        item.timer = window.setTimeout(() => {
          this._removeToast(id);
        }, 2000);
      }
    });

    // Agregar al contenedor
    this.container.appendChild(toast);

    // Timer para auto-cerrar usando BOM (window.setTimeout)
    const timer = window.setTimeout(() => {
      this._removeToast(id);
    }, duration);

    // Agregar a la cola
    this.queue.push({ id, element: toast, timer });

    // Limitar visible
    if (this.queue.length > this.maxVisible) {
      this._removeToast(this.queue[0].id);
    }

    return id;
  }

  /**
   * Remover toast con animación
   */
  _removeToast(id) {
    const index = this.queue.findIndex((q) => q.id === id);
    if (index === -1) return;

    const item = this.queue[index];

    // Limpiar timer
    if (item.timer) {
      window.clearTimeout(item.timer);
    }

    // Animación de salida
    item.element.classList.add('toast-exit');

    // Remover del DOM después de la animación
    window.setTimeout(() => {
      if (item.element.parentNode) {
        item.element.parentNode.removeChild(item.element);
      }
    }, 300);

    // Remover de la cola
    this.queue.splice(index, 1);
  }

  // Métodos de conveniencia
  success(title, message, duration) {
    return this.show('success', title, message, duration);
  }

  error(title, message, duration) {
    return this.show('error', title, message, duration);
  }

  warning(title, message, duration) {
    return this.show('warning', title, message, duration);
  }

  info(title, message, duration) {
    return this.show('info', title, message, duration);
  }

  /**
   * Limpiar todas las notificaciones
   */
  clearAll() {
    // Iteración con sentencia repetitiva
    while (this.queue.length > 0) {
      this._removeToast(this.queue[0].id);
    }
  }
}

// Singleton export
const notifications = new NotificationSystem();
export default notifications;

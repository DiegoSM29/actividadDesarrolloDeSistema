import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// ─── Axios Instance ─────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── jQuery AJAX Service (Módulo 5) ─────────────────────
// Se usa $ global cargado vía import de jQuery
export const ApiService = {
  baseUrl: API_BASE_URL,

  _getHeaders() {
    const token = localStorage.getItem('taskflow_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  getProjects() {
    const $ = window.jQuery;
    return $.ajax({
      url: `${this.baseUrl}/proyectos`,
      method: 'GET',
      headers: this._getHeaders(),
      beforeSend: function() {
        $('#loading-indicator').show();
      }
    }).fail(function(xhr) {
      console.error('Error fetching projects:', xhr.responseJSON);
    }).always(function() {
      $('#loading-indicator').hide();
    });
  },

  createTask(taskData) {
    const $ = window.jQuery;
    return $.ajax({
      url: `${this.baseUrl}/tareas`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(taskData),
      dataType: 'json',
      headers: this._getHeaders()
    });
  },

  updateTaskStatus(taskId, estado) {
    const $ = window.jQuery;
    return $.ajax({
      url: `${this.baseUrl}/tareas/${taskId}/estado`,
      method: 'PATCH',
      contentType: 'application/json',
      data: JSON.stringify({ estado }),
      dataType: 'json',
      headers: this._getHeaders()
    });
  },

  getComments(tareaId) {
    const $ = window.jQuery;
    return $.ajax({
      url: `${this.baseUrl}/comentarios`,
      method: 'GET',
      data: { tareaId },
      headers: this._getHeaders()
    });
  },

  createComment(commentData) {
    const $ = window.jQuery;
    return $.ajax({
      url: `${this.baseUrl}/comentarios`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(commentData),
      dataType: 'json',
      headers: this._getHeaders()
    });
  },

  updateComment(commentId, texto) {
    const $ = window.jQuery;
    return $.ajax({
      url: `${this.baseUrl}/comentarios/${commentId}`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ texto }),
      dataType: 'json',
      headers: this._getHeaders()
    });
  },

  deleteComment(commentId) {
    const $ = window.jQuery;
    return $.ajax({
      url: `${this.baseUrl}/comentarios/${commentId}`,
      method: 'DELETE',
      headers: this._getHeaders()
    });
  }
};

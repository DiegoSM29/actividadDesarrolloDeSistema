/**
 * FormValidator - Validación de formularios con JavaScript puro
 * Demuestra: POO con clase, Map para errores, manipulación DOM,
 * funciones anónimas, eventos de teclado
 */
class FormValidator {
  /**
   * @param {string} formId - ID del formulario
   * @param {Object} rules - Reglas de validación por campo
   */
  constructor(formId, rules) {
    this.form = document.getElementById(formId);
    this.rules = rules;
    /** @type {Map<string, string[]>} */
    this.errors = new Map();
    /** @type {Set<string>} */
    this.validFields = new Set();
    this.onSubmitCallback = null;

    if (this.form) {
      this.init();
    }
  }

  /**
   * Inicializar eventos del formulario
   */
  init() {
    // Evento submit con función anónima
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateAll()) {
        const formData = this.getFormData();
        if (typeof this.onSubmitCallback === 'function') {
          this.onSubmitCallback(formData);
        }
      }
    });

    // Validación en tiempo real con eventos de teclado
    const fields = Object.keys(this.rules);
    for (let i = 0; i < fields.length; i++) {
      const fieldName = fields[i];
      const input = this.form.querySelector(`[name="${fieldName}"]`);

      if (input) {
        // Evento keyup para validación en tiempo real
        input.addEventListener('keyup', () => {
          this.validateField(fieldName, input.value);
          this.updateFieldUI(fieldName, input);
        });

        // Evento blur para validación al salir del campo
        input.addEventListener('blur', () => {
          this.validateField(fieldName, input.value);
          this.updateFieldUI(fieldName, input);
        });
      }
    }
  }

  /**
   * Validar un campo específico
   * @param {string} fieldName
   * @param {string} value
   * @returns {boolean}
   */
  validateField(fieldName, value) {
    const fieldRules = this.rules[fieldName];
    if (!fieldRules) return true;

    const fieldErrors = [];

    // Iteración sobre reglas con for...of
    for (const rule of fieldRules) {
      // Validaciones usando sentencias selectivas
      if (rule.type === 'required' && (!value || value.trim() === '')) {
        fieldErrors.push(rule.message || `${fieldName} es requerido`);
      }

      if (rule.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          fieldErrors.push(rule.message || 'Email inválido');
        }
      }

      if (rule.type === 'minLength' && value && value.length < rule.value) {
        fieldErrors.push(rule.message || `Mínimo ${rule.value} caracteres`);
      }

      if (rule.type === 'maxLength' && value && value.length > rule.value) {
        fieldErrors.push(rule.message || `Máximo ${rule.value} caracteres`);
      }

      if (rule.type === 'pattern' && value) {
        const regex = new RegExp(rule.value);
        if (!regex.test(value)) {
          fieldErrors.push(rule.message || 'Formato inválido');
        }
      }

      if (rule.type === 'match') {
        const targetInput = this.form.querySelector(`[name="${rule.value}"]`);
        if (targetInput && value !== targetInput.value) {
          fieldErrors.push(rule.message || 'Los campos no coinciden');
        }
      }

      if (rule.type === 'custom' && typeof rule.validate === 'function') {
        if (!rule.validate(value)) {
          fieldErrors.push(rule.message || 'Valor inválido');
        }
      }
    }

    if (fieldErrors.length > 0) {
      this.errors.set(fieldName, fieldErrors);
      this.validFields.delete(fieldName);
    } else {
      this.errors.delete(fieldName);
      this.validFields.add(fieldName);
    }

    return fieldErrors.length === 0;
  }

  /**
   * Validar todos los campos
   */
  validateAll() {
    this.errors.clear();
    this.validFields.clear();

    const fields = Object.keys(this.rules);
    let isValid = true;

    // Sentencia repetitiva forEach
    fields.forEach((fieldName) => {
      const input = this.form.querySelector(`[name="${fieldName}"]`);
      const value = input ? input.value : '';

      if (!this.validateField(fieldName, value)) {
        isValid = false;
      }

      if (input) {
        this.updateFieldUI(fieldName, input);
      }
    });

    return isValid;
  }

  /**
   * Actualizar UI del campo (mostrar/ocultar errores)
   * Manipulación DOM nativa
   */
  updateFieldUI(fieldName, input) {
    // Buscar o crear contenedor de error
    let errorContainer = input.parentElement.querySelector('.form-error');

    if (this.errors.has(fieldName)) {
      const errors = this.errors.get(fieldName);
      input.style.borderColor = 'var(--accent-red)';
      input.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.2)';

      if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'form-error';
        input.parentElement.appendChild(errorContainer);
      }

      errorContainer.textContent = errors[0];
    } else {
      input.style.borderColor = '';
      input.style.boxShadow = '';

      if (this.validFields.has(fieldName)) {
        input.style.borderColor = 'var(--accent-green)';
        input.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.2)';
      }

      if (errorContainer) {
        errorContainer.parentElement.removeChild(errorContainer);
      }
    }
  }

  /**
   * Obtener datos del formulario como objeto
   */
  getFormData() {
    const data = {};
    const formData = new FormData(this.form);
    formData.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }

  /**
   * Establecer callback de submit
   */
  onSubmit(callback) {
    this.onSubmitCallback = callback;
    return this;
  }

  /**
   * Resetear formulario y errores
   */
  reset() {
    this.errors.clear();
    this.validFields.clear();
    if (this.form) {
      this.form.reset();
      // Limpiar estilos de error
      const inputs = this.form.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
      });
      // Remover mensajes de error del DOM
      const errorElements = this.form.querySelectorAll('.form-error');
      errorElements.forEach((el) => el.parentElement.removeChild(el));
    }
  }
}

export default FormValidator;

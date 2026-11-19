/**
 * Kanban Manager - Drag & Drop con jQuery UI
 * Demuestra: jQuery selectores, eventos, jQuery UI plugins (draggable, droppable),
 * manipulación DOM con jQuery, métodos de efectos
 */
import { ApiService } from '../services/api';
import notifications from '../utils/NotificationSystem';

/**
 * Inicializar el tablero Kanban con jQuery UI
 * @param {Function} onStatusChange - Callback cuando cambia el estado de una tarea
 */
export function initKanban(onStatusChange) {
  const $ = window.jQuery;
  if (!$ || !$.ui) {
    console.warn('jQuery UI no está disponible');
    return;
  }

  $(document).ready(function() {
    // ─── Drag & Drop de tareas entre columnas ────────
    // Cada task-card es draggable
    $(".task-card").draggable({
      revert: "invalid",
      helper: "clone",
      cursor: "move",
      opacity: 0.8,
      zIndex: 1000,
      start: function(event, ui) {
        // Efecto visual al iniciar drag
        $(this).addClass('dragging');
        ui.helper.css({
          'transform': 'rotate(3deg)',
          'box-shadow': '0 8px 32px rgba(0,0,0,0.4)'
        });
      },
      stop: function() {
        $(this).removeClass('dragging');
      }
    });

    // Cada columna kanban es droppable
    $(".kanban-column-body").droppable({
      accept: ".task-card",
      hoverClass: "drag-over",
      tolerance: "pointer",
      drop: function(event, ui) {
        const taskId = ui.draggable.data("id");
        const newStatus = $(this).closest('.kanban-column').data("status");
        const oldStatus = ui.draggable.data("status");

        if (oldStatus === newStatus) return;

        // Note: No hacemos detach() ni appendTo() manual con jQuery
        // porque React está rastreando el DOM (React Virtual DOM).
        // Si movemos el DOM con jQuery, React crasheará con una "Página Blanca"
        // cuando intente re-renderizar botones condicionales.
        // Simplemente disparamos el cambio de estado y React se encarga de re-renderizar.

        // Actualizar en el backend vía AJAX
        ApiService.updateTaskStatus(taskId, newStatus)
          .then(function() {
            notifications.success('Tarea actualizada', `Estado cambiado a: ${getStatusLabel(newStatus)}`);
            // Actualizar contadores de columnas
            updateColumnCounts();
            // Callback para sincronizar React
            if (typeof onStatusChange === 'function') {
              onStatusChange(taskId, newStatus);
            }
          })
          .fail(function(xhr) {
            notifications.error('Error', 'No se pudo actualizar la tarea');
            console.error('Error updating task:', xhr);
          });
      }
    });

    // ─── Filtro de búsqueda con eventos jQuery ───────
    $("#searchTask").on("keyup", function() {
      const searchTerm = $(this).val().toLowerCase();
      $(".task-card").each(function() {
        const title = $(this).find(".task-title").text().toLowerCase();
        const desc = $(this).find(".task-desc").text().toLowerCase();
        const matches = title.includes(searchTerm) || desc.includes(searchTerm);
        // Usar toggle con animación
        if (matches) {
          $(this).slideDown(200);
        } else {
          $(this).slideUp(200);
        }
      });
    });

    // ─── Hover effects con jQuery ────────────────────
    $(".task-card").on("mouseenter", function() {
      $(this).css('transform', 'translateY(-2px)');
    }).on("mouseleave", function() {
      $(this).css('transform', 'translateY(0)');
    });
  });
}

/**
 * Re-inicializar draggable para nuevas tarjetas
 * Se llama después de que React renderiza nuevas tarjetas
 */
export function refreshDraggable(onStatusChange) {
  const $ = window.jQuery;
  if (!$ || !$.ui) return;

  // Destruir draggable existente y re-crear
  $(".task-card").each(function() {
    if ($(this).hasClass('ui-draggable')) {
      $(this).draggable('destroy');
    }
  });

  // Re-inicializar
  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone",
    cursor: "move",
    opacity: 0.8,
    zIndex: 1000,
    start: function(event, ui) {
      $(this).addClass('dragging');
      ui.helper.css({
        'transform': 'rotate(3deg)',
        'box-shadow': '0 8px 32px rgba(0,0,0,0.4)'
      });
    },
    stop: function() {
      $(this).removeClass('dragging');
    }
  });

  // Re-inicializar droppable también
  $(".kanban-column-body").each(function() {
    if ($(this).hasClass('ui-droppable')) {
      $(this).droppable('destroy');
    }
  });

  $(".kanban-column-body").droppable({
    accept: ".task-card",
    hoverClass: "drag-over",
    tolerance: "pointer",
    drop: function(event, ui) {
      const taskId = ui.draggable.data("id");
      const newStatus = $(this).closest('.kanban-column').data("status");
      const oldStatus = ui.draggable.data("status");

      if (oldStatus === newStatus) return;

      // Delegar movimiento del DOM a React para evitar conflictos de Virtual DOM
      ApiService.updateTaskStatus(taskId, newStatus)
        .then(function() {
          notifications.success('Tarea actualizada', `Estado cambiado a: ${getStatusLabel(newStatus)}`);
          updateColumnCounts();
          if (typeof onStatusChange === 'function') {
            onStatusChange(taskId, newStatus);
          }
        })
        .fail(function() {
          notifications.error('Error', 'No se pudo actualizar la tarea');
        });
    }
  });
}

/**
 * Actualizar contadores de columnas
 */
function updateColumnCounts() {
  const $ = window.jQuery;
  $(".kanban-column").each(function() {
    const count = $(this).find('.kanban-column-body .task-card').length;
    $(this).find('.column-count').text(count);
  });
}

/**
 * Obtener label de estado
 */
function getStatusLabel(status) {
  const labels = {
    pendiente: 'Pendiente',
    en_progreso: 'En Progreso',
    completada: 'Completada'
  };
  return labels[status] || status;
}

export default { initKanban, refreshDraggable };

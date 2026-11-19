/**
 * Comment Manager - Gestión de comentarios con jQuery
 * Demuestra: jQuery AJAX, manipulación DOM jQuery, selectores avanzados,
 * métodos de efectos (fadeIn, slideDown), edición inline
 */
import { ApiService } from '../services/api';
import notifications from '../utils/NotificationSystem';

/**
 * Inicializar sistema de comentarios jQuery
 * @param {string} containerId - ID del contenedor de comentarios
 */
export function initComments(containerId) {
  const $ = window.jQuery;
  if (!$) return;

  const $container = $(`#${containerId}`);
  if ($container.length === 0) return;

  // ─── Cargar comentarios con AJAX ──────────────────
  $container.on('click', '.load-comments-btn', function() {
    const tareaId = $(this).data('tarea-id');
    loadComments($container, tareaId);
  });

  // ─── Enviar nuevo comentario ──────────────────────
  $container.on('click', '.submit-comment-btn', function() {
    const tareaId = $(this).data('tarea-id');
    const $input = $container.find('.comment-input');
    const texto = $input.val().trim();

    if (!texto) {
      $input.css('border-color', 'var(--accent-red)');
      return;
    }

    $input.css('border-color', '');

    ApiService.createComment({ tareaId, texto })
      .then(function(comment) {
        // Agregar comentario al DOM con animación jQuery
        const commentHtml = renderCommentHtml(comment);
        const $comment = $(commentHtml);
        $container.find('.comments-list').prepend($comment);
        $comment.hide().slideDown(300);

        $input.val('');
        notifications.success('Comentario agregado', 'Tu comentario fue publicado');
      })
      .fail(function() {
        notifications.error('Error', 'No se pudo publicar el comentario');
      });
  });

  // ─── Tecla Enter para enviar ──────────────────────
  $container.on('keypress', '.comment-input', function(e) {
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();
      $container.find('.submit-comment-btn').trigger('click');
    }
  });

  // ─── Edición inline ───────────────────────────────
  $container.on('click', '.edit-comment-btn', function() {
    const $commentItem = $(this).closest('.comment-item');
    const $textEl = $commentItem.find('.comment-text');
    const currentText = $textEl.text();
    const commentId = $commentItem.data('comment-id');

    // Reemplazar texto con input editable
    $textEl.html(`
      <textarea class="comment-edit-input form-input" style="min-height:60px">${currentText}</textarea>
      <div class="flex gap-sm mt-md">
        <button class="btn btn-primary btn-sm save-edit-btn">Guardar</button>
        <button class="btn btn-secondary btn-sm cancel-edit-btn">Cancelar</button>
      </div>
    `);

    $textEl.find('.comment-edit-input').focus();

    // Guardar edición
    $textEl.find('.save-edit-btn').on('click', function() {
      const newText = $textEl.find('.comment-edit-input').val().trim();
      if (!newText) return;

      ApiService.updateComment(commentId, newText)
        .then(function() {
          $textEl.fadeOut(150, function() {
            $textEl.html(newText + ' <span class="comment-edited">(editado)</span>');
            $textEl.fadeIn(150);
          });
          notifications.success('Editado', 'Comentario actualizado');
        })
        .fail(function() {
          notifications.error('Error', 'No se pudo editar el comentario');
        });
    });

    // Cancelar edición
    $textEl.find('.cancel-edit-btn').on('click', function() {
      $textEl.fadeOut(150, function() {
        $textEl.html(currentText);
        $textEl.fadeIn(150);
      });
    });
  });

  // ─── Eliminar comentario ──────────────────────────
  $container.on('click', '.delete-comment-btn', function() {
    const $commentItem = $(this).closest('.comment-item');
    const commentId = $commentItem.data('comment-id');

    if (!window.confirm('¿Estás seguro de eliminar este comentario?')) return;

    ApiService.deleteComment(commentId)
      .then(function() {
        $commentItem.slideUp(300, function() {
          $(this).remove();
        });
        notifications.success('Eliminado', 'Comentario eliminado');
      })
      .fail(function() {
        notifications.error('Error', 'No se pudo eliminar el comentario');
      });
  });
}

/**
 * Cargar comentarios de una tarea vía jQuery AJAX
 * @param {jQuery} $container
 * @param {string} tareaId
 */
export function loadComments($container, tareaId) {
  const $ = window.jQuery;

  // Mostrar loading con jQuery
  const $list = $container.find('.comments-list');
  $list.html('<div class="loading-container" style="min-height:100px"><div class="spinner"></div></div>');

  ApiService.getComments(tareaId)
    .then(function(comments) {
      $list.empty();

      if (comments.length === 0) {
        $list.html('<div class="empty-state" style="padding:20px"><p>No hay comentarios aún</p></div>');
        return;
      }

      // Iterar y agregar cada comentario con animación
      comments.forEach(function(comment, index) {
        const $comment = $(renderCommentHtml(comment));
        $list.append($comment);
        // Animación escalonada usando fadeIn con delay
        $comment.hide().delay(index * 100).fadeIn(300);
      });
    })
    .fail(function() {
      $list.html('<div class="empty-state" style="padding:20px"><p style="color:var(--accent-red)">Error al cargar comentarios</p></div>');
    });
}

/**
 * Renderizar HTML de un comentario
 * @param {Object} comment
 * @returns {string}
 */
function renderCommentHtml(comment) {
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.autorNombre || 'U')}&background=6C63FF&color=fff&size=36`;
  const timeAgo = getTimeAgo(comment.createdAt);
  const edited = comment.editado ? ' <span class="comment-edited" style="color:var(--text-tertiary);font-size:0.7rem">(editado)</span>' : '';

  return `
    <div class="comment-item" data-comment-id="${comment.id}">
      <img src="${avatar}" alt="${comment.autorNombre}" class="comment-avatar" />
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">${comment.autorNombre || 'Usuario'}</span>
          <span class="comment-time">${timeAgo}</span>
        </div>
        <div class="comment-text">${comment.texto}${edited}</div>
        <div class="comment-actions">
          <button class="edit-comment-btn">Editar</button>
          <button class="delete-comment-btn">Eliminar</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Calcular tiempo relativo
 */
function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Justo ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHr < 24) return `hace ${diffHr}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES');
}

export default { initComments, loadComments };

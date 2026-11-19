import { useEffect, useRef, useState } from 'react';
import { initComments, loadComments } from '../../jquery/commentManager';

/**
 * CommentSection - Sección de comentarios (con jQuery)
 * Se integra con el commentManager de jQuery para AJAX, animaciones y edición inline
 */
export default function CommentSection({ taskId, projectId }) {
  const containerRef = useRef(null);
  const containerId = `comments-${taskId}`;
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && window.jQuery) {
      // Inicializar jQuery comment manager
      initComments(containerId);
      setInitialized(true);
    }
  }, [containerId, initialized]);

  // Cargar comentarios cuando cambia la tarea
  useEffect(() => {
    if (initialized && window.jQuery) {
      const $ = window.jQuery;
      const $container = $(`#${containerId}`);
      if ($container.length > 0) {
        loadComments($container, taskId);
      }
    }
  }, [taskId, containerId, initialized]);

  return (
    <div className="comments-section" id={containerId} ref={containerRef}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>💬 Comentarios</h3>

      {/* Lista de comentarios (gestionada por jQuery) */}
      <div
        className="comments-list"
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          marginBottom: '12px'
        }}
      >
        <div className="loading-container" style={{ minHeight: '80px', padding: '20px' }}>
          <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
        </div>
      </div>

      {/* Input de nuevo comentario */}
      <div className="comment-input-container" style={{ padding: 0 }}>
        <textarea
          className="comment-input"
          placeholder="Escribe un comentario..."
          rows="2"
          id={`comment-input-${taskId}`}
        ></textarea>
        <button
          className="btn btn-primary btn-sm submit-comment-btn"
          data-tarea-id={taskId}
          style={{ alignSelf: 'flex-end' }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

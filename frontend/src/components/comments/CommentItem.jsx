export default function CommentItem({ comment }) {
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.autorNombre || 'U')}&background=6C63FF&color=fff&size=36`;

  const timeAgo = (dateStr) => {
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
  };

  return (
    <div className="comment-item" data-comment-id={comment.id}>
      <img src={avatar} alt={comment.autorNombre} className="comment-avatar" />
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.autorNombre || 'Usuario'}</span>
          <span className="comment-time">{timeAgo(comment.createdAt)}</span>
          {comment.editado && <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>(editado)</span>}
        </div>
        <div className="comment-text">{comment.texto}</div>
        <div className="comment-actions">
          <button className="edit-comment-btn">Editar</button>
          <button className="delete-comment-btn">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

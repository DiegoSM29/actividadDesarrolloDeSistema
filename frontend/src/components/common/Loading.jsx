export default function Loading({ text = 'Cargando...' }) {
  return (
    <div className="loading-container" id="loading-indicator">
      <div className="spinner"></div>
      <span className="loading-text">{text}</span>
    </div>
  );
}

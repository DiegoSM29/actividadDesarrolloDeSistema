export default function TaskFilters({ filters, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="task-filters">
      <div className="filter-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar tareas..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          id="searchTask"
        />
      </div>

      <select
        className="filter-select"
        value={filters.prioridad || ''}
        onChange={(e) => handleChange('prioridad', e.target.value)}
        id="filter-prioridad"
      >
        <option value="">Todas las prioridades</option>
        <option value="alta">🔥 Alta</option>
        <option value="media">⚡ Media</option>
        <option value="baja">🔵 Baja</option>
      </select>

      <select
        className="filter-select"
        value={filters.asignado || ''}
        onChange={(e) => handleChange('asignado', e.target.value)}
        id="filter-asignado"
      >
        <option value="">Todos los miembros</option>
        <option value="ana@email.com">Ana García</option>
        <option value="carlos@email.com">Carlos López</option>
        <option value="maria@email.com">María Rodríguez</option>
      </select>
    </div>
  );
}

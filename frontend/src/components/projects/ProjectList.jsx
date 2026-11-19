import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import ProjectCard from '../dashboard/ProjectCard';
import ProjectForm from './ProjectForm';
import Loading from '../common/Loading';

export default function ProjectList() {
  const { projects, fetchProjects, loading, createProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = projects.filter((p) => {
    const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filterEstado || p.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const handleCreate = async (data) => {
    await createProject(data);
    setShowForm(false);
    fetchProjects();
  };

  if (loading && projects.length === 0) return <Loading />;

  return (
    <div id="projects-page">
      <div className="section-header">
        <h1 className="section-title">
          Proyectos <span className="section-count">({filtered.length})</span>
        </h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-new-project">
          + Nuevo Proyecto
        </button>
      </div>

      {/* Filters */}
      <div className="task-filters">
        <div className="filter-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-projects"
          />
        </div>
        <select
          className="filter-select"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          id="filter-project-estado"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="pausado">Pausado</option>
          <option value="completado">Completado</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No hay proyectos</h3>
          <p>Crea tu primer proyecto para comenzar</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <ProjectForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

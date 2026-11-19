import { useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects debe usarse dentro de un ProjectProvider');
  }
  const { projects, currentProject, loading, fetchProjects, fetchProject, createProject, updateProject, deleteProject, stats, fetchStats, setCurrentProject } = context;
  return { projects, currentProject, loading, fetchProjects, fetchProject, createProject, updateProject, deleteProject, stats, fetchStats, setCurrentProject };
}

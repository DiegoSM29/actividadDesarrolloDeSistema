import { useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';

export function useTasks() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useTasks debe usarse dentro de un ProjectProvider');
  }
  const { tasks, loading, fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask } = context;
  return { tasks, loading, fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask };
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProjectList from './components/projects/ProjectList';
import ProjectDetail from './components/projects/ProjectDetail';
import MyTasks from './components/tasks/MyTasks';
import Reports from './components/reports/Reports';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import { useEffect, useState } from 'react';
import { initTooltips } from './jquery/tooltipManager';

// Import jQuery globally - setup MUST come before jquery-ui
import './jquery/setup';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';

function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Inicializar tooltips de jQuery
    initTooltips();
  }, []);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="app-main">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas protegidas con layout */}
            <Route path="/" element={
              <PrivateRoute>
                <AppLayout><Dashboard /></AppLayout>
              </PrivateRoute>
            } />
            <Route path="/projects" element={
              <PrivateRoute>
                <AppLayout><ProjectList /></AppLayout>
              </PrivateRoute>
            } />
            <Route path="/projects/:id" element={
              <PrivateRoute>
                <AppLayout><ProjectDetail /></AppLayout>
              </PrivateRoute>
            } />
            <Route path="/tasks" element={
              <PrivateRoute>
                <AppLayout><MyTasks /></AppLayout>
              </PrivateRoute>
            } />
            <Route path="/reports" element={
              <PrivateRoute>
                <AppLayout><Reports /></AppLayout>
              </PrivateRoute>
            } />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

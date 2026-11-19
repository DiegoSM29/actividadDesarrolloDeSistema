# TaskFlow - Plataforma de Gestión de Proyectos

## 📋 Descripción

**TaskFlow** es una plataforma completa de gestión de proyectos que permite a equipos de trabajo organizar tareas, colaborar en tiempo real y visualizar el progreso de sus proyectos. Desarrollada como proyecto final del curso de Diseño Web II.

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** + **Express** - API REST
- **Socket.IO** - Comunicación en tiempo real
- **JWT** (jsonwebtoken) - Autenticación
- **bcryptjs** - Hash de contraseñas
- **JSON** - Persistencia de datos en memoria

### Frontend
- **React 18** (Vite) - Framework principal
- **React Router** - Navegación SPA
- **Context API** + Custom Hooks - Manejo de estado
- **Axios** - Peticiones HTTP
- **jQuery** + jQuery UI - Drag & Drop, AJAX, efectos
- **Socket.IO Client** - Comunicación en tiempo real
- **Canvas API** - Gráficos estadísticos
- **CSS puro** - Design system dark mode

## 📁 Estructura del Proyecto

```
proyecto_final_taskflow/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Controladores (Auth, Projects, Tasks, Comments)
│   │   ├── middleware/      # JWT Auth middleware
│   │   ├── models/          # DataStore (Map, Set, JSON persistence)
│   │   ├── routes/          # Rutas Express
│   │   ├── socket/          # Socket.IO handlers
│   │   └── app.js           # Servidor principal
│   ├── data/                # Datos JSON
│   ├── seed.js              # Script para generar datos de prueba
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── auth/        # Login, Register, PrivateRoute
│   │   │   ├── common/      # Header, Sidebar, Loading
│   │   │   ├── dashboard/   # Dashboard, ProjectCard, StatsWidget
│   │   │   ├── projects/    # ProjectList, ProjectForm, ProjectDetail
│   │   │   ├── tasks/       # TaskBoard (Kanban), TaskCard, TaskForm
│   │   │   ├── comments/    # CommentSection (jQuery), CommentItem
│   │   │   └── reports/     # Reports (Canvas charts)
│   │   ├── context/         # AuthContext, ProjectContext
│   │   ├── hooks/           # useAuth, useProjects, useTasks
│   │   ├── services/        # API (Axios + jQuery AJAX), Socket.IO
│   │   ├── jquery/          # jQuery modules (Kanban, Comments, Tooltips)
│   │   ├── utils/           # JS puro (Notifications, Validator, Charts, Exporter)
│   │   └── App.jsx
│   └── package.json
├── database/
│   └── datos_ejemplo.json
├── .gitignore
└── README.md
```

## ⚙️ Instalación

### Prerrequisitos
- Node.js v18+
- npm v9+

### Backend
```bash
cd backend
npm install
node seed.js    # Generar contraseñas de prueba
npm run dev     # Inicia en http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev     # Inicia en http://localhost:5173
```

## 👤 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| ana@email.com | 123456 | Admin |
| carlos@email.com | 123456 | Miembro |
| maria@email.com | 123456 | Miembro |

## 📐 Contenido Técnico Demostrado

### JavaScript Puro
- ✅ Variables y tipos de datos
- ✅ Operadores en todas las operaciones
- ✅ Sentencias selectivas (if, switch) en validaciones
- ✅ Sentencias repetitivas (for, forEach, while)
- ✅ Tipos de referencia (Map, Set, Array, Object)
- ✅ POO con clases (NotificationSystem, FormValidator, ChartRenderer, DataStore)
- ✅ Funciones anónimas en callbacks
- ✅ Manipulación BOM (window, localStorage, FileReader)
- ✅ Manipulación DOM con JavaScript nativo
- ✅ Eventos de teclado y mouse

### jQuery
- ✅ Carga correcta de la librería
- ✅ Selectores avanzados
- ✅ Manipulación del DOM con jQuery
- ✅ Métodos de eventos (on, trigger, keyup)
- ✅ Métodos de efectos (fadeIn, fadeOut, slideDown, slideUp)
- ✅ Plugins jQuery UI (draggable, droppable)
- ✅ Peticiones AJAX con $.ajax
- ✅ Procesamiento de JSON

### React (Framework)
- ✅ Estructura de componentes
- ✅ Hooks (useState, useEffect, useCallback, useRef, useContext)
- ✅ Custom Hooks (useAuth, useProjects, useTasks)
- ✅ Context API (AuthContext, ProjectContext)
- ✅ React Router (rutas protegidas)
- ✅ Integración con jQuery y Socket.IO
- ✅ Aplicación funcional completa

## 📡 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Registro |
| GET | /api/auth/me | Usuario actual |
| GET | /api/proyectos | Listar proyectos |
| GET | /api/proyectos/:id | Detalle proyecto |
| POST | /api/proyectos | Crear proyecto |
| PUT | /api/proyectos/:id | Editar proyecto |
| DELETE | /api/proyectos/:id | Eliminar proyecto |
| GET | /api/tareas | Listar tareas |
| POST | /api/tareas | Crear tarea |
| PUT | /api/tareas/:id | Editar tarea |
| PATCH | /api/tareas/:id/estado | Cambiar estado |
| DELETE | /api/tareas/:id | Eliminar tarea |
| GET | /api/comentarios | Comentarios por tarea |
| POST | /api/comentarios | Crear comentario |
| PUT | /api/comentarios/:id | Editar comentario |
| DELETE | /api/comentarios/:id | Eliminar comentario |

## 🔌 WebSocket Events

| Evento | Descripción |
|--------|-------------|
| join-project | Unirse a sala de proyecto |
| leave-project | Salir de sala |
| task-updated | Tarea actualizada |
| new-comment | Nuevo comentario |
| project-users | Usuarios conectados |

## 👨‍💻 Autor

Proyecto Final - Diseño Web II

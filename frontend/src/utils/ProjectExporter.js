/**
 * ProjectExporter - Exportación/Importación de proyectos en JSON
 * Demuestra: BOM (window, localStorage), FileReader, JSON, DOM manipulation
 */

/**
 * Exportar proyecto a archivo JSON descargable
 * Usa manipulación BOM y DOM para la descarga
 * @param {Object} project - Datos del proyecto
 */
export function exportProject(project) {
  // Serialización JSON con formato legible
  const dataStr = JSON.stringify(project, null, 2);

  // Usar BOM APIs para crear descarga
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const fileName = `proyecto_${project.nombre.replace(/\s+/g, '_')}_${Date.now()}.json`;

  // Manipulación DOM para trigger descarga
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', fileName);
  linkElement.style.display = 'none';
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
}

/**
 * Importar proyecto desde archivo JSON
 * Usa FileReader API (BOM)
 * @param {File} jsonFile - Archivo JSON
 * @returns {Promise<Object>}
 */
export function importProject(jsonFile) {
  return new Promise((resolve, reject) => {
    // Validar tipo de archivo
    if (!jsonFile.name.endsWith('.json') && jsonFile.type !== 'application/json') {
      reject(new Error('El archivo debe ser de tipo JSON'));
      return;
    }

    // FileReader API - BOM
    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        const project = JSON.parse(e.target.result);

        // Validación básica de estructura
        if (!project.nombre) {
          reject(new Error('El archivo JSON no contiene un proyecto válido'));
          return;
        }

        resolve(project);
      } catch(error) {
        reject(new Error('Archivo JSON inválido: ' + error.message));
      }
    };

    reader.onerror = function() {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsText(jsonFile);
  });
}

/**
 * Backup automático en localStorage (BOM)
 * @param {Object} projectData
 */
export function autoSaveToLocal(projectData) {
  const backup = {
    data: projectData,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('taskflow_project_backup', JSON.stringify(backup));
}

/**
 * Recuperar backup de localStorage
 * @returns {Object|null}
 */
export function getLocalBackup() {
  const backupStr = localStorage.getItem('taskflow_project_backup');
  if (!backupStr) return null;

  try {
    return JSON.parse(backupStr);
  } catch {
    return null;
  }
}

/**
 * Limpiar backup de localStorage
 */
export function clearLocalBackup() {
  localStorage.removeItem('taskflow_project_backup');
}

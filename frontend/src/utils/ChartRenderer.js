/**
 * ChartRenderer - Gráficos estadísticos con Canvas API
 * Demuestra: POO, Canvas API, requestAnimationFrame, variables y operadores
 */
class ChartRenderer {
  /**
   * @param {string} canvasId - ID del canvas
   * @param {number} width
   * @param {number} height
   */
  constructor(canvasId, width = 400, height = 300) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;
    this.animationProgress = 0;
    this.animationFrame = null;

    this.isLightMode = document.documentElement.getAttribute('data-theme') === 'light';

    // Colores del tema
    this.colors = {
      primary: '#6C63FF',
      green: '#4ECDC4',
      red: '#FF6B6B',
      orange: '#FF9F43',
      blue: '#54A0FF',
      pink: '#FF6B9D',
      yellow: '#FFE66D',
      text: this.isLightMode ? '#212529' : '#FFFFFE',
      textSecondary: this.isLightMode ? '#495057' : '#A7A9BE',
      bg: this.isLightMode ? '#FFFFFF' : '#232234',
      grid: this.isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(167, 169, 190, 0.1)'
    };
  }

  /**
   * Limpiar canvas
   */
  clear() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Gráfico circular - Distribución de tareas por estado
   * @param {Object} data - { pendiente: n, en_progreso: n, completada: n }
   * @param {string} title
   */
  drawPieChart(data, title = 'Distribución de Tareas') {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const centerX = w * 0.4;
    const centerY = h * 0.55;
    const radius = Math.min(w, h) * 0.3;

    const entries = Object.entries(data);
    const total = entries.reduce((sum, [, val]) => sum + val, 0);

    if (total === 0) {
      this._drawEmptyState(title);
      return;
    }

    const colorMap = {
      pendiente: this.colors.textSecondary,
      en_progreso: this.colors.blue,
      completada: this.colors.green
    };

    const labelMap = {
      pendiente: 'Pendientes',
      en_progreso: 'En Progreso',
      completada: 'Completadas'
    };

    // Animación con requestAnimationFrame
    this.animationProgress = 0;
    const animate = () => {
      this.animationProgress += 0.025;
      if (this.animationProgress > 1) this.animationProgress = 1;

      this.clear();

      // Título
      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, w / 2, 24);

      // Dibujar segmentos
      let startAngle = -Math.PI / 2;

      for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        const percentage = value / total;
        const sliceAngle = (2 * Math.PI * percentage) * this.animationProgress;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colorMap[key] || this.colors.primary;
        ctx.fill();

        // Borde entre segmentos
        ctx.strokeStyle = this.isLightMode ? '#FFFFFF' : '#0F0E17';
        ctx.lineWidth = 2;
        ctx.stroke();

        startAngle += sliceAngle;
      }

      // Centro (donut)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.55, 0, 2 * Math.PI);
      ctx.fillStyle = this.isLightMode ? '#FFFFFF' : '#0F0E17';
      ctx.fill();

      // Número total en el centro
      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(total * this.animationProgress), centerX, centerY - 6);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = this.colors.textSecondary;
      ctx.fillText('tareas', centerX, centerY + 14);

      // Leyenda
      const legendX = w * 0.72;
      let legendY = h * 0.3;

      for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        const pct = Math.round((value / total) * 100);

        // Color indicator
        ctx.fillStyle = colorMap[key] || this.colors.primary;
        ctx.beginPath();
        ctx.roundRect(legendX - 6, legendY - 6, 12, 12, 3);
        ctx.fill();

        // Label
        ctx.fillStyle = this.colors.text;
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${labelMap[key] || key}`, legendX + 14, legendY + 3);

        // Value
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(`${value} (${pct}%)`, legendX + 14, legendY + 18);

        legendY += 40;
      }

      if (this.animationProgress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    animate();
  }

  /**
   * Gráfico de barras - Progreso de proyectos
   * @param {Array<{nombre: string, progreso: number}>} projects
   * @param {string} title
   */
  drawBarChart(projects, title = 'Progreso de Proyectos') {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const padding = { top: 45, right: 20, bottom: 50, left: 50 };

    if (!projects || projects.length === 0) {
      this._drawEmptyState(title);
      return;
    }

    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const barWidth = Math.min(60, (chartW / projects.length) * 0.6);
    const gap = (chartW - barWidth * projects.length) / (projects.length + 1);

    const barColors = [this.colors.primary, this.colors.red, this.colors.green, this.colors.orange, this.colors.blue];

    this.animationProgress = 0;

    const animate = () => {
      this.animationProgress += 0.03;
      if (this.animationProgress > 1) this.animationProgress = 1;

      this.clear();

      // Título
      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, w / 2, 24);

      // Grid lines horizontales
      ctx.strokeStyle = this.colors.grid;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        // Labels del eje Y
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${100 - i * 25}%`, padding.left - 8, y + 4);
      }

      // Barras
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const x = padding.left + gap + i * (barWidth + gap);
        const barH = (project.progreso / 100) * chartH * this.animationProgress;
        const y = padding.top + chartH - barH;

        // Gradiente para barra
        const gradient = ctx.createLinearGradient(x, y, x, padding.top + chartH);
        const color = barColors[i % barColors.length];
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '44');

        // Barra con bordes redondeados
        ctx.beginPath();
        const r = 4;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + barWidth - r, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
        ctx.lineTo(x + barWidth, padding.top + chartH);
        ctx.lineTo(x, padding.top + chartH);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Valor sobre la barra
        if (this.animationProgress > 0.5) {
          ctx.fillStyle = this.colors.text;
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${project.progreso}%`, x + barWidth / 2, y - 8);
        }

        // Label del proyecto (nombre trucado)
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        const label = project.nombre.length > 12 ? project.nombre.substring(0, 12) + '…' : project.nombre;
        ctx.fillText(label, x + barWidth / 2, h - padding.bottom + 18);
      }

      if (this.animationProgress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    animate();
  }

  /**
   * Estado vacío
   */
  _drawEmptyState(title) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.clear();

    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, 24);

    ctx.fillStyle = this.colors.textSecondary;
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Sin datos disponibles', w / 2, h / 2);
  }

  /**
   * Destruir y limpiar animaciones
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.clear();
  }
}

export default ChartRenderer;

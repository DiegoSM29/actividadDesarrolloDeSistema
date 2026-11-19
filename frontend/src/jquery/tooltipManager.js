/**
 * Tooltip Manager - Tooltips personalizados con jQuery
 * Demuestra: jQuery selectores avanzados, eventos de mouse,
 * posicionamiento dinámico, animaciones jQuery
 */

/**
 * Inicializar tooltips personalizados
 * Se aplica a elementos con atributo data-tooltip
 */
export function initTooltips() {
  const $ = window.jQuery;
  if (!$) return;

  $(document).ready(function() {
    let $tooltip = null;

    // Crear/obtener elemento tooltip
    function getTooltip() {
      if (!$tooltip || $tooltip.length === 0) {
        $tooltip = $('<div class="custom-tooltip" id="custom-tooltip"></div>');
        $('body').append($tooltip);
      }
      return $tooltip;
    }

    // ─── Eventos de mouse para tooltips ──────────────
    // Selector avanzado: cualquier elemento con data-tooltip
    $(document).on('mouseenter', '[data-tooltip]', function(e) {
      const $el = $(this);
      const text = $el.attr('data-tooltip');
      if (!text) return;

      const $tip = getTooltip();
      $tip.html(text);

      // Posicionamiento dinámico basado en posición del mouse
      const elRect = this.getBoundingClientRect();
      let tipX = elRect.left + (elRect.width / 2);
      let tipY = elRect.top - 8;

      // Mostrar temporalmente para medir dimensiones
      $tip.css({ visibility: 'hidden', display: 'block' });
      const tipW = $tip.outerWidth();
      const tipH = $tip.outerHeight();
      $tip.css({ visibility: '', display: '' });

      // Ajustar posición para no salir de pantalla
      tipX = tipX - (tipW / 2);
      tipY = tipY - tipH;

      // Verificar bordes de la ventana (BOM - window)
      if (tipX < 8) tipX = 8;
      if (tipX + tipW > window.innerWidth - 8) {
        tipX = window.innerWidth - tipW - 8;
      }
      if (tipY < 8) {
        // Mostrar debajo si no hay espacio arriba
        tipY = elRect.bottom + 8;
        $tip.addClass('tooltip-bottom');
      } else {
        $tip.removeClass('tooltip-bottom');
      }

      // Mostrar con animación jQuery
      $tip.css({
        left: tipX + 'px',
        top: tipY + 'px'
      }).stop(true).fadeIn(150);
    });

    $(document).on('mouseleave', '[data-tooltip]', function() {
      const $tip = getTooltip();
      $tip.stop(true).fadeOut(100);
    });

    // Ocultar al hacer scroll
    $(window).on('scroll', function() {
      if ($tooltip) {
        $tooltip.hide();
      }
    });
  });
}

/**
 * Actualizar texto de un tooltip específico
 * @param {string} selector - Selector jQuery
 * @param {string} newText
 */
export function updateTooltip(selector, newText) {
  const $ = window.jQuery;
  if (!$) return;
  $(selector).attr('data-tooltip', newText);
}

/**
 * Destruir tooltips
 */
export function destroyTooltips() {
  const $ = window.jQuery;
  if (!$) return;
  $('#custom-tooltip').remove();
}

export default { initTooltips, updateTooltip, destroyTooltips };

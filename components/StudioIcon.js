/**
 * StudioIcon Component
 * Safe Vue-native Lucide SVG Icon Renderer
 * Prevents Lucide's destructive DOM replacement from breaking Vue's Virtual DOM
 */

(function (window) {
  function toPascalCase(str) {
    if (!str) return '';
    return str
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  const StudioIcon = {
    name: 'StudioIcon',
    props: {
      name: { type: String, required: true },
      class: { type: [String, Array, Object], default: '' },
      size: { type: [Number, String], default: 16 }
    },
    setup(props) {
      const { computed, h } = window.Vue;

      const svgHtml = computed(() => {
        if (!props.name || !window.lucide || !window.lucide.icons) return '';
        
        const pascalName = toPascalCase(props.name);
        const iconDef = window.lucide.icons[pascalName] || window.lucide.icons[props.name];
        if (!iconDef) return '';

        try {
          const svgEl = window.lucide.createElement(iconDef);
          if (props.class) {
            let clsStr = '';
            if (typeof props.class === 'string') {
              clsStr = props.class;
            } else if (Array.isArray(props.class)) {
              clsStr = props.class.filter(Boolean).join(' ');
            }
            if (clsStr) svgEl.setAttribute('class', clsStr);
          }
          if (props.size) {
            svgEl.setAttribute('width', props.size);
            svgEl.setAttribute('height', props.size);
          }
          return svgEl.outerHTML;
        } catch (e) {
          console.warn('[StudioIcon] Failed to render icon:', props.name, e);
          return '';
        }
      });

      return () => h('span', {
        class: 'inline-flex items-center justify-center shrink-0 leading-none',
        'aria-hidden': 'true',
        innerHTML: svgHtml.value
      });
    }
  };

  window.StudioIcon = StudioIcon;
})(window);

/**
 * CustomSelect Component
 * Authentic Apple iOS Popover Context Select Component with Spring Micro-transitions
 */

(function (window) {
  const { toRefs, ref, computed, nextTick } = window.Vue;

  const CustomSelect = {
    name: 'CustomSelect',
    props: {
      modelValue: { type: [String, Number], default: '' },
      options: { type: Array, default: () => [] },
      placeholder: { type: String, default: '请选择' }
    },
    emits: ['update:modelValue', 'change'],
    setup(props, { emit }) {
      const { modelValue, options, placeholder } = toRefs(props);
      const isOpen = ref(false);

      const currentLabel = computed(() => {
        const list = options.value || [];
        const found = list.find(opt => opt.value === modelValue.value);
        return found ? found.label : (placeholder.value || '请选择');
      });

      function toggle(e) {
        if (e) e.stopPropagation();
        isOpen.value = !isOpen.value;
        if (window.lucide) {
          nextTick(() => window.lucide.createIcons());
        }
      }

      function selectOption(val) {
        emit('update:modelValue', val);
        emit('change', val);
        isOpen.value = false;
      }

      function close() {
        isOpen.value = false;
      }

      return {
        modelValue,
        options,
        isOpen,
        currentLabel,
        toggle,
        selectOption,
        close
      };
    },
    template: `
      <div :class="['custom-select-container w-full', { open: isOpen }]" @click.stop>
        <button 
          @click="toggle" 
          @keydown.down.prevent="isOpen = true"
          @keydown.up.prevent="isOpen = true"
          @keydown.esc="close"
          class="custom-select-trigger focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]" 
          type="button"
          role="combobox"
          :aria-expanded="isOpen"
          aria-haspopup="listbox"
          :aria-label="placeholder || '请选择选项'">
          <span class="custom-select-label truncate font-semibold text-xs">{{ currentLabel }}</span>
          <studio-icon name="chevron-down" :class="['custom-select-chevron transition-transform duration-200', { 'rotate-180': isOpen }]"></studio-icon>
        </button>
        <div v-show="isOpen" class="custom-select-dropdown w-full animate-fadeIn" role="listbox">
          <div 
            v-for="opt in options" 
            :key="opt.value"
            @click="selectOption(opt.value)"
            @keydown.enter.prevent="selectOption(opt.value)"
            @keydown.space.prevent="selectOption(opt.value)"
            role="option"
            :aria-selected="modelValue === opt.value"
            tabindex="0"
            :class="['custom-select-option transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] outline-none', { selected: modelValue === opt.value }]">
            <span>{{ opt.label }}</span>
            <studio-icon name="check" class="check-icon"></studio-icon>
          </div>
        </div>
      </div>
    `
  };

  window.CustomSelect = CustomSelect;
})(window);

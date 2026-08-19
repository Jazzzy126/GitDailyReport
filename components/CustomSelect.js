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
          class="custom-select-trigger" 
          type="button">
          <span class="custom-select-label truncate font-semibold">{{ currentLabel }}</span>
          <i data-lucide="chevron-down" :class="['custom-select-chevron transition-transform duration-200', { 'rotate-180': isOpen }]"></i>
        </button>
        <div v-show="isOpen" class="custom-select-dropdown w-full animate-fadeIn">
          <div 
            v-for="opt in options" 
            :key="opt.value"
            @click="selectOption(opt.value)"
            :class="['custom-select-option transition-colors duration-150', { selected: modelValue === opt.value }]">
            <span>{{ opt.label }}</span>
            <i data-lucide="check" class="check-icon"></i>
          </div>
        </div>
      </div>
    `
  };

  window.CustomSelect = CustomSelect;
})(window);

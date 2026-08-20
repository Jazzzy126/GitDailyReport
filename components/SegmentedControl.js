/**
 * SegmentedControl Component
 * Authentic Apple iOS Segmented Control with Smooth Sliding Indicator Pill
 * Hardware-accelerated GPU spring translation & 100% Theme Adaptive
 */

(function (window) {
  const { computed } = window.Vue;

  const SegmentedControl = {
    name: 'SegmentedControl',
    props: {
      modelValue: { type: [String, Number], required: true },
      tabs: { type: Array, required: true },
      customClass: { type: String, default: '' }
    },
    emits: ['update:modelValue', 'change'],
    setup(props, { emit }) {
      const activeIndex = computed(() => {
        const idx = props.tabs.findIndex(t => (t.id ?? t.value) === props.modelValue);
        return idx >= 0 ? idx : 0;
      });

      const tabCount = computed(() => Math.max(1, props.tabs.length));

      const sliderStyle = computed(() => {
        const count = tabCount.value;
        const index = activeIndex.value;
        return {
          width: `calc((100% - 8px) / ${count})`,
          transform: `translateX(calc(${index} * 100%))`,
          transition: 'transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)'
        };
      });

      function selectTab(tab) {
        const val = tab.id ?? tab.value;
        if (val !== props.modelValue) {
          emit('update:modelValue', val);
          emit('change', val);
        }
      }

      function onKeydown(e, currentIdx) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIdx = (currentIdx + 1) % props.tabs.length;
          selectTab(props.tabs[nextIdx]);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIdx = (currentIdx - 1 + props.tabs.length) % props.tabs.length;
          selectTab(props.tabs[prevIdx]);
        }
      }

      return {
        activeIndex,
        sliderStyle,
        selectTab,
        onKeydown
      };
    },
    template: `
      <div
        class="studio-segmented-control"
        :class="customClass"
        role="tablist"
        aria-label="分段控制器">
        
        <!-- Apple Sliding Indicator Pill (Hardware-Accelerated with Concentric Radius) -->
        <div
          class="studio-segmented-slider"
          :style="sliderStyle"
          aria-hidden="true"></div>

        <!-- Segmented Tab Items -->
        <button
          v-for="(tab, idx) in tabs"
          :key="tab.id ?? tab.value"
          type="button"
          role="tab"
          :id="'tab-' + (tab.id ?? tab.value)"
          :aria-selected="modelValue === (tab.id ?? tab.value)"
          :aria-controls="'panel-' + (tab.id ?? tab.value)"
          tabindex="0"
          @click="selectTab(tab)"
          @keydown="onKeydown($event, idx)"
          :class="[
            'studio-segmented-item focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]',
            { 'is-active': modelValue === (tab.id ?? tab.value) }
          ]">
          <studio-icon v-if="tab.icon" :name="tab.icon" class="w-3.5 h-3.5"></studio-icon>
          <span>{{ tab.label || tab.name || tab.id }}</span>
        </button>
      </div>
    `
  };

  window.SegmentedControl = SegmentedControl;
})(window);

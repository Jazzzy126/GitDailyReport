/**
 * StudioPane Component
 * Apple Frosted Liquid Glass Card Container with Unified 44px Header & Micro-hover interactions
 */

(function (window) {
  const StudioPane = {
    name: 'StudioPane',
    props: {
      title: { type: String, default: '' },
      icon: { type: String, default: '' },
      customClass: { type: String, default: '' }
    },
    template: `
      <div :class="['studio-pane rounded-2xl flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl', customClass]">
        <!-- Edge-to-Edge Header Bar -->
        <div class="studio-card-header">
          <div class="studio-pane-title">
            <i v-if="icon" :data-lucide="icon" class="studio-pane-title-icon" aria-hidden="true"></i>
            <span>{{ title }}</span>
          </div>
          <!-- Badge / Action Slot -->
          <slot name="header-right"></slot>
        </div>

        <!-- Card Content Body -->
        <slot></slot>
      </div>
    `
  };

  window.StudioPane = StudioPane;
})(window);

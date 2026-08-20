/**
 * StudioModal Component
 * Unified Apple-Grade Modal & Backdrop Base Component
 * Provides clean opacity background transition + Anime.js spring physics for modal content
 */

(function (window) {
  const { toRefs, watch, nextTick, ref } = window.Vue;

  const StudioModal = {
    name: 'StudioModal',
    props: {
      isOpen: { type: Boolean, default: false },
      customClass: { type: String, default: '' },
      closeOnClickOutside: { type: Boolean, default: true },
      ariaLabel: { type: String, default: '系统弹窗' }
    },
    emits: ['close'],
    setup(props, { emit }) {
      const { isOpen, customClass, closeOnClickOutside, ariaLabel } = toRefs(props);
      const contentRef = ref(null);

      watch(
        () => props.isOpen,
        (val) => {
          if (val) {
            nextTick(() => {
              if (window.anime && contentRef.value) {
                try {
                  window.anime({
                    targets: contentRef.value,
                    scale: [0.92, 1],
                    opacity: [0, 1],
                    duration: 350,
                    easing: 'easeOutCubic'
                  });
                } catch (e) {}
              }
            });
          }
        }
      );

      function onBackdropClick(e) {
        if (props.closeOnClickOutside && e.target === e.currentTarget) {
          emit('close');
        }
      }

      function onKeydown(e) {
        if (props.isOpen && props.closeOnClickOutside && e.key === 'Escape') {
          emit('close');
        }
      }

      return {
        isOpen,
        customClass,
        closeOnClickOutside,
        ariaLabel,
        contentRef,
        onBackdropClick,
        onKeydown
      };
    },
    template: `
      <transition
        enter-active-class="transition-opacity duration-250 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div
          v-if="isOpen"
          @click="onBackdropClick"
          @keydown="onKeydown"
          role="dialog"
          aria-modal="true"
          :aria-label="ariaLabel"
          tabindex="-1"
          class="studio-modal-overlay">
          <div
            ref="contentRef"
            :class="['studio-modal-content will-change-transform', customClass]">
            <slot></slot>
          </div>
        </div>
      </transition>
    `
  };

  window.StudioModal = StudioModal;
})(window);

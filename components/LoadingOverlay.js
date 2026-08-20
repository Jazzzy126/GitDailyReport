/**
 * LoadingOverlay Component
 * Global Apple-Grade Frosted Blur Loading Overlay
 * Enhanced with Whimsy Dynamic Loading Quote Transitions
 */

(function (window) {
  const LoadingOverlay = {
    name: 'LoadingOverlay',
    props: {
      isLoading: { type: Boolean, default: false },
      message: { type: String, default: '正在处理中…' }
    },
    template: `
      <studio-modal
        :is-open="isLoading"
        :close-on-click-outside="false"
        aria-label="正在加载"
        custom-class="w-auto">
        <div class="studio-modal-glass px-8 py-6 rounded-3xl flex flex-col items-center gap-3.5 max-w-sm text-center border border-[var(--md-sys-color-outline-variant)] shadow-2xl backdrop-blur-xl">
          <div class="relative w-12 h-12 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center shadow-inner">
            <studio-icon name="sparkles" class="w-6 h-6 animate-pulse"></studio-icon>
            <div class="absolute inset-0 rounded-2xl border-2 border-[var(--md-sys-color-primary)] opacity-40 animate-ping pointer-events-none"></div>
          </div>
          <div class="h-10 flex items-center justify-center overflow-hidden">
            <transition name="quote-fade" mode="out-in">
              <span :key="message" class="text-xs font-bold leading-relaxed tracking-wide text-[var(--md-sys-color-on-surface)]">
                {{ message }}
              </span>
            </transition>
          </div>
        </div>
      </studio-modal>
    `
  };

  window.LoadingOverlay = LoadingOverlay;
})(window);

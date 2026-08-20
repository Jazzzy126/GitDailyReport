/**
 * LoadingOverlay Component
 * Global Apple-Grade Frosted Blur Loading Overlay
 * Powered by unified StudioModal base component
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
        <div class="studio-modal-glass px-7 py-6 rounded-3xl flex flex-col items-center gap-3.5 max-w-xs text-center border border-[var(--border)] shadow-2xl">
          <div class="w-12 h-12 rounded-2xl bg-[var(--color-brand-subtle)] text-[var(--accent-primary)] flex items-center justify-center">
            <studio-icon name="loader-2" class="w-6 h-6 animate-spin"></studio-icon>
          </div>
          <span class="text-xs font-black tracking-wide text-[var(--foreground)]">{{ message }}</span>
        </div>
      </studio-modal>
    `
  };

  window.LoadingOverlay = LoadingOverlay;
})(window);

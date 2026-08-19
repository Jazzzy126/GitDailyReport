/**
 * LoadingOverlay Component
 * Global iOS Frosted Blur Loading Overlay
 */

(function (window) {
  const LoadingOverlay = {
    name: 'LoadingOverlay',
    props: {
      isLoading: { type: Boolean, default: false },
      message: { type: String, default: '正在处理中...' }
    },
    template: `
      <transition
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95">
        <div 
          v-if="isLoading" 
          class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 transition-all duration-300">
          <div class="studio-pane px-6 py-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3 border border-white/20 max-w-xs text-center animate-pulse">
            <i data-lucide="loader-2" class="w-8 h-8 text-[#007AFF] animate-spin"></i>
            <span class="text-xs font-bold tracking-wide">{{ message }}</span>
          </div>
        </div>
      </transition>
    `
  };

  window.LoadingOverlay = LoadingOverlay;
})(window);

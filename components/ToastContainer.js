/**
 * ToastContainer Component
 * Floating iOS Toast Stack with Spring Slide Transitions
 */

(function (window) {
  const ToastContainer = {
    name: 'ToastContainer',
    props: {
      toasts: { type: Array, default: () => [] }
    },
    template: `
      <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none" role="status" aria-live="polite">
        <transition-group 
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform translate-y-4 scale-95 opacity-0"
          enter-to-class="transform translate-y-0 scale-100 opacity-100"
          leave-active-class="transition duration-250 ease-in"
          leave-from-class="transform translate-y-0 scale-100 opacity-100"
          leave-to-class="transform translate-y-2 scale-95 opacity-0">
          <div 
            v-for="t in toasts" 
            :key="t.id" 
            class="toast-msg flex items-center gap-2 pointer-events-auto">
            <span>{{ t.message }}</span>
          </div>
        </transition-group>
      </div>
    `
  };

  window.ToastContainer = ToastContainer;
})(window);

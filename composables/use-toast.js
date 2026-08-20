/**
 * useToast Composable
 * Global iOS-styled Toast notification state management
 */

(function (window) {
  function useToast() {
    const { ref } = window.Vue;
    const toasts = ref([]);

    function showToast(message, type = 'info', duration = 2400) {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      const toast = { id, message, type, visible: true };
      
      toasts.value.push(toast);

      setTimeout(() => {
        const item = toasts.value.find(t => t.id === id);
        if (item) {
          item.visible = false;
          setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== id);
          }, 260);
        }
      }, duration);
    }

    return {
      toasts,
      showToast
    };
  }

  window.useToast = useToast;
})(window);

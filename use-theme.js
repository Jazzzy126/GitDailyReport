/**
 * useTheme Composable
 * 3-State iOS Theme Manager (System -> Dark -> Light -> System)
 */

(function (window) {
  const THEME_STORAGE_KEY = 'git_daily_report_ios_theme_mode';

  function useTheme() {
    const { ref, computed, onMounted, watch, nextTick } = window.Vue;

    const themeMode = ref(localStorage.getItem(THEME_STORAGE_KEY) || 'system');
    const prefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

    const isDark = computed(() => {
      if (themeMode.value === 'dark') return true;
      if (themeMode.value === 'light') return false;
      return prefersDark.value;
    });

    const themeIcon = computed(() => {
      if (themeMode.value === 'dark') return 'moon';
      if (themeMode.value === 'light') return 'sun';
      return 'laptop';
    });

    const themeTitle = computed(() => {
      if (themeMode.value === 'dark') return '主题：暗黑模式 (Dark)';
      if (themeMode.value === 'light') return '主题：明亮模式 (Light)';
      return '主题：跟随系统 (System)';
    });

    const themeColorClass = computed(() => {
      if (themeMode.value === 'dark') return 'text-indigo-400';
      if (themeMode.value === 'light') return 'text-amber-500';
      return 'opacity-80';
    });

    function applyTheme() {
      if (isDark.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    function toggleTheme() {
      if (themeMode.value === 'system') {
        themeMode.value = 'dark';
      } else if (themeMode.value === 'dark') {
        themeMode.value = 'light';
      } else {
        themeMode.value = 'system';
      }

      localStorage.setItem(THEME_STORAGE_KEY, themeMode.value);
      applyTheme();
    }

    onMounted(() => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e) => {
        prefersDark.value = e.matches;
        if (themeMode.value === 'system') {
          applyTheme();
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', listener);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(listener);
      }

      applyTheme();
    });

    return {
      themeMode,
      isDark,
      themeIcon,
      themeTitle,
      themeColorClass,
      toggleTheme,
      applyTheme
    };
  }

  window.useTheme = useTheme;
})(window);

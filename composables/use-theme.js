/**
 * useTheme Composable
 * Material 3 Dynamic Theming Engine (Zero-Legacy Clean System)
 * Strictly injects --md-sys-* design tokens
 */

(function (window) {
  const THEME_STORAGE_KEY = 'git_daily_report_ios_theme_mode';
  const CUSTOM_THEME_KEY = 'git_daily_report_theme_custom_config';

  // Preset Palettes with Full Tonal Spectrum
  const COLOR_PRESETS = [
    { id: 'blue', name: '科技蓝', hex: '#0066FF', lightHex: '#0A84FF', deepHex: '#0052CC', glow: 'rgba(0, 102, 255, 0.35)', subtle: 'rgba(0, 102, 255, 0.08)' },
    { id: 'purple', name: '极光紫', hex: '#8B5CF6', lightHex: '#A78BFA', deepHex: '#7C3AED', glow: 'rgba(139, 92, 246, 0.35)', subtle: 'rgba(139, 92, 246, 0.08)' },
    { id: 'emerald', name: '翡翠绿', hex: '#10B981', lightHex: '#34D399', deepHex: '#059669', glow: 'rgba(16, 185, 129, 0.35)', subtle: 'rgba(16, 185, 129, 0.08)' },
    { id: 'rose', name: '赛博粉', hex: '#EC4899', lightHex: '#F472B6', deepHex: '#DB2777', glow: 'rgba(236, 72, 153, 0.35)', subtle: 'rgba(236, 72, 153, 0.08)' },
    { id: 'amber', name: '琥珀金', hex: '#F59E0B', lightHex: '#FBBF24', deepHex: '#D97706', glow: 'rgba(245, 158, 11, 0.35)', subtle: 'rgba(245, 158, 11, 0.08)' }
  ];

  // Material 3 Shape Scale Presets
  const RADIUS_PRESETS = [
    { id: 'sharp', name: '直角极客', desc: '0px 硬朗现代', extraLarge: '0px', large: '0px', medium: '0px', small: '0px', full: '0px' },
    { id: 'compact', name: '精致微圆', desc: '8px 紧凑干练', extraLarge: '10px', large: '8px', medium: '6px', small: '4px', full: '4px' },
    { id: 'standard', name: 'Apple 标准', desc: '14px 经典温润', extraLarge: '16px', large: '12px', medium: '8px', small: '6px', full: '9999px' },
    { id: 'bento', name: 'Bento 大圆角', desc: '20px 饱满层次 (默认)', extraLarge: '20px', large: '14px', medium: '10px', small: '6px', full: '9999px' }
  ];

  // Glassmorphism Levels
  const GLASS_PRESETS = [
    { id: 'opaque', name: '纯色扁平', desc: '无模糊不透明', blur: '0px', bgLight: '#ffffff', bgDark: '#121218' },
    { id: 'standard', name: '标准磨砂', desc: '24px 晶莹通透 (默认)', blur: '28px', bgLight: 'rgba(255, 255, 255, 0.88)', bgDark: 'rgba(18, 18, 26, 0.82)' },
    { id: 'heavy', name: '极光亚克力', desc: '40px 重度透光', blur: '40px', bgLight: 'rgba(255, 255, 255, 0.72)', bgDark: 'rgba(18, 18, 26, 0.7)' }
  ];

  // Utility: Hex to RGBA
  function hexToRgba(hex, alpha = 1) {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const DEFAULT_CUSTOM_CONFIG = {
    colorId: 'blue',
    customHex: '#0066FF',
    radiusId: 'bento',
    glassId: 'standard'
  };

  function useTheme() {
    const { ref, reactive, computed, onMounted } = window.Vue;
    const DBStorage = window.DBStorage || {
      getItem: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } },
      setItem: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    };

    const themeMode = ref(localStorage.getItem(THEME_STORAGE_KEY) || 'system');
    const prefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Custom Appearance Config
    const customConfig = reactive({
      ...DEFAULT_CUSTOM_CONFIG,
      ...DBStorage.getItem(CUSTOM_THEME_KEY, {})
    });

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
      if (themeMode.value === 'dark') return 'text-[var(--md-sys-color-primary)]';
      if (themeMode.value === 'light') return 'text-amber-500';
      return 'opacity-80';
    });

    /**
     * Apply Material 3 tokens to :root
     */
    function applyCustomVariables() {
      const root = document.documentElement;

      // 1. Apply Primary Color Spectrum
      let brand500 = customConfig.customHex || '#0066FF';
      let brand400 = brand500;
      let brand600 = brand500;
      let primaryGlow = hexToRgba(brand500, 0.35);
      let primarySubtle = hexToRgba(brand500, 0.08);

      const matchedPreset = COLOR_PRESETS.find(p => p.id === customConfig.colorId);
      if (matchedPreset) {
        brand500 = matchedPreset.hex;
        brand400 = matchedPreset.lightHex;
        brand600 = matchedPreset.deepHex;
        primaryGlow = matchedPreset.glow;
        primarySubtle = matchedPreset.subtle;
      } else {
        primaryGlow = hexToRgba(brand500, 0.35);
        primarySubtle = hexToRgba(brand500, 0.09);
      }

      const activePrimary = isDark.value ? brand400 : brand500;
      const activePrimaryDark = isDark.value ? brand500 : brand600;
      const activePrimaryContainer = isDark.value ? hexToRgba(brand500, 0.16) : primarySubtle;
      const activeOnPrimaryContainer = isDark.value ? brand400 : brand600;

      root.style.setProperty('--md-sys-color-primary', activePrimary);
      root.style.setProperty('--md-sys-color-on-primary', '#ffffff');
      root.style.setProperty('--md-sys-color-primary-light', brand400);
      root.style.setProperty('--md-sys-color-primary-dark', activePrimaryDark);
      root.style.setProperty('--md-sys-color-primary-container', activePrimaryContainer);
      root.style.setProperty('--md-sys-color-on-primary-container', activeOnPrimaryContainer);
      root.style.setProperty('--md-sys-color-primary-glow', primaryGlow);
      root.style.setProperty('--md-sys-color-outline', primaryGlow);
      root.style.setProperty('--md-sys-color-ring', primaryGlow);

      // 2. Apply Material 3 Shape Scale
      const rad = RADIUS_PRESETS.find(r => r.id === customConfig.radiusId) || RADIUS_PRESETS[3];
      root.style.setProperty('--md-sys-shape-corner-none', '0px');
      root.style.setProperty('--md-sys-shape-corner-extra-small', '4px');
      root.style.setProperty('--md-sys-shape-corner-small', rad.small);
      root.style.setProperty('--md-sys-shape-corner-medium', rad.medium);
      root.style.setProperty('--md-sys-shape-corner-large', rad.large);
      root.style.setProperty('--md-sys-shape-corner-extra-large', rad.extraLarge);
      root.style.setProperty('--md-sys-shape-corner-full', rad.full);

      // 3. Apply Glassmorphism State
      const gl = GLASS_PRESETS.find(g => g.id === customConfig.glassId) || GLASS_PRESETS[1];
      root.style.setProperty('--md-sys-state-glass-blur', gl.blur);
      if (gl.id === 'opaque') {
        root.style.setProperty('--md-sys-color-surface-container-low', isDark.value ? gl.bgDark : gl.bgLight);
      } else {
        root.style.removeProperty('--md-sys-color-surface-container-low');
      }
    }

    function applyTheme() {
      if (isDark.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      applyCustomVariables();
    }

    function setThemeMode(mode) {
      themeMode.value = mode;
      localStorage.setItem(THEME_STORAGE_KEY, mode);
      applyTheme();
    }

    function toggleTheme() {
      if (themeMode.value === 'system') {
        themeMode.value = 'light';
      } else if (themeMode.value === 'light') {
        themeMode.value = 'dark';
      } else {
        themeMode.value = 'system';
      }
      localStorage.setItem(THEME_STORAGE_KEY, themeMode.value);
      applyTheme();
    }

    function setColorPreset(presetId, customHex = null) {
      customConfig.colorId = presetId;
      if (customHex) {
        customConfig.customHex = customHex;
      }
      DBStorage.setItem(CUSTOM_THEME_KEY, customConfig);
      applyCustomVariables();
    }

    function setRadiusPreset(radiusId) {
      customConfig.radiusId = radiusId;
      DBStorage.setItem(CUSTOM_THEME_KEY, customConfig);
      applyCustomVariables();
    }

    function setGlassPreset(glassId) {
      customConfig.glassId = glassId;
      DBStorage.setItem(CUSTOM_THEME_KEY, customConfig);
      applyCustomVariables();
    }

    function resetCustomConfig() {
      Object.assign(customConfig, DEFAULT_CUSTOM_CONFIG);
      DBStorage.setItem(CUSTOM_THEME_KEY, customConfig);
      applyCustomVariables();
    }

    onMounted(() => {
      applyTheme();
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        prefersDark.value = e.matches;
        if (themeMode.value === 'system') {
          applyTheme();
        }
      });
    });

    return {
      themeMode,
      isDark,
      themeIcon,
      themeTitle,
      themeColorClass,
      customConfig,
      colorPresets: COLOR_PRESETS,
      radiusPresets: RADIUS_PRESETS,
      glassPresets: GLASS_PRESETS,
      setThemeMode,
      toggleTheme,
      setColorPreset,
      setRadiusPreset,
      setGlassPreset,
      resetCustomConfig
    };
  }

  window.useTheme = useTheme;
})(window);

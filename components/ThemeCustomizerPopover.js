/**
 * ThemeCustomizerPopover Component
 * Apple macOS Control Center Style Floating Theme & Appearance Inspector
 * Instant real-time live preview, 100% zero-friction configuration
 * Full i18n support
 */

(function (window) {
  const { toRefs, computed, onMounted, onUnmounted } = window.Vue;

  const ThemeCustomizerPopover = {
    name: 'ThemeCustomizerPopover',
    props: {
      isOpen: { type: Boolean, default: false },
      themeMode: { type: String, default: 'system' },
      themeCustomConfig: { type: Object, required: true },
      colorPresets: { type: Array, default: () => [] },
      radiusPresets: { type: Array, default: () => [] },
      glassPresets: { type: Array, default: () => [] }
    },
    emits: [
      'close',
      'set-theme-mode',
      'set-color-preset',
      'set-radius-preset',
      'set-glass-preset',
      'reset-theme-custom'
    ],
    setup(props, { emit }) {
      const {
        isOpen,
        themeMode,
        themeCustomConfig,
        colorPresets,
        radiusPresets,
        glassPresets
      } = toRefs(props);

      const i18n = window.useI18n ? window.useI18n() : null;
      function t(key, params) {
        return i18n ? i18n.t(key, params) : key;
      }

      const modeTabs = computed(() => [
        { id: 'light', label: t('themePopover.modeLight'), icon: 'sun' },
        { id: 'dark', label: t('themePopover.modeDark'), icon: 'moon' },
        { id: 'system', label: t('themePopover.modeSystem'), icon: 'laptop' }
      ]);

      const localizedColorPresets = computed(() => {
        const keyMap = {
          blue: 'themePopover.colorBlue',
          purple: 'themePopover.colorPurple',
          emerald: 'themePopover.colorEmerald',
          rose: 'themePopover.colorRose',
          amber: 'themePopover.colorAmber'
        };
        return (colorPresets.value || []).map(p => ({
          ...p,
          displayName: keyMap[p.id] ? t(keyMap[p.id]) : p.name
        }));
      });

      const localizedRadiusPresets = computed(() => {
        const keyMap = {
          sharp: 'themePopover.radiusSharp',
          compact: 'themePopover.radiusCompact',
          standard: 'themePopover.radiusStandard',
          bento: 'themePopover.radiusBento'
        };
        return (radiusPresets.value || []).map(r => ({
          ...r,
          displayName: keyMap[r.id] ? t(keyMap[r.id]) : r.name
        }));
      });

      const localizedGlassPresets = computed(() => {
        const keyMap = {
          opaque: 'themePopover.glassOpaque',
          standard: 'themePopover.glassStandard',
          heavy: 'themePopover.glassHeavy'
        };
        return (glassPresets.value || []).map(g => ({
          ...g,
          displayName: keyMap[g.id] ? t(keyMap[g.id]) : g.name
        }));
      });

      function onCustomColorChange(e) {
        emit('set-color-preset', 'custom', e.target.value);
      }

      function onGlobalClick() {
        if (isOpen.value) {
          emit('close');
        }
      }

      onMounted(() => {
        document.addEventListener('click', onGlobalClick);
      });

      onUnmounted(() => {
        document.removeEventListener('click', onGlobalClick);
      });

      return {
        isOpen,
        themeMode,
        themeCustomConfig,
        colorPresets,
        radiusPresets,
        glassPresets,
        modeTabs,
        localizedColorPresets,
        localizedRadiusPresets,
        localizedGlassPresets,
        t,
        onCustomColorChange
      };
    },
    template: `
      <transition name="split-menu">
        <div
          v-show="isOpen"
          @click.stop
          class="absolute right-0 top-full mt-2 w-80 p-4 rounded-2xl z-50 bg-[var(--md-sys-color-surface-container-highest)] backdrop-blur-2xl border border-[var(--md-sys-color-outline-variant)] shadow-2xl space-y-4 select-none">
          
          <!-- Popover Header -->
          <div class="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2.5">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0">
                <studio-icon name="palette" class="w-4 h-4"></studio-icon>
              </div>
              <div>
                <h3 class="font-extrabold text-xs font-sans text-[var(--md-sys-color-on-surface)]">{{ t('themePopover.title') }}</h3>
                <span class="text-[10px] opacity-50 font-medium">{{ t('themePopover.subtitle') }}</span>
              </div>
            </div>
            <button
              type="button"
              @click="$emit('reset-theme-custom')"
              class="text-[11px] text-[var(--md-sys-color-primary)] hover:underline font-bold cursor-pointer"
              :title="t('themePopover.reset')">
              {{ t('themePopover.reset') }}
            </button>
          </div>

          <!-- 1. Color Scheme Mode Switcher (3-State Pill with Sliding Indicator) -->
          <div class="space-y-1.5">
            <div class="text-[11px] font-bold opacity-75">{{ t('themePopover.modeSection') }}</div>
            <segmented-control
              :model-value="themeMode"
              :tabs="modeTabs"
              @update:model-value="$emit('set-theme-mode', $event)"></segmented-control>
          </div>

          <!-- 2. Brand Primary Color Presets -->
          <div class="space-y-1.5">
            <div class="text-[11px] font-bold opacity-75">{{ t('themePopover.colorSection') }}</div>
            <div class="grid grid-cols-6 gap-1.5 items-center">
              <button
                v-for="p in localizedColorPresets"
                :key="p.id"
                type="button"
                @click="$emit('set-color-preset', p.id)"
                :title="p.displayName"
                :class="[
                  'p-1.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer',
                  themeCustomConfig.colorId === p.id 
                    ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] shadow-xs scale-105' 
                    : 'border-black/5 dark:border-white/10 hover:border-[var(--md-sys-color-primary)]/40'
                ]">
                <span class="w-4 h-4 rounded-full color-dot shadow-xs flex items-center justify-center text-white" :style="{ backgroundColor: p.hex }">
                  <studio-icon v-if="themeCustomConfig.colorId === p.id" name="check" class="w-2.5 h-2.5 stroke-[3]"></studio-icon>
                </span>
                <span class="text-[9px] font-bold truncate max-w-full">{{ p.displayName }}</span>
              </button>

              <!-- Custom Color Picker -->
              <label 
                class="p-1.5 rounded-xl border border-black/5 dark:border-white/10 hover:border-[var(--md-sys-color-primary)]/40 flex flex-col items-center gap-1 transition cursor-pointer relative"
                :class="{ 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] shadow-xs scale-105': themeCustomConfig.colorId === 'custom' }">
                <span class="w-4 h-4 rounded-full color-dot shadow-xs flex items-center justify-center text-white overflow-hidden border border-white/20" :style="{ backgroundColor: themeCustomConfig.customHex }">
                  <studio-icon v-if="themeCustomConfig.colorId === 'custom'" name="check" class="w-2.5 h-2.5 stroke-[3]"></studio-icon>
                </span>
                <span class="text-[9px] font-bold">#HEX</span>
                <input 
                  type="color" 
                  :value="themeCustomConfig.customHex" 
                  @input="onCustomColorChange"
                  class="opacity-0 absolute inset-0 w-full h-full cursor-pointer">
              </label>
            </div>
          </div>

          <!-- 3. Border Radius Presets -->
          <div class="space-y-1.5">
            <div class="text-[11px] font-bold opacity-75">{{ t('themePopover.radiusSection') }}</div>
            <div class="grid grid-cols-4 gap-1.5">
              <button
                v-for="r in localizedRadiusPresets"
                :key="r.id"
                type="button"
                @click="$emit('set-radius-preset', r.id)"
                :class="[
                  'py-2 px-1 rounded-xl border text-center transition cursor-pointer',
                  themeCustomConfig.radiusId === r.id 
                    ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] font-bold shadow-xs' 
                    : 'border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                ]">
                <div class="text-[11px] font-bold">{{ r.displayName }}</div>
                <div class="text-[9px] opacity-60 font-mono mt-0.5">{{ r.desc }}</div>
              </button>
            </div>
          </div>

          <!-- 4. Glassmorphism Refraction Presets -->
          <div class="space-y-1.5">
            <div class="text-[11px] font-bold opacity-75">{{ t('themePopover.glassSection') }}</div>
            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="g in localizedGlassPresets"
                :key="g.id"
                type="button"
                @click="$emit('set-glass-preset', g.id)"
                :class="[
                  'py-2 px-1 rounded-xl border text-center transition cursor-pointer',
                  themeCustomConfig.glassId === g.id 
                    ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] font-bold shadow-xs' 
                    : 'border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                ]">
                <div class="text-[11px] font-bold">{{ g.displayName }}</div>
                <div class="text-[9px] opacity-60 font-mono mt-0.5">{{ g.desc }}</div>
              </button>
            </div>
          </div>

        </div>
      </transition>
    `
  };

  window.ThemeCustomizerPopover = ThemeCustomizerPopover;
})(window);

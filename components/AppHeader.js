/**
 * AppHeader Component
 * Floating Liquid Glass Header Navbar with Logo Easter Egg, Language Switcher,
 * Keyboard Shortcuts Modal Trigger, Theme Customizer & System Settings.
 */

(function (window) {
  const AppHeader = {
    name: 'AppHeader',
    props: {
      t: {
        type: Function,
        required: true
      },
      currentLocaleInfo: {
        type: Object,
        default: () => ({ code: 'zh-CN', label: '简体中文', icon: '🇨🇳' })
      },
      isThemePopoverOpen: {
        type: Boolean,
        default: false
      },
      themeColorClass: {
        type: String,
        default: ''
      },
      themeMode: {
        type: String,
        default: 'system'
      },
      customThemeConfig: {
        type: Object,
        default: () => ({})
      },
      colorPresets: {
        type: Array,
        default: () => []
      },
      radiusPresets: {
        type: Array,
        default: () => []
      },
      glassPresets: {
        type: Array,
        default: () => []
      }
    },
    emits: [
      'logo-click',
      'open-language',
      'open-shortcuts',
      'toggle-theme',
      'close-theme',
      'set-theme-mode',
      'set-color-preset',
      'set-radius-preset',
      'set-glass-preset',
      'reset-theme-custom',
      'open-settings'
    ],
    template: `
      <header class="w-full max-w-[1536px] mx-auto px-3 pt-3 shrink-0 z-40 sticky top-0" role="banner">
        <div class="ios-header h-13 px-4 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-2xl border border-white/40 dark:border-white/10 transition-all duration-300">
          
          <!-- Header Left: Brand Logo & Title -->
          <div class="flex items-center gap-3 shrink-0 cursor-pointer select-none group"
            @click="$emit('logo-click')"
            role="button"
            tabindex="0"
            @keydown.enter.prevent="$emit('logo-click')"
            @keydown.space.prevent="$emit('logo-click')"
            :title="t('whimsy.logoTooltip') || '✨ 点击探索隐藏极客彩蛋'"
            :aria-label="t('app.title')">
            <div class="w-8.5 h-8.5 rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-md shrink-0 group-hover:-translate-y-0.5 group-hover:rotate-6 group-hover:shadow-lg active:scale-90 transition-all duration-200" aria-hidden="true">
              <i data-lucide="git-pull-request" class="w-4 h-4 text-[var(--md-sys-color-primary)]"></i>
            </div>
            <div class="flex items-center gap-2.5">
              <h1 class="font-heading font-black text-sm sm:text-base tracking-tight truncate m-0 p-0">{{ t('app.title') }}</h1>
              <span class="hidden sm:inline-flex studio-badge-pill font-mono">
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-primary)] animate-pulse" aria-hidden="true"></span>
                {{ t('app.tagline') }}
              </span>
            </div>
          </div>

          <!-- Header Right: Action Buttons Group -->
          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0 relative" role="toolbar" :aria-label="t('app.title') + ' Actions'">
            
            <!-- Global Keyboard Shortcuts Trigger -->
            <button type="button"
              @click.stop="$emit('open-shortcuts')"
              class="studio-icon-btn focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] relative group"
              :title="t('shortcuts.title') || '快捷键指南 (Ctrl/Cmd + K)'"
              :aria-label="t('shortcuts.title') || '快捷键指南'">
              <studio-icon name="keyboard" class="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] group-hover:scale-110 transition-transform"></studio-icon>
            </button>

            <!-- Language Switcher Trigger Button -->
            <button type="button"
              @click.stop="$emit('open-language')"
              class="studio-icon-btn focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] relative group"
              :title="t('app.openLanguageModal') + ' (' + currentLocaleInfo.label + ')'"
              :aria-label="t('app.openLanguageModal')">
              <studio-icon name="languages" class="w-4 h-4 text-[var(--md-sys-color-primary)] group-hover:scale-110 transition-transform"></studio-icon>
            </button>

            <!-- Theme Customizer Trigger Button -->
            <button type="button"
              @click.stop="$emit('toggle-theme')"
              class="studio-icon-btn focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] relative"
              :title="t('app.theme')"
              :aria-label="t('app.theme')"
              :aria-expanded="isThemePopoverOpen">
              <studio-icon name="palette" :class="['w-4 h-4', themeColorClass]"></studio-icon>
            </button>

            <!-- Floating Theme Customizer Popover -->
            <theme-customizer-popover
              :is-open="isThemePopoverOpen"
              :theme-mode="themeMode"
              :theme-custom-config="customThemeConfig"
              :color-presets="colorPresets"
              :radius-presets="radiusPresets"
              :glass-presets="glassPresets"
              @close="$emit('close-theme')"
              @set-theme-mode="(m) => $emit('set-theme-mode', m)"
              @set-color-preset="(id) => $emit('set-color-preset', id)"
              @set-radius-preset="(id) => $emit('set-radius-preset', id)"
              @set-glass-preset="(id) => $emit('set-glass-preset', id)"
              @reset-theme-custom="() => $emit('reset-theme-custom')"></theme-customizer-popover>

            <!-- System Settings Modal Trigger -->
            <button type="button"
              @click="$emit('open-settings', 'prompt')"
              class="studio-icon-btn focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]" 
              :title="t('app.settings')"
              :aria-label="t('app.settings')">
              <i data-lucide="settings" class="w-4 h-4 opacity-80" aria-hidden="true"></i>
            </button>
          </div>

        </div>
      </header>
    `
  };

  window.AppHeader = AppHeader;
})(window);

/**
 * LanguageModal Component
 * Apple Liquid Glass Bento Style Language Selector Modal
 * Supports seamless instant switching for: zh-CN (中文), en-US (English), ja-JP (日本語), ko-KR (한국어)
 */

(function (window) {
  const { toRefs, watch, nextTick } = window.Vue;

  const LanguageModal = {
    name: 'LanguageModal',
    props: {
      isOpen: { type: Boolean, default: false },
      currentLocale: { type: String, default: 'zh-CN' },
      supportedLocales: { type: Array, default: () => [] }
    },
    emits: ['close', 'select-locale'],
    setup(props, { emit }) {
      const { isOpen, currentLocale, supportedLocales } = toRefs(props);
      const i18n = window.useI18n ? window.useI18n() : null;

      function t(key, params) {
        return i18n ? i18n.t(key, params) : key;
      }

      watch(
        () => isOpen.value,
        (open) => {
          if (open) {
            nextTick(() => {
              if (window.anime) {
                try {
                  window.anime({
                    targets: '.language-modal-box',
                    scale: [0.92, 1],
                    opacity: [0, 1],
                    duration: 350,
                    easing: 'easeOutCubic'
                  });
                  window.anime({
                    targets: '.lang-card-item',
                    translateY: [12, 0],
                    opacity: [0, 1],
                    delay: window.anime.stagger(40, { start: 60 }),
                    duration: 350,
                    easing: 'easeOutCubic'
                  });
                } catch (e) {}
              }
              if (window.lucide) {
                window.lucide.createIcons();
              }
            });
          }
        }
      );

      function close() {
        emit('close');
      }

      function onSelect(code) {
        emit('select-locale', code);
        close();
      }

      return {
        isOpen,
        currentLocale,
        supportedLocales,
        t,
        close,
        onSelect
      };
    },
    template: `
      <transition name="studio-modal">
        <div
          v-if="isOpen"
          @click.self="close"
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-modal-title"
          class="studio-modal-overlay">
          
          <div class="language-modal-box studio-modal-glass w-full max-w-md p-6 space-y-5 relative shadow-2xl rounded-3xl border border-[var(--md-sys-color-outline-variant)]">
            <!-- Close Button -->
            <button
              type="button"
              @click="close"
              :aria-label="t('languageModal.close')"
              class="absolute right-4 top-4 studio-icon-btn text-xs font-bold hover:rotate-90">
              ✕
            </button>

            <!-- Header -->
            <div class="flex items-center gap-3.5 pr-8">
              <div class="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0 shadow-sm">
                <studio-icon name="languages" class="w-5 h-5"></studio-icon>
              </div>
              <div>
                <h2 id="language-modal-title" class="font-extrabold text-base font-sans text-[var(--md-sys-color-on-surface)]">
                  {{ t('languageModal.title') }}
                </h2>
                <p class="text-xs opacity-60 font-medium">
                  {{ t('languageModal.subtitle') }}
                </p>
              </div>
            </div>

            <!-- Bento Language Grid (2x2 Grid) -->
            <div class="grid grid-cols-2 gap-2.5">
              <div
                v-for="l in supportedLocales"
                :key="l.code"
                @click="onSelect(l.code)"
                @keydown.enter.prevent="onSelect(l.code)"
                @keydown.space.prevent="onSelect(l.code)"
                role="button"
                tabindex="0"
                :aria-pressed="currentLocale === l.code"
                :class="[
                  'lang-card-item ios-press-action p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 text-left group focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]',
                  currentLocale === l.code
                    ? 'bg-[var(--md-sys-color-primary-container)]/80 border-[var(--md-sys-color-primary)] shadow-md'
                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/15 dark:hover:border-white/20'
                ]">
                
                <div class="flex items-center justify-between">
                  <span class="text-2xl leading-none" aria-hidden="true">{{ l.icon }}</span>
                  <div
                    v-if="currentLocale === l.code"
                    class="w-5 h-5 rounded-full bg-[var(--md-sys-color-primary)] text-white flex items-center justify-center shadow-xs">
                    <studio-icon name="check" class="w-3.5 h-3.5 stroke-[3]"></studio-icon>
                  </div>
                  <span
                    v-else
                    class="text-[10px] font-mono font-bold opacity-40 px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10">
                    {{ l.tag }}
                  </span>
                </div>

                <div>
                  <div
                    :class="[
                      'font-heading font-black text-sm tracking-tight transition-colors',
                      currentLocale === l.code ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface)]'
                    ]">
                    {{ l.label }}
                  </div>
                  <div class="text-[11px] opacity-60 font-medium truncate">
                    {{ l.englishLabel }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom Hint -->
            <div class="text-center pt-1 border-t border-black/5 dark:border-white/10">
              <span class="text-[11px] opacity-50 font-medium">
                {{ t('languageModal.confirmTip') }}
              </span>
            </div>

          </div>
        </div>
      </transition>
    `
  };

  window.LanguageModal = LanguageModal;
})(window);

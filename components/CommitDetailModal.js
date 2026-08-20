/**
 * CommitDetailModal Component
 * Authentic Apple iOS Inset Grouped Commit Metadata Inspector
 * Powered by unified StudioModal base component
 * Full i18n support
 */

(function (window) {
  const { toRefs, computed, watch, nextTick } = window.Vue;

  const CommitDetailModal = {
    name: 'CommitDetailModal',
    props: {
      isOpen: { type: Boolean, default: false },
      commit: { type: Object, default: null }
    },
    emits: ['close', 'copy-sha', 'copy-msg'],
    setup(props, { emit }) {
      const { isOpen, commit } = toRefs(props);
      const i18n = window.useI18n ? window.useI18n() : null;

      function t(key, params) {
        return i18n ? i18n.t(key, params) : key;
      }

      watch(
        () => props.isOpen,
        (val) => {
          if (val) {
            nextTick(() => {
              if (window.anime) {
                try {
                  window.anime({
                    targets: '.commit-detail-modal-box',
                    scale: [0.92, 1],
                    opacity: [0, 1],
                    duration: 350,
                    easing: 'easeOutCubic'
                  });
                } catch (e) {}
              }
              if (window.lucide) window.lucide.createIcons();
            });
          }
        }
      );

      function close() {
        emit('close');
      }

      const commitTypeLabel = computed(() => {
        if (!commit.value) return '--';
        const type = commit.value.type;
        if (!type) return '--';
        const map = {
          feat: 'commits.typeFeature',
          feature: 'commits.typeFeature',
          fix: 'commits.typeFix',
          refactor: 'commits.typeRefactor',
          docs: 'commits.typeDocs',
          chore: 'commits.typeChore',
          style: 'commits.typeStyle',
          perf: 'commits.typePerf'
        };
        const i18nKey = map[type.toLowerCase()];
        return i18nKey ? `${t(i18nKey)} (${type})` : (commit.value.typeInfo ? commit.value.typeInfo.label : type);
      });

      return {
        isOpen,
        commit,
        commitTypeLabel,
        t,
        close
      };
    },
    template: `
      <transition name="studio-modal">
        <div
          v-if="isOpen"
          @click.self="close"
          role="dialog"
          aria-modal="true"
          aria-labelledby="commit-modal-title"
          class="studio-modal-overlay">
          <div class="commit-detail-modal-box studio-modal-glass w-full max-w-xl p-6 space-y-4 relative max-h-[92vh] overflow-y-auto custom-scrollbar">
          <button
            type="button"
            @click="close"
            :aria-label="t('commitDetail.close')"
            class="absolute right-4 top-4 studio-icon-btn text-xs font-bold hover:rotate-90">
            ✕
          </button>

          <!-- Modal Header -->
          <div class="flex items-center gap-3 pr-8 pb-1">
            <div class="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0">
              <studio-icon name="git-commit" class="w-5 h-5"></studio-icon>
            </div>
            <div>
              <h2 id="commit-modal-title" class="font-extrabold text-base font-sans text-[var(--md-sys-color-on-surface)]">{{ t('commitDetail.title') }}</h2>
              <span class="text-xs opacity-50 font-medium">{{ t('commitDetail.subtitle') }}</span>
            </div>
          </div>

          <!-- Section 1: Inset Grouped SHA Card -->
          <div class="p-4 ios-input-box rounded-2xl space-y-2.5 text-xs">
            <div class="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
              <span class="text-xs opacity-50 font-bold uppercase tracking-wider">{{ t('commitDetail.checksum') }}</span>
              <button
                type="button"
                @click="$emit('copy-sha')"
                :aria-label="t('commitDetail.copyHash')"
                class="text-xs text-[var(--md-sys-color-primary)] hover:underline font-bold flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded px-1">
                <studio-icon name="copy" class="w-3.5 h-3.5"></studio-icon>
                <span>{{ t('commitDetail.copyHash') }}</span>
              </button>
            </div>
            <div class="font-mono text-xs font-bold text-[var(--md-sys-color-primary)] break-all select-all tabular-nums">
              {{ commit?.fullHash || commit?.hash || '--' }}
            </div>
          </div>

          <!-- Section 2: Inset Grouped Key-Value List Card -->
          <div class="px-4 py-1 ios-input-box rounded-2xl text-xs divide-y divide-black/5 dark:divide-white/5">
            <div class="flex items-center justify-between py-2.5">
              <span class="opacity-60 font-medium">{{ t('commitDetail.fieldAuthor') }}</span>
              <span class="font-bold truncate max-w-72">
                {{ commit?.author || '--' }}
                {{ commit?.email ? '<' + commit.email + '>' : '' }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <span class="opacity-60 font-medium">{{ t('commitDetail.fieldDate') }}</span>
              <span class="font-bold font-mono tabular-nums">
                {{ commit?.date }} {{ commit?.time }}
                {{ commit?.timezone ? '(' + commit.timezone + ')' : '' }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <span class="opacity-60 font-medium">{{ t('commitDetail.fieldType') }}</span>
              <span class="font-bold text-[var(--md-sys-color-primary)]">
                {{ commitTypeLabel }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <span class="opacity-60 font-medium">{{ t('commitDetail.fieldRepo') }}</span>
              <span class="font-bold font-mono truncate max-w-56 opacity-80 tabular-nums">
                {{ commit?.repoName || 'LocalRepo' }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <span class="opacity-60 font-medium">Unix Timestamp</span>
              <span class="font-mono font-bold opacity-80 tabular-nums">
                {{ commit?.timestamp ? commit.timestamp + ' (Sec)' : '--' }}
              </span>
            </div>
          </div>

          <!-- Section 3: Full Message Section -->
          <div class="p-4 ios-input-box rounded-2xl space-y-2 min-w-0">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold opacity-70">{{ t('commitDetail.fieldMessage') }}</span>
              <button
                type="button"
                @click="$emit('copy-msg')"
                :aria-label="t('commitDetail.copyMsg')"
                class="text-xs text-[var(--md-sys-color-primary)] hover:underline font-bold flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded px-1">
                <studio-icon name="copy" class="w-3.5 h-3.5"></studio-icon>
                <span>{{ t('commitDetail.copyMsg') }}</span>
              </button>
            </div>
            <div class="studio-editor-textarea p-3.5 ios-input-box rounded-xl text-xs leading-5 font-mono whitespace-pre-wrap break-words max-h-40 overflow-y-auto custom-scrollbar select-text bg-white/50 dark:bg-slate-900/60">
              {{ commit?.fullMessage || commit?.message || '--' }}
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end pt-3 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              @click="close"
              :aria-label="t('commitDetail.close')"
              class="studio-btn studio-btn-primary px-6 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]">
              OK
            </button>
          </div>
        </div>
      </transition>
    `
  };

  window.CommitDetailModal = CommitDetailModal;
})(window);

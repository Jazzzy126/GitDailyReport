/**
 * RepoActionModal Component
 * Authentic Apple iOS Action Sheet Modal for Repository Management
 * Animated with Anime.js Spring Physics Engine
 * Full i18n support
 */

(function (window) {
  const { toRefs, watch, nextTick } = window.Vue;

  const RepoActionModal = {
    name: 'RepoActionModal',
    props: {
      isOpen: { type: Boolean, default: false },
      repoName: { type: String, default: '' },
      displayName: { type: String, default: '' }
    },
    emits: ['close', 'edit-alias', 'refresh', 'remove'],
    setup(props, { emit }) {
      const { isOpen, repoName, displayName } = toRefs(props);
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
                    targets: '.repo-action-modal-box',
                    scale: [0.92, 1],
                    opacity: [0, 1],
                    duration: 350,
                    easing: 'easeOutCubic'
                  });
                } catch (e) { }
              }
            });
          }
        }
      );

      function close() {
        emit('close');
      }

      function onEditAlias() {
        emit('edit-alias', props.repoName);
      }

      function onRefresh() {
        emit('refresh', props.repoName);
      }

      function onRemove() {
        emit('remove', props.repoName);
      }

      return {
        isOpen,
        repoName,
        displayName,
        t,
        close,
        onEditAlias,
        onRefresh,
        onRemove
      };
    },
    template: `
      <transition name="studio-modal">
        <div
          v-if="isOpen"
          @click.self="close"
          role="dialog"
          aria-modal="true"
          aria-labelledby="repo-action-modal-title"
          class="studio-modal-overlay">
          <div class="repo-action-modal-box studio-modal-glass w-full max-w-sm p-6 space-y-4 shadow-2xl rounded-3xl relative border border-[var(--md-sys-color-outline-variant)]">
            <button
              type="button"
              @click="close"
              :aria-label="t('repoAction.close')"
              class="absolute right-4 top-4 studio-icon-btn text-xs font-bold hover:rotate-90">
              ✕
            </button>

            <div class="flex items-center gap-3 pr-8">
              <div class="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0">
                <studio-icon name="git-branch" class="w-5 h-5"></studio-icon>
              </div>
              <div class="min-w-0">
                <h2 id="repo-action-modal-title" class="font-extrabold text-base font-sans truncate text-[var(--md-sys-color-on-surface)]">
                  {{ displayName || repoName }}
                </h2>
                <div class="text-[10px] font-mono opacity-50 truncate" :title="repoName">
                  {{ repoName }}
                </div>
              </div>
            </div>

            <!-- Inset Grouped Options Card -->
            <div class="p-1.5 ios-input-box rounded-2xl space-y-1">
              <button
                type="button"
                @click="onEditAlias"
                class="w-full px-3.5 py-2.5 rounded-md flex items-center justify-between text-left cursor-pointer font-medium text-xs transition-all duration-150 group hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)]">
                <span class="flex items-center gap-2.5">
                  <studio-icon name="edit-3" class="w-4 h-4 opacity-75 text-[var(--md-sys-color-primary)] group-hover:opacity-100"></studio-icon>
                  <span>{{ t('repoAction.editAlias') }}</span>
                </span>
                <studio-icon name="chevron-right" class="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"></studio-icon>
              </button>

              <button
                type="button"
                @click="onRefresh"
                class="w-full px-3.5 py-2.5 rounded-md flex items-center justify-between text-left cursor-pointer font-medium text-xs transition-all duration-150 group hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-[var(--md-sys-color-on-surface)]">
                <span class="flex items-center gap-2.5">
                  <studio-icon name="refresh-cw" class="w-4 h-4 opacity-75 text-emerald-500 group-hover:opacity-100"></studio-icon>
                  <span>{{ t('repoAction.refresh') }}</span>
                </span>
                <studio-icon name="chevron-right" class="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"></studio-icon>
              </button>

              <div class="border-t border-black/5 dark:border-white/5 my-0.5 mx-1"></div>

              <button
                type="button"
                @click="onRemove"
                class="w-full px-3.5 py-2.5 rounded-md flex items-center justify-between text-left cursor-pointer font-medium text-xs transition-all duration-150 group hover:bg-red-500/12 text-red-500 hover:text-red-600 dark:hover:text-red-400">
                <span class="flex items-center gap-2.5">
                  <studio-icon name="trash-2" class="w-4 h-4 opacity-75 text-red-500 group-hover:opacity-100"></studio-icon>
                  <span>{{ t('repoAction.remove') }}</span>
                </span>
                <studio-icon name="chevron-right" class="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"></studio-icon>
              </button>
            </div>
          </div>
        </div>
      </transition>
    `
  };

  window.RepoActionModal = RepoActionModal;
})(window);

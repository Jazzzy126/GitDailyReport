/**
 * RepoTagList Component
 * Instant, crisp, professional Multi-Repo Tag List with Zero Animation Lag
 * Full i18n support
 */

(function (window) {
  const { toRefs } = window.Vue;

  const RepoTagList = {
    name: 'RepoTagList',
    props: {
      recentRepos: { type: Array, default: () => [] },
      selectedRepoNames: { type: Array, default: () => [] },
      activeRepoMenu: { type: String, default: '' },
      repoAliases: { type: Object, default: () => ({}) }
    },
    emits: ['toggle-select-all', 'toggle-selection', 'open-menu'],
    setup(props, { emit }) {
      const { recentRepos, selectedRepoNames, activeRepoMenu, repoAliases } = toRefs(props);
      const i18n = window.useI18n ? window.useI18n() : null;

      function t(key, params) {
        return i18n ? i18n.t(key, params) : key;
      }

      function getDisplayName(name) {
        return (repoAliases.value && repoAliases.value[name]) || name;
      }

      function onToggleSelectAll() {
        emit('toggle-select-all');
      }

      function onToggleSelection(repoName) {
        emit('toggle-selection', repoName);
      }

      function onOpenMenu(repoName) {
        emit('open-menu', repoName);
      }

      return {
        recentRepos,
        selectedRepoNames,
        activeRepoMenu,
        getDisplayName,
        t,
        onToggleSelectAll,
        onToggleSelection,
        onOpenMenu
      };
    },
    template: `
      <div v-if="recentRepos.length > 0" class="shrink-0">
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="font-bold opacity-70 flex items-center gap-1.5">
            <studio-icon name="layers" class="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]"></studio-icon>
            <span>{{ t('repo.recentTitle') }}</span>
          </span>
          <button
            type="button"
            @click="onToggleSelectAll"
            class="text-[11px] font-bold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded px-1"
            :aria-label="selectedRepoNames.length === recentRepos.length ? t('repo.clearAllAria') : t('repo.selectAllAria')">
            {{ selectedRepoNames.length === recentRepos.length ? t('repo.clearSelection') : t('repo.selectAll') }}
          </button>
        </div>

        <div 
          id="recent-pills-container" 
          class="flex items-center gap-2 overflow-x-auto custom-scrollbar px-1 py-1.5">
          <div v-for="r in recentRepos" :key="r.repoName" class="shrink-0">
            <div
              @click="onToggleSelection(r.repoName)"
              @contextmenu.prevent="onOpenMenu(r.repoName)"
              role="checkbox"
              :aria-checked="selectedRepoNames.includes(r.repoName)"
              tabindex="0"
              @keydown.space.prevent="onToggleSelection(r.repoName)"
              @keydown.enter.prevent="onToggleSelection(r.repoName)"
              :class="[
                'repo-pill-tag px-2.5 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] select-none',
                selectedRepoNames.includes(r.repoName)
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)]/40 shadow-xs hover:border-[var(--md-sys-color-primary)]/70'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--md-sys-color-on-surface)] border-black/5 dark:border-white/10 opacity-80 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/10 dark:border-white/20'
              ]">
              
              <!-- Clean Static Crisp Icon -->
              <studio-icon
                :name="selectedRepoNames.includes(r.repoName) ? 'check' : 'git-branch'"
                :class="['w-3.5 h-3.5 shrink-0', selectedRepoNames.includes(r.repoName) ? 'text-[var(--md-sys-color-primary)]' : 'opacity-70']"></studio-icon>

              <span class="truncate max-w-36 leading-none" :title="r.repoName">
                {{ getDisplayName(r.repoName) }}
              </span>

              <!-- 常驻微型更多操作按钮 (⋯) -->
              <button
                type="button"
                @click.stop="onOpenMenu(r.repoName)"
                :class="[
                  'w-5 h-5 inline-flex items-center justify-center rounded-md cursor-pointer focus-visible:ring-1 focus-visible:ring-[var(--md-sys-color-primary)] -mr-1',
                  activeRepoMenu === r.repoName
                    ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs font-bold'
                    : 'opacity-70 hover:opacity-100 text-current hover:bg-black/15 dark:hover:bg-white/25'
                ]"
                :title="t('repo.moreOptions') + ': ' + getDisplayName(r.repoName)"
                :aria-label="t('repo.moreOptions') + ': ' + getDisplayName(r.repoName)">
                <studio-icon name="more-horizontal" class="w-3.5 h-3.5"></studio-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  };

  window.RepoTagList = RepoTagList;
})(window);

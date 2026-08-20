/**
 * CommitList Component
 * High-performance virtualized Commit Stream with Adaptive Filtering & Skeleton Shimmers
 * Capable of rendering 1,000+ commits with 60 FPS scrolling and low DOM overhead.
 */

(function (window) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = window.Vue;

  const ITEM_HEIGHT = 68; // Estimated item height in px
  const VIRTUAL_THRESHOLD = 25; // Trigger virtual list when commit count exceeds threshold
  const OVERSCAN = 6; // Extra buffer items

  const CommitList = {
    name: 'CommitList',
    props: {
      t: {
        type: Function,
        required: true
      },
      filteredCommits: {
        type: Array,
        default: () => []
      },
      filterDate: {
        type: String,
        default: ''
      },
      filterAuthor: {
        type: String,
        default: ''
      },
      authorOptions: {
        type: Array,
        default: () => []
      },
      hasMultipleAuthors: {
        type: Boolean,
        default: false
      },
      singleAuthorName: {
        type: String,
        default: ''
      },
      activeDatePreset: {
        type: String,
        default: 'today'
      },
      isMultiRepoMode: {
        type: Boolean,
        default: false
      },
      isRefreshing: {
        type: Boolean,
        default: false
      },
      getRepoDisplayName: {
        type: Function,
        default: (name) => name
      }
    },
    emits: [
      'update:filterDate',
      'update:filterAuthor',
      'set-date-preset',
      'open-detail'
    ],
    setup(props, { emit }) {
      const scrollContainerRef = ref(null);
      const scrollTop = ref(0);
      const containerHeight = ref(400);

      let ticking = false;
      function handleScroll(e) {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (scrollContainerRef.value) {
              scrollTop.value = scrollContainerRef.value.scrollTop;
            }
            ticking = false;
          });
          ticking = true;
        }
      }

      function updateContainerHeight() {
        if (scrollContainerRef.value) {
          containerHeight.value = scrollContainerRef.value.clientHeight || 400;
        }
      }

      onMounted(() => {
        updateContainerHeight();
        window.addEventListener('resize', updateContainerHeight);
      });

      onUnmounted(() => {
        window.removeEventListener('resize', updateContainerHeight);
      });

      // Virtual Scroll Computations
      const isVirtualized = computed(() => props.filteredCommits.length > VIRTUAL_THRESHOLD);

      const totalHeight = computed(() => props.filteredCommits.length * ITEM_HEIGHT);

      const virtualRange = computed(() => {
        if (!isVirtualized.value) {
          return {
            start: 0,
            end: props.filteredCommits.length,
            offsetY: 0
          };
        }

        const count = props.filteredCommits.length;
        const startIdx = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - OVERSCAN);
        const visibleCount = Math.ceil(containerHeight.value / ITEM_HEIGHT);
        const endIdx = Math.min(count, startIdx + visibleCount + OVERSCAN * 2);
        const offsetY = startIdx * ITEM_HEIGHT;

        return {
          start: startIdx,
          end: endIdx,
          offsetY
        };
      });

      const visibleCommits = computed(() => {
        if (!isVirtualized.value) return props.filteredCommits;
        return props.filteredCommits.slice(virtualRange.value.start, virtualRange.value.end);
      });

      function onDateInput(e) {
        emit('update:filterDate', e.target.value);
      }

      function onAuthorSelect(val) {
        emit('update:filterAuthor', val);
      }

      return {
        scrollContainerRef,
        handleScroll,
        isVirtualized,
        totalHeight,
        virtualRange,
        visibleCommits,
        onDateInput,
        onAuthorSelect
      };
    },
    template: `
      <studio-pane :title="t('commits.title')" icon="git-commit" custom-class="flex-1 min-h-0">
        <template #header-right>
          <div class="studio-badge-pill tabular-nums font-mono" :aria-label="t('commits.countBadge', { count: filteredCommits.length })">
            <studio-icon name="git-commit" class="w-3 h-3 text-[var(--md-sys-color-primary)]"></studio-icon>
            <span>{{ t('commits.countBadge', { count: filteredCommits.length }) }}</span>
          </div>
        </template>

        <div class="p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
          
          <!-- Filter Controls Bar (Adaptive Layout) -->
          <div class="mb-3 shrink-0 space-y-2">
            <!-- Multi-Author Mode: Date + Author Dropdown -->
            <div v-if="hasMultipleAuthors" class="grid grid-cols-2 gap-2 items-center">
              <div class="relative w-full">
                <input type="date" id="filter-date-input" name="filterDate"
                  :value="filterDate" @input="onDateInput"
                  :aria-label="t('commits.filterDateLabel')"
                  class="ios-form-control cursor-pointer">
              </div>
              <div class="w-full">
                <custom-select
                  :model-value="filterAuthor"
                  @update:model-value="onAuthorSelect"
                  :options="authorOptions"
                  :placeholder="t('commits.allAuthors')"></custom-select>
              </div>
            </div>

            <!-- Single Author / Default Mode -->
            <div v-else class="flex items-center gap-2">
              <div class="relative flex-1">
                <input type="date" id="filter-date-input" name="filterDate"
                  :value="filterDate" @input="onDateInput"
                  :aria-label="t('commits.filterDateLabel')"
                  class="ios-form-control cursor-pointer">
              </div>

              <div v-if="singleAuthorName" class="flex items-center gap-1.5 shrink-0">
                <div class="studio-badge-pill text-[11px] py-1.5 px-2.5 max-w-[120px] truncate"
                  :title="t('commits.currentAuthor', { name: singleAuthorName })">
                  <studio-icon name="user" class="w-3 h-3 shrink-0 text-[var(--md-sys-color-primary)]"></studio-icon>
                  <span class="truncate">{{ singleAuthorName }}</span>
                </div>
              </div>
            </div>

            <!-- Date Preset Quick Buttons (Today / Yesterday / All) -->
            <div class="flex items-center gap-1.5 pt-0.5" role="group" :aria-label="t('commits.filterDateLabel')">
              <button type="button" @click="$emit('set-date-preset', 'today')"
                :class="['date-pill-btn', { 'active': activeDatePreset === 'today' }]"
                :aria-label="t('commits.todayAria')">
                <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                <span>{{ t('commits.today') }}</span>
              </button>
              <button type="button" @click="$emit('set-date-preset', 'yesterday')"
                :class="['date-pill-btn', { 'active': activeDatePreset === 'yesterday' }]"
                :aria-label="t('commits.yesterdayAria')">
                <span>{{ t('commits.yesterday') }}</span>
              </button>
              <button type="button" @click="$emit('set-date-preset', 'all')"
                :class="['date-pill-btn', { 'active': activeDatePreset === 'all' }]"
                :aria-label="t('commits.allAria')">
                <span>{{ t('commits.all') }}</span>
              </button>
            </div>
          </div>

          <!-- Commit Stream List Container -->
          <div id="commit-list-container" ref="scrollContainerRef" @scroll="handleScroll"
            class="max-h-96 lg:max-h-none flex-1 min-h-0 overflow-y-auto pr-1.5 custom-scrollbar relative"
            role="feed" :aria-busy="isRefreshing" :aria-label="t('commits.title')">

            <!-- Loading Skeleton Shimmers -->
            <div v-if="isRefreshing" class="space-y-2 py-1">
              <div v-for="i in 3" :key="'skel-' + i"
                class="p-2.5 rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 animate-pulse flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-black/10 dark:bg-white/10 shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-3 bg-black/10 dark:bg-white/10 rounded w-3/4"></div>
                  <div class="h-2.5 bg-black/10 dark:bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredCommits.length === 0" class="text-center opacity-70 text-xs py-8 space-y-3">
              <studio-icon name="folder-open" class="w-8 h-8 mx-auto opacity-60 text-[var(--md-sys-color-primary)]"></studio-icon>
              <div class="font-heading font-bold text-sm text-[var(--md-sys-color-on-surface)]">{{ t('commits.emptyTitle') }}</div>
              <div class="text-xs opacity-70 max-w-xs mx-auto leading-relaxed">
                {{ t('commits.emptyDesc') }}
              </div>
            </div>

            <!-- Virtual Scroll Height Wrapper -->
            <div v-else-if="isVirtualized" :style="{ height: totalHeight + 'px', position: 'relative', width: '100%' }">
              <div :style="{ transform: 'translateY(' + virtualRange.offsetY + 'px)', position: 'absolute', top: 0, left: 0, right: 0 }" class="space-y-2">
                <div v-for="c in visibleCommits" :key="c.hash + '-' + (c.repoName || '')"
                  @click="$emit('open-detail', c)"
                  @keydown.enter.prevent="$emit('open-detail', c)"
                  tabindex="0"
                  role="article"
                  class="commit-stream-item p-2.5 rounded-xl flex items-center justify-between gap-2.5 group cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]">
                  
                  <span :class="['timeline-dot', 'timeline-dot-' + (c.type || 'chore')]" :title="c.type || 'chore'"></span>

                  <div class="min-w-0 flex-1 space-y-1">
                    <div class="text-[13px] truncate font-bold leading-snug text-[var(--md-sys-color-on-surface)]" :title="c.message">
                      {{ c.message }}
                    </div>

                    <div class="flex items-center gap-2 flex-wrap text-[11px] opacity-75">
                      <span v-if="c.type" :class="['commit-tag', 'commit-tag-' + (c.type || 'chore')]">
                        {{ c.type }}
                      </span>

                      <span v-if="isMultiRepoMode && c.repoName"
                        class="studio-badge-pill text-[10px] shrink-0 truncate max-w-28" :title="c.repoName">
                        {{ getRepoDisplayName(c.repoName) }}
                      </span>
                      <span class="font-mono opacity-60 font-semibold tabular-nums">#{{ c.hash }}</span>
                      <span class="opacity-70 font-medium truncate">{{ c.author }}</span>
                      <span class="ml-auto font-mono text-[10px] opacity-50 tabular-nums">{{ c.date?.split(' ')[1] || '' }}</span>
                    </div>
                  </div>

                  <button type="button" @click.stop="$emit('open-detail', c)"
                    class="studio-icon-btn w-7 h-7 shrink-0 opacity-70 group-hover:opacity-100"
                    :title="t('commits.viewDetailAria', { hash: c.hash })"
                    :aria-label="t('commits.viewDetailAria', { hash: c.hash })">
                    <studio-icon name="eye" class="w-3.5 h-3.5"></studio-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Standard Non-virtualized List (<= 25 items) -->
            <div v-else class="space-y-2">
              <div v-for="c in visibleCommits" :key="c.hash + '-' + (c.repoName || '')"
                @click="$emit('open-detail', c)"
                @keydown.enter.prevent="$emit('open-detail', c)"
                tabindex="0"
                role="article"
                class="commit-stream-item p-2.5 rounded-xl flex items-center justify-between gap-2.5 group cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]">
                
                <span :class="['timeline-dot', 'timeline-dot-' + (c.type || 'chore')]" :title="c.type || 'chore'"></span>

                <div class="min-w-0 flex-1 space-y-1">
                  <div class="text-[13px] truncate font-bold leading-snug text-[var(--md-sys-color-on-surface)]" :title="c.message">
                    {{ c.message }}
                  </div>

                  <div class="flex items-center gap-2 flex-wrap text-[11px] opacity-75">
                    <span v-if="c.type" :class="['commit-tag', 'commit-tag-' + (c.type || 'chore')]">
                      {{ c.type }}
                    </span>

                    <span v-if="isMultiRepoMode && c.repoName"
                      class="studio-badge-pill text-[10px] shrink-0 truncate max-w-28" :title="c.repoName">
                      {{ getRepoDisplayName(c.repoName) }}
                    </span>
                    <span class="font-mono opacity-60 font-semibold tabular-nums">#{{ c.hash }}</span>
                    <span class="opacity-70 font-medium truncate">{{ c.author }}</span>
                    <span class="ml-auto font-mono text-[10px] opacity-50 tabular-nums">{{ c.date?.split(' ')[1] || '' }}</span>
                  </div>
                </div>

                <button type="button" @click.stop="$emit('open-detail', c)"
                  class="studio-icon-btn w-7 h-7 shrink-0 opacity-70 group-hover:opacity-100"
                  :title="t('commits.viewDetailAria', { hash: c.hash })"
                  :aria-label="t('commits.viewDetailAria', { hash: c.hash })">
                  <studio-icon name="eye" class="w-3.5 h-3.5"></studio-icon>
                </button>
              </div>
            </div>

          </div>

        </div>
      </studio-pane>
    `
  };

  window.CommitList = CommitList;
})(window);

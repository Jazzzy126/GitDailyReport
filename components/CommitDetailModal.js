/**
 * CommitDetailModal Component
 * Authentic Apple iOS Inset Grouped Commit Metadata Inspector
 * Powered by unified StudioModal base component
 */

(function (window) {
  const { toRefs, watch, nextTick } = window.Vue;

  const CommitDetailModal = {
    name: 'CommitDetailModal',
    props: {
      isOpen: { type: Boolean, default: false },
      commit: { type: Object, default: null }
    },
    emits: ['close', 'copy-sha', 'copy-msg'],
    setup(props, { emit }) {
      const { isOpen, commit } = toRefs(props);

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

      return {
        isOpen,
        commit,
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
            aria-label="关闭详情"
            class="absolute right-4 top-4 studio-icon-btn text-xs font-bold hover:rotate-90">
            ✕
          </button>

          <!-- Modal Header (Unified Apple Studio Pro Header Structure) -->
          <div class="flex items-center gap-3 pr-8 pb-1">
            <div class="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0">
              <studio-icon name="git-commit" class="w-5 h-5"></studio-icon>
            </div>
            <div>
              <h2 id="commit-modal-title" class="font-extrabold text-base font-sans">Git 提交元数据明细</h2>
              <span class="text-xs opacity-50 font-medium">Studio Pro Commit Inspector</span>
            </div>
          </div>

          <!-- Section 1: Inset Grouped SHA Card -->
          <div class="p-4 ios-input-box rounded-2xl space-y-2.5 text-xs">
            <div class="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
              <span class="text-xs opacity-50 font-bold uppercase tracking-wider">Commit 40位 Checksum</span>
              <button
                type="button"
                @click="$emit('copy-sha')"
                aria-label="复制 Commit Hash 校验码"
                class="text-xs text-[var(--md-sys-color-primary)] hover:underline font-bold flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded px-1">
                <studio-icon name="copy" class="w-3.5 h-3.5"></studio-icon>
                <span>复制 Hash</span>
              </button>
            </div>
            <div class="font-mono text-xs font-bold text-[var(--md-sys-color-primary)] break-all select-all tabular-nums">
              {{ commit?.fullHash || commit?.hash || '--' }}
            </div>
          </div>

          <!-- Section 2: Inset Grouped Key-Value List Card -->
          <div class="px-4 py-1 ios-input-box rounded-2xl text-xs divide-y divide-black/5 dark:divide-white/5">
            <div class="flex items-center justify-between py-2.5">
              <span class="opacity-60 font-medium">提交作者 (Author & Email)</span>
              <span class="font-bold truncate max-w-72">
                {{ commit?.author || '未知' }}
                {{ commit?.email ? '<' + commit.email + '>' : '' }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <span class="opacity-60 font-medium">提交精确时间 (Date & Timezone)</span>
              <span class="font-bold font-mono tabular-nums">
                {{ commit?.date }} {{ commit?.time }}
                {{ commit?.timezone ? '(' + commit.timezone + ')' : '' }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <span class="opacity-60 font-medium">规范分类 (Category)</span>
              <span class="font-bold text-[var(--md-sys-color-primary)]">
                {{ commit?.typeInfo ? commit.typeInfo.label : (commit?.type || '--') }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <span class="opacity-60 font-medium">Git 动作 (Action)</span>
              <span class="font-bold uppercase font-mono">
                {{ commit?.action || 'commit' }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <span class="opacity-60 font-medium">Unix 时间戳 (Timestamp)</span>
              <span class="font-mono font-bold opacity-80 tabular-nums">
                {{ commit?.timestamp ? commit.timestamp + ' (Sec)' : '--' }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <span class="opacity-60 font-medium">父级 Commit (Parent SHA)</span>
              <span class="font-mono font-bold truncate max-w-56 opacity-80 tabular-nums" :title="commit?.prevHash">
                {{ commit?.prevHash || '--' }}
              </span>
            </div>
          </div>

          <!-- Section 3: Full Message Section -->
          <div class="p-4 ios-input-box rounded-2xl space-y-2 min-w-0">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold opacity-70">完整 Commit 日志 Message</span>
              <button
                type="button"
                @click="$emit('copy-msg')"
                aria-label="复制完整 Commit 日志"
                class="text-xs text-[var(--md-sys-color-primary)] hover:underline font-bold flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded px-1">
                <studio-icon name="copy" class="w-3.5 h-3.5"></studio-icon>
                <span>复制日志</span>
              </button>
            </div>
            <div class="studio-editor-textarea p-3.5 ios-input-box rounded-xl text-xs leading-5 font-mono whitespace-pre-wrap break-words max-h-40 overflow-y-auto custom-scrollbar select-text bg-white/50 dark:bg-slate-900/60">
              {{ commit?.fullMessage || commit?.message || '--' }}
            </div>
          </div>

          <!-- Section 4: Raw Log Line Expandable Inset Card -->
          <div class="p-3.5 ios-input-box rounded-2xl">
            <details class="group">
              <summary class="text-xs font-bold opacity-60 cursor-pointer hover:opacity-100 flex items-center justify-between select-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded">
                <span>查看 100% 原始 Git 日报底层数据 (Raw Log Line)</span>
                <studio-icon name="chevron-down" class="w-3.5 h-3.5 transition group-open:rotate-180 text-[var(--md-sys-color-primary)]"></studio-icon>
              </summary>
              <div class="mt-2.5 p-3 rounded-xl font-mono text-xs opacity-80 break-all select-all bg-black/5 dark:bg-white/5 tabular-nums">
                {{ commit?.rawLine || ('commit ' + (commit?.fullHash || commit?.hash || '')) }}
              </div>
            </details>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end pt-3 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              @click="close"
              aria-label="关闭对话框"
              class="studio-btn studio-btn-primary px-6 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]">
              确定
            </button>
          </div>
        </div>
      </transition>
    `
  };

  window.CommitDetailModal = CommitDetailModal;
})(window);

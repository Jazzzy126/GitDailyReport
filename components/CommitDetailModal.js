/**
 * CommitDetailModal Component
 * iOS Inset Grouped Commit Inspector Modal Overlay with Spring Entrance
 */

(function (window) {
  const { toRefs, watch, nextTick } = window.Vue;

  const CommitDetailModal = {
    name: 'CommitDetailModal',
    props: {
      isOpen: { type: Boolean, default: false },
      commit: { type: Object, default: () => null }
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
                    targets: '.commit-modal-box',
                    scale: [0.92, 1],
                    opacity: [0, 1],
                    duration: 350,
                    easing: 'easeOutCubic'
                  });
                } catch (e) { }
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
      <div
        v-if="isOpen"
        @click.self="close"
        class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
        <div class="commit-modal-box studio-modal-box w-full max-w-xl p-6 space-y-4 rounded-3xl studio-pane shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar border border-white/20">
          <button
            @click="close"
            class="absolute right-4 top-4 w-8 h-8 rounded-full ios-input-box flex items-center justify-center text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer hover:rotate-90 transition duration-200">
            ✕
          </button>

          <!-- Modal Header -->
          <div class="flex items-center gap-3 border-b border-black/5 dark:border-white/10 pb-3">
            <div class="w-10 h-10 rounded-2xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
              <i data-lucide="git-commit" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-base">Git 提交元数据明细</h3>
              <span class="text-xs opacity-50 font-medium">iOS Inset Grouped Commit Inspector</span>
            </div>
          </div>

          <!-- Section 1: Inset Grouped SHA Card -->
          <div class="p-4 ios-input-box rounded-2xl space-y-3 text-xs">
            <div class="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
              <span class="text-xs opacity-50 font-bold uppercase tracking-wider">Commit 40位 Checksum</span>
              <button
                @click="$emit('copy-sha')"
                class="text-xs text-[#007AFF] hover:underline font-bold flex items-center gap-1 cursor-pointer">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                <span>复制 Hash</span>
              </button>
            </div>
            <div class="font-mono text-xs font-bold text-[#007AFF] dark:text-[#38bdf8] break-all select-all">
              {{ commit?.fullHash || commit?.hash || '--' }}
            </div>
          </div>

          <!-- Section 2: Inset Grouped Key-Value List Card -->
          <div class="p-4 ios-input-box rounded-2xl space-y-3 text-xs divide-y divide-black/5 dark:divide-white/5">
            <div class="flex items-center justify-between pt-1 first:pt-0">
              <span class="opacity-60 font-medium">提交作者 (Author & Email)</span>
              <span class="font-bold truncate max-w-72">
                {{ commit?.author || '未知' }}
                {{ commit?.email ? '<' + commit.email + '>' : '' }}
              </span>
            </div>

            <div class="flex items-center justify-between pt-3">
              <span class="opacity-60 font-medium">提交精确时间 (Date & Timezone)</span>
              <span class="font-bold font-mono">
                {{ commit?.date }} {{ commit?.time }}
                {{ commit?.timezone ? '(' + commit.timezone + ')' : '' }}
              </span>
            </div>

            <div class="flex items-center justify-between pt-3">
              <span class="opacity-60 font-medium">规范分类 (Category)</span>
              <span class="font-bold text-[#007AFF]">
                {{ commit?.typeInfo ? commit.typeInfo.label : (commit?.type || '--') }}
              </span>
            </div>

            <div class="flex items-center justify-between pt-3">
              <span class="opacity-60 font-medium">Git 动作 (Action)</span>
              <span class="font-bold uppercase font-mono">
                {{ commit?.action || 'commit' }}
              </span>
            </div>

            <div class="flex items-center justify-between pt-3">
              <span class="opacity-60 font-medium">Unix 时间戳 (Timestamp)</span>
              <span class="font-mono font-bold opacity-80">
                {{ commit?.timestamp ? commit.timestamp + ' (Sec)' : '--' }}
              </span>
            </div>

            <div class="flex items-center justify-between pt-3">
              <span class="opacity-60 font-medium">父级 Commit (Parent SHA)</span>
              <span class="font-mono font-bold truncate max-w-56 opacity-80" :title="commit?.prevHash">
                {{ commit?.prevHash || '--' }}
              </span>
            </div>
          </div>

          <!-- Section 3: Full Message Section -->
          <div class="p-4 ios-input-box rounded-2xl space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold opacity-70">完整 Commit 日志 Message</span>
              <button
                @click="$emit('copy-msg')"
                class="text-xs text-[#007AFF] hover:underline font-bold flex items-center gap-1 cursor-pointer">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                <span>复制日志</span>
              </button>
            </div>
            <div class="studio-editor-textarea p-3.5 ios-input-box rounded-xl text-xs leading-5 font-mono whitespace-pre-wrap wrap-break-word max-h-40 overflow-y-auto custom-scrollbar select-text bg-white/50 dark:bg-slate-900/60">
              {{ commit?.fullMessage || commit?.message || '--' }}
            </div>
          </div>

          <!-- Section 4: Raw Log Line Expandable Box -->
          <div class="border-t border-black/5 dark:border-white/10 pt-2">
            <details class="group">
              <summary class="text-xs font-bold opacity-50 cursor-pointer hover:opacity-100 flex items-center justify-between select-none">
                <span>查看 100% 原始 Git 日报底层数据 (Raw Log Line)</span>
                <i data-lucide="chevron-down" class="w-3.5 h-3.5 transition group-open:rotate-180"></i>
              </summary>
              <div class="mt-2 p-3 ios-input-box rounded-xl font-mono text-xs opacity-70 break-all select-all bg-slate-100 dark:bg-slate-950">
                {{ commit?.rawLine || ('commit ' + (commit?.fullHash || commit?.hash || '')) }}
              </div>
            </details>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end pt-2 border-t border-black/5 dark:border-white/10">
            <button
              @click="close"
              class="ios-btn px-6 py-2 bg-[#007AFF] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition">
              确定
            </button>
          </div>
        </div>
      </div>
    `
  };

  window.CommitDetailModal = CommitDetailModal;
})(window);

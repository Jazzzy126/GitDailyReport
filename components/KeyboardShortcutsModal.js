/**
 * KeyboardShortcutsModal Component
 * Visual cheat sheet and guide for global keyboard accelerators.
 */

(function (window) {
  const KeyboardShortcutsModal = {
    name: 'KeyboardShortcutsModal',
    props: {
      isOpen: {
        type: Boolean,
        default: false
      },
      t: {
        type: Function,
        required: true
      }
    },
    emits: ['close'],
    setup(props) {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const modKey = isMac ? '⌘' : 'Ctrl';

      return {
        isMac,
        modKey
      };
    },
    template: `
      <studio-modal :is-open="isOpen" @close="$emit('close')" :aria-label="t('shortcuts.title') || '快捷键指南'" custom-class="max-w-md">
        <div class="studio-modal-glass rounded-3xl overflow-hidden border border-[var(--md-sys-color-outline-variant)] shadow-2xl flex flex-col">
          
          <!-- Header -->
          <div class="px-5 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center">
                <studio-icon name="keyboard" class="w-4 h-4"></studio-icon>
              </div>
              <div>
                <h3 class="font-heading font-black text-sm text-[var(--md-sys-color-on-surface)] m-0">
                  {{ t('shortcuts.title') || '键盘快捷键' }}
                </h3>
                <p class="text-[11px] text-[var(--md-sys-color-on-surface-variant)] m-0">
                  {{ t('shortcuts.subtitle') || '提高工作流效率的全局快捷操作' }}
                </p>
              </div>
            </div>
            <button type="button" @click="$emit('close')"
              class="studio-icon-btn w-7 h-7"
              :title="t('shortcuts.close') || '关闭'"
              :aria-label="t('shortcuts.close') || '关闭'">
              <studio-icon name="x" class="w-4 h-4"></studio-icon>
            </button>
          </div>

          <!-- Shortcuts List Body -->
          <div class="p-5 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <!-- Shortcut 1: Generate AI Report -->
            <div class="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5">
              <div class="flex items-center gap-2.5">
                <studio-icon name="sparkles" class="w-4 h-4 text-[var(--md-sys-color-primary)]"></studio-icon>
                <span class="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
                  {{ t('shortcuts.generateReport') || '一键生成 AI 日报' }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <kbd class="kbd-badge">{{ modKey }}</kbd>
                <span class="text-xs opacity-40">+</span>
                <kbd class="kbd-badge">Enter</kbd>
              </div>
            </div>

            <!-- Shortcut 2: Copy Markdown -->
            <div class="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5">
              <div class="flex items-center gap-2.5">
                <studio-icon name="copy" class="w-4 h-4 text-emerald-500"></studio-icon>
                <span class="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
                  {{ t('shortcuts.copyMarkdown') || '快速复制 Markdown' }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <kbd class="kbd-badge">{{ modKey }}</kbd>
                <span class="text-xs opacity-40">+</span>
                <kbd class="kbd-badge">Shift</kbd>
                <span class="text-xs opacity-40">+</span>
                <kbd class="kbd-badge">C</kbd>
              </div>
            </div>

            <!-- Shortcut 3: System Settings -->
            <div class="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5">
              <div class="flex items-center gap-2.5">
                <studio-icon name="settings" class="w-4 h-4 text-purple-500"></studio-icon>
                <span class="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
                  {{ t('shortcuts.openSettings') || '打开系统与 AI 设置' }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <kbd class="kbd-badge">{{ modKey }}</kbd>
                <span class="text-xs opacity-40">+</span>
                <kbd class="kbd-badge">,</kbd>
              </div>
            </div>

            <!-- Shortcut 4: Toggle Shortcuts -->
            <div class="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5">
              <div class="flex items-center gap-2.5">
                <studio-icon name="command" class="w-4 h-4 text-blue-500"></studio-icon>
                <span class="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
                  {{ t('shortcuts.toggleShortcuts') || '查看快捷键指南' }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <kbd class="kbd-badge">{{ modKey }}</kbd>
                <span class="text-xs opacity-40">+</span>
                <kbd class="kbd-badge">K</kbd>
              </div>
            </div>

            <!-- Shortcut 5: Dismiss / Close Modal -->
            <div class="flex items-center justify-between py-2">
              <div class="flex items-center gap-2.5">
                <studio-icon name="x-circle" class="w-4 h-4 text-zinc-400"></studio-icon>
                <span class="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
                  {{ t('shortcuts.escape') || '关闭弹窗 / 撤销' }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <kbd class="kbd-badge">Esc</kbd>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-3 border-t border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-end">
            <button type="button" @click="$emit('close')"
              class="studio-btn studio-btn-primary py-1.5 px-4 text-xs">
              <span>{{ t('repoAction.close') || '我知道了' }}</span>
            </button>
          </div>

        </div>
      </studio-modal>
    `
  };

  window.KeyboardShortcutsModal = KeyboardShortcutsModal;
})(window);

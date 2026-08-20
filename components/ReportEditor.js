/**
 * ReportEditor Component
 * Apple Studio Pro Report Output & Markdown Editor Pane with Toolbar and Word Count Badge
 */

(function (window) {
  const { toRefs } = window.Vue;

  const ReportEditor = {
    name: 'ReportEditor',
    props: {
      modelValue: { type: String, default: '' },
      isTyping: { type: Boolean, default: false },
      provider: { type: String, default: 'DeepSeek' },
      wordCount: { type: [Number, String], default: 0 },
      commitCount: { type: Number, default: 0 }
    },
    emits: ['update:modelValue', 'generate', 'copy-plain', 'copy-md'],
    setup(props, { emit }) {
      const { modelValue, isTyping, provider, wordCount, commitCount } = toRefs(props);

      function onInput(e) {
        emit('update:modelValue', e.target.value);
      }

      function onGenerate() {
        emit('generate');
      }

      function onCopyPlain() {
        emit('copy-plain');
      }

      function onCopyMd() {
        emit('copy-md');
      }

      return {
        modelValue,
        isTyping,
        provider,
        wordCount,
        commitCount,
        onInput,
        onGenerate,
        onCopyPlain,
        onCopyMd
      };
    },
    template: `
      <studio-pane title="工作日报输出 Studio" icon="file-text" custom-class="h-full">
        <template #header-right>
          <div class="flex items-center gap-2">
            <div class="studio-badge-pill font-mono">
              <studio-icon name="cpu" class="w-3 h-3 shrink-0 text-[var(--accent-primary)]"></studio-icon>
              <span>{{ provider || 'DeepSeek' }}</span>
            </div>
            <div class="studio-badge-pill font-mono tabular-nums">
              <studio-icon name="type" class="w-3 h-3 shrink-0 text-[var(--accent-primary)]"></studio-icon>
              <span class="tabular-nums font-bold">{{ wordCount }} 字</span>
            </div>
          </div>
        </template>

        <div class="p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
          <!-- Action Toolbar with Counter & Flex Grouping -->
          <div class="p-2.5 ios-input-box rounded-2xl mb-3 shrink-0 flex flex-wrap items-center justify-between gap-2 shadow-xs">
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="onGenerate"
                :disabled="isTyping || commitCount === 0"
                class="studio-btn studio-btn-primary cursor-pointer transition shadow-xs disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                aria-label="生成日报">
                <studio-icon name="sparkles" class="w-4 h-4 text-amber-300 animate-pulse"></studio-icon>
                <span class="font-heading font-black">
                  {{ isTyping ? '正在流式撰写中…' : ('一键生成日报 (' + commitCount + ' 条 Commit)') }}
                </span>
              </button>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                @click="onCopyPlain"
                :disabled="!modelValue"
                class="studio-btn studio-btn-secondary cursor-pointer transition shadow-xs disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                aria-label="复制纯文本日报">
                <studio-icon name="copy" class="w-4 h-4 opacity-70"></studio-icon>
                <span>复制纯文本</span>
              </button>

              <button
                type="button"
                @click="onCopyMd"
                :disabled="!modelValue"
                class="studio-btn studio-btn-secondary cursor-pointer transition disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                aria-label="复制 Markdown 格式日报">
                <studio-icon name="file-code" class="w-4 h-4 opacity-70"></studio-icon>
                <span>复制 MD</span>
              </button>
            </div>
          </div>

          <!-- Editor Textarea Area -->
          <div class="flex-1 min-h-72 lg:min-h-0 relative flex flex-col overflow-hidden">
            <textarea
              id="report-output-textarea"
              name="reportOutput"
              :value="modelValue"
              @input="onInput"
              aria-label="工作日报输出与编辑区"
              :class="['studio-editor-textarea w-full flex-1 h-full p-4 text-[13px] sm:text-sm leading-6 ios-input-box rounded-2xl resize-none custom-scrollbar font-medium transition-all duration-300 relative z-10', { 'is-generating-report': isTyping }]"
              placeholder="生成的日报将在此处呈现，您可以随意在此处实时修改补充…"></textarea>
          </div>
        </div>
      </studio-pane>
    `
  };

  window.ReportEditor = ReportEditor;
})(window);

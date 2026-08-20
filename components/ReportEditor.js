/**
 * ReportEditor Component
 * Apple Studio Pro Report Output & Markdown Editor Pane
 * Features: Markdown Visual Preview / Source Switcher, Rich Text HTML Copy, Token-level Typing Stream & Hero Ready State.
 */

(function (window) {
  const { toRefs, ref, computed, onMounted, onUnmounted } = window.Vue;

  const ReportEditor = {
    name: 'ReportEditor',
    props: {
      modelValue: { type: String, default: '' },
      isTyping: { type: Boolean, default: false },
      provider: { type: String, default: 'DeepSeek' },
      wordCount: { type: [Number, String], default: 0 },
      commitCount: { type: Number, default: 0 },
      currentTemplate: { type: String, default: 'technical' },
      templates: { type: Array, default: () => [] }
    },
    emits: ['update:modelValue', 'generate', 'copy-plain', 'copy-md', 'copy-html', 'select-template'],
    setup(props, { emit }) {
      const { modelValue, isTyping, provider, wordCount, commitCount, currentTemplate, templates } = toRefs(props);
      const isTemplateMenuOpen = ref(false);
      const viewMode = ref('edit'); // 'edit' | 'preview'

      const isPlainCopied = ref(false);
      const isMdCopied = ref(false);
      const isHtmlCopied = ref(false);

      let plainCopyTimer = null;
      let mdCopyTimer = null;
      let htmlCopyTimer = null;

      const activeTemplateName = computed(() => {
        const list = templates.value || [];
        const found = list.find(t => t.id === currentTemplate.value);
        return found ? found.name : '标准版';
      });

      const renderedPreviewHtml = computed(() => {
        const text = modelValue.value || '';
        if (!text) return '';
        if (window.marked && typeof window.marked.parse === 'function') {
          try {
            return window.marked.parse(text);
          } catch (e) {
            return text.replace(/\n/g, '<br>');
          }
        }
        return text.replace(/\n/g, '<br>');
      });

      function onInput(e) {
        emit('update:modelValue', e.target.value);
      }

      function onGenerate() {
        emit('generate');
      }

      function onCopyPlain() {
        emit('copy-plain');
        isPlainCopied.value = true;
        clearTimeout(plainCopyTimer);
        plainCopyTimer = setTimeout(() => {
          isPlainCopied.value = false;
        }, 1500);
      }

      function onCopyMd() {
        emit('copy-md');
        isMdCopied.value = true;
        clearTimeout(mdCopyTimer);
        mdCopyTimer = setTimeout(() => {
          isMdCopied.value = false;
        }, 1500);
      }

      function onCopyHtml() {
        emit('copy-html');
        isHtmlCopied.value = true;
        clearTimeout(htmlCopyTimer);
        htmlCopyTimer = setTimeout(() => {
          isHtmlCopied.value = false;
        }, 1500);
      }

      function toggleTemplateMenu(e) {
        if (e) e.stopPropagation();
        isTemplateMenuOpen.value = !isTemplateMenuOpen.value;
      }

      function onSelectTemplate(tplId) {
        emit('select-template', tplId);
        isTemplateMenuOpen.value = false;
      }

      function onGlobalClick() {
        if (isTemplateMenuOpen.value) {
          isTemplateMenuOpen.value = false;
        }
      }

      onMounted(() => {
        document.addEventListener('click', onGlobalClick);
      });

      onUnmounted(() => {
        document.removeEventListener('click', onGlobalClick);
        clearTimeout(plainCopyTimer);
        clearTimeout(mdCopyTimer);
        clearTimeout(htmlCopyTimer);
      });

      return {
        modelValue,
        isTyping,
        provider,
        wordCount,
        commitCount,
        currentTemplate,
        templates,
        isTemplateMenuOpen,
        viewMode,
        isPlainCopied,
        isMdCopied,
        isHtmlCopied,
        activeTemplateName,
        renderedPreviewHtml,
        onInput,
        onGenerate,
        onCopyPlain,
        onCopyMd,
        onCopyHtml,
        toggleTemplateMenu,
        onSelectTemplate
      };
    },
    template: `
      <studio-pane title="工作日报输出 Studio" icon="file-text" custom-class="h-full">
        <template #header-right>
          <div class="flex items-center gap-2">
            <!-- View Mode Switcher (Edit vs Preview) -->
            <div class="inline-flex p-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-[var(--md-sys-color-outline-variant)]">
              <button
                type="button"
                @click="viewMode = 'edit'"
                :class="[
                  'px-2 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer',
                  viewMode === 'edit'
                    ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                ]">
                编辑
              </button>
              <button
                type="button"
                @click="viewMode = 'preview'"
                :class="[
                  'px-2 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer',
                  viewMode === 'preview'
                    ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                ]">
                预览
              </button>
            </div>

            <div class="studio-badge-pill font-mono">
              <studio-icon name="cpu" class="w-3 h-3 shrink-0 text-[var(--md-sys-color-primary)]"></studio-icon>
              <span>{{ provider || 'DeepSeek' }}</span>
            </div>
            <div class="studio-badge-pill font-mono tabular-nums">
              <studio-icon name="type" class="w-3 h-3 shrink-0 text-[var(--md-sys-color-primary)]"></studio-icon>
              <span class="tabular-nums font-bold">{{ wordCount }} 字</span>
            </div>
          </div>
        </template>

        <div class="p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
          <!-- Action Toolbar with Unified Split Button & Actions -->
          <div class="p-2.5 ios-input-box rounded-2xl mb-3 shrink-0 flex flex-wrap items-center justify-between gap-2 shadow-xs">
            
            <!-- Unified Seamless Professional Split Action Button (Generate + Mode Switcher) -->
            <div class="relative inline-flex items-center" @click.stop>
              <div :class="['studio-split-group', { 'studio-split-pulse': commitCount > 0 && !isTyping }]">
                <!-- Main Action Trigger -->
                <button
                  type="button"
                  @click="onGenerate"
                  :disabled="isTyping || commitCount === 0"
                  class="studio-split-main focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:opacity-50"
                  title="快捷键：Ctrl/Cmd + Enter"
                  aria-label="生成日报 (快捷键 Ctrl+Enter)">
                  <studio-icon name="sparkles" class="w-4 h-4 text-amber-300 animate-pulse"></studio-icon>
                  <span class="font-heading font-black">
                    {{ isTyping ? '正在流式撰写中…' : ('生成日报 (' + activeTemplateName + ')') }}
                  </span>
                </button>

                <!-- Split Dropdown Chevron Trigger -->
                <button
                  type="button"
                  @click="toggleTemplateMenu"
                  :disabled="isTyping"
                  class="studio-split-arrow focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:opacity-50"
                  title="切换日报风格模板"
                  aria-label="切换日报风格模板"
                  :aria-expanded="isTemplateMenuOpen">
                  <studio-icon name="chevron-down" :class="['studio-split-chevron', { 'is-open': isTemplateMenuOpen }]"></studio-icon>
                </button>
              </div>

              <!-- Split Mode Popover Dropdown Menu with Smooth Physics Transition -->
              <transition name="split-menu">
                <div
                  v-show="isTemplateMenuOpen"
                  class="absolute left-0 top-full mt-1.5 w-48 p-1.5 rounded-xl z-50 bg-[var(--md-sys-color-surface-container-highest)] backdrop-blur-2xl border border-[var(--md-sys-color-outline-variant)] shadow-2xl space-y-1">
                  <button
                    v-for="tpl in templates"
                    :key="tpl.id"
                    type="button"
                    @click="onSelectTemplate(tpl.id)"
                    :class="[
                      'w-full px-3 py-2 rounded-lg text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer',
                      currentTemplate === tpl.id
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)]'
                        : 'text-[var(--md-sys-color-on-surface)] hover:bg-black/5 dark:hover:bg-white/5'
                    ]">
                    <span class="flex items-center gap-2">
                      <studio-icon :name="tpl.icon" class="w-3.5 h-3.5"></studio-icon>
                      <span>{{ tpl.name }}</span>
                    </span>
                    <studio-icon v-if="currentTemplate === tpl.id" name="check" class="w-3.5 h-3.5 stroke-[2.5] text-[var(--md-sys-color-primary)]"></studio-icon>
                  </button>
                </div>
              </transition>
            </div>

            <!-- Copy Action Button Group with Multi-Format & Inline Feedback -->
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Copy Rich Text HTML (Direct to Feishu / WeChat / DingTalk) -->
              <button
                type="button"
                @click="onCopyHtml"
                :disabled="!modelValue"
                :class="[
                  'studio-btn cursor-pointer transition shadow-xs disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]',
                  isHtmlCopied ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' : 'studio-btn-primary'
                ]"
                title="复制带排版富文本，支持直接粘贴到飞书/企微/钉钉/邮件"
                aria-label="复制富文本日报">
                <studio-icon :name="isHtmlCopied ? 'check' : 'wand-2'" :class="['w-4 h-4 transition-transform', isHtmlCopied ? 'text-emerald-500 scale-110' : 'text-amber-300']"></studio-icon>
                <span class="font-bold">{{ isHtmlCopied ? '已复制富文本' : '复制富文本' }}</span>
              </button>

              <button
                type="button"
                @click="onCopyPlain"
                :disabled="!modelValue"
                :class="[
                  'studio-btn cursor-pointer transition shadow-xs disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]',
                  isPlainCopied ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' : 'studio-btn-secondary'
                ]"
                aria-label="复制纯文本日报">
                <studio-icon :name="isPlainCopied ? 'check' : 'copy'" :class="['w-4 h-4 transition-transform', isPlainCopied ? 'text-emerald-500 scale-110' : 'opacity-70']"></studio-icon>
                <span>{{ isPlainCopied ? '已复制纯文本' : '复制纯文本' }}</span>
              </button>

              <button
                type="button"
                @click="onCopyMd"
                :disabled="!modelValue"
                :class="[
                  'studio-btn cursor-pointer transition disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]',
                  isMdCopied ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' : 'studio-btn-secondary'
                ]"
                aria-label="复制 Markdown 格式日报">
                <studio-icon :name="isMdCopied ? 'check' : 'file-code'" :class="['w-4 h-4 transition-transform', isMdCopied ? 'text-emerald-500 scale-110' : 'opacity-70']"></studio-icon>
                <span>{{ isMdCopied ? '已复制 MD' : '复制 MD' }}</span>
              </button>
            </div>
          </div>

          <!-- Editor Output Container (Edit Textarea vs Markdown Preview) -->
          <div class="flex-1 min-h-72 lg:min-h-0 relative flex flex-col overflow-hidden rounded-2xl">
            <!-- Hero Ready State (When Empty) -->
            <div
              v-if="!modelValue && !isTyping"
              class="editor-hero-ready absolute inset-0 z-20 pointer-events-none select-none">
              <div class="w-14 h-14 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center mb-3 shadow-lg shadow-[var(--md-sys-color-primary-glow)]">
                <studio-icon name="sparkles" class="w-7 h-7"></studio-icon>
              </div>
              <h3 class="font-heading font-black text-sm sm:text-base tracking-tight mb-1">
                {{ commitCount > 0 ? (commitCount + ' 条提交记录已就绪') : '等待导入 Git 提交记录' }}
              </h3>
              <p class="text-xs opacity-65 max-w-sm mb-3 leading-relaxed">
                {{ commitCount > 0 ? 'AI 已准备就绪，点击上方主按钮或使用快捷键提炼精炼工作汇报' : '请在左侧拖拽 Git 仓库文件夹或选择预置项目' }}
              </p>
              <div v-if="commitCount > 0" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--md-sys-color-outline-variant)] text-[11px] font-mono opacity-80">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>快捷键 <kbd class="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-bold">Ctrl + Enter</kbd> 极速生成</span>
              </div>
            </div>

            <!-- View Mode 1: Markdown Visual Preview -->
            <div
              v-if="viewMode === 'preview' && (modelValue || isTyping)"
              class="markdown-preview-body w-full flex-1 h-full p-4 ios-input-box rounded-2xl overflow-y-auto custom-scrollbar relative z-10">
              <div v-html="renderedPreviewHtml"></div>
              <span v-if="isTyping" class="typing-cursor"></span>
            </div>

            <!-- View Mode 2: Source Code Textarea Editor -->
            <div v-show="viewMode === 'edit'" class="w-full flex-1 h-full relative">
              <textarea
                id="report-output-textarea"
                name="reportOutput"
                :value="modelValue"
                @input="onInput"
                aria-label="工作日报输出与编辑区"
                :class="['studio-editor-textarea w-full flex-1 h-full p-4 text-[13px] sm:text-sm leading-6 ios-input-box rounded-2xl resize-none custom-scrollbar font-medium transition-all duration-300 relative z-10', { 'is-generating-report': isTyping, 'opacity-0': !modelValue && !isTyping }]"
                placeholder="生成的日报将在此处呈现，您可以随意在此处实时修改补充…"></textarea>
            </div>
          </div>
        </div>
      </studio-pane>
    `
  };

  window.ReportEditor = ReportEditor;
})(window);

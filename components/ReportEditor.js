/**
 * ReportEditor Component
 * Apple Studio Pro Report Output & Markdown Editor Pane with Unified Split Generate Button, Toolbar & Word Count Badge
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
    emits: ['update:modelValue', 'generate', 'copy-plain', 'copy-md', 'select-template'],
    setup(props, { emit }) {
      const { modelValue, isTyping, provider, wordCount, commitCount, currentTemplate, templates } = toRefs(props);
      const isTemplateMenuOpen = ref(false);

      const activeTemplateName = computed(() => {
        const list = templates.value || [];
        const found = list.find(t => t.id === currentTemplate.value);
        return found ? found.name : '标准版';
      });

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
        activeTemplateName,
        onInput,
        onGenerate,
        onCopyPlain,
        onCopyMd,
        toggleTemplateMenu,
        onSelectTemplate
      };
    },
    template: `
      <studio-pane title="工作日报输出 Studio" icon="file-text" custom-class="h-full">
        <template #header-right>
          <div class="flex items-center gap-2">
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
          <!-- Action Toolbar with Unified Split Button & Counter -->
          <div class="p-2.5 ios-input-box rounded-2xl mb-3 shrink-0 flex flex-wrap items-center justify-between gap-2 shadow-xs">
            
            <!-- Unified Seamless Professional Split Action Button (Generate + Mode Switcher) -->
            <div class="relative inline-flex items-center" @click.stop>
              <div class="studio-split-group">
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

            <!-- Copy Action Button Group -->
            <div class="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                @click="onCopyPlain"
                :disabled="!modelValue"
                class="studio-btn studio-btn-secondary cursor-pointer transition shadow-xs disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                aria-label="复制纯文本日报">
                <studio-icon name="copy" class="w-4 h-4 opacity-70"></studio-icon>
                <span>复制纯文本</span>
              </button>

              <button
                type="button"
                @click="onCopyMd"
                :disabled="!modelValue"
                class="studio-btn studio-btn-secondary cursor-pointer transition disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
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

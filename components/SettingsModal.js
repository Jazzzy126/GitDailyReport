/**
 * SettingsModal Component
 * Authentic Apple iOS Segmented Control Settings Modal with Prompts & AI Parameters
 * Focused 100% on Business Logic, API Models & Prompt Templates
 */

(function (window) {
  const { toRefs, watch, nextTick } = window.Vue;

  const SettingsModal = {
    name: 'SettingsModal',
    props: {
      isOpen: { type: Boolean, default: false },
      settingsTab: { type: String, default: 'prompt' },
      aiConfig: { type: Object, required: true },
      isTestingConnection: { type: Boolean, default: false },
      itemCountOptions: { type: Array, default: () => [] },
      providerOptions: { type: Array, default: () => [] },
      reportTemplates: { type: Array, default: () => [] }
    },
    emits: [
      'close',
      'switch-tab',
      'select-template',
      'reset-prompt',
      'save-settings',
      'test-connection',
      'provider-change'
    ],
    setup(props, { emit }) {
      const {
        isOpen,
        settingsTab,
        aiConfig,
        isTestingConnection,
        itemCountOptions,
        providerOptions,
        reportTemplates
      } = toRefs(props);

      function close() {
        emit('close');
      }

      watch(
        () => isOpen.value,
        (open) => {
          if (open) {
            nextTick(() => {
              if (window.lucide) {
                window.lucide.createIcons();
              }
            });
          }
        }
      );

      const tabs = [
        { id: 'prompt', label: '提示词模板', icon: 'file-text' },
        { id: 'ai', label: 'AI 模型设置', icon: 'cpu' }
      ];

      return {
        isOpen,
        settingsTab,
        aiConfig,
        isTestingConnection,
        itemCountOptions,
        providerOptions,
        reportTemplates,
        tabs,
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
          aria-labelledby="modal-title"
          class="studio-modal-overlay">
          
          <div class="settings-modal-box studio-modal-glass w-full max-w-xl p-6 space-y-4 relative max-h-[92vh] overflow-y-auto custom-scrollbar">
            <!-- Close Button -->
            <button 
              type="button"
              @click="close" 
              aria-label="关闭设置"
              class="absolute right-4 top-4 studio-icon-btn text-xs font-bold hover:rotate-90">
              ✕
            </button>

            <!-- Header -->
            <div class="flex items-center gap-3 pr-8 pb-1">
              <div class="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0">
                <studio-icon name="sliders" class="w-5 h-5"></studio-icon>
              </div>
              <div>
                <h2 id="modal-title" class="font-extrabold text-base font-sans text-[var(--md-sys-color-on-surface)]">系统参数设置</h2>
                <span class="text-xs opacity-50 font-medium">配置 AI 服务商、API Key 与日报 Prompt</span>
              </div>
            </div>

            <!-- iOS Segmented Control Tabs (Official SegmentedControl Component with Sliding Pill) -->
            <segmented-control
              :model-value="settingsTab"
              :tabs="tabs"
              @update:model-value="$emit('switch-tab', $event)"></segmented-control>

            <!-- Tab Panels Container with Unified Absolute Equal Height (Eliminates Jitter) -->
            <div class="h-[340px] text-xs relative overflow-hidden">
              <!-- Tab 1: Prompt Settings -->
              <div 
                v-show="settingsTab === 'prompt'" 
                id="panel-prompt" 
                role="tabpanel" 
                aria-labelledby="tab-prompt"
                class="h-full flex flex-col justify-between space-y-2.5">
                <div class="flex items-center justify-between gap-2 flex-wrap shrink-0">
                  <div class="flex items-center p-0.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 gap-0.5">
                    <button
                      v-for="tpl in reportTemplates"
                      :key="tpl.id"
                      type="button"
                      @click="$emit('select-template', tpl.id)"
                      :class="[
                        'px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors',
                        aiConfig.templateId === tpl.id
                          ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
                          : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                      ]">
                      <studio-icon :name="tpl.icon" class="w-3.5 h-3.5"></studio-icon>
                      <span>{{ tpl.name }}</span>
                    </button>
                  </div>
                  <button 
                    type="button"
                    @click="$emit('reset-prompt')" 
                    class="text-xs text-[var(--md-sys-color-primary)] hover:underline font-bold focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded px-1 cursor-pointer" 
                    aria-label="恢复当前模板默认 Prompt">
                    恢复该模板默认
                  </button>
                </div>
                <textarea 
                  id="system-prompt-textarea"
                  name="systemPrompt"
                  v-model="aiConfig.systemPrompt" 
                  aria-label="AI 系统提示词模板"
                  class="studio-editor-textarea w-full flex-1 p-3.5 ios-input-box rounded-2xl resize-none text-xs font-mono select-text" 
                  placeholder="请输入 Prompt 模板..."></textarea>
                <div class="text-[11px] opacity-60 font-mono shrink-0">
                  可用动态占位符：{item_count} 或 {items}（生成条数）、{date}（今日日期）、{commits}（Git 提交日志列表）
                </div>
              </div>

              <!-- Tab 2: AI Engine Settings -->
              <div 
                v-show="settingsTab === 'ai'" 
                id="panel-ai" 
                role="tabpanel" 
                aria-labelledby="tab-ai"
                class="h-full flex flex-col justify-between space-y-2.5">
                <div class="grid grid-cols-2 gap-3 shrink-0">
                  <div class="space-y-1">
                    <label for="ai-provider-select" class="block font-semibold opacity-75">AI 服务商</label>
                    <custom-select 
                      id="ai-provider-select"
                      v-model="aiConfig.provider" 
                      :options="providerOptions" 
                      @change="$emit('provider-change', $event)" 
                      placeholder="选择 AI 服务商"></custom-select>
                  </div>
                  <div class="space-y-1">
                    <label for="ai-item-count-select" class="block font-semibold opacity-75">默认生成条目数</label>
                    <custom-select 
                      id="ai-item-count-select"
                      v-model="aiConfig.itemCount" 
                      :options="itemCountOptions" 
                      placeholder="选择条目数"></custom-select>
                  </div>
                </div>

                <div class="space-y-1 shrink-0">
                  <label for="ai-base-url-input" class="block font-semibold opacity-75">API Base URL</label>
                  <input 
                    id="ai-base-url-input"
                    name="baseUrl"
                    type="text" 
                    v-model="aiConfig.baseUrl" 
                    aria-label="API Base URL 地址"
                    class="ios-form-control ios-input-box rounded-2xl text-xs font-mono select-text" 
                    placeholder="https://api.deepseek.com/v1">
                </div>

                <div class="space-y-1 shrink-0">
                  <label for="ai-api-key-input" class="block font-semibold opacity-75">API Key</label>
                  <input 
                    id="ai-api-key-input"
                    name="apiKey"
                    type="password" 
                    v-model="aiConfig.apiKey" 
                    aria-label="API 密钥"
                    class="ios-form-control ios-input-box rounded-2xl text-xs font-mono select-text" 
                    placeholder="sk-...">
                </div>

                <div class="space-y-1 shrink-0">
                  <label for="ai-model-input" class="block font-semibold opacity-75">模型名称 (Model)</label>
                  <input 
                    id="ai-model-input"
                    name="model"
                    type="text" 
                    v-model="aiConfig.model" 
                    aria-label="大语言模型名称"
                    class="ios-form-control ios-input-box rounded-2xl text-xs font-mono select-text" 
                    placeholder="deepseek-chat">
                </div>

                <!-- Connection Test Action Row -->
                <div class="pt-2 flex items-center justify-between border-t border-black/5 dark:border-white/10 shrink-0">
                  <span class="text-[11px] opacity-60">配置完成后可先验证 API 接口连通状态</span>
                  <button 
                    type="button"
                    @click="$emit('test-connection')" 
                    :disabled="isTestingConnection || !aiConfig.apiKey" 
                    class="studio-btn studio-btn-secondary px-3 py-1.5 text-xs font-bold rounded-xl disabled:opacity-40 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer" 
                    aria-label="测试 API 接口连通性">
                    <studio-icon :name="isTestingConnection ? 'loader-2' : 'activity'" :class="['w-3.5 h-3.5', { 'animate-spin': isTestingConnection }]"></studio-icon>
                    <span>{{ isTestingConnection ? '正在测试连通中…' : '测试 API 连通性' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer Action Row -->
            <div class="pt-3 flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/10">
              <button 
                type="button"
                @click="close" 
                class="studio-btn studio-btn-secondary px-4 py-1.5 rounded-xl cursor-pointer" 
                aria-label="取消关闭设置弹窗">
                取消
              </button>
              <button 
                type="button"
                @click="$emit('save-settings')" 
                class="studio-btn studio-btn-primary px-5 py-1.5 rounded-xl font-bold shadow-xs cursor-pointer" 
                aria-label="保存设置">
                保存配置
              </button>
            </div>
          </div>
        </div>
      </transition>
    `
  };

  window.SettingsModal = SettingsModal;
})(window);

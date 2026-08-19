/**
 * SettingsModal Component
 * Authentic Apple iOS Segmented Control Settings Modal with Prompts & AI Parameters
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
      providerOptions: { type: Array, default: () => [] }
    },
    emits: [
      'close',
      'switch-tab',
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
        providerOptions 
      } = toRefs(props);

      watch(
        () => props.isOpen,
        (val) => {
          if (val) {
            nextTick(() => {
              if (window.anime) {
                try {
                  window.anime({
                    targets: '.settings-modal-box',
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

      function switchTab(tab) {
        emit('switch-tab', tab);
        nextTick(() => {
          if (window.lucide) window.lucide.createIcons();
        });
      }

      return {
        isOpen,
        settingsTab,
        aiConfig,
        isTestingConnection,
        itemCountOptions,
        providerOptions,
        close,
        switchTab
      };
    },
    template: `
      <div 
        v-if="isOpen" 
        @click.self="close"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
        <div class="settings-modal-box studio-modal-box w-full max-w-lg p-6 space-y-4 rounded-3xl studio-pane shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/20">
          <button 
            type="button"
            @click="close" 
            aria-label="关闭设置"
            class="absolute right-4 top-4 w-8 h-8 rounded-full ios-input-box flex items-center justify-center text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer hover:rotate-90 transition duration-200 focus-visible:ring-2 focus-visible:ring-[#007AFF]">
            ✕
          </button>
          
          <!-- Modal Header -->
          <div class="flex items-center gap-2 pb-1">
            <i data-lucide="settings" class="w-5 h-5 text-[#007AFF]" aria-hidden="true"></i>
            <h2 id="settings-modal-title" class="font-extrabold text-base">系统参数设置</h2>
          </div>

          <!-- Segmented Control Tabs -->
          <div class="flex items-center gap-1 p-1 ios-input-box rounded-2xl" role="tablist" aria-label="设置选项卡">
            <button 
              type="button" 
              role="tab"
              id="tab-prompt"
              aria-controls="panel-prompt"
              :aria-selected="settingsTab === 'prompt'"
              @click="switchTab('prompt')"
              :class="[
                'settings-tab-btn flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#007AFF]',
                settingsTab === 'prompt' ? 'active-settings-tab shadow-sm' : 'opacity-70 hover:opacity-100'
              ]">
              <i data-lucide="file-text" class="w-3.5 h-3.5" aria-hidden="true"></i>
              <span>提示词设置</span>
            </button>

            <button 
              type="button" 
              role="tab"
              id="tab-ai"
              aria-controls="panel-ai"
              :aria-selected="settingsTab === 'ai'"
              @click="switchTab('ai')"
              :class="[
                'settings-tab-btn flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#007AFF]',
                settingsTab === 'ai' ? 'active-settings-tab shadow-sm' : 'opacity-70 hover:opacity-100'
              ]">
              <i data-lucide="cpu" class="w-3.5 h-3.5" aria-hidden="true"></i>
              <span>AI设置</span>
            </button>
          </div>

          <!-- Tab 1: Prompt Settings -->
          <div 
            v-show="settingsTab === 'prompt'" 
            role="tabpanel"
            id="panel-prompt"
            aria-labelledby="tab-prompt"
            class="space-y-3 text-xs">
            <div>
              <label class="font-bold block mb-1">日报总结生成条数 (Item Count)</label>
              <custom-select 
                v-model="aiConfig.itemCount" 
                :options="itemCountOptions"></custom-select>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="setting-system-prompt" class="font-bold block text-xs cursor-pointer">自定义 AI 提示词 (System Prompt)</label>
                <button 
                  type="button"
                  @click="$emit('reset-prompt')" 
                  aria-label="恢复默认系统提示词"
                  class="text-xs text-[#007AFF] hover:underline font-semibold flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#007AFF] rounded px-1">
                  <i data-lucide="rotate-ccw" class="w-3 h-3" aria-hidden="true"></i>
                  <span>恢复默认提示词</span>
                </button>
              </div>
              <textarea 
                id="setting-system-prompt"
                name="systemPrompt"
                v-model="aiConfig.systemPrompt" 
                rows="8" 
                class="studio-editor-textarea w-full p-3.5 ios-input-box rounded-2xl text-xs leading-5 font-mono resize-none custom-scrollbar focus:border-[#007AFF] focus-visible:ring-2 focus-visible:ring-[#007AFF] transition" 
                placeholder="在此配置自定义 AI 提示词…"></textarea>
              <p class="text-xs opacity-60 mt-1.5 leading-relaxed">
                💡 <strong>变量说明</strong>：在提示词中使用 <code class="px-1 py-0.5 bg-[#007AFF]/10 text-[#007AFF] dark:text-[#38bdf8] font-mono font-bold rounded">{item_count}</code> 可动态代表上方选中的生成条数（系统发送时将自动替换为具体条数要求）。
              </p>
            </div>
          </div>

          <!-- Tab 2: AI Provider & API Key Settings -->
          <div 
            v-show="settingsTab === 'ai'" 
            role="tabpanel"
            id="panel-ai"
            aria-labelledby="tab-ai"
            class="space-y-3 text-xs">
            <div>
              <label class="font-bold block mb-1">服务提供商 (Provider)</label>
              <custom-select 
                v-model="aiConfig.provider" 
                :options="providerOptions" 
                @change="$emit('provider-change', $event)"></custom-select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label for="setting-api-key" class="font-bold block mb-1 cursor-pointer">API Key</label>
                <input 
                  id="setting-api-key"
                  name="apiKey"
                  type="password" 
                  autocomplete="off"
                  spellcheck="false"
                  v-model="aiConfig.apiKey" 
                  class="w-full p-2.5 ios-input-box rounded-xl font-mono text-xs focus:border-[#007AFF] focus-visible:ring-2 focus-visible:ring-[#007AFF] transition" 
                  placeholder="sk-…">
              </div>

              <div>
                <label for="setting-model" class="font-bold block mb-1 cursor-pointer">Model 模型名称</label>
                <input 
                  id="setting-model"
                  name="modelName"
                  type="text" 
                  autocomplete="off"
                  spellcheck="false"
                  v-model="aiConfig.model" 
                  class="w-full p-2.5 ios-input-box rounded-xl font-mono text-xs focus:border-[#007AFF] focus-visible:ring-2 focus-visible:ring-[#007AFF] transition" 
                  placeholder="deepseek-chat">
              </div>
            </div>

            <div>
              <label for="setting-base-url" class="font-bold block mb-1 cursor-pointer">Base URL (接口地址)</label>
              <input 
                id="setting-base-url"
                name="baseUrl"
                type="url" 
                autocomplete="off"
                spellcheck="false"
                v-model="aiConfig.baseUrl" 
                class="w-full p-2.5 ios-input-box rounded-xl font-mono text-xs focus:border-[#007AFF] focus-visible:ring-2 focus-visible:ring-[#007AFF] transition" 
                placeholder="https://api.deepseek.com/v1">
            </div>

            <div class="pt-1">
              <button 
                type="button" 
                @click="$emit('test-connection')" 
                :disabled="isTestingConnection"
                class="ios-btn w-full py-2.5 ios-input-box rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#007AFF]/10 text-[#007AFF] transition cursor-pointer disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-[#007AFF]">
                <i data-lucide="zap" class="w-3.5 h-3.5" aria-hidden="true"></i>
                <span>{{ isTestingConnection ? '测试中…' : '测试连通性' }}</span>
              </button>
            </div>
          </div>

          <!-- Save Footer -->
          <div class="flex justify-end pt-3 border-t border-black/5 dark:border-white/10">
            <button 
              type="button"
              @click="$emit('save-settings')" 
              class="ios-btn px-5 py-2 bg-[#007AFF] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition focus-visible:ring-2 focus-visible:ring-[#007AFF]">
              保存配置
            </button>
          </div>
        </div>
      </div>
    `
  };

  window.SettingsModal = SettingsModal;
})(window);

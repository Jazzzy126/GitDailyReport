/**
 * SettingsModal Component
 * Authentic Apple iOS Segmented Control Settings Modal with Prompts & AI Parameters
 * Focused 100% on Business Logic, API Models & Prompt Templates
 * Full i18n support
 */

(function (window) {
  const { toRefs, computed, watch, nextTick } = window.Vue;

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

      const i18n = window.useI18n ? window.useI18n() : null;
      function t(key, params) {
        return i18n ? i18n.t(key, params) : key;
      }

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

      const tabs = computed(() => [
        { id: 'prompt', label: t('settingsModal.tabPrompt'), icon: 'file-text' },
        { id: 'ai', label: t('settingsModal.tabAi'), icon: 'cpu' }
      ]);

      const localizedTemplates = computed(() => {
        return (reportTemplates.value || []).map(tpl => {
          const tplI18nKey = `templates.${tpl.id}`;
          const localized = t(tplI18nKey);
          return {
            ...tpl,
            displayName: localized !== tplI18nKey ? localized : tpl.name
          };
        });
      });

      return {
        isOpen,
        settingsTab,
        aiConfig,
        isTestingConnection,
        itemCountOptions,
        providerOptions,
        reportTemplates,
        localizedTemplates,
        tabs,
        t,
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
              :aria-label="t('settingsModal.close')"
              class="absolute right-4 top-4 studio-icon-btn text-xs font-bold hover:rotate-90">
              ✕
            </button>

            <!-- Header -->
            <div class="flex items-center gap-3 pr-8 pb-1">
              <div class="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0">
                <studio-icon name="sliders" class="w-5 h-5"></studio-icon>
              </div>
              <div>
                <h2 id="modal-title" class="font-extrabold text-base font-sans text-[var(--md-sys-color-on-surface)]">{{ t('settingsModal.title') }}</h2>
                <span class="text-xs opacity-50 font-medium">{{ t('settingsModal.subtitle') }}</span>
              </div>
            </div>

            <!-- iOS Segmented Control Tabs -->
            <segmented-control
              :model-value="settingsTab"
              :tabs="tabs"
              @update:model-value="$emit('switch-tab', $event)"></segmented-control>

            <!-- Tab Panels Container -->
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
                      v-for="tpl in localizedTemplates"
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
                      <span>{{ tpl.displayName }}</span>
                    </button>
                  </div>
                  <button 
                    type="button"
                    @click="$emit('reset-prompt')" 
                    class="text-xs text-[var(--md-sys-color-primary)] hover:underline font-bold focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded px-1 cursor-pointer" 
                    :aria-label="t('settingsModal.resetPrompt')">
                    {{ t('settingsModal.resetPrompt') }}
                  </button>
                </div>
                <textarea 
                  id="system-prompt-textarea"
                  name="systemPrompt"
                  v-model="aiConfig.systemPrompt" 
                  :aria-label="t('settingsModal.promptLabel')"
                  class="studio-editor-textarea w-full flex-1 p-3.5 ios-input-box rounded-2xl resize-none text-xs font-mono select-text" 
                  placeholder="System Prompt..."></textarea>
                <div class="text-[11px] opacity-60 font-mono shrink-0">
                  {{ t('settingsModal.promptDesc') }}
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
                    <label for="ai-provider-select" class="block font-semibold opacity-75">{{ t('settingsModal.providerLabel') }}</label>
                    <custom-select 
                      id="ai-provider-select"
                      v-model="aiConfig.provider" 
                      :options="providerOptions" 
                      @change="$emit('provider-change', $event)" 
                      :placeholder="t('settingsModal.providerLabel')"></custom-select>
                  </div>
                  <div class="space-y-1">
                    <label for="ai-item-count-select" class="block font-semibold opacity-75">{{ t('settingsModal.itemCountLabel') }}</label>
                    <custom-select 
                      id="ai-item-count-select"
                      v-model="aiConfig.itemCount" 
                      :options="itemCountOptions" 
                      :placeholder="t('settingsModal.itemCountLabel')"></custom-select>
                  </div>
                </div>

                <div class="space-y-1 shrink-0">
                  <label for="ai-base-url-input" class="block font-semibold opacity-75">{{ t('settingsModal.baseUrlLabel') }}</label>
                  <input 
                    id="ai-base-url-input"
                    name="baseUrl"
                    type="text" 
                    v-model="aiConfig.baseUrl" 
                    :aria-label="t('settingsModal.baseUrlLabel')"
                    class="ios-form-control ios-input-box rounded-2xl text-xs font-mono select-text" 
                    placeholder="https://api.deepseek.com/v1">
                </div>

                <div class="space-y-1 shrink-0">
                  <label for="ai-api-key-input" class="block font-semibold opacity-75">{{ t('settingsModal.apiKeyLabel') }}</label>
                  <input 
                    id="ai-api-key-input"
                    name="apiKey"
                    type="password" 
                    v-model="aiConfig.apiKey" 
                    :aria-label="t('settingsModal.apiKeyLabel')"
                    class="ios-form-control ios-input-box rounded-2xl text-xs font-mono select-text" 
                    placeholder="sk-...">
                </div>

                <div class="space-y-1 shrink-0">
                  <label for="ai-model-input" class="block font-semibold opacity-75">{{ t('settingsModal.modelLabel') }}</label>
                  <input 
                    id="ai-model-input"
                    name="model"
                    type="text" 
                    v-model="aiConfig.model" 
                    :aria-label="t('settingsModal.modelLabel')"
                    class="ios-form-control ios-input-box rounded-2xl text-xs font-mono select-text" 
                    placeholder="deepseek-chat">
                </div>

                <!-- Connection Test Action Row -->
                <div class="pt-2 flex items-center justify-between border-t border-black/5 dark:border-white/10 shrink-0">
                  <span class="text-[11px] opacity-60">OpenAI Compatible</span>
                  <button 
                    type="button"
                    @click="$emit('test-connection')" 
                    :disabled="isTestingConnection || !aiConfig.apiKey" 
                    class="studio-btn studio-btn-secondary px-3 py-1.5 text-xs font-bold rounded-xl disabled:opacity-40 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer" 
                    :aria-label="t('settingsModal.testBtn')">
                    <studio-icon :name="isTestingConnection ? 'loader-2' : 'activity'" :class="['w-3.5 h-3.5', { 'animate-spin': isTestingConnection }]"></studio-icon>
                    <span>{{ isTestingConnection ? t('settingsModal.testingBtn') : t('settingsModal.testBtn') }}</span>
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
                :aria-label="t('settingsModal.close')">
                ✕
              </button>
              <button 
                type="button"
                @click="$emit('save-settings')" 
                class="studio-btn studio-btn-primary px-5 py-1.5 rounded-xl font-bold shadow-xs cursor-pointer" 
                :aria-label="t('settingsModal.saveBtn')">
                {{ t('settingsModal.saveBtn') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    `
  };

  window.SettingsModal = SettingsModal;
})(window);

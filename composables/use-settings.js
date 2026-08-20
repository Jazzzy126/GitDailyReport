/**
 * useSettings Composable
 * Settings Modal, Prompts & AI Model Configuration, Multi-Template Management, Connection Testing
 * Full i18n support
 */

(function (window) {
  function useSettings({ showToast }) {
    const { ref, reactive } = window.Vue;
    const i18n = window.useI18n ? window.useI18n() : null;

    function t(key, params) {
      return i18n ? i18n.t(key, params) : key;
    }

    const isSettingsModalOpen = ref(false);
    const settingsTab = ref('prompt'); // 'prompt' | 'ai' | 'theme'
    const isTestingConnection = ref(false);

    const aiConfig = reactive({
      provider: 'deepseek',
      apiKey: '',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      itemCount: '2-3',
      templateId: 'technical',
      customPrompts: {},
      systemPrompt: ''
    });

    const reportTemplates = window.AIService ? window.AIService.REPORT_TEMPLATES : [];

    function loadConfig() {
      if (!window.AIService) return;
      const loaded = window.AIService.getConfig();
      aiConfig.provider = loaded.provider || 'deepseek';
      aiConfig.apiKey = loaded.apiKey || '';
      aiConfig.baseUrl = loaded.baseUrl || 'https://api.deepseek.com/v1';
      aiConfig.model = loaded.model || 'deepseek-chat';
      aiConfig.itemCount = loaded.itemCount || '2-3';
      aiConfig.templateId = loaded.templateId || 'technical';
      aiConfig.customPrompts = loaded.customPrompts || {};
      
      const currentPrompt = aiConfig.customPrompts[aiConfig.templateId] || loaded.systemPrompt;
      aiConfig.systemPrompt = currentPrompt || (reportTemplates[0] ? reportTemplates[0].prompt : '');
    }

    function setTemplate(tplId, silent = false) {
      // 1. Save current prompt to active template before switching
      if (aiConfig.templateId && aiConfig.systemPrompt) {
        aiConfig.customPrompts[aiConfig.templateId] = aiConfig.systemPrompt;
      }

      // 2. Switch to new template
      aiConfig.templateId = tplId;
      const found = reportTemplates.find(t => t.id === tplId);
      if (found) {
        aiConfig.systemPrompt = aiConfig.customPrompts[tplId] || found.prompt;
        window.AIService.saveConfig(aiConfig);
        if (!silent) {
          const tplI18nKey = `templates.${found.id}`;
          const tplName = t(tplI18nKey) !== tplI18nKey ? t(tplI18nKey) : found.name;
          showToast(t('report.templateCurrent', { name: tplName }));
        }
      }
    }

    function openSettingsModal(tab = 'prompt') {
      loadConfig();
      settingsTab.value = tab;
      isSettingsModalOpen.value = true;
    }

    function closeSettingsModal() {
      isSettingsModalOpen.value = false;
    }

    function switchSettingsTab(tab) {
      settingsTab.value = tab;
    }

    function onProviderChange(newProvider) {
      aiConfig.provider = newProvider;
      if (newProvider === 'deepseek') {
        aiConfig.baseUrl = 'https://api.deepseek.com/v1';
        aiConfig.model = 'deepseek-chat';
      } else if (newProvider === 'openai') {
        aiConfig.baseUrl = 'https://api.openai.com/v1';
        aiConfig.model = 'gpt-4o-mini';
      } else if (newProvider === 'ollama') {
        aiConfig.baseUrl = 'http://localhost:11434/v1';
        aiConfig.model = 'llama3';
      }
    }

    function resetDefaultPrompt() {
      if (window.AIService) {
        const found = reportTemplates.find(t => t.id === aiConfig.templateId);
        if (found) {
          aiConfig.systemPrompt = found.prompt;
          aiConfig.customPrompts[aiConfig.templateId] = found.prompt;
          window.AIService.saveConfig(aiConfig);
          const tplI18nKey = `templates.${found.id}`;
          const tplName = t(tplI18nKey) !== tplI18nKey ? t(tplI18nKey) : found.name;
          showToast(t('settingsModal.promptResetToast', { name: tplName }));
        }
      }
    }

    function saveSettings() {
      if (window.AIService) {
        if (aiConfig.templateId && aiConfig.systemPrompt) {
          aiConfig.customPrompts[aiConfig.templateId] = aiConfig.systemPrompt;
        }

        window.AIService.saveConfig({
          provider: aiConfig.provider,
          apiKey: (aiConfig.apiKey || '').trim(),
          baseUrl: (aiConfig.baseUrl || '').trim(),
          model: (aiConfig.model || '').trim(),
          itemCount: aiConfig.itemCount,
          templateId: aiConfig.templateId,
          customPrompts: aiConfig.customPrompts,
          systemPrompt: (aiConfig.systemPrompt || '').trim()
        });
      }
      isSettingsModalOpen.value = false;
      showToast(t('settingsModal.saveSuccessToast'));
    }

    async function testConnection() {
      if (!aiConfig.apiKey || !aiConfig.apiKey.trim()) {
        showToast(t('settingsModal.apiKeyRequiredToast'), 'warning');
        return;
      }

      isTestingConnection.value = true;
      try {
        const res = await window.AIService.testConnection({
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey.trim(),
          baseUrl: aiConfig.baseUrl.trim(),
          model: aiConfig.model.trim()
        });
        showToast(t('settingsModal.testSuccessToast', { latency: res.latencyMs }));
      } catch (err) {
        showToast(t('settingsModal.testFailedToast', { error: err.message }), 'error');
      } finally {
        isTestingConnection.value = false;
      }
    }

    return {
      isSettingsModalOpen,
      settingsTab,
      isTestingConnection,
      aiConfig,
      reportTemplates,
      setTemplate,
      loadConfig,
      openSettingsModal,
      closeSettingsModal,
      switchSettingsTab,
      onProviderChange,
      resetDefaultPrompt,
      saveSettings,
      testConnection
    };
  }

  window.useSettings = useSettings;
})(window);

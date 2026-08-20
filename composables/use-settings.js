/**
 * useSettings Composable
 * Settings Modal, Prompts & AI Model Configuration, Multi-Template Management, Connection Testing
 */

(function (window) {
  function useSettings({ showToast }) {
    const { ref, reactive } = window.Vue;

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
          showToast('已切换至「' + found.name + '」模板');
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
          showToast(`✨ 已恢复「${found.name}」的系统默认提示词`);
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
      showToast('⚙️ 配置保存成功');
    }

    async function testConnection() {
      if (!aiConfig.apiKey || !aiConfig.apiKey.trim()) {
        showToast('请先填写 API Key 再测试连通性', 'warning');
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
        showToast(`✅ API 接口连通成功！(响应耗时 ${res.latencyMs}ms)`);
      } catch (err) {
        showToast(`❌ 连通失败: ${err.message}`, 'error');
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

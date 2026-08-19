/**
 * useSettings Composable
 * Settings Modal, Prompts & AI Model Configuration, Connection Testing
 */

(function (window) {
  function useSettings({ showToast }) {
    const { ref, reactive } = window.Vue;

    const isSettingsModalOpen = ref(false);
    const settingsTab = ref('prompt'); // 'prompt' | 'ai'
    const isTestingConnection = ref(false);

    const aiConfig = reactive({
      provider: 'deepseek',
      apiKey: '',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      itemCount: '2-3',
      systemPrompt: window.AIService ? window.AIService.DEFAULT_SYSTEM_PROMPT : ''
    });

    function loadConfig() {
      if (!window.AIService) return;
      const loaded = window.AIService.getConfig();
      aiConfig.provider = loaded.provider || 'deepseek';
      aiConfig.apiKey = loaded.apiKey || '';
      aiConfig.baseUrl = loaded.baseUrl || 'https://api.deepseek.com/v1';
      aiConfig.model = loaded.model || 'deepseek-chat';
      aiConfig.itemCount = loaded.itemCount || '2-3';
      aiConfig.systemPrompt = loaded.systemPrompt || window.AIService.DEFAULT_SYSTEM_PROMPT;
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
        aiConfig.systemPrompt = window.AIService.DEFAULT_SYSTEM_PROMPT;
        showToast('✨ 已重置为默认高精简提示词');
      }
    }

    function saveSettings() {
      if (window.AIService) {
        window.AIService.saveConfig({
          provider: aiConfig.provider,
          apiKey: (aiConfig.apiKey || '').trim(),
          baseUrl: (aiConfig.baseUrl || '').trim(),
          model: (aiConfig.model || '').trim(),
          itemCount: aiConfig.itemCount,
          systemPrompt: (aiConfig.systemPrompt || '').trim()
        });
      }
      isSettingsModalOpen.value = false;
      showToast('⚙️ 系统设置（生成条数与 AI 配置）保存成功');
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

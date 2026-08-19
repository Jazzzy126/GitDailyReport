/**
 * Main Application Entry Point
 * Vue 3 Root App mounting, Global Component Registration & Composition API integration
 * Fully equipped with Apple-Grade Animation Engine & Staggered Micro-interactions
 */

(function (window) {
  const { createApp, ref, computed, onMounted, watch, nextTick } = window.Vue;

  const App = {
    setup() {
      // 1. Loading State
      const isLoading = ref(false);
      const loadingMessage = ref('正在解析 Git 提交记录...');

      function showLoading(msg = '正在解析 Git 提交记录...') {
        loadingMessage.value = msg;
        isLoading.value = true;
      }

      function hideLoading() {
        isLoading.value = false;
      }

      // 2. Lucide Icons Refresher
      function refreshIcons() {
        nextTick(() => {
          if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
          }
        });
      }

      // 3. Composables
      const toast = window.useToast();
      const theme = window.useTheme();
      const motion = window.useMotion ? window.useMotion() : null;

      const repos = window.useRepos({
        showToast: toast.showToast,
        showLoading,
        hideLoading
      });

      const commits = window.useCommits({
        mergedCommits: repos.mergedCommits,
        showToast: toast.showToast
      });

      const settings = window.useSettings({
        showToast: toast.showToast
      });

      const report = window.useReport({
        filteredCommits: commits.filteredCommits,
        filterDate: commits.filterDate,
        selectedRepoNames: repos.selectedRepoNames,
        getRepoDisplayName: repos.getRepoDisplayName,
        openSettingsModal: settings.openSettingsModal,
        showLoading,
        hideLoading,
        showToast: toast.showToast,
        motion
      });

      // Item count options label mapping
      const itemCountOptions = [
        { value: '2-3', label: '2 ~ 3 条 (默认精炼)' },
        { value: '3-5', label: '3 ~ 5 条 (标准适中)' },
        { value: '5-8', label: '5 ~ 8 条 (详细完整)' },
        { value: 'auto', label: '自动自适应 (根据提交量)' }
      ];

      // Provider options label mapping
      const providerOptions = [
        { value: 'deepseek', label: 'DeepSeek (推荐)' },
        { value: 'openai', label: 'OpenAI (GPT-4o/3.5)' },
        { value: 'ollama', label: 'Ollama (本地大模型)' },
        { value: 'custom', label: '自定义 API' }
      ];

      // Drag & Drop event bindings
      const isDragOver = ref(false);
      const fileInputRef = ref(null);

      function onDropZoneClick(e) {
        repos.handleFolderSelect().then(handled => {
          if (!handled && fileInputRef.value) {
            fileInputRef.value.click();
          }
        });
      }

      function onDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        isDragOver.value = true;
      }

      function onDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        isDragOver.value = false;
      }

      function onDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        isDragOver.value = false;
        if (e.dataTransfer) {
          repos.handleDropFiles(e.dataTransfer);
        }
      }

      function onFileInputChange(e) {
        if (e.target && e.target.files) {
          repos.handleFileInputChange(e.target.files);
          e.target.value = '';
        }
      }

      // Smooth Animated Word Count Display
      const animatedWordCount = ref(0);
      watch(
        () => report.wordCount.value,
        (newVal) => {
          if (window.anime) {
            window.anime({
              targets: animatedWordCount,
              value: newVal,
              round: 1,
              easing: 'easeOutExpo',
              duration: 400
            });
          } else {
            animatedWordCount.value = newVal;
          }
        }
      );

      // Staggered Entrance Animation for Main Studio Panes Only
      function playEntranceAnimation() {
        if (window.anime) {
          window.anime({
            targets: 'header, main .studio-pane',
            translateY: [16, 0],
            opacity: [0, 1],
            delay: window.anime.stagger(80, { start: 50 }),
            easing: 'easeOutCubic',
            duration: 600
          });
        }
      }

      // Theme Change -> Vanta Update
      watch(
        () => theme.isDark.value,
        (isDark) => {
          if (motion) motion.updateVantaTheme(isDark);
        }
      );

      // Icons update watcher
      watch(
        [
          () => theme.themeMode.value,
          () => repos.recentRepos.value.length,
          () => repos.selectedRepoNames.value,
          () => commits.filteredCommits.value.length,
          () => commits.isDetailModalOpen.value,
          () => settings.isSettingsModalOpen.value,
          () => settings.settingsTab.value
        ],
        () => {
          refreshIcons();
        },
        { flush: 'post' }
      );

      onMounted(() => {
        repos.initRepoState();
        settings.loadConfig();

        // 1. Dynamic Vanta Fog Canvas
        if (motion) {
          const bgContainer = document.getElementById('vanta-bg');
          motion.initVantaBackground(bgContainer, theme.isDark.value);
        }

        // 2. AutoAnimate seamless list binding
        if (motion) {
          const commitListEl = document.getElementById('commit-list-container');
          const pillsListEl = document.getElementById('recent-pills-container');
          if (commitListEl) motion.bindAutoAnimate(commitListEl);
          if (pillsListEl) motion.bindAutoAnimate(pillsListEl);
        }

        // 3. Staggered card entrance
        playEntranceAnimation();

        // 4. AI config check toast
        const savedAi = window.AIService ? window.AIService.getConfig() : null;
        if (savedAi && savedAi.apiKey) {
          toast.showToast('⚙️ 已检测到本地 AI 配置');
        }

        // 5. Global Escape listener
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            if (commits.isDetailModalOpen.value) commits.closeCommitDetail();
            if (settings.isSettingsModalOpen.value) settings.closeSettingsModal();
          }
        });

        refreshIcons();
      });

      return {
        // Loading
        isLoading,
        loadingMessage,

        // Motion
        motion,
        animatedWordCount,

        // Theme
        themeMode: theme.themeMode,
        isDark: theme.isDark,
        themeIcon: theme.themeIcon,
        themeTitle: theme.themeTitle,
        themeColorClass: theme.themeColorClass,
        toggleTheme: theme.toggleTheme,

        // Repos
        recentRepos: repos.recentRepos,
        selectedRepoNames: repos.selectedRepoNames,
        currentRepoBadgeText: repos.currentRepoBadgeText,
        isMultiRepoMode: repos.isMultiRepoMode,
        getRepoDisplayName: repos.getRepoDisplayName,
        promptEditAlias: repos.promptEditAlias,
        toggleRepoSelection: repos.toggleRepoSelection,
        toggleSelectAllRepos: repos.toggleSelectAllRepos,
        isDragOver,
        fileInputRef,
        onDropZoneClick,
        onDragOver,
        onDragLeave,
        onDrop,
        onFileInputChange,

        // Commits
        filterDate: commits.filterDate,
        filterAuthor: commits.filterAuthor,
        authorOptions: commits.authorOptions,
        filteredCommits: commits.filteredCommits,
        activeDetailCommit: commits.activeDetailCommit,
        isDetailModalOpen: commits.isDetailModalOpen,
        openCommitDetail: commits.openCommitDetail,
        closeCommitDetail: commits.closeCommitDetail,
        copyFullSha: commits.copyFullSha,
        copyCommitMsg: commits.copyCommitMsg,

        // Settings
        isSettingsModalOpen: settings.isSettingsModalOpen,
        settingsTab: settings.settingsTab,
        isTestingConnection: settings.isTestingConnection,
        aiConfig: settings.aiConfig,
        openSettingsModal: settings.openSettingsModal,
        closeSettingsModal: settings.closeSettingsModal,
        switchSettingsTab: settings.switchSettingsTab,
        onProviderChange: settings.onProviderChange,
        resetDefaultPrompt: settings.resetDefaultPrompt,
        saveSettings: settings.saveSettings,
        testConnection: settings.testConnection,
        itemCountOptions,
        providerOptions,

        // Report
        reportOutput: report.reportOutput,
        wordCount: report.wordCount,
        isTyping: report.isTyping,
        generateReport: report.generateReport,
        copyPlain: report.copyPlain,
        copyMd: report.copyMd,

        // Toast
        toasts: toast.toasts,

        refreshIcons
      };
    }
  };

  const app = createApp(App);

  // Global Component Registration
  if (window.StudioIcon) app.component('StudioIcon', window.StudioIcon);
  if (window.StudioPane) app.component('StudioPane', window.StudioPane);
  if (window.CustomSelect) app.component('CustomSelect', window.CustomSelect);
  if (window.CommitDetailModal) app.component('CommitDetailModal', window.CommitDetailModal);
  if (window.SettingsModal) app.component('SettingsModal', window.SettingsModal);
  if (window.ToastContainer) app.component('ToastContainer', window.ToastContainer);
  if (window.LoadingOverlay) app.component('LoadingOverlay', window.LoadingOverlay);

  app.mount('#app');
})(window);

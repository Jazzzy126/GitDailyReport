/**
 * Main Application Entry Point
 * Vue 3 Root App mounting, Global Component Registration & Composition API integration
 * Fully equipped with Apple-Grade Animation Engine, Debounced Render & Event Lifecycle Cleanup
 * Full i18n support with Chinese, English, Japanese, and Korean
 */

(function (window) {
  const { createApp, ref, computed, onMounted, onUnmounted, watch, nextTick } = window.Vue;

  const App = {
    setup() {
      // 0. i18n Engine
      const i18n = window.useI18n ? window.useI18n() : {
        locale: ref('zh-CN'),
        supportedLocales: [],
        currentLocaleInfo: ref({ code: 'zh-CN', label: '简体中文', icon: '🇨🇳' }),
        setLocale: () => {},
        t: (k) => k
      };
      const { t, locale, supportedLocales, currentLocaleInfo, setLocale } = i18n;

      // 1. Loading State
      const isLoading = ref(false);
      const loadingMessage = ref(t('report.generatingLoading'));

      function showLoading(msg) {
        loadingMessage.value = msg || t('report.generatingLoading');
        isLoading.value = true;
      }

      function hideLoading() {
        isLoading.value = false;
      }

      // 2. Lucide Icons Debounced Refresher
      let iconRefreshScheduled = false;
      function refreshIcons() {
        if (iconRefreshScheduled) return;
        iconRefreshScheduled = true;
        nextTick(() => {
          iconRefreshScheduled = false;
          if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
          }
        });
      }

      // 3. Composables
      const toast = window.useToast();
      const theme = window.useTheme();
      const motion = window.useMotion ? window.useMotion() : null;
      const whimsy = window.useWhimsy ? window.useWhimsy() : null;

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
        motion,
        whimsy
      });

      // Item count options dynamic i18n mapping
      const itemCountOptions = computed(() => [
        { value: '2-3', label: t('itemCountOptions.2-3') },
        { value: '3-5', label: t('itemCountOptions.3-5') },
        { value: '5-8', label: t('itemCountOptions.5-8') },
        { value: 'auto', label: t('itemCountOptions.auto') }
      ]);

      // Provider options label mapping
      const providerOptions = [
        { value: 'deepseek', label: 'DeepSeek' },
        { value: 'openai', label: 'OpenAI (GPT-4o/3.5)' },
        { value: 'ollama', label: 'Ollama (Local LLM)' },
        { value: 'custom', label: 'Custom API' }
      ];

      // Drag & Drop event bindings
      const isDragOver = ref(false);
      const fileInputRef = ref(null);

      function onDropZoneClick() {
        repos.handleFolderSelect().then((handled) => {
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

      // Staggered Entrance Animation for Main Studio Panes
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

      // Language Switcher Modal State
      const isLanguageModalOpen = ref(false);

      function openLanguageModal(e) {
        if (e) e.stopPropagation();
        isLanguageModalOpen.value = true;
      }

      function closeLanguageModal() {
        isLanguageModalOpen.value = false;
      }

      function onSelectLanguage(code) {
        setLocale(code);
        const targetLocale = supportedLocales.find(l => l.code === code);
        const langName = targetLocale ? targetLocale.label : code;
        toast.showToast(t('toast.languageSwitched', { lang: langName }));
      }

      // Theme Customizer Popover state
      const isThemePopoverOpen = ref(false);

      function toggleThemePopover(e) {
        if (e) e.stopPropagation();
        isThemePopoverOpen.value = !isThemePopoverOpen.value;
      }

      function closeThemePopover() {
        isThemePopoverOpen.value = false;
      }

      function setThemeMode(mode) {
        theme.setThemeMode(mode);
      }

      // Icons update watcher (batching)
      watch(
        [
          () => theme.themeMode.value,
          () => locale.value,
          () => repos.recentRepos.value.length,
          () => repos.selectedRepoNames.value,
          () => commits.filteredCommits.value.length,
          () => commits.isDetailModalOpen.value,
          () => settings.isSettingsModalOpen.value,
          () => settings.settingsTab.value,
          () => isLanguageModalOpen.value
        ],
        () => {
          refreshIcons();
        },
        { flush: 'post' }
      );

      // Global Event Listeners with Safe Lifecycle Cleanup & Power
      // Shortcuts Modal State
      const isShortcutsModalOpen = ref(false);
      function openShortcutsModal() {
        isShortcutsModalOpen.value = true;
      }
      function closeShortcutsModal() {
        isShortcutsModalOpen.value = false;
      }

      // 8. Global Keyboard Accelerators & Event Bindings
      function onKeyDown(e) {
        // 1. Escape -> Close any open modal/popover
        if (e.key === 'Escape') {
          if (isShortcutsModalOpen.value) {
            closeShortcutsModal();
            return;
          }
          if (isThemePopoverOpen.value) closeThemePopover();
          if (isLanguageModalOpen.value) closeLanguageModal();
          if (whimsy && whimsy.isAchievementModalOpen.value) whimsy.closeAchievementModal();
          if (commits.isDetailModalOpen.value) commits.closeCommitDetail();
          if (settings.isSettingsModalOpen.value) settings.closeSettingsModal();
          if (repos.activeRepoMenu.value) repos.closeRepoMenu();
          return;
        }

        // 2. Ctrl/Cmd + Enter -> Quick Generate Report
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (!report.isTyping.value && commits.filteredCommits.value.length > 0) {
            report.generateReport();
          } else if (commits.filteredCommits.value.length === 0) {
            toast.showToast(t('report.noCommitsWarn'), 'warning');
          }
          return;
        }

        // 3. Ctrl/Cmd + Shift + C -> Quick Copy Markdown
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
          e.preventDefault();
          report.copyMd();
          return;
        }

        // 4. Ctrl/Cmd + , -> Open System Settings
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
          e.preventDefault();
          if (settings.isSettingsModalOpen.value) {
            settings.closeSettingsModal();
          } else {
            settings.openSettingsModal('prompt');
          }
          return;
        }

        // 5. Ctrl/Cmd + K or '?' in non-input -> Toggle Shortcuts Guide
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
          e.preventDefault();
          isShortcutsModalOpen.value = !isShortcutsModalOpen.value;
          return;
        }

        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (e.key === '?' && activeTag !== 'input' && activeTag !== 'textarea' && !document.activeElement.isContentEditable) {
          e.preventDefault();
          isShortcutsModalOpen.value = !isShortcutsModalOpen.value;
          return;
        }
      }

      function onDocumentClick(e) {
        if (isThemePopoverOpen.value && !e.target.closest('.theme-popover-container')) {
          closeThemePopover();
        }
        if (repos.activeRepoMenu.value && !e.target.closest('.repo-menu-container')) {
          repos.closeRepoMenu();
        }
      }

      function onPaste(e) {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable) {
          return;
        }
        const text = e.clipboardData ? e.clipboardData.getData('text') : '';
        if (text && text.trim()) {
          const parsed = window.GitParser.parseTextLog(text);
          if (parsed && parsed.length > 0) {
            e.preventDefault();
            repos.importCommits(parsed, 'PastedGitLog');
            toast.showToast(t('toast.clipboardImportSuccess', { count: parsed.length }));
          }
        }
      }

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
          toast.showToast(t('toast.aiConfigDetected'));
        }

        // 5. Whimsy Geek Banner
        if (whimsy) {
          whimsy.printConsoleGeekBanner();
        }

        // 6. Register Global Event Listeners
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('click', onDocumentClick);
        window.addEventListener('paste', onPaste);

        refreshIcons();
      });

      onUnmounted(() => {
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('click', onDocumentClick);
        window.removeEventListener('paste', onPaste);
      });

      return {
        // i18n
        t,
        locale,
        supportedLocales,
        currentLocaleInfo,
        setLocale,
        isLanguageModalOpen,
        openLanguageModal,
        closeLanguageModal,
        onSelectLanguage,

        // Whimsy & Easter Eggs
        whimsy,
        handleLogoClick: whimsy ? whimsy.handleLogoClick : () => {},
        isAchievementModalOpen: whimsy ? whimsy.isAchievementModalOpen : ref(false),
        closeAchievementModal: whimsy ? whimsy.closeAchievementModal : () => {},

        // Loading
        isLoading,
        loadingMessage,

        // Motion
        motion,
        animatedWordCount,

        // Theme & Appearance Customizer
        isThemePopoverOpen,
        toggleThemePopover,
        closeThemePopover,
        setThemeMode,
        themeMode: theme.themeMode,
        isDark: theme.isDark,
        themeColorClass: theme.themeColorClass,
        customThemeConfig: theme.customConfig,
        colorPresets: theme.colorPresets,
        radiusPresets: theme.radiusPresets,
        glassPresets: theme.glassPresets,
        toggleTheme: theme.toggleTheme,
        setColorPreset: theme.setColorPreset,
        setRadiusPreset: theme.setRadiusPreset,
        setGlassPreset: theme.setGlassPreset,
        resetCustomConfig: theme.resetCustomConfig,

        // Repos
        recentRepos: repos.recentRepos,
        selectedRepoNames: repos.selectedRepoNames,
        repoAliases: repos.repoAliases,
        isMultiRepoMode: repos.isMultiRepoMode,
        currentRepoBadgeText: repos.currentRepoBadgeText,
        mergedCommits: repos.mergedCommits,
        isRefreshing: repos.isRefreshing,
        isDropzoneCollapsed: repos.isDropzoneCollapsed,
        toggleDropzone: repos.toggleDropzone,
        getRepoDisplayName: repos.getRepoDisplayName,
        promptEditAlias: repos.promptEditAlias,
        removeRepo: repos.removeRepo,
        activeRepoMenu: repos.activeRepoMenu,
        toggleRepoMenu: repos.toggleRepoMenu,
        closeRepoMenu: repos.closeRepoMenu,
        refreshRepoByHandle: repos.refreshRepoByHandle,
        toggleRepoSelection: repos.toggleRepoSelection,
        toggleSelectAllRepos: repos.toggleSelectAllRepos,
        refreshSelectedRepos: repos.refreshSelectedRepos,

        // Drag & Drop
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
        hasMultipleAuthors: commits.hasMultipleAuthors,
        singleAuthorName: commits.singleAuthorName,
        filteredCommits: commits.filteredCommits,
        activeDetailCommit: commits.activeDetailCommit,
        isDetailModalOpen: commits.isDetailModalOpen,
        activeDatePreset: commits.activeDatePreset,
        setDatePreset: commits.setDatePreset,
        openCommitDetail: commits.openCommitDetail,
        closeCommitDetail: commits.closeCommitDetail,
        copyFullSha: commits.copyFullSha,
        copyCommitMsg: commits.copyCommitMsg,

        // Shortcuts Guide
        isShortcutsModalOpen,
        openShortcutsModal,
        closeShortcutsModal,

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
        reportTemplates: settings.reportTemplates,
        setTemplate: settings.setTemplate,
        itemCountOptions,
        providerOptions,

        // Report
        reportOutput: report.reportOutput,
        wordCount: report.wordCount,
        isTyping: report.isTyping,
        generateReport: report.generateReport,
        copyPlain: report.copyPlain,
        copyMd: report.copyMd,
        copyHtml: report.copyHtml,

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
  if (window.SegmentedControl) app.component('SegmentedControl', window.SegmentedControl);
  if (window.RepoTagList) app.component('RepoTagList', window.RepoTagList);
  if (window.AppHeader) app.component('AppHeader', window.AppHeader);
  if (window.CommitList) app.component('CommitList', window.CommitList);
  if (window.KeyboardShortcutsModal) app.component('KeyboardShortcutsModal', window.KeyboardShortcutsModal);
  if (window.ReportEditor) app.component('ReportEditor', window.ReportEditor);
  if (window.ThemeCustomizerPopover) app.component('ThemeCustomizerPopover', window.ThemeCustomizerPopover);
  if (window.CommitDetailModal) app.component('CommitDetailModal', window.CommitDetailModal);
  if (window.SettingsModal) app.component('SettingsModal', window.SettingsModal);
  if (window.RepoActionModal) app.component('RepoActionModal', window.RepoActionModal);
  if (window.ToastContainer) app.component('ToastContainer', window.ToastContainer);
  if (window.StudioModal) app.component('StudioModal', window.StudioModal);
  if (window.LoadingOverlay) app.component('LoadingOverlay', window.LoadingOverlay);
  if (window.LanguageModal) app.component('LanguageModal', window.LanguageModal);

  app.mount('#app');
})(window);

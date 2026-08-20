/**
 * useRepos Composable
 * Multi-Repo state, custom alias management, persistence, drag-and-drop & directory parsing
 * Refactored: Decoupled with DBStorage service, O(N) Hash MergedCommits, Memory leak protection
 * Full i18n support
 */

(function (window) {
  const RECENT_REPOS_KEY = 'git_daily_report_recent_repos';
  const REPO_ALIASES_KEY = 'git_daily_report_repo_aliases';
  const SELECTED_REPOS_KEY = 'git_daily_report_selected_repo_names';

  function useRepos({ showToast, showLoading, hideLoading }) {
    const { ref, shallowReactive, computed, onUnmounted } = window.Vue;
    const DBStorage = window.DBStorage;
    const i18n = window.useI18n ? window.useI18n() : null;

    function t(key, params) {
      return i18n ? i18n.t(key, params) : key;
    }

    const recentRepos = ref([]);
    const selectedRepoNames = ref([]);
    const repoAliases = ref({});
    const isRefreshing = ref(false);
    const isDropzoneCollapsed = ref(false);
    const activeRepoMenu = ref(null);
    const allRepoMap = shallowReactive(new Map());
    const repoHandlesMap = new Map();

    let cleanupFocusListener = null;

    function toggleRepoMenu(repoName) {
      activeRepoMenu.value = activeRepoMenu.value === repoName ? null : repoName;
    }

    function closeRepoMenu() {
      activeRepoMenu.value = null;
    }

    function toggleDropzone() {
      isDropzoneCollapsed.value = !isDropzoneCollapsed.value;
    }

    // 1. Alias Helpers
    function loadAliases() {
      repoAliases.value = DBStorage.getItem(REPO_ALIASES_KEY, {});
    }

    function setRepoAlias(repoName, aliasStr) {
      if (!repoName) return;
      const updated = { ...repoAliases.value };
      if (aliasStr && aliasStr.trim()) {
        updated[repoName] = aliasStr.trim();
      } else {
        delete updated[repoName];
      }
      repoAliases.value = updated;
      DBStorage.setItem(REPO_ALIASES_KEY, updated);
    }

    function getRepoDisplayName(repoName) {
      if (!repoName) return 'LocalRepo';
      return (repoAliases.value && repoAliases.value[repoName]) || repoName;
    }

    function promptEditAlias(repoName) {
      closeRepoMenu();
      const currentAlias = getRepoDisplayName(repoName);
      const input = prompt(
        t('repoAction.promptAlias', { name: repoName }),
        currentAlias !== repoName ? currentAlias : ''
      );
      if (input !== null) {
        setRepoAlias(repoName, input);
        showToast(t('repoAction.aliasUpdatedToast', { name: repoName, alias: getRepoDisplayName(repoName) }));
      }
    }

    // 2. Recent Repos & Selection Persistence
    function loadRecentRepos() {
      recentRepos.value = DBStorage.getItem(RECENT_REPOS_KEY, []);
    }

    function saveRepoToRecent(repoName, commits) {
      if (!repoName || !commits || commits.length === 0) return;
      let recent = recentRepos.value.filter((r) => r.repoName !== repoName);
      recent.unshift({
        repoName,
        commits,
        savedAt: Date.now()
      });
      if (recent.length > 8) recent = recent.slice(0, 8);
      recentRepos.value = recent;
      DBStorage.setItem(RECENT_REPOS_KEY, recent);
    }

    function loadSavedSelectedNames() {
      return DBStorage.getItem(SELECTED_REPOS_KEY, null);
    }

    function saveSelectedNames() {
      DBStorage.setItem(SELECTED_REPOS_KEY, selectedRepoNames.value);
    }

    function removeRepo(repoName) {
      if (!repoName) return;
      closeRepoMenu();
      const displayName = getRepoDisplayName(repoName);

      // 1. 从最近仓库列表移除并持久化
      recentRepos.value = recentRepos.value.filter((r) => r.repoName !== repoName);
      DBStorage.setItem(RECENT_REPOS_KEY, recentRepos.value);

      // 2. 从当前选中列表中移除并持久化
      if (selectedRepoNames.value.includes(repoName)) {
        selectedRepoNames.value = selectedRepoNames.value.filter((name) => name !== repoName);
        saveSelectedNames();
      }

      // 3. 清理自定义别名
      if (repoAliases.value[repoName]) {
        const updatedAliases = { ...repoAliases.value };
        delete updatedAliases[repoName];
        repoAliases.value = updatedAliases;
        DBStorage.setItem(REPO_ALIASES_KEY, updatedAliases);
      }

      // 4. 清理内存缓存与 IndexedDB 句柄
      allRepoMap.delete(repoName);
      repoHandlesMap.delete(repoName);
      DBStorage.deleteHandle(repoName);

      showToast(t('repoAction.removedToast', { name: displayName }));
    }

    async function initRepoState() {
      loadAliases();
      loadRecentRepos();

      if (recentRepos.value.length > 0) {
        recentRepos.value.forEach((r) => {
          const tagged = r.commits.map((c) => ({ ...c, repoName: r.repoName }));
          allRepoMap.set(r.repoName, tagged);
        });

        const savedSelected = loadSavedSelectedNames();
        if (savedSelected !== null && Array.isArray(savedSelected)) {
          selectedRepoNames.value = savedSelected.filter((name) => allRepoMap.has(name));
        } else {
          selectedRepoNames.value = recentRepos.value.map((r) => r.repoName);
        }

        for (const r of recentRepos.value) {
          const handle = await DBStorage.getHandle(r.repoName);
          if (handle) {
            repoHandlesMap.set(r.repoName, handle);
          }
        }
      }

      setupWindowFocusAutoRefresh();
    }

    // 3. Selection Actions
    function toggleRepoSelection(repoName) {
      const idx = selectedRepoNames.value.indexOf(repoName);
      if (idx > -1) {
        selectedRepoNames.value = selectedRepoNames.value.filter((name) => name !== repoName);
      } else {
        selectedRepoNames.value = [...selectedRepoNames.value, repoName];
      }

      saveSelectedNames();
    }

    function toggleSelectAllRepos() {
      if (selectedRepoNames.value.length === recentRepos.value.length) {
        selectedRepoNames.value = [];
      } else {
        selectedRepoNames.value = recentRepos.value.map((r) => r.repoName);
      }
      saveSelectedNames();
    }

    // 4. Merged Commits Pool with O(N) Hash Deduplication
    const mergedCommits = computed(() => {
      const selected = selectedRepoNames.value;
      if (!selected || selected.length === 0) return [];

      if (selected.length === 1) {
        const singleList = allRepoMap.get(selected[0]);
        return singleList ? [...singleList] : [];
      }

      const commitMap = new Map();
      for (const name of selected) {
        const list = allRepoMap.get(name);
        if (list && list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            const c = list[i];
            const key = `${c.hash}-${c.message}`;
            if (!commitMap.has(key)) {
              commitMap.set(key, c);
            }
          }
        }
      }

      const result = Array.from(commitMap.values());
      result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      return result;
    });

    const isMultiRepoMode = computed(() => selectedRepoNames.value.length > 1);

    const currentRepoBadgeText = computed(() => {
      if (selectedRepoNames.value.length === 0) return t('repo.emptyRepo');
      if (selectedRepoNames.value.length === 1) return getRepoDisplayName(selectedRepoNames.value[0]);
      return t('repo.activeRepoBadge', { count: selectedRepoNames.value.length });
    });

    function importCommits(commits, repoName) {
      const targetRepo = repoName || 'LocalRepo';
      const tagged = commits.map((c) => ({ ...c, repoName: targetRepo }));

      allRepoMap.set(targetRepo, tagged);
      if (!selectedRepoNames.value.includes(targetRepo)) {
        selectedRepoNames.value = [...selectedRepoNames.value, targetRepo];
      }
      saveSelectedNames();
      saveRepoToRecent(targetRepo, commits);
    }

    // 5. Refresh Logic via FileSystemDirectoryHandle
    async function refreshRepoByHandle(repoName, isSilent = false) {
      let handle = repoHandlesMap.get(repoName);
      if (!handle) {
        handle = await DBStorage.getHandle(repoName);
        if (handle) repoHandlesMap.set(repoName, handle);
      }

      if (!handle) {
        return false;
      }

      try {
        let perm = await handle.queryPermission({ mode: 'read' });
        if (perm !== 'granted') {
          if (isSilent) return false;
          perm = await handle.requestPermission({ mode: 'read' });
          if (perm !== 'granted') {
            return false;
          }
        }

        if (!isSilent) isRefreshing.value = true;
        const result = await window.GitParser.parseFromDirectoryHandle(handle);
        if (result && result.commits && result.commits.length > 0) {
          const oldCommits = allRepoMap.get(repoName) || [];
          const oldTopHash = oldCommits.length > 0 ? oldCommits[0].hash : '';
          const newTopHash = result.commits.length > 0 ? result.commits[0].hash : '';
          const oldCount = oldCommits.length;
          const newCount = result.commits.length;

          importCommits(result.commits, repoName);

          if (oldTopHash !== newTopHash || oldCount !== newCount) {
            showToast(t('repoAction.refreshedToast', { name: getRepoDisplayName(repoName) }));
          }
          return true;
        }
      } catch (err) {
        console.warn(`[Refresh] 刷新项目「${repoName}」失败:`, err);
      } finally {
        if (!isSilent) isRefreshing.value = false;
      }
      return false;
    }

    async function refreshSelectedRepos(isSilent = false) {
      if (selectedRepoNames.value.length === 0) {
        return;
      }
      if (!isSilent) isRefreshing.value = true;
      try {
        for (const name of selectedRepoNames.value) {
          await refreshRepoByHandle(name, isSilent);
        }
      } finally {
        isRefreshing.value = false;
      }
    }

    // 6. Window Focus Auto-Sync Listener
    let lastFocusCheckTime = 0;
    function setupWindowFocusAutoRefresh() {
      if (cleanupFocusListener) return;

      const onFocusHandler = async () => {
        const now = Date.now();
        if (now - lastFocusCheckTime < 3000) return;
        lastFocusCheckTime = now;

        if (selectedRepoNames.value.length > 0) {
          for (const name of selectedRepoNames.value) {
            await refreshRepoByHandle(name, true);
          }
        }
      };

      window.addEventListener('focus', onFocusHandler);
      cleanupFocusListener = () => {
        window.removeEventListener('focus', onFocusHandler);
      };
    }

    if (typeof onUnmounted === 'function') {
      onUnmounted(() => {
        if (cleanupFocusListener) {
          cleanupFocusListener();
          cleanupFocusListener = null;
        }
      });
    }

    // 7. File & Directory Drop / Selection Handlers
    async function handleFolderSelect() {
      if ('showDirectoryPicker' in window) {
        try {
          const dirHandle = await window.showDirectoryPicker();
          showLoading();
          await new Promise((r) => setTimeout(r, 40));

          const result = await window.GitParser.parseFromDirectoryHandle(dirHandle);
          hideLoading();

          if (result.commits && result.commits.length > 0) {
            await DBStorage.saveHandle(result.repoName, dirHandle);
            repoHandlesMap.set(result.repoName, dirHandle);
            importCommits(result.commits, result.repoName);
            showToast(t('toast.repoParsed', { name: getRepoDisplayName(result.repoName), count: result.commits.length }));
            return true;
          }
        } catch (err) {
          hideLoading();
          if (err.name === 'AbortError') return true;
        }
      }
      return false;
    }

    async function scanFileEntries(entry) {
      if (!entry) return [];
      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file(
            (f) => {
              f.customPath = entry.fullPath || '/' + f.name;
              resolve([f]);
            },
            () => resolve([])
          );
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const results = [];
        const readBatch = () => {
          return new Promise((resolve) => {
            dirReader.readEntries(
              async (entries) => {
                if (!entries || entries.length === 0) {
                  resolve(results);
                } else {
                  for (const subEntry of entries) {
                    const subFiles = await scanFileEntries(subEntry);
                    results.push(...subFiles);
                  }
                  await readBatch();
                  resolve(results);
                }
              },
              () => resolve(results)
            );
          });
        };
        return await readBatch();
      }
      return [];
    }

    async function handleDropFiles(dataTransfer) {
      showLoading();
      await new Promise((r) => setTimeout(r, 40));

      try {
        const items = dataTransfer.items;
        let allScannedFiles = [];
        let detectedRepoName = '';

        if (items && items.length > 0) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
              const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
              if (entry) {
                if (entry.isDirectory && !detectedRepoName) {
                  detectedRepoName = entry.name === '.git' ? 'LocalRepo' : entry.name;
                }
                const scanned = await scanFileEntries(entry);
                allScannedFiles.push(...scanned);
              }
            }
          }
        }

        if (allScannedFiles.length === 0 && dataTransfer.files && dataTransfer.files.length > 0) {
          allScannedFiles = Array.from(dataTransfer.files);
        }

        if (allScannedFiles.length > 0) {
          const headFiles = allScannedFiles.filter((f) => {
            const p = (f.customPath || f.webkitRelativePath || f.name).replace(/\\/g, '/');
            return p.endsWith('/logs/HEAD') || p === 'HEAD' || p.endsWith('/HEAD');
          });

          const refFiles = allScannedFiles.filter((f) => {
            const p = (f.customPath || f.webkitRelativePath || f.name).replace(/\\/g, '/');
            return p.includes('/logs/refs/');
          });

          const textFiles = allScannedFiles.filter((f) => {
            const name = f.name.toLowerCase();
            return name.endsWith('.txt') || name.endsWith('.log') || name === 'gitlog';
          });

          const candidates = [...headFiles, ...refFiles, ...textFiles];
          if (candidates.length === 0) {
            candidates.push(...allScannedFiles.filter((f) => f.size > 0 && f.size < 5 * 1024 * 1024));
          }

          let combinedLogText = '';
          for (const file of candidates) {
            try {
              const text = await file.text();
              const p = (file.customPath || file.webkitRelativePath || file.name).replace(/\\/g, '/');
              if (text && text.trim()) {
                combinedLogText += text + '\n';
                if (!detectedRepoName) {
                  const segments = p.split('/').filter(Boolean);
                  if (segments.length > 1 && segments[0] !== '.git') {
                    detectedRepoName = segments[0];
                  } else if (file.name !== 'HEAD' && !file.name.includes('.')) {
                    detectedRepoName = file.name;
                  }
                }
              }
            } catch (e) { }
          }

          if (combinedLogText.trim()) {
            const commits = window.GitParser.parseTextLog(combinedLogText);
            hideLoading();
            if (commits && commits.length > 0) {
              const finalRepoName = detectedRepoName || 'LocalRepo';
              importCommits(commits, finalRepoName);
              showToast(t('toast.repoParsed', { name: getRepoDisplayName(finalRepoName), count: commits.length }));
              return;
            }
          }
        }
      } catch (err) {
        console.error('❌ 拖拽解析发生异常:', err);
      } finally {
        hideLoading();
      }
    }

    async function handleFileInputChange(files) {
      if (!files || files.length === 0) return;

      showLoading();
      await new Promise((r) => setTimeout(r, 40));

      try {
        let combinedLogText = '';
        let repoName = 'LocalRepo';
        const fileList = Array.from(files);

        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          const relPath = (file.webkitRelativePath || file.name).replace(/\\/g, '/');

          if (
            relPath.includes('logs/HEAD') ||
            relPath.includes('logs/refs/') ||
            file.name === 'HEAD' ||
            file.name.endsWith('.log') ||
            file.name.endsWith('.txt')
          ) {
            const text = await file.text();
            if (text && text.trim()) {
              combinedLogText += text + '\n';
              if (relPath.includes('/')) {
                const segs = relPath.split('/').filter(Boolean);
                if (segs.length > 0 && segs[0] !== '.git') repoName = segs[0];
              }
            }
          }
        }

        if (!combinedLogText.trim()) {
          for (let i = 0; i < Math.min(fileList.length, 10); i++) {
            const file = fileList[i];
            if (file.size > 0 && file.size < 2 * 1024 * 1024) {
              const text = await file.text();
              if (text && (text.includes('commit ') || text.match(/^[a-f0-9]{40}\s+[a-f0-9]{40}/m))) {
                combinedLogText += text + '\n';
              }
            }
          }
        }

        if (combinedLogText.trim()) {
          const commits = window.GitParser.parseTextLog(combinedLogText);
          hideLoading();
          if (commits && commits.length > 0) {
            importCommits(commits, repoName);
            showToast(t('toast.repoParsed', { name: getRepoDisplayName(repoName), count: commits.length }));
            return;
          }
        }
      } catch (err) {
        console.error('❌ 文件提取过程发生异常:', err);
      } finally {
        hideLoading();
      }
    }

    return {
      recentRepos,
      selectedRepoNames,
      repoAliases,
      isRefreshing,
      isDropzoneCollapsed,
      toggleDropzone,
      mergedCommits,
      isMultiRepoMode,
      currentRepoBadgeText,
      getRepoDisplayName,
      promptEditAlias,
      removeRepo,
      activeRepoMenu,
      toggleRepoMenu,
      closeRepoMenu,
      toggleRepoSelection,
      toggleSelectAllRepos,
      initRepoState,
      importCommits,
      refreshRepoByHandle,
      refreshSelectedRepos,
      handleFolderSelect,
      handleDropFiles,
      handleFileInputChange
    };
  }

  window.useRepos = useRepos;
})(window);

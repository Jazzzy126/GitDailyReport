/**
 * useRepos Composable
 * Multi-Repo state, custom alias management, persistence, drag-and-drop & directory parsing
 * Refactored: Decoupled with DBStorage service, O(N) Hash MergedCommits, Memory leak protection
 */

(function (window) {
  const RECENT_REPOS_KEY = 'git_daily_report_recent_repos';
  const REPO_ALIASES_KEY = 'git_daily_report_repo_aliases';
  const SELECTED_REPOS_KEY = 'git_daily_report_selected_repo_names';

  function useRepos({ showToast, showLoading, hideLoading }) {
    const { ref, shallowReactive, computed, onUnmounted } = window.Vue;
    const DBStorage = window.DBStorage;

    const recentRepos = ref([]);
    const selectedRepoNames = ref([]);
    const repoAliases = ref({});
    const isRefreshing = ref(false);
    const isDropzoneCollapsed = ref(false);
    const activeRepoMenu = ref(null);
    const allRepoMap = shallowReactive(new Map()); // repoName -> commits array (shallow to reduce deep proxy overhead)
    const repoHandlesMap = new Map(); // repoName -> FileSystemDirectoryHandle (in-memory)

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
        `请输入项目「${repoName}」的自定义别名（例如: 前端UI / 后端API）:`,
        currentAlias !== repoName ? currentAlias : ''
      );
      if (input !== null) {
        setRepoAlias(repoName, input);
        showToast(`✨ 项目「${repoName}」别名已设置为「${getRepoDisplayName(repoName)}」`);
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

      showToast(`🗑️ 已移除项目「${displayName}」`);
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

        // Preload directory handles from IndexedDB
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

      const count = selectedRepoNames.value.length;
      if (count === 0) {
        showToast('已清空勾选的项目');
      } else if (count === 1) {
        showToast(`🔀 已切换至项目「${getRepoDisplayName(selectedRepoNames.value[0])}」`);
      } else {
        showToast(`🔀 已成功合并 ${count} 个项目的提交记录！`);
      }
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

      // Fast single-repo path
      if (selected.length === 1) {
        const singleList = allRepoMap.get(selected[0]);
        return singleList ? [...singleList] : [];
      }

      // Multi-repo path: O(N) deduplication via Map
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
      if (selectedRepoNames.value.length === 0) return '未选择仓库';
      if (selectedRepoNames.value.length === 1) return getRepoDisplayName(selectedRepoNames.value[0]);
      return `已合并 ${selectedRepoNames.value.length} 个项目`;
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
        if (!isSilent) {
          showToast(
            `💡 项目「${getRepoDisplayName(repoName)}」未建立直接句柄绑定，可点击上传框重新选取一次以激活一键刷新`,
            'info'
          );
        }
        return false;
      }

      try {
        let perm = await handle.queryPermission({ mode: 'read' });
        if (perm !== 'granted') {
          if (isSilent) return false;
          perm = await handle.requestPermission({ mode: 'read' });
          if (perm !== 'granted') {
            showToast(`⚠️ 未授予「${getRepoDisplayName(repoName)}」目录读取权限`, 'warning');
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
            showToast(`🔄 已重新读取并同步「${getRepoDisplayName(repoName)}」最新提交日志`);
          } else if (!isSilent) {
            showToast(`✅ 已拉取最新 Git 日志，「${getRepoDisplayName(repoName)}」已是最新状态`);
          }
          return true;
        }
      } catch (err) {
        console.warn(`[Refresh] 刷新项目「${repoName}」失败:`, err);
        if (!isSilent) {
          showToast(`⚠️ 刷新「${getRepoDisplayName(repoName)}」失败: ${err.message || '读取异常'}`);
        }
      } finally {
        if (!isSilent) isRefreshing.value = false;
      }
      return false;
    }

    async function refreshSelectedRepos(isSilent = false) {
      if (selectedRepoNames.value.length === 0) {
        if (!isSilent) showToast('💡 请先在列表中勾选要刷新的项目');
        return;
      }
      if (!isSilent) isRefreshing.value = true;
      let refreshedCount = 0;
      try {
        for (const name of selectedRepoNames.value) {
          const success = await refreshRepoByHandle(name, isSilent);
          if (success) refreshedCount++;
        }
        if (!isSilent && refreshedCount === 0) {
          showToast('💡 提示：点击项目卡片选取目录后即可永久享受一键极速刷新', 'info');
        }
      } finally {
        isRefreshing.value = false;
      }
    }

    // 6. Window Focus Auto-Sync Listener (切回窗口静默自动感知，带防抖与清理)
    let lastFocusCheckTime = 0;
    function setupWindowFocusAutoRefresh() {
      if (cleanupFocusListener) return;

      const onFocusHandler = async () => {
        const now = Date.now();
        if (now - lastFocusCheckTime < 3000) return;
        lastFocusCheckTime = now;

        if (selectedRepoNames.value.length > 0) {
          console.log('👀 [Auto-Sync] 窗口获得焦点，正在静默检查 Git 仓库更新…');
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
          showLoading('⏳ 正在读取并解析 .git/logs 文件…');
          await new Promise((r) => setTimeout(r, 40));

          const result = await window.GitParser.parseFromDirectoryHandle(dirHandle);
          hideLoading();

          if (result.commits && result.commits.length > 0) {
            await DBStorage.saveHandle(result.repoName, dirHandle);
            repoHandlesMap.set(result.repoName, dirHandle);
            importCommits(result.commits, result.repoName);
            showToast(
              `✅ 成功导入「${getRepoDisplayName(result.repoName)}」 ${result.commits.length} 条记录 (已开启自动同步)`
            );
            return true;
          }
        } catch (err) {
          hideLoading();
          if (err.name === 'AbortError') return true;
        }
      }
      return false;
    }

    // Helper: Recursively scan FileSystemEntry (supports hidden .git directory reading)
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
      showLoading('⏳ 正在解析 Git 仓库与提交记录…');
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
              showToast(`✅ 成功解析「${getRepoDisplayName(finalRepoName)}」 ${commits.length} 条 Commit 记录`);
              return;
            }
          }
        }
      } catch (err) {
        console.error('❌ 拖拽解析发生异常:', err);
      } finally {
        hideLoading();
      }

      showToast('💡 提示：请拖入包含 .git 的项目文件夹、.git 目录或导出的 git log 文本文件！', 'warning');
    }

    async function handleFileInputChange(files) {
      if (!files || files.length === 0) return;

      showLoading('⏳ 正在提取项目日志并构建提交序列…');
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
            showToast(`✅ 成功提取「${getRepoDisplayName(repoName)}」 ${commits.length} 条 Commit 记录`);
            return;
          }
        }
      } catch (err) {
        console.error('❌ 文件提取过程发生异常:', err);
      } finally {
        hideLoading();
      }

      showToast('💡 提示：浏览器选择文件夹可能过滤隐藏的 .git 目录。建议直接将项目文件夹拖拽到页面中！', 'warning');
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

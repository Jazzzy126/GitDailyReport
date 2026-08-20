/**
 * useCommits Composable
 * Commits filtering by author & date, commit inspector modal management
 * Optimized for performance and clean memoization
 */

(function (window) {
  function getLocalDateString(dateObj = new Date()) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function useCommits({ mergedCommits, showToast }) {
    const { ref, computed } = window.Vue;

    const filterDate = ref(getLocalDateString());
    const filterAuthor = ref('all');
    const activeDetailCommit = ref(null);
    const isDetailModalOpen = ref(false);

    // O(N) single-pass author extraction
    const authorsList = computed(() => {
      const list = mergedCommits.value;
      if (!list || list.length === 0) return [];
      const set = new Set();
      for (let i = 0; i < list.length; i++) {
        if (list[i].author) set.add(list[i].author);
      }
      return Array.from(set);
    });

    const hasMultipleAuthors = computed(() => authorsList.value.length > 1);
    const singleAuthorName = computed(() => (authorsList.value.length === 1 ? authorsList.value[0] : ''));

    // Dynamic Author Options from mergedCommits
    const authorOptions = computed(() => {
      const authors = authorsList.value;
      const options = [{ value: 'all', label: '所有提交人' }];
      for (let i = 0; i < authors.length; i++) {
        options.push({ value: authors[i], label: authors[i] });
      }
      return options;
    });

    // High-performance Filtered Commits
    const filteredCommits = computed(() => {
      const list = mergedCommits.value;
      if (!list || list.length === 0) return [];

      const targetDate = filterDate.value ? filterDate.value.trim() : '';
      const targetAuthor = filterAuthor.value;

      // Fast path: no filtering
      if (!targetDate && targetAuthor === 'all') {
        return list;
      }

      const result = [];
      for (let i = 0; i < list.length; i++) {
        const c = list[i];
        if (targetAuthor !== 'all' && c.author !== targetAuthor) continue;
        if (targetDate && c.date !== targetDate) continue;
        result.push(c);
      }
      return result;
    });

    // Commit Detail Inspector Actions
    function openCommitDetail(commit) {
      activeDetailCommit.value = commit;
      isDetailModalOpen.value = true;
    }

    function closeCommitDetail() {
      isDetailModalOpen.value = false;
      activeDetailCommit.value = null;
    }

    // Quick Date Preset Helpers
    const activeDatePreset = computed(() => {
      const today = getLocalDateString();
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yesterday = getLocalDateString(d);
      if (!filterDate.value) return 'all';
      if (filterDate.value === today) return 'today';
      if (filterDate.value === yesterday) return 'yesterday';
      return 'custom';
    });

    function setDatePreset(preset) {
      if (preset === 'today') {
        filterDate.value = getLocalDateString();
      } else if (preset === 'yesterday') {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        filterDate.value = getLocalDateString(d);
      } else if (preset === 'all') {
        filterDate.value = '';
      }
    }

    function copyFullSha() {
      if (!activeDetailCommit.value) return;
      const sha = activeDetailCommit.value.fullHash || activeDetailCommit.value.hash;
      navigator.clipboard.writeText(sha);
      showToast('📋 已复制 40 位 Git SHA Checksum');
    }

    function copyCommitMsg() {
      if (!activeDetailCommit.value || !activeDetailCommit.value.message) return;
      navigator.clipboard.writeText(activeDetailCommit.value.message);
      showToast('📋 已复制 Commit 完整日志 Message');
    }

    return {
      filterDate,
      filterAuthor,
      authorOptions,
      authorsList,
      hasMultipleAuthors,
      singleAuthorName,
      filteredCommits,
      activeDetailCommit,
      isDetailModalOpen,
      activeDatePreset,
      setDatePreset,
      openCommitDetail,
      closeCommitDetail,
      copyFullSha,
      copyCommitMsg
    };
  }

  window.useCommits = useCommits;
})(window);

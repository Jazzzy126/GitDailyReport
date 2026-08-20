/**
 * useCommits Composable
 * Commits filtering by author & date, commit inspector modal management
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

    const authorsList = computed(() => {
      return Array.from(new Set((mergedCommits.value || []).map(c => c.author))).filter(Boolean);
    });

    const hasMultipleAuthors = computed(() => authorsList.value.length > 1);
    const singleAuthorName = computed(() => (authorsList.value.length === 1 ? authorsList.value[0] : ''));

    // Dynamic Author Options from mergedCommits
    const authorOptions = computed(() => {
      return [
        { value: 'all', label: '所有提交人' },
        ...authorsList.value.map(a => ({ value: a, label: a }))
      ];
    });

    // Filtered Commits
    const filteredCommits = computed(() => {
      const d = filterDate.value;
      const a = filterAuthor.value;

      return (mergedCommits.value || []).filter(c => {
        // Author check
        if (a !== 'all' && c.author !== a) return false;

        // Date check
        if (d && d.trim()) {
          if (c.date !== d.trim()) return false;
        }

        return true;
      });
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
      openCommitDetail,
      closeCommitDetail,
      copyFullSha,
      copyCommitMsg
    };
  }

  window.useCommits = useCommits;
})(window);

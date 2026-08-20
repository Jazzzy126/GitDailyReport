/**
 * useReport Composable
 * Report Generation (AI-driven & Rule-based fallback), Word Count & Clipboard Actions
 * Integrated with Typewriter Streaming Effect & Confetti Celebration
 */

(function (window) {
  function useReport({
    filteredCommits,
    filterDate,
    selectedRepoNames,
    getRepoDisplayName,
    openSettingsModal,
    showLoading,
    hideLoading,
    showToast,
    motion
  }) {
    const { ref, computed } = window.Vue;

    const reportOutput = ref('');
    const isTyping = ref(false);

    const wordCount = computed(() => {
      return (reportOutput.value || '').trim().length;
    });

    function stripMarkdownToPlain(mdText) {
      if (!mdText) return '';

      // 优先使用 marked.lexer 工业级 AST 解析提取纯文本
      if (window.marked && typeof window.marked.lexer === 'function') {
        try {
          const tokens = window.marked.lexer(mdText);
          const extractText = (tokenList) => {
            let result = '';
            for (const token of tokenList) {
              switch (token.type) {
                case 'heading':
                  result += `${extractText(token.tokens || [{ text: token.text }])}\n\n`;
                  break;
                case 'paragraph':
                  result += `${extractText(token.tokens || [{ text: token.text }])}\n\n`;
                  break;
                case 'list':
                  token.items.forEach((item, index) => {
                    const prefix = token.ordered ? `${index + 1}. ` : '• ';
                    result += `${prefix}${extractText(item.tokens || [{ text: item.text }]).trim()}\n`;
                  });
                  result += '\n';
                  break;
                case 'list_item':
                  result += `${extractText(token.tokens || [{ text: token.text }])}\n`;
                  break;
                case 'blockquote':
                  result += `${extractText(token.tokens || [{ text: token.text }])}\n`;
                  break;
                case 'code':
                  result += `${token.text}\n\n`;
                  break;
                case 'codespan':
                case 'text':
                case 'escape':
                  result += token.text || '';
                  break;
                case 'strong':
                case 'em':
                case 'del':
                case 'link':
                  result += extractText(token.tokens || [{ text: token.text }]);
                  break;
                case 'image':
                  result += token.text ? `[图片: ${token.text}]` : '';
                  break;
                case 'space':
                case 'hr':
                  result += '\n';
                  break;
                default:
                  if (token.tokens) {
                    result += extractText(token.tokens);
                  } else if (token.text) {
                    result += token.text;
                  }
                  break;
              }
            }
            return result;
          };

          const text = extractText(tokens).replace(/\n{3,}/g, '\n\n').trim();
          if (text) return text;
        } catch (e) {
          console.warn('[useReport] marked lexer 解析异常，使用降级逻辑', e);
        }
      }

      // 降级正则兜底
      return mdText
        .replace(/^#+\s+(.*$)/gm, '$1\n')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/^-\s+/gm, '• ')
        .replace(/```[\s\S]*?```/g, '')
        .trim();
    }

    function generateStandardReport(commits) {
      if (!commits || commits.length === 0) return '无提交记录';

      const reportDate = filterDate.value || new Date().toISOString().split('T')[0];
      let output = `# 工作日报 (${reportDate})\n\n`;

      const aiConfig = window.AIService ? window.AIService.getConfig() : { itemCount: '2-3' };
      let maxItems = 3;
      if (aiConfig.itemCount === '3-5') maxItems = 5;
      else if (aiConfig.itemCount === '5-8') maxItems = 8;
      else if (aiConfig.itemCount === 'auto') {
        if (commits.length >= 12) maxItems = 7;
        else if (commits.length >= 6) maxItems = 5;
        else if (commits.length >= 3) maxItems = 4;
        else maxItems = commits.length;
      }

      const validCommits = commits.filter(c => {
        const msg = (c.message || '').toLowerCase();
        if (
          msg.includes('merge') ||
          msg.includes('deps') ||
          msg.includes('chore') ||
          msg.includes('wip') ||
          msg.includes('bump') ||
          msg.includes('提交配置') ||
          msg.includes('更新依赖') ||
          msg.includes('合并分支')
        ) {
          return false;
        }
        return true;
      });

      const pool = validCommits.length > 0 ? validCommits : commits;
      const isMultiRepo = selectedRepoNames.value.length > 1;

      if (pool.length <= maxItems) {
        pool.forEach((c, idx) => {
          const cleanMsg = c.message.replace(/^.*?:\s*/, '').slice(0, 18);
          const repoPrefix = isMultiRepo && c.repoName ? `【${getRepoDisplayName(c.repoName)}】` : '';
          output += `${idx + 1}. 完成${repoPrefix}${cleanMsg}\n`;
        });
        return output;
      }

      const featureCommits = pool.filter(c => c.type === 'feat' || (c.message && (c.message.toLowerCase().includes('feat') || c.message.includes('新增') || c.message.includes('支持'))));
      const fixCommits = pool.filter(c => c.type === 'fix' || (c.message && (c.message.toLowerCase().includes('fix') || c.message.includes('修复') || c.message.includes('优化'))));
      const otherCommits = pool.filter(c => !featureCommits.includes(c) && !fixCommits.includes(c));

      const bulletPoints = [];

      if (featureCommits.length > 0) {
        const repoTag = isMultiRepo && featureCommits[0].repoName ? `【${getRepoDisplayName(featureCommits[0].repoName)}】` : '';
        const msgs = featureCommits.map(c => c.message.replace(/^.*?:\s*/, '')).join('、');
        bulletPoints.push(`完成${repoTag}核心功能开发与交付（${msgs.slice(0, 12)}）`);
      }

      if (fixCommits.length > 0) {
        const repoTag = isMultiRepo && fixCommits[0].repoName ? `【${getRepoDisplayName(fixCommits[0].repoName)}】` : '';
        const msgs = fixCommits.map(c => c.message.replace(/^.*?:\s*/, '')).join('、');
        bulletPoints.push(`修复${repoTag}系统运行缺陷并提升稳定性（${msgs.slice(0, 12)}）`);
      }

      if (otherCommits.length > 0 || bulletPoints.length < maxItems) {
        const subPool = otherCommits.length > 0 ? otherCommits : pool;
        subPool.forEach(c => {
          if (bulletPoints.length < maxItems) {
            const repoTag = isMultiRepo && c.repoName ? `【${getRepoDisplayName(c.repoName)}】` : '';
            const cleanMsg = c.message.replace(/^.*?:\s*/, '').slice(0, 16);
            bulletPoints.push(`推进${repoTag}${cleanMsg}`);
          }
        });
      }

      const selectedPoints = bulletPoints.slice(0, maxItems);
      selectedPoints.forEach((point, idx) => {
        output += `${idx + 1}. ${point}\n`;
      });

      return output;
    }

    async function generateReport() {
      const commits = filteredCommits.value;
      if (!commits || commits.length === 0) {
        showToast('当前筛选条件下没有 Commit 提交记录', 'warning');
        return;
      }

      const aiConfig = window.AIService ? window.AIService.getConfig() : {};
      if (!aiConfig.apiKey || !aiConfig.apiKey.trim()) {
        showToast('💡 尚未配置 AI 大模型 API Key，已为您打开【AI设置】', 'warning');
        openSettingsModal('ai');
        return;
      }

      let loadingText = '✨ AI 正在为您精炼归纳 2-3 条日报…';
      if (aiConfig.itemCount === '3-5') {
        loadingText = '✨ AI 正在为您提炼 3-5 条日报…';
      } else if (aiConfig.itemCount === '5-8') {
        loadingText = '✨ AI 正在为您提炼 5-8 条日报…';
      } else if (aiConfig.itemCount === 'auto') {
        const targetStr = window.AIService.getAdaptiveTargetCountStr(commits.length);
        loadingText = `✨ AI 正在根据 ${commits.length} 条提交自适应归纳 ${targetStr} 条日报…`;
      }

      showLoading(loadingText);
      try {
        const commitsWithDisplayName = commits.map(c => ({
          ...c,
          repoName: getRepoDisplayName(c.repoName)
        }));

        const result = await window.AIService.generateReport(commitsWithDisplayName);
        hideLoading();

        // Typewriter streaming effect
        if (motion && motion.runTypewriter) {
          isTyping.value = true;
          reportOutput.value = '';
          motion.runTypewriter(
            true,
            result,
            (curr) => { reportOutput.value = curr; },
            () => {
              isTyping.value = false;
              showToast('🎉 AI 已为您生成精炼日报！');
            }
          );
        } else {
          reportOutput.value = result;
          showToast('🎉 AI 已为您生成精炼日报！');
        }
      } catch (err) {
        hideLoading();
        showToast(`❌ ${err.message}`, 'error');
        reportOutput.value = generateStandardReport(commits);
      }
    }

    function generateRichHtml(mdText) {
      if (!mdText) return '';
      let rawHtml = '';
      if (window.marked && typeof window.marked.parse === 'function') {
        rawHtml = window.marked.parse(mdText);
      } else {
        rawHtml = mdText.replace(/\n/g, '<br>');
      }

      // Inject refined inline styles for Feishu, DingTalk, WeChat, Outlook & Apple Mail
      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 14px; line-height: 1.75; color: #1f2328;">
          ${rawHtml}
        </div>
      `
        .replace(/<h1>/g, '<h1 style="font-size: 18px; font-weight: 800; color: #0066FF; margin: 14px 0 8px 0; border-bottom: 1px solid rgba(0, 102, 255, 0.15); padding-bottom: 4px;">')
        .replace(/<h2>/g, '<h2 style="font-size: 16px; font-weight: 700; color: #0066FF; margin: 12px 0 6px 0;">')
        .replace(/<h3>/g, '<h3 style="font-size: 15px; font-weight: 700; color: #0066FF; margin: 10px 0 4px 0;">')
        .replace(/<p>/g, '<p style="margin: 0 0 8px 0;">')
        .replace(/<ul>/g, '<ul style="margin: 0 0 10px 0; padding-left: 22px;">')
        .replace(/<ol>/g, '<ol style="margin: 0 0 10px 0; padding-left: 22px;">')
        .replace(/<li>/g, '<li style="margin-bottom: 5px;">')
        .replace(/<strong>/g, '<strong style="color: #0052CC; font-weight: 700;">')
        .replace(/<code>/g, '<code style="background-color: rgba(0, 102, 255, 0.08); color: #0066FF; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">');
    }

    async function copyHtml() {
      const text = reportOutput.value;
      if (!text || !text.trim()) {
        showToast('内容为空，请先点击【生成日报】', 'warning');
        return false;
      }

      const plainText = stripMarkdownToPlain(text);
      const richHtml = generateRichHtml(text);

      try {
        if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
          const htmlBlob = new Blob([richHtml], { type: 'text/html' });
          const textBlob = new Blob([plainText], { type: 'text/plain' });
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/html': htmlBlob,
              'text/plain': textBlob
            })
          ]);
          showToast('🎨 已复制富文本 (支持直接粘贴飞书/企微/钉钉)');
          return true;
        } else {
          await navigator.clipboard.writeText(plainText);
          showToast('📝 当前环境不支持富文本，已降级复制纯文本');
          return true;
        }
      } catch (err) {
        console.warn('[useReport] 富文本写入剪贴板异常，降级纯文本', err);
        await navigator.clipboard.writeText(plainText);
        showToast('📝 已降级复制纯文本');
        return true;
      }
    }

    function copyPlain() {
      const text = reportOutput.value;
      if (!text || !text.trim()) {
        showToast('内容为空，请先点击【生成日报】', 'warning');
        return;
      }
      const plainText = stripMarkdownToPlain(text);
      navigator.clipboard.writeText(plainText);
      showToast('📝 已复制纯文本 (已去除 Markdown 符号)');
    }

    function copyMd() {
      const text = reportOutput.value;
      if (!text || !text.trim()) {
        showToast('内容为空，请先点击【生成日报】', 'warning');
        return;
      }
      navigator.clipboard.writeText(text);
      showToast('📄 Markdown 已复制');
    }

    return {
      reportOutput,
      wordCount,
      isTyping,
      generateReport,
      copyPlain,
      copyMd,
      copyHtml,
      generateRichHtml
    };
  }

  window.useReport = useReport;
})(window);

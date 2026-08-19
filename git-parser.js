/**
 * Enhanced Git Log Parser Engine
 * Handles parsing, timezone correction, conventional commit categorization, ticket grouping, merge filtering, and regex matching.
 */

class GitParser {
  static CONVENTIONAL_TYPES = {
    feat: { label: '✨ 新功能 (Feature)', tagClass: 'badge-success', icon: '✨' },
    fix: { label: '🐛 缺陷修复 (Fix)', tagClass: 'badge-error', icon: '🐛' },
    refactor: { label: '♻️ 代码重构 (Refactor)', tagClass: 'badge-info', icon: '♻️' },
    docs: { label: '📝 文档变更 (Docs)', tagClass: 'badge-warning', icon: '📝' },
    style: { label: '💄 样式 UI (Style)', tagClass: 'badge-accent', icon: '💄' },
    perf: { label: '⚡ 性能优化 (Perf)', tagClass: 'badge-info', icon: '⚡' },
    test: { label: '🧪 测试相关 (Test)', tagClass: 'badge-ghost', icon: '🧪' },
    chore: { label: '🔧 构建/杂务 (Chore)', tagClass: 'badge-neutral', icon: '🔧' },
    ci: { label: '🚀 持续集成 (CI/CD)', tagClass: 'badge-neutral', icon: '🚀' }
  };

  /**
   * Helper: Format Date object to Local YYYY-MM-DD String
   */
  static getLocalDateString(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) return new Date().toISOString().split('T')[0];
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse raw git log text or reflog text into structured commits.
   */
  static parseTextLog(rawText) {
    if (!rawText || !rawText.trim()) return [];

    const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
    const commits = [];

    // 1. Try parsing as Git reflog format (.git/logs/HEAD)
    const reflogCommits = [];
    lines.forEach(line => {
      const parsed = this.parseGitLogHeadLine(line);
      if (parsed) reflogCommits.push(parsed);
    });

    if (reflogCommits.length > 0) {
      console.log(`🔍 [GitParser] 匹配到 Reflog 格式 (.git/logs/HEAD)，成功提取 ${reflogCommits.length} 条记录`);
      return this.deduplicateCommits(reflogCommits.reverse());
    }

    // 2. Check pipe-separated format: hash|author|date|message
    const isPipeFormatted = lines.some(l => l.split('|').length >= 4);

    if (isPipeFormatted) {
      console.log('🔍 [GitParser] 匹配到管道格式 (hash|author|date|message)');
      lines.forEach(line => {
        const parts = line.split('|');
        if (parts.length >= 4) {
          const hash = parts[0].trim().substring(0, 7);
          const author = parts[1].trim();
          const dateStr = parts[2].trim();
          const message = parts.slice(3).join('|').trim();
          const parsed = this.parseCommitMessage(hash, author, dateStr, message);
          if (parsed) commits.push(parsed);
        }
      });
      return this.deduplicateCommits(commits);
    }

    // 3. Standard git log format (commit [sha] ... Author: ... Date: ...)
    if (rawText.includes('commit ')) {
      console.log('🔍 [GitParser] 匹配到标准 Git Log 多行格式 (commit <hash>)');
      const commitBlocks = rawText.split(/(?=^commit [a-f0-9]{40})/m);
      commitBlocks.forEach(block => {
        const hashMatch = block.match(/^commit ([a-f0-9]{7,40})/m);
        const authorMatch = block.match(/^Author:\s*(.*?)(?:\s*<(.*?)>)?$/m);
        const dateMatch = block.match(/^Date:\s*(.*?)$/m);

        if (hashMatch) {
          const fullSha = hashMatch[1];
          const hash = fullSha.substring(0, 7);
          const author = authorMatch ? authorMatch[1].trim() : 'Unknown';
          const email = authorMatch && authorMatch[2] ? authorMatch[2].trim() : '';
          const rawDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

          const messageLines = block
            .split('\n')
            .filter(l => l.startsWith('    '))
            .map(l => l.trim());

          const message = messageLines.join(' ');
          if (message) {
            const parsed = this.parseCommitMessage(hash, author, rawDate, message);
            if (parsed) {
              parsed.fullHash = fullSha;
              parsed.email = email;
              parsed.rawLine = block.trim().slice(0, 200);
              commits.push(parsed);
            }
          }
        }
      });
      return this.deduplicateCommits(commits);
    }

    // Line by line fallback
    lines.forEach(line => {
      const cleaned = line.replace(/^[*\s-•]+/, '').trim();
      if (!cleaned) return;
      const parsed = this.parseCommitMessage('local', 'Current User', new Date().toISOString(), cleaned);
      if (parsed) commits.push(parsed);
    });

    return this.deduplicateCommits(commits);
  }

  /**
   * Parse .git/logs/HEAD reflog line (Complete Metadata Extraction)
   */
  static parseGitLogHeadLine(line) {
    if (!line || !line.trim()) return null;
    const tabSplit = line.split('\t');
    if (tabSplit.length < 2) return null;

    const metaStr = tabSplit[0].trim();
    const actionWithMessage = tabSplit[1].trim();

    // Regex for Git reflog header: <old-sha> <new-sha> <committer-name> <<email>> <timestamp> <tz>
    const metaRegex = /^([a-f0-9]{40})\s+([a-f0-9]{40})\s+(.*?)\s*<(.*?)>\s+(\d+)\s+([+-]\d{4})$/i;
    const match = metaStr.match(metaRegex);

    if (match) {
      const prevSha = match[1];
      const newSha = match[2];
      const shortSha = newSha.substring(0, 7);
      const author = match[3] || 'Git User';
      const email = match[4] || '';
      const timestampSec = parseInt(match[5], 10);
      const tz = match[6] || '';
      const dateObj = !isNaN(timestampSec) ? new Date(timestampSec * 1000) : new Date();

      const actionMatch = actionWithMessage.match(/^(commit(?:\s+\([^)]+\))?|rebase|checkout|merge|reset):\s*(.*)$/i);
      let actionType = actionMatch ? actionMatch[1] : 'commit';
      let message = actionMatch ? actionMatch[2] : actionWithMessage;

      if (actionWithMessage.startsWith('checkout: moving from') || actionWithMessage.startsWith('reset: moving to')) {
        return null;
      }

      const commit = this.parseCommitMessage(shortSha, author, dateObj, message);
      if (commit) {
        commit.fullHash = newSha;
        commit.prevHash = prevSha;
        commit.email = email;
        commit.timestamp = timestampSec;
        commit.timezone = tz;
        commit.time = dateObj.toTimeString().split(' ')[0];
        commit.action = actionType;
        commit.rawLine = line;
      }
      return commit;
    }

    return null;
  }

  /**
   * Commit Details Parser
   */
  static parseCommitMessage(hash, author, rawDate, fullMessage) {
    if (!fullMessage || fullMessage.trim().length === 0) return null;

    let dateObj = new Date();
    if (rawDate instanceof Date) {
      dateObj = rawDate;
    } else {
      try {
        const parsedD = new Date(rawDate);
        if (!isNaN(parsedD.getTime())) {
          dateObj = parsedD;
        }
      } catch (e) {}
    }

    const formattedDate = this.getLocalDateString(dateObj);
    const timeStr = dateObj.toTimeString().split(' ')[0] || '00:00:00';
    const isMerge = /^merge\s/i.test(fullMessage) || /merge branch/i.test(fullMessage) || /merge pull request/i.test(fullMessage);

    const convRegex = /^([a-zA-Z]+)(?:\((.*?)\))?:\s*(.*)$/;
    const match = fullMessage.match(convRegex);

    let typeKey = 'feat';
    let scope = '';
    let cleanMessage = fullMessage;

    if (match) {
      const rawType = match[1].toLowerCase();
      if (this.CONVENTIONAL_TYPES[rawType]) {
        typeKey = rawType;
      } else if (rawType === 'fixup' || rawType === 'bugfix') {
        typeKey = 'fix';
      } else {
        typeKey = 'feat';
      }
      scope = match[2] || '';
      cleanMessage = match[3] || fullMessage;
    } else {
      const lower = fullMessage.toLowerCase();
      if (lower.startsWith('fix') || lower.includes('bug') || lower.includes('修复')) {
        typeKey = 'fix';
      } else if (lower.startsWith('docs') || lower.includes('readme') || lower.includes('文档')) {
        typeKey = 'docs';
      } else if (lower.startsWith('refactor') || lower.includes('重构') || lower.includes('优化结构')) {
        typeKey = 'refactor';
      } else if (lower.startsWith('style') || lower.includes('ui') || lower.includes('样式')) {
        typeKey = 'style';
      } else if (lower.startsWith('perf') || lower.includes('性能')) {
        typeKey = 'perf';
      } else if (lower.startsWith('test') || lower.includes('测试')) {
        typeKey = 'test';
      } else if (isMerge) {
        typeKey = 'chore';
      }
    }

    const issueMatch = fullMessage.match(/(?:#\d+|[A-Z]{2,}-\d+)/g);
    const issues = issueMatch ? Array.from(new Set(issueMatch)) : [];

    return {
      id: `${hash}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      hash,
      fullHash: hash,
      prevHash: '0000000000000000000000000000000000000000',
      author,
      email: '',
      date: formattedDate,
      time: timeStr,
      timestamp: Math.floor(dateObj.getTime() / 1000),
      timezone: '+0800',
      action: isMerge ? 'merge' : 'commit',
      rawDate: dateObj.toISOString(),
      type: typeKey,
      typeInfo: this.CONVENTIONAL_TYPES[typeKey] || this.CONVENTIONAL_TYPES.feat,
      scope,
      message: cleanMessage,
      fullMessage,
      issues,
      isMerge,
      rawLine: ''
    };
  }

  static deduplicateCommits(commits) {
    const seen = new Set();
    return commits.filter(c => {
      const key = `${c.hash}-${c.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Read directory handle (including checking logs/HEAD, logs/refs/heads, etc.)
   */
  static async parseFromDirectoryHandle(dirHandle) {
    let logsContent = '';
    let repoName = dirHandle.name;

    try {
      let gitDirHandle = null;
      if (dirHandle.name === '.git') {
        gitDirHandle = dirHandle;
      } else {
        try {
          gitDirHandle = await dirHandle.getDirectoryHandle('.git');
        } catch (e) {}
      }

      const targetDir = gitDirHandle || dirHandle;

      // 1. Try targetDir/logs/HEAD
      try {
        const logsDir = await targetDir.getDirectoryHandle('logs');
        const headFileHandle = await logsDir.getFileHandle('HEAD');
        const file = await headFileHandle.getFile();
        logsContent = await file.text();
      } catch (err) {
        // 2. Try targetDir/logs/refs/heads/main or master or SP1.5.1
        try {
          const logsDir = await targetDir.getDirectoryHandle('logs');
          const refsDir = await logsDir.getDirectoryHandle('refs');
          const headsDir = await refsDir.getDirectoryHandle('heads');

          for await (const entry of headsDir.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              logsContent += (await file.text()) + '\n';
            }
          }
        } catch (err2) {}
      }

      if (logsContent) {
        const commits = this.parseTextLog(logsContent);
        return {
          repoName,
          commits
        };
      }
    } catch (err) {
      console.error('Directory read error:', err);
    }

    return { repoName, commits: [] };
  }
}

window.GitParser = GitParser;

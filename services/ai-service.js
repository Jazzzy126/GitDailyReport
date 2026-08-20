/**
 * AIService (Universal OpenAI-Compatible LLM Client)
 * Connects to DeepSeek, OpenAI, Ollama, or any compatible OpenAI endpoints.
 * Equipped with customizable system prompt, template variable injection ({item_count}),
 * configurable item count, and test connection engine.
 * Supports multi-repo tag awareness & dynamic loading text calculation.
 */

class AIService {
  static STORAGE_KEY = 'git_daily_report_ai_config';

  static DEFAULT_SYSTEM_PROMPT = `你是资深软件工程师。把 Git Commit 记录压缩成精炼日报，只写最核心的已完成工作。

要求：
1. 归纳为 {item_count}，别多写；
2. 每条前面标数字（1. 2. 3.），别用加粗、斜体；
3. 每条只写一件事，控制在 20 字以内，用动词开头，直接说完成了什么或修复了什么；
4. 如果包含多个不同项目的提交，请在每条描述中明确带有【项目名】标注（如：“1. 完成【前端项目】UI开发；2. 修复【后端项目】接口异常”）；
5. 过滤掉无用的提交，比如合并代码、提交配置、更新依赖这类杂项，只保留有实际开发价值的内容；
6. 别写“明日计划”、开场白、结束语；
7. 第一行写「# 工作日报 (日期)」，换行后列条目。`;

  static getConfig() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.systemPrompt) {
          parsed.systemPrompt = this.DEFAULT_SYSTEM_PROMPT;
        }
        if (!parsed.itemCount) {
          parsed.itemCount = '2-3';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load AI config from localStorage', e);
    }

    return {
      provider: 'deepseek',
      apiKey: '',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      itemCount: '2-3',
      systemPrompt: this.DEFAULT_SYSTEM_PROMPT
    };
  }

  static saveConfig(config) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save AI config', e);
    }
  }

  static getAdaptiveTargetCountStr(commitCount = 5) {
    if (commitCount >= 12) return '5-7';
    if (commitCount >= 6) return '3-5';
    if (commitCount >= 3) return '2-4';
    return `${commitCount}`;
  }

  static getItemCountText(itemCountStr, commitCount = 5) {
    if (itemCountStr === '3-5') {
      return '3 到 5 条工作事项';
    } else if (itemCountStr === '5-8') {
      return '5 到 8 条工作事项';
    } else if (itemCountStr === 'auto') {
      const targetStr = this.getAdaptiveTargetCountStr(commitCount);
      return `自适应的 ${targetStr} 条工作事项（根据选中的 ${commitCount} 条提交记录）`;
    }
    return '2 到 3 条工作事项';
  }

  static async testConnection(testConfig) {
    const config = testConfig || this.getConfig();

    if (!config.apiKey || !config.apiKey.trim()) {
      throw new Error('请先填写有效的 API Key');
    }

    let url = config.baseUrl.trim();
    if (!url.endsWith('/chat/completions')) {
      url = url.replace(/\/+$/, '') + '/chat/completions';
    }

    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`
        },
        body: JSON.stringify({
          model: config.model || 'deepseek-chat',
          messages: [
            { role: 'user', content: 'Hi' }
          ],
          max_tokens: 5,
          temperature: 0.1
        })
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errBody = await response.text();
        if (response.status === 401) {
          throw new Error('鉴权失败 (401): API Key 无效或已过期');
        } else if (response.status === 404) {
          throw new Error('接口未找到 (404): 请检查 Base URL 或 Model 名称');
        } else {
          throw new Error(`HTTP ${response.status}: ${errBody.slice(0, 100)}`);
        }
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0]) {
        throw new Error('接口连通但返回的数据格式非标准 OpenAI 结构');
      }

      return { success: true, latencyMs };
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查 Base URL 地址或跨域限制');
      }
      throw err;
    }
  }

  static async generateReport(commits) {
    const config = this.getConfig();

    if (!config.apiKey || !config.apiKey.trim()) {
      throw new Error('请先在右上角【AI 设置】中配置有效 API Key 后再使用 AI 生成功能');
    }

    const reportDate = new Date().toISOString().split('T')[0];
    let basePrompt = (config.systemPrompt && config.systemPrompt.trim()) 
      ? config.systemPrompt 
      : this.DEFAULT_SYSTEM_PROMPT;

    // Dynamically replace {item_count} template variable with calculated text
    const itemCountText = this.getItemCountText(config.itemCount, commits.length);
    
    if (basePrompt.includes('{item_count}')) {
      basePrompt = basePrompt.replaceAll('{item_count}', itemCountText);
    } else {
      // Fallback replace rule 1 if template variable isn't present
      basePrompt = basePrompt.replace(/^1\.\s+.*$/m, `1. 归纳为 ${itemCountText}，别多写；`);
    }

    const commitsSummary = commits.map((c, idx) => {
      const repoTag = c.repoName ? `[${c.repoName}] ` : '';
      return `${idx + 1}. ${repoTag}[${c.date}] ${c.author}: ${c.message} (Hash: #${c.hash})`;
    }).join('\n');

    const userPrompt = `【今日基准日期】: ${reportDate}\n【生成条数硬性要求】: 归纳为 ${itemCountText}\n\n【原始 Git 提交记录 (${commits.length}条)】:\n${commitsSummary}\n\n请严格按照上述要求生成对应数量的精炼日报条目。如果包含多个项目，请在每条简记中保留【项目名】。`;

    let url = config.baseUrl.trim();
    if (!url.endsWith('/chat/completions')) {
      url = url.replace(/\/+$/, '') + '/chat/completions';
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`
        },
        body: JSON.stringify({
          model: config.model || 'deepseek-chat',
          messages: [
            { role: 'system', content: basePrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API 响应错误 (${response.status}): ${errBody.slice(0, 150)}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('API 返回的数据格式无效');
      }

      return data.choices[0].message.content.trim();
    } catch (err) {
      console.error('AI Service Error:', err);
      throw err;
    }
  }
}

window.AIService = AIService;

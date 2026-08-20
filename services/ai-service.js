/**
 * AIService (Universal OpenAI-Compatible LLM Client)
 * Connects to DeepSeek, OpenAI, Ollama, or any compatible OpenAI endpoints.
 * Equipped with customizable system prompt, template variable injection ({item_count}),
 * configurable item count, and test connection engine.
 * Supports multi-repo tag awareness & dynamic loading text calculation.
 */

class AIService {
  static STORAGE_KEY = 'git_daily_report_ai_config';

  static REPORT_TEMPLATES = [
    {
      id: 'technical',
      name: '技术精简版',
      icon: 'code-2',
      prompt: `你是资深软件工程师。请基于以下 Git 提交记录生成精炼工作日报。

基准日期：{date}
目标条目数：{item_count}

要求：
1. 归纳为 {item_count}，别多写；
2. 每条前面标数字（1. 2. 3.），标明【Feature/Fix/Refactor】分类与【项目名】；
3. 每条只写一件事，控制在 25 字以内，用动词开头，直接说完成了什么或修复了什么；
4. 过滤掉无用的提交，比如合并代码、提交配置、更新依赖这类杂项；
5. 第一行写「# 工作日报 ({date})」，换行后列条目。`
    },
    {
      id: 'executive',
      name: '管理汇报版',
      icon: 'briefcase',
      prompt: `你是技术负责人。请将 Git 提交记录整理为向上级汇报的业务成果日报。

基准日期：{date}
目标条目数：{item_count}

要求：
1. 提取最核心的业务交付价值，提炼为 {item_count} 条；
2. 语言干练专业，突出功能上线、体验改善与业务价值，多项目带【项目名】；
3. 结构包含【今日核心产出】与【明日工作规划】；
4. 第一行写「# 工作汇报 ({date})」。`
    },
    {
      id: 'concise',
      name: '极简打卡版',
      icon: 'zap',
      prompt: `你是高效率工程师。把 Git Commit 记录压缩成极简打卡文本。

基准日期：{date}
目标条目数：{item_count}

要求：
1. 归纳为 {item_count} 条，每条 15 字以内；
2. 纯文本格式：序号 + 核心进展（多项目带【项目名】）；
3. 严禁开场白、结束语和多余标题，适合直接发群打卡。`
    }
  ];

  static DEFAULT_SYSTEM_PROMPT = AIService.REPORT_TEMPLATES[0].prompt;

  static getConfig() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.customPrompts) {
          parsed.customPrompts = {};
          this.REPORT_TEMPLATES.forEach(t => {
            parsed.customPrompts[t.id] = t.prompt;
          });
        }
        if (!parsed.templateId) {
          parsed.templateId = 'technical';
        }
        if (!parsed.systemPrompt) {
          parsed.systemPrompt = parsed.customPrompts[parsed.templateId] || this.DEFAULT_SYSTEM_PROMPT;
        }
        if (!parsed.itemCount) {
          parsed.itemCount = '2-3';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load AI config from localStorage', e);
    }

    const defaultPrompts = {};
    this.REPORT_TEMPLATES.forEach(t => {
      defaultPrompts[t.id] = t.prompt;
    });

    return {
      provider: 'deepseek',
      apiKey: '',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      itemCount: '2-3',
      templateId: 'technical',
      customPrompts: defaultPrompts,
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

    // 1. Calculate and replace {item_count} & {items}
    const itemCountText = this.getItemCountText(config.itemCount, commits.length);
    basePrompt = basePrompt.replaceAll('{item_count}', itemCountText);
    basePrompt = basePrompt.replaceAll('{items}', itemCountText);

    // 2. Replace {date}
    basePrompt = basePrompt.replaceAll('{date}', reportDate);

    // 3. Prepare commits text
    const commitsSummary = commits.map((c, idx) => {
      const repoTag = c.repoName ? `[${c.repoName}] ` : '';
      return `${idx + 1}. ${repoTag}[${c.date}] ${c.author}: ${c.message} (Hash: #${c.hash})`;
    }).join('\n');

    let userPrompt = '';
    if (basePrompt.includes('{commits}')) {
      basePrompt = basePrompt.replaceAll('{commits}', commitsSummary);
      userPrompt = `请基于系统提示词中的 Git 提交记录，生成今日工作日报。`;
    } else {
      userPrompt = `【今日基准日期】: ${reportDate}\n【生成条目要求】: 归纳为 ${itemCountText}\n\n【原始 Git 提交记录 (${commits.length}条)】:\n${commitsSummary}\n\n请严格按照要求生成对应数量的精炼日报条目。如果包含多个项目，请在每条简记中保留【项目名】。`;
    }

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

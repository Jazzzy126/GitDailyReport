/**
 * useI18n Composable
 * Global Internationalization (i18n) Engine for Git Daily Report Studio
 * Fully supports: zh-CN (Simplified Chinese), en-US (English), ja-JP (Japanese), ko-KR (Korean)
 * Features: Deep key resolution, parameter interpolation ({name}), reactive locale, localStorage sync
 */

(function (window) {
  const LOCALE_STORAGE_KEY = 'git_daily_report_locale';

  const SUPPORTED_LOCALES = [
    { code: 'zh-CN', label: '简体中文', englishLabel: 'Simplified Chinese', icon: '🇨🇳', tag: '中文' },
    { code: 'en-US', label: 'English', englishLabel: 'English', icon: '🇺🇸', tag: 'EN' },
    { code: 'ja-JP', label: '日本語', englishLabel: 'Japanese', icon: '🇯🇵', tag: '日本語' },
    { code: 'ko-KR', label: '한국어', englishLabel: 'Korean', icon: '🇰🇷', tag: '한국어' }
  ];

  const MESSAGES = {
    'zh-CN': {
      app: {
        title: 'Git 日报生成器',
        tagline: 'Studio Pro',
        skipToContent: '跳至主要内容',
        language: '语言设置',
        theme: '外观与个性化偏好',
        settings: '系统与 AI 设置 (快捷键：Ctrl/Cmd + ,)',
        themeTitle: '外观偏好',
        openLanguageModal: '切换系统语言'
      },
      repo: {
        title: '项目仓库',
        expandDropzone: '导入新项目',
        collapseDropzone: '收起',
        refresh: '刷新',
        refreshing: '同步中…',
        refreshTitle: '一键刷新读取本地最新提交 (支持切回窗口自动同步)',
        clickOrDrag: '点击或拖拽 Git 项目文件夹',
        recentTitle: '最近项目 (点击标签多选)',
        selectAll: '全选项目',
        clearSelection: '清空选择',
        selectAllAria: '全选所有最近项目',
        clearAllAria: '清空所有已选项目',
        moreOptions: '更多操作',
        emptyRepo: '暂无仓库',
        activeRepoBadge: '{count} 个仓库'
      },
      repoAction: {
        title: '项目操作',
        editAlias: '修改项目别名',
        editAliasDesc: '为该仓库设置易记的中文/自定义名称',
        refresh: '重新读取提交',
        refreshDesc: '重新扫描本地 .git 目录获取最新提交',
        remove: '从列表中移除',
        removeDesc: '仅从网页最近列表中移除，不影响本地文件',
        close: '关闭窗口',
        promptAlias: '请输入项目「{name}」的自定义别名（例如: 前端UI / 后端API）:',
        aliasUpdatedToast: '✨ 项目「{name}」别名已设置为「{alias}」',
        removedToast: '🗑️ 已移除项目「{name}」',
        refreshedToast: '🔄 项目「{name}」提交记录已刷新！'
      },
      commits: {
        title: 'Git 提交记录',
        countBadge: '{count} 条提交',
        allAuthors: '所有提交人',
        currentAuthor: '当前作者: {name}',
        filterDateLabel: '筛选提交日期',
        filterAuthorLabel: '筛选提交人',
        today: '今天',
        yesterday: '昨天',
        all: '全部',
        todayAria: '快速筛选今日提交',
        yesterdayAria: '快速筛选昨日提交',
        allAria: '查看全部提交',
        emptyTitle: '暂无提交记录',
        emptyDesc: '请拖拽本地 Git 项目文件夹到上方区域以加载提交记录',
        viewDetailAria: '查看提交 {hash} 详情',
        typeFeature: '功能',
        typeFix: '修复',
        typeRefactor: '重构',
        typeDocs: '文档',
        typeChore: '构建/杂项',
        typeStyle: '样式',
        typePerf: '性能'
      },
      commitDetail: {
        title: 'Git 提交元数据明细',
        subtitle: 'Studio Pro Commit Inspector',
        close: '关闭详情',
        checksum: 'Commit 40位 Checksum',
        copyHash: '复制 Hash',
        hashCopied: '已复制完整 Commit Hash',
        fieldAuthor: '提交作者',
        fieldDate: '提交时间',
        fieldType: '语义分类',
        fieldRepo: '所属仓库',
        fieldMessage: '提交信息 (Commit Message)',
        copyMsg: '复制提交信息',
        msgCopied: '已复制提交信息'
      },
      report: {
        paneTitle: '工作日报生成与输出',
        edit: '编辑 Markdown',
        preview: '预览排版',
        templateLabel: '报告模板',
        templateCurrent: '模板: {name}',
        generateBtn: 'AI 极速生成日报',
        generatingBtn: 'AI 正在提炼生成…',
        wordCount: '{count} 字',
        commitCount: '{count} 条提交',
        copyPlain: '复制纯文本',
        copyMd: '复制 Markdown',
        copyHtml: '复制富文本 (HTML)',
        copied: '已复制！',
        placeholder: '✨ 点击上方「AI 极速生成日报」或按快捷键 Ctrl/Cmd + Enter 立即提炼生成专业工作日报。\n\n您也可以直接在此编辑 Markdown 内容。',
        readyHeadline: '一键生成专业工作日报',
        readySubheadline: '基于当前选中的 {commits} 条 Git 提交记录，通过 AI 智能提炼业务成果',
        noCommitsWarn: '暂无提交记录可生成',
        generatingLoading: 'AI 正在分析 Git 提交记录并撰写日报…',
        generateSuccess: '🎉 日报生成完毕！',
        ruleFallbackNotice: '💡 未配置 API Key，已为您使用智能规则引擎本地生成日报'
      },
      themePopover: {
        title: '外观与个性化',
        subtitle: '实时生效，随心定制',
        reset: '重置',
        modeSection: '外观模式',
        modeLight: '浅色',
        modeDark: '深色',
        modeSystem: '跟随系统',
        colorSection: '主题主色调',
        colorBlue: '极客蓝',
        colorPurple: '灵动紫',
        colorEmerald: '清新绿',
        colorRose: '活力粉',
        colorAmber: '暖阳橙',
        radiusSection: '圆角质感',
        radiusSharp: '直角克制',
        radiusCompact: '精巧适度',
        radiusStandard: '优雅标准',
        radiusBento: '灵动 Bento',
        glassSection: '毛玻璃氛围',
        glassOpaque: '纯净实色',
        glassStandard: '柔和透光',
        glassHeavy: '深邃高斯',
        footerTip: '配置将自动保存到本地浏览器'
      },
      languageModal: {
        title: '切换系统语言',
        subtitle: '选择您习惯的语言界面 (Select Language)',
        close: '关闭语言切换弹窗',
        currentTag: '当前语言',
        confirmTip: '语言切换将即时生效并保存偏好'
      },
      settingsModal: {
        title: '系统与 AI 模型设置',
        subtitle: '配置大模型 API 与自定义日报提示词模板',
        close: '关闭设置',
        tabPrompt: '提示词模板',
        tabAi: 'AI 模型设置',
        templateLabel: '选择编辑的模板',
        promptLabel: '系统提示词 (Prompt)',
        promptDesc: '可使用变量：{date} 代表日期，{item_count} 代表目标条目数',
        resetPrompt: '恢复默认提示词',
        promptResetToast: '✨ 已恢复「{name}」的系统默认提示词',
        itemCountLabel: '输出条目数偏好',
        providerLabel: 'API 服务商',
        apiKeyLabel: 'API Key',
        apiKeyPlaceholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        baseUrlLabel: 'API 基础地址 (Base URL)',
        baseUrlPlaceholder: 'https://api.deepseek.com/v1',
        modelLabel: '模型标识 (Model Name)',
        modelPlaceholder: 'deepseek-chat',
        testBtn: '测试 API 连通性',
        testingBtn: '正在测试…',
        saveBtn: '保存设置',
        saveSuccessToast: '⚙️ 配置保存成功',
        apiKeyRequiredToast: '请先填写 API Key 再测试连通性',
        testSuccessToast: '✅ API 接口连通成功！(响应耗时 {latency}ms)',
        testFailedToast: '❌ 连通失败: {error}'
      },
      templates: {
        technical: '技术精简版',
        executive: '管理汇报版',
        concise: '极简打卡版'
      },
      itemCountOptions: {
        '2-3': '2 ~ 3 条 (默认精炼)',
        '3-5': '3 ~ 5 条 (标准适中)',
        '5-8': '5 ~ 8 条 (详细完整)',
        'auto': '自动自适应 (根据提交量)'
      },
      toast: {
        clipboardImportSuccess: '📋 已通过剪贴板成功快速导入 {count} 条提交记录！',
        aiConfigDetected: '⚙️ 已检测到本地 AI 配置',
        repoParsed: '✅ 成功解析项目「{name}」，共 {count} 条提交！',
        copySuccess: '📋 内容已成功复制到剪贴板！',
        languageSwitched: '🌐 语言已切换为：{lang}'
      },
      whimsy: {
        loadingQuotes: [
          '☕ 正在给 Git 提交记录脱水压榨精华...',
          '✨ 正在将 10 个 fix: typo 包装成重大架构优化...',
          '🤖 正在向 AI 翻译官解释什么叫「一行代码写一天」...',
          '🚀 数字小精灵正在对齐颗粒度与赋能闭环...',
          '🎨 正在为今日份努力寻找最惊艳的修辞手法...',
          '☕ 喝口咖啡，今日份高质量战报马上送达...'
        ],
        copyToastPlain: '📋 纯文本已送达剪贴板，去惊艳你的 Leader 吧！',
        copyToastMd: '📝 Markdown 已复制，格式规整得像艺术品！',
        copyToastHtml: '✨ 精美富文本已就位，直接粘贴即可惊艳全场！',
        achievementTitle: '🏆 获得隐藏极客称号',
        achievementName: '【野生代码艺术家】',
        achievementDesc: '恭喜你！在代码与日报之间保持了最纯粹的好奇心与探索欲。',
        achievementQuote: '「Talk is cheap, show me the daily report.」',
        closeAchievement: '低调收下'
      },
      shortcuts: {
        title: '键盘快捷键指南',
        subtitle: '大幅提升日常生产力的全局快捷操作',
        generateReport: '一键生成 AI 智能日报',
        copyMarkdown: '快速复制 Markdown 格式',
        openSettings: '打开系统与 AI 参数设置',
        toggleShortcuts: '呼出 / 隐藏快捷键指南',
        escape: '关闭当前弹窗 / 撤销',
        close: '我知道了'
      }
    },

    'en-US': {
      app: {
        title: 'Git Daily Report',
        tagline: 'Studio Pro',
        skipToContent: 'Skip to main content',
        language: 'Language Settings',
        theme: 'Appearance & Customization',
        settings: 'System & AI Settings (Shortcut: Ctrl/Cmd + ,)',
        themeTitle: 'Appearance',
        openLanguageModal: 'Change System Language'
      },
      repo: {
        title: 'Repositories',
        expandDropzone: 'Import Project',
        collapseDropzone: 'Collapse',
        refresh: 'Refresh',
        refreshing: 'Syncing…',
        refreshTitle: 'Refresh to read the latest local commits',
        clickOrDrag: 'Click or drag Git project folder here',
        recentTitle: 'Recent Repos (Click to multi-select)',
        selectAll: 'Select All',
        clearSelection: 'Clear All',
        selectAllAria: 'Select all recent repositories',
        clearAllAria: 'Clear all selected repositories',
        moreOptions: 'More Actions',
        emptyRepo: 'No repositories',
        activeRepoBadge: '{count} repos'
      },
      repoAction: {
        title: 'Repository Actions',
        editAlias: 'Edit Project Alias',
        editAliasDesc: 'Set a custom memorable display name for this repository',
        refresh: 'Reload Commits',
        refreshDesc: 'Re-scan the local .git directory for fresh commits',
        remove: 'Remove from List',
        removeDesc: 'Only removes from recent list, local files remain untouched',
        close: 'Close Window',
        promptAlias: 'Enter custom alias for repository "{name}" (e.g. Frontend UI / Backend API):',
        aliasUpdatedToast: '✨ Alias for "{name}" set to "{alias}"',
        removedToast: '🗑️ Removed repository "{name}"',
        refreshedToast: '🔄 Commits for "{name}" refreshed!'
      },
      commits: {
        title: 'Git Commits',
        countBadge: '{count} commits',
        allAuthors: 'All Authors',
        currentAuthor: 'Author: {name}',
        filterDateLabel: 'Filter by date',
        filterAuthorLabel: 'Filter by author',
        today: 'Today',
        yesterday: 'Yesterday',
        all: 'All',
        todayAria: 'Filter commits from today',
        yesterdayAria: 'Filter commits from yesterday',
        allAria: 'View all commits',
        emptyTitle: 'No Commits Found',
        emptyDesc: 'Drag & drop a local Git folder to load commit history',
        viewDetailAria: 'View commit {hash} details',
        typeFeature: 'Feature',
        typeFix: 'Fix',
        typeRefactor: 'Refactor',
        typeDocs: 'Docs',
        typeChore: 'Chore',
        typeStyle: 'Style',
        typePerf: 'Perf'
      },
      commitDetail: {
        title: 'Git Commit Metadata',
        subtitle: 'Studio Pro Commit Inspector',
        close: 'Close Details',
        checksum: 'Commit 40-char Checksum',
        copyHash: 'Copy Hash',
        hashCopied: 'Full Commit Hash copied',
        fieldAuthor: 'Author',
        fieldDate: 'Date & Time',
        fieldType: 'Semantic Type',
        fieldRepo: 'Repository',
        fieldMessage: 'Commit Message',
        copyMsg: 'Copy Message',
        msgCopied: 'Commit message copied'
      },
      report: {
        paneTitle: 'Daily Report Generator & Output',
        edit: 'Edit Markdown',
        preview: 'Preview Output',
        templateLabel: 'Template',
        templateCurrent: 'Template: {name}',
        generateBtn: 'Generate AI Daily Report',
        generatingBtn: 'Generating with AI…',
        wordCount: '{count} words',
        commitCount: '{count} commits',
        copyPlain: 'Copy Plain Text',
        copyMd: 'Copy Markdown',
        copyHtml: 'Copy Rich Text (HTML)',
        copied: 'Copied!',
        placeholder: '✨ Click "Generate AI Daily Report" above or press Ctrl/Cmd + Enter to synthesize work reports.\n\nYou can also edit Markdown content directly here.',
        readyHeadline: 'One-Click Daily Report Generator',
        readySubheadline: 'Synthesize professional business deliverables from {commits} Git commits using AI',
        noCommitsWarn: 'No commits available to generate report',
        generatingLoading: 'AI is analyzing Git commits and generating the report…',
        generateSuccess: '🎉 Daily report generated successfully!',
        ruleFallbackNotice: '💡 No API Key provided; report generated locally using smart rule engine'
      },
      themePopover: {
        title: 'Appearance & Customization',
        subtitle: 'Live preview, customize freely',
        reset: 'Reset',
        modeSection: 'Appearance Mode',
        modeLight: 'Light',
        modeDark: 'Dark',
        modeSystem: 'System',
        colorSection: 'Primary Accent Color',
        colorBlue: 'Cyber Blue',
        colorPurple: 'Vibrant Purple',
        colorEmerald: 'Emerald Green',
        colorRose: 'Vivid Rose',
        colorAmber: 'Warm Amber',
        radiusSection: 'Corner Radius Style',
        radiusSharp: 'Sharp Flat',
        radiusCompact: 'Compact Neat',
        radiusStandard: 'Standard Smooth',
        radiusBento: 'Dynamic Bento',
        glassSection: 'Frosted Glass Atmosphere',
        glassOpaque: 'Solid Opaque',
        glassStandard: 'Soft Translucent',
        glassHeavy: 'Deep Gaussian',
        footerTip: 'Settings are automatically saved in local browser'
      },
      languageModal: {
        title: 'Change System Language',
        subtitle: 'Select your preferred interface language',
        close: 'Close Language Modal',
        currentTag: 'Active',
        confirmTip: 'Language switch takes effect instantly and saves your preference'
      },
      settingsModal: {
        title: 'System & AI Model Settings',
        subtitle: 'Configure LLM API endpoints and custom daily report prompt templates',
        close: 'Close Settings',
        tabPrompt: 'Prompt Templates',
        tabAi: 'AI Model Settings',
        templateLabel: 'Template to Edit',
        promptLabel: 'System Prompt',
        promptDesc: 'Variables available: {date} for date, {item_count} for item count target',
        resetPrompt: 'Reset to Default Prompt',
        promptResetToast: '✨ Reset system prompt for "{name}" to default',
        itemCountLabel: 'Output Item Count Preference',
        providerLabel: 'API Provider',
        apiKeyLabel: 'API Key',
        apiKeyPlaceholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        baseUrlLabel: 'API Base URL',
        baseUrlPlaceholder: 'https://api.deepseek.com/v1',
        modelLabel: 'Model Name',
        modelPlaceholder: 'deepseek-chat',
        testBtn: 'Test API Connection',
        testingBtn: 'Testing…',
        saveBtn: 'Save Settings',
        saveSuccessToast: '⚙️ Settings saved successfully',
        apiKeyRequiredToast: 'Please provide an API Key before testing connection',
        testSuccessToast: '✅ API connection successful! (Latency: {latency}ms)',
        testFailedToast: '❌ Connection failed: {error}'
      },
      templates: {
        technical: 'Technical Concise',
        executive: 'Executive Summary',
        concise: 'Minimal Standup'
      },
      itemCountOptions: {
        '2-3': '2 ~ 3 Items (Concise & Focused)',
        '3-5': '3 ~ 5 Items (Standard Balanced)',
        '5-8': '5 ~ 8 Items (Detailed & Complete)',
        'auto': 'Auto Adaptive (Based on commits)'
      },
      toast: {
        clipboardImportSuccess: '📋 Successfully imported {count} commits from clipboard!',
        aiConfigDetected: '⚙️ Local AI configuration detected',
        repoParsed: '✅ Successfully parsed repo "{name}" with {count} commits!',
        copySuccess: '📋 Content copied to clipboard successfully!',
        languageSwitched: '🌐 Language switched to: {lang}'
      },
      whimsy: {
        loadingQuotes: [
          '☕ Extracting pure value from Git commits...',
          '✨ Packaging 10 "fix: typo" commits into major architecture revamps...',
          '🤖 Explaining to AI what "spent whole day on 1 line of code" means...',
          '🚀 Aligning granular synergy and closed-loop empowerment...',
          '🎨 Searching for the most stunning rhetoric for your daily grind...',
          '☕ Grab a coffee, your masterpiece report is rendering...'
        ],
        copyToastPlain: '📋 Plain text copied! Ready to impress your leader!',
        copyToastMd: '📝 Markdown copied! Crafted cleanly like a piece of art.',
        copyToastHtml: '✨ Rich HTML ready! Paste directly into email/chat to shine.',
        achievementTitle: '🏆 Hidden Geek Title Unlocked',
        achievementName: '【Wild Code Artist】',
        achievementDesc: 'Congratulations! You kept pure curiosity and exploration between code and reports.',
        achievementQuote: '"Talk is cheap, show me the daily report."',
        closeAchievement: 'Keep It Low-key'
      },
      shortcuts: {
        title: 'Keyboard Shortcuts',
        subtitle: 'Global shortcuts to boost your daily workflow',
        generateReport: 'Generate AI Daily Report',
        copyMarkdown: 'Quick Copy Markdown Format',
        openSettings: 'Open System & AI Settings',
        toggleShortcuts: 'Toggle Shortcuts Guide',
        escape: 'Dismiss Modal / Cancel',
        close: 'Got It'
      }
    },

    'ja-JP': {
      app: {
        title: 'Git 日報ジェネレーター',
        tagline: 'Studio Pro',
        skipToContent: 'メインコンテンツへスキップ',
        language: '言語設定',
        theme: '外観とパーソナライズ',
        settings: 'システムとAI設定 (ショートカット: Ctrl/Cmd + ,)',
        themeTitle: '外観設定',
        openLanguageModal: 'システム言語を切り替える'
      },
      repo: {
        title: 'リポジトリ',
        expandDropzone: 'プロジェクトを追加',
        collapseDropzone: '閉じる',
        refresh: '更新',
        refreshing: '同期中…',
        refreshTitle: '最新のローカルコミットを再読込',
        clickOrDrag: 'Git プロジェクトフォルダをクリックまたはドラッグ',
        recentTitle: '最近のプロジェクト (クリックで複数選択)',
        selectAll: 'すべて選択',
        clearSelection: '選択解除',
        selectAllAria: 'すべての最近のリポジトリを選択',
        clearAllAria: 'すべての選択をクリア',
        moreOptions: 'その他操作',
        emptyRepo: 'リポジトリがありません',
        activeRepoBadge: '{count} 件のリポジトリ'
      },
      repoAction: {
        title: 'リポジトリ操作',
        editAlias: 'エイリアス名を変更',
        editAliasDesc: 'このリポジトリの表示名を分かりやすい名称に変更します',
        refresh: 'コミットを再読込',
        refreshDesc: 'ローカルの .git ディレクトリを再スキャンして最新コミットを取得',
        remove: 'リストから削除',
        removeDesc: '履歴リストからのみ削除され、ローカルファイルには影響しません',
        close: 'ウィンドウを閉じる',
        promptAlias: 'プロジェクト「{name}」のカスタムエイリアス名を入力してください:',
        aliasUpdatedToast: '✨ プロジェクト「{name}」の別名を「{alias}」に設定しました',
        removedToast: '🗑️ プロジェクト「{name}」を削除しました',
        refreshedToast: '🔄 プロジェクト「{name}」のコミット履歴を更新しました！'
      },
      commits: {
        title: 'Git コミット履歴',
        countBadge: '{count} 件のコミット',
        allAuthors: 'すべてのコミッター',
        currentAuthor: '現在の作成者: {name}',
        filterDateLabel: '日付で絞り込み',
        filterAuthorLabel: 'コミッターで絞り込み',
        today: '今日',
        yesterday: '昨日',
        all: 'すべて',
        todayAria: '今日のコミットを絞り込み',
        yesterdayAria: '昨日のコミットを絞り込み',
        allAria: 'すべてのコミットを表示',
        emptyTitle: 'コミット履歴がありません',
        emptyDesc: '上のエリアにローカル Git フォルダをドラッグ＆ドロップして読み込んでください',
        viewDetailAria: 'コミット {hash} の詳細を表示',
        typeFeature: '機能追加',
        typeFix: '修正',
        typeRefactor: 'リファクタ',
        typeDocs: 'ドキュメント',
        typeChore: 'ビルド/雑務',
        typeStyle: 'スタイル',
        typePerf: 'パフォーマンス'
      },
      commitDetail: {
        title: 'Git コミット詳細',
        subtitle: 'Studio Pro Commit Inspector',
        close: '詳細を閉じる',
        checksum: 'Commit 40桁 Checksum',
        copyHash: 'Hash をコピー',
        hashCopied: '完全な Commit Hash をコピーしました',
        fieldAuthor: 'コミッター',
        fieldDate: 'コミット日時',
        fieldType: 'セマンティック分類',
        fieldRepo: '対象リポジトリ',
        fieldMessage: 'コミットメッセージ',
        copyMsg: 'メッセージをコピー',
        msgCopied: 'コミットメッセージをコピーしました'
      },
      report: {
        paneTitle: '業務日報の生成と出力',
        edit: 'Markdown 編集',
        preview: 'プレビュー',
        templateLabel: 'テンプレート',
        templateCurrent: 'テンプレート: {name}',
        generateBtn: 'AI で日報を即座に生成',
        generatingBtn: 'AI が日報を作成中…',
        wordCount: '{count} 文字',
        commitCount: '{count} 件のコミット',
        copyPlain: 'テキストをコピー',
        copyMd: 'Markdown をコピー',
        copyHtml: 'リッチテキスト(HTML)をコピー',
        copied: 'コピー完了！',
        placeholder: '✨ 上の「AI で日報を即座に生成」をクリックするか、Ctrl/Cmd + Enter を押して業務日報を自動生成します。\n\nここで直接 Markdown を編集することもできます。',
        readyHeadline: 'ワンクリックで業務日報を自動生成',
        readySubheadline: '選択された {commits} 件のコミットをもとに、AI が業務成果をスマートに要約します',
        noCommitsWarn: '生成対象のコミットがありません',
        generatingLoading: 'AI が Git コミットを分析して日報を作成しています…',
        generateSuccess: '🎉 業務日報の生成が完了しました！',
        ruleFallbackNotice: '💡 API Key が未設定のため、スマートルールエンジンによりローカルで日報を生成しました'
      },
      themePopover: {
        title: '外観とパーソナライズ',
        subtitle: 'リアルタイムプレビュー、自由にカスタマイズ',
        reset: 'リセット',
        modeSection: '外観モード',
        modeLight: 'ライト',
        modeDark: 'ダーク',
        modeSystem: 'システム連動',
        colorSection: 'プライマリアクセント色',
        colorBlue: 'ギークブルー',
        colorPurple: 'バイブラントパープル',
        colorEmerald: 'エメラルドグリーン',
        colorRose: 'ビビッドローズ',
        colorAmber: 'ウォームアンバー',
        radiusSection: '角丸スタイル',
        radiusSharp: 'シャープ',
        radiusCompact: 'コンパクト',
        radiusStandard: 'スタンダード',
        radiusBento: 'Bento グリッド',
        glassSection: 'すりガラス効果',
        glassOpaque: '不透明ソリッド',
        glassStandard: 'ソフトグラス',
        glassHeavy: 'ディープグラス',
        footerTip: '設定はブラウザに自動保存されます'
      },
      languageModal: {
        title: 'システム言語の切り替え',
        subtitle: 'ご希望の言語を選択してください (Select Language)',
        close: '言語設定モーダルを閉じる',
        currentTag: '現在の言語',
        confirmTip: '言語の切り替えは即座に反映され、設定が保存されます'
      },
      settingsModal: {
        title: 'システムと AI モデル設定',
        subtitle: 'LLM API 接続と日報プロンプトテンプレートのカスタマイズ',
        close: '設定を閉じる',
        tabPrompt: 'プロンプトテンプレート',
        tabAi: 'AI モデル設定',
        templateLabel: '編集するテンプレート',
        promptLabel: 'システムプロンプト (Prompt)',
        promptDesc: '利用可能変数: {date} (日付), {item_count} (目標項目数)',
        resetPrompt: 'デフォルトプロンプトに戻す',
        promptResetToast: '✨「{name}」のプロンプトをデフォルトに戻しました',
        itemCountLabel: '出力項目数の希望',
        providerLabel: 'API プロバイダー',
        apiKeyLabel: 'API Key',
        apiKeyPlaceholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        baseUrlLabel: 'API Base URL',
        baseUrlPlaceholder: 'https://api.deepseek.com/v1',
        modelLabel: 'モデル名',
        modelPlaceholder: 'deepseek-chat',
        testBtn: 'API 接続テスト',
        testingBtn: '接続テスト中…',
        saveBtn: '設定を保存',
        saveSuccessToast: '⚙️ 設定を保存しました',
        apiKeyRequiredToast: '接続テストの前に API Key を入力してください',
        testSuccessToast: '✅ API 接続に成功しました！(応答時間: {latency}ms)',
        testFailedToast: '❌ 接続に失敗しました: {error}'
      },
      templates: {
        technical: 'エンジニア技術版',
        executive: 'マネジメント報告版',
        concise: 'シンプル打刻版'
      },
      itemCountOptions: {
        '2-3': '2 ~ 3 項目 (簡潔に要約)',
        '3-5': '3 ~ 5 項目 (標準バランス)',
        '5-8': '5 ~ 8 項目 (詳細・網羅的)',
        'auto': '自動調整 (コミット数連動)'
      },
      toast: {
        clipboardImportSuccess: '📋 クリップボードから {count} 件のコミットをインポートしました！',
        aiConfigDetected: '⚙️ ローカルの AI 設定を検出しました',
        repoParsed: '✅ リポジトリ「{name}」から {count} 件のコミットを読み込みました！',
        copySuccess: '📋 クリップボードにコピーしました！',
        languageSwitched: '🌐 言語を切り替えました：{lang}'
      },
      whimsy: {
        loadingQuotes: [
          '☕ コミット履歴から純粋なエッセンスを抽出中...',
          '✨ 10件の fix: typo を主要アーキテクチャ刷新に昇華中...',
          '🤖 1行のコードに1日かけた苦労をAIに熱弁中...',
          '🚀 粒度を揃えてシナジーを最大化しています...',
          '🎨 本日の努力にふさわしい美しい修辞を探索中...',
          '☕ コーヒーブレイクをどうぞ、極上の日報がまもなく完成します...'
        ],
        copyToastPlain: '📋 テキストをコピーしました！リーダーを驚かせましょう！',
        copyToastMd: '📝 Markdown をコピー！芸術品のように整った書式です。',
        copyToastHtml: '✨ リッチテキストをコピー！そのまま貼り付けて完璧な報告に。',
        achievementTitle: '🏆 隠し称号を獲得',
        achievementName: '【孤高のコードアーティスト】',
        achievementDesc: 'おめでとうございます！コードと日報の間に純粋な探求心を保ち続けました。',
        achievementQuote: '「Talk is cheap, show me the daily report.」',
        closeAchievement: 'そっと受け取る'
      },
      shortcuts: {
        title: 'キーボードショートカット',
        subtitle: '作業効率を飛躍的に高めるグローバルショートカット',
        generateReport: 'AI日報をワンクリック生成',
        copyMarkdown: 'Markdown形式を素早くコピー',
        openSettings: 'システム・AI設定を開く',
        toggleShortcuts: 'ショートカットガイドの開閉',
        escape: 'モーダルを閉じる / キャンセル',
        close: '了解しました'
      }
    },

    'ko-KR': {
      app: {
        title: 'Git 일일 업무보고 생성기',
        tagline: 'Studio Pro',
        skipToContent: '본문으로 건너뛰기',
        language: '언어 설정',
        theme: '테마 및 디자인 맞춤 설정',
        settings: '시스템 및 AI 설정 (단축키: Ctrl/Cmd + ,)',
        themeTitle: '테마 설정',
        openLanguageModal: '시스템 언어 변경'
      },
      repo: {
        title: '프로젝트 저장소',
        expandDropzone: '새 프로젝트 가져오기',
        collapseDropzone: '접기',
        refresh: '새로고침',
        refreshing: '동기화 중…',
        refreshTitle: '로컬 최신 커밋 즉시 새로고침',
        clickOrDrag: 'Git 프로젝트 폴더를 클릭하거나 드래그하세요',
        recentTitle: '최근 프로젝트 (클릭하여 다중 선택)',
        selectAll: '전체 선택',
        clearSelection: '선택 해제',
        selectAllAria: '모든 최근 프로젝트 선택',
        clearAllAria: '모든 선택 해제',
        moreOptions: '추가 작업',
        emptyRepo: '저장소 없음',
        activeRepoBadge: '{count}개 저장소'
      },
      repoAction: {
        title: '저장소 관리',
        editAlias: '프로젝트 별칭 수정',
        editAliasDesc: '이 저장소에 식별하기 쉬운 맞춤 이름을 설정합니다',
        refresh: '커밋 다시 읽기',
        refreshDesc: '로컬 .git 디렉터리를 다시 스캔하여 최신 커밋 불러오기',
        remove: '목록에서 제거',
        removeDesc: '웹 최근 목록에서만 제거되며 로컬 파일은 보존됩니다',
        close: '창 닫기',
        promptAlias: '프로젝트 "{name}"의 맞춤 별칭을 입력하세요 (예: 프론트엔드 UI / 백엔드 API):',
        aliasUpdatedToast: '✨ 프로젝트 "{name}"의 별칭이 "{alias}"(으)로 설정되었습니다',
        removedToast: '🗑️ 프로젝트 "{name}"을(를) 제거했습니다',
        refreshedToast: '🔄 프로젝트 "{name}"의 커밋 기록이 새로고침되었습니다!'
      },
      commits: {
        title: 'Git 커밋 기록',
        countBadge: '{count}개 커밋',
        allAuthors: '모든 커밋 작성자',
        currentAuthor: '현재 작성자: {name}',
        filterDateLabel: '날짜별 필터링',
        filterAuthorLabel: '작성자별 필터링',
        today: '오늘',
        yesterday: '어제',
        all: '전체',
        todayAria: '오늘 커밋 필터링',
        yesterdayAria: '어제 커밋 필터링',
        allAria: '모든 커밋 보기',
        emptyTitle: '커밋 기록이 없습니다',
        emptyDesc: '위 영역으로 로컬 Git 프로젝트 폴더를 드래그하여 커밋을 불러오세요',
        viewDetailAria: '커밋 {hash} 상세 정보 보기',
        typeFeature: '기능 추가',
        typeFix: '버그 수정',
        typeRefactor: '리팩토링',
        typeDocs: '문서화',
        typeChore: '빌드/기타',
        typeStyle: '스타일',
        typePerf: '성능 개선'
      },
      commitDetail: {
        title: 'Git 커밋 메타데이터 상세',
        subtitle: 'Studio Pro Commit Inspector',
        close: '상세 정보 닫기',
        checksum: 'Commit 40자리 Checksum',
        copyHash: 'Hash 복사',
        hashCopied: '전체 Commit Hash가 복사되었습니다',
        fieldAuthor: '커밋 작성자',
        fieldDate: '커밋 일시',
        fieldType: '시맨틱 분류',
        fieldRepo: '소속 저장소',
        fieldMessage: '커밋 메시지 (Commit Message)',
        copyMsg: '메시지 복사',
        msgCopied: '커밋 메시지가 복사되었습니다'
      },
      report: {
        paneTitle: '일일 업무보고서 생성 및 출력',
        edit: 'Markdown 편집',
        preview: '미리보기',
        templateLabel: '보고서 템플릿',
        templateCurrent: '템플릿: {name}',
        generateBtn: 'AI 로 일일보고서 즉시 생성',
        generatingBtn: 'AI 가 보고서를 작성하는 중…',
        wordCount: '{count} 자',
        commitCount: '{count}개 커밋',
        copyPlain: '텍스트 복사',
        copyMd: 'Markdown 복사',
        copyHtml: '서식 텍스트(HTML) 복사',
        copied: '복사 완료!',
        placeholder: '✨ 상단의 "AI 로 일일보고서 즉시 생성"을 클릭하거나 Ctrl/Cmd + Enter 를 눌러 전문적인 업무보고서를 생성하세요.\n\n여기서 직접 Markdown 내용을 편집할 수도 있습니다.',
        readyHeadline: '원클릭 스마트 일일 업무보고서 생성',
        readySubheadline: '선택된 {commits}개의 Git 커밋을 기반으로 AI 가 주요 업무 성과를 명확하게 요약합니다',
        noCommitsWarn: '생성할 커밋 기록이 없습니다',
        generatingLoading: 'AI 가 Git 커밋을 분석하여 일일 업무보고서를 작성하고 있습니다…',
        generateSuccess: '🎉 일일 업무보고서 생성이 완료되었습니다!',
        ruleFallbackNotice: '💡 API Key 가 설정되지 않아 스마트 규칙 엔진으로 로컬에서 보고서를 생성했습니다'
      },
      themePopover: {
        title: '외관 및 맞춤 설정',
        subtitle: '실시간 미리보기 및 자유로운 스타일링',
        reset: '초기화',
        modeSection: '화면 모드',
        modeLight: '라이트',
        modeDark: '다크',
        modeSystem: '시스템 연동',
        colorSection: '기본 테마 색상',
        colorBlue: '사이버 블루',
        colorPurple: '비비드 퍼플',
        colorEmerald: '에메랄드 그린',
        colorRose: '비비드 로즈',
        colorAmber: '웜 앰버',
        radiusSection: '모서리 둥글기',
        radiusSharp: '직각 (Sharp)',
        radiusCompact: '컴팩트 (Compact)',
        radiusStandard: '표준 (Standard)',
        radiusBento: '다이내믹 Bento',
        glassSection: '반투명 글래스 효과',
        glassOpaque: '불투명 솔리드',
        glassStandard: '은은한 글래스',
        glassHeavy: '깊은 가우시안',
        footerTip: '설정은 브라우저에 자동으로 저장됩니다'
      },
      languageModal: {
        title: '시스템 언어 변경',
        subtitle: '원하시는 인터페이스 언어를 선택하세요 (Select Language)',
        close: '언어 설정 창 닫기',
        currentTag: '현재 언어',
        confirmTip: '언어 전환은 즉시 적용되며 환경설정에 저장됩니다'
      },
      settingsModal: {
        title: '시스템 및 AI 모델 설정',
        subtitle: 'LLM API 연결 및 일일 업무보고 프롬프트 템플릿 맞춤 설정',
        close: '설정 닫기',
        tabPrompt: '프롬프트 템플릿',
        tabAi: 'AI 모델 설정',
        templateLabel: '편집할 템플릿 선택',
        promptLabel: '시스템 프롬프트 (Prompt)',
        promptDesc: '사용 가능한 변수: {date} (기준 날짜), {item_count} (목표 항목 수)',
        resetPrompt: '기본 프롬프트로 복원',
        promptResetToast: '✨ "{name}" 템플릿의 프롬프트를 기본값으로 복원했습니다',
        itemCountLabel: '출력 항목 수 설정',
        providerLabel: 'API 제공업체',
        apiKeyLabel: 'API Key',
        apiKeyPlaceholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        baseUrlLabel: 'API 기본 주소 (Base URL)',
        baseUrlPlaceholder: 'https://api.deepseek.com/v1',
        modelLabel: '모델 이름 (Model Name)',
        modelPlaceholder: 'deepseek-chat',
        testBtn: 'API 연결 테스트',
        testingBtn: '연결 테스트 중…',
        saveBtn: '설정 저장',
        saveSuccessToast: '⚙️ 설정이 성공적으로 저장되었습니다',
        apiKeyRequiredToast: '연결 테스트 전에 API Key 를 입력해 주세요',
        testSuccessToast: '✅ API 연결 성공! (응답 속도: {latency}ms)',
        testFailedToast: '❌ 연결 실패: {error}'
      },
      templates: {
        technical: '기술 요약형',
        executive: '경영진 보고형',
        concise: '간편 스탠드업형'
      },
      itemCountOptions: {
        '2-3': '2 ~ 3 개 항목 (간결하게)',
        '3-5': '3 ~ 5 개 항목 (표준 균형)',
        '5-8': '5 ~ 8 개 항목 (상세하게)',
        'auto': '자동 맞춤 (커밋 양에 따라)'
      },
      toast: {
        clipboardImportSuccess: '📋 클립보드에서 {count}개의 커밋을 가져왔습니다!',
        aiConfigDetected: '⚙️ 로컬 AI 설정이 감지되었습니다',
        repoParsed: '✅ "{name}" 저장소에서 {count}개의 커밋을 성공적으로 불러왔습니다!',
        copySuccess: '📋 내용이 클립보드에 복사되었습니다!',
        languageSwitched: '🌐 언어가 변경되었습니다: {lang}'
      },
      whimsy: {
        loadingQuotes: [
          '☕ Git 커밋 기록에서 핵심 가치만 농축 추출하는 중...',
          '✨ 10개의 fix: typo 를 중대한 아키텍처 개선으로 승화 중...',
          '🤖 한 줄 코드에 하루를 쏟은 이유를 AI에게 설명하는 중...',
          '🚀 업무의 밀도를 맞추고 시너지를 극대화하는 중...',
          '🎨 오늘의 피땀눈물을 가장 빛나게 해줄 수사를 찾는 중...',
          '☕ 커피 한 잔 즐기세요, 최고의 업무보고서가 곧 완성됩니다...'
        ],
        copyToastPlain: '📋 텍스트 복사 완료! 팀장님을 감동시킬 준비 완료!',
        copyToastMd: '📝 Markdown 복사 완료! 예술 작품처럼 깔끔한 포맷팅.',
        copyToastHtml: '✨ 서식 텍스트 복사 완료! 붙여넣기만 하면 완벽한 보고서 완성.',
        achievementTitle: '🏆 히든 칭호 획득',
        achievementName: '【야생의 코드 아티스트】',
        achievementDesc: '축하합니다! 코드와 일일보고 사이에서 순수한 호기심과 탐구심을 지켜내셨습니다.',
        achievementQuote: '「Talk is cheap, show me the daily report.」',
        closeAchievement: '조용히 받기'
      },
      shortcuts: {
        title: '키보드 단축키 안내',
        subtitle: '일일 워크플로우를 가속화하는 글로벌 단축키',
        generateReport: 'AI 일일 업무보고 즉시 생성',
        copyMarkdown: 'Markdown 형식 빠른 복사',
        openSettings: '시스템 및 AI 설정 열기',
        toggleShortcuts: '단축키 가이드 표시/숨김',
        escape: '팝업 닫기 / 취소',
        close: '확인'
      }
    }
  };

  function detectInitialLocale() {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved && MESSAGES[saved]) {
        return saved;
      }
      const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (navLang.startsWith('zh')) return 'zh-CN';
      if (navLang.startsWith('ja')) return 'ja-JP';
      if (navLang.startsWith('ko')) return 'ko-KR';
      if (navLang.startsWith('en')) return 'en-US';
    } catch (e) {
      console.warn('[useI18n] Error detecting browser locale', e);
    }
    return 'zh-CN';
  }

  // Singleton reactive state for global synchronization across all Vue components
  const { ref, computed } = window.Vue;
  const currentLocale = ref(detectInitialLocale());

  function useI18n() {
    const locale = currentLocale;

    const currentLocaleInfo = computed(() => {
      return SUPPORTED_LOCALES.find(l => l.code === locale.value) || SUPPORTED_LOCALES[0];
    });

    function setLocale(newLocale) {
      if (MESSAGES[newLocale]) {
        locale.value = newLocale;
        try {
          localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
          document.documentElement.setAttribute('lang', newLocale);
        } catch (e) {
          console.warn('[useI18n] Failed to persist locale', e);
        }
      }
    }

    /**
     * Translate key with optional parameter interpolation
     * Usage: t('repo.countBadge', { count: 5 }) or t('app.title')
     */
    function t(path, params = {}) {
      if (!path) return '';
      const dict = MESSAGES[locale.value] || MESSAGES['zh-CN'];
      const fallbackDict = MESSAGES['zh-CN'];

      const resolve = (obj, p) => {
        const keys = p.split('.');
        let cur = obj;
        for (const k of keys) {
          if (cur && typeof cur === 'object' && k in cur) {
            cur = cur[k];
          } else {
            return undefined;
          }
        }
        return cur;
      };

      let val = resolve(dict, path);
      if (val === undefined) {
        val = resolve(fallbackDict, path);
      }
      if (val === undefined) {
        return path;
      }

      if (typeof val === 'string' && params && typeof params === 'object') {
        return val.replace(/\{(\w+)\}/g, (match, key) => {
          return params[key] !== undefined ? params[key] : match;
        });
      }

      return val;
    }

    return {
      locale,
      currentLocaleInfo,
      supportedLocales: SUPPORTED_LOCALES,
      setLocale,
      t
    };
  }

  window.useI18n = useI18n;
})(window);

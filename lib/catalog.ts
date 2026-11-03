export type Category = 'all' | 'research' | 'creative' | 'business';
export const categories: {id: Category; label: string}[] = [
  { id: 'all', label: '全部任务' }, { id: 'research', label: '研究与分析' },
  { id: 'creative', label: '内容与设计' }, { id: 'business', label: '业务与开发' },
];
export const templates = [
  { id: 'research', title: '行业调研报告', description: '从海量信息里，找到值得行动的洞察。', category: 'research', label: 'RESEARCH / REPORT', output: '研究报告 · 来源清单', prompt: '帮我调研一个行业，比较主流产品，找到新的市场机会。', color: 'peach', crew: ['研究 Agent', '分析 Agent', '写作 Agent'], steps: ['明确研究范围，收集可信来源', '比较市场与产品，提炼关键发现', '整理报告，并附上信息来源'] },
  { id: 'brand', title: '品牌内容策划', description: '把品牌想法，变成有节奏的内容计划。', category: 'creative', label: 'CONTENT / CAMPAIGN', output: '内容方案 · 发布日历', prompt: '为我的品牌策划一周社交媒体内容，让更多人了解我们。', color: 'lavender', crew: ['策略 Agent', '创作 Agent', '编辑 Agent'], steps: ['理解品牌定位与目标受众', '规划内容主题与表达方向', '编排发布日历与内容草稿'] },
  { id: 'slides', title: '商业演示文稿', description: '整理重点，让复杂的业务清楚动人。', category: 'creative', label: 'STORY / PRESENTATION', output: '演示大纲 · 逐页文案', prompt: '把我的产品想法，整理成一份清晰、有说服力的商业演示文稿。', color: 'sand', crew: ['策划 Agent', '写作 Agent', '设计 Agent'], steps: ['提炼业务目标与核心故事', '设计演示结构与叙事顺序', '整理逐页文案与视觉建议'] },
  { id: 'data', title: '业务数据分析', description: '从数字背后，发现下一步增长机会。', category: 'research', label: 'DATA / INSIGHTS', output: '分析报告 · 行动建议', prompt: '分析我的业务数据，找到增长机会，并给出下一步行动建议。', color: 'mint', crew: ['数据 Agent', '分析 Agent', '策略 Agent'], steps: ['确认业务问题与数据口径', '分析趋势，定位问题与机会', '整理可执行的行动建议'] },
  { id: 'web', title: '产品落地页', description: '让产品价值，成为用户看得懂的页面。', category: 'business', label: 'WEB / PRODUCT', output: '页面方案 · 转化文案', prompt: '为我的新产品规划一个落地页，清晰传达价值，引导用户开始体验。', color: 'blue', crew: ['产品 Agent', '设计 Agent', '开发 Agent'], steps: ['明确产品价值与目标用户', '规划页面结构与体验路径', '协同设计、开发与内容交付'] },
  { id: 'prototype', title: '企业工具原型', description: '把重复的工作，变成顺手的工具。', category: 'business', label: 'BUILD / PROTOTYPE', output: '需求说明 · 工具原型', prompt: '把团队重复的工作流程，变成一个简单、顺手的内部工具。', color: 'rose', crew: ['产品 Agent', '开发 Agent', '测试 Agent'], steps: ['梳理真实场景与核心需求', '拆解页面、角色与业务流程', '搭建原型，验证核心工作流'] },
] as const;
export type Template = typeof templates[number];

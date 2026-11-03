export type ChatMessage = { role: 'user' | 'assistant'; text: string; action?: 'draft' | 'new' };
export type Activity = { id: string; time: string; title: string; detail: string; stage: number };
export type WorkspaceTask = {
  id: string; goal: string; format: string; audience: string; phase: number;
  paused: boolean; needsRevision: boolean; draft: string; revision: number;
  activities: Activity[]; messages: ChatMessage[];
};

export const crew = [
  { name: '情报侦察员', role: '发现值得说的事', step: '收集灵感', color: 'mint', icon: 'search', output: '围绕目标整理信息线索，明确还需要补充的素材。' },
  { name: '选题策划师', role: '找到打动人的切口', step: '确定选题', color: 'lavender', icon: 'compass', output: '从用户问题、产品价值和使用场景三个角度，选择内容方向。' },
  { name: '内容主笔', role: '把想法写成好内容', step: '完成初稿', color: 'blue', icon: 'pen', output: '按选定平台编排开头、核心信息和行动引导，形成可编辑草稿。' },
  { name: '事实编辑', role: '让每一句更有依据', step: '校对与确认', color: 'peach', icon: 'shield', output: '提醒核实数据与来源，检查表达。最终内容由你阅读并确认。' },
  { name: '分发助手', role: '为每个平台做好准备', step: '准备分发', color: 'rose', icon: 'send', output: '模拟整理平台格式和发布清单，不连接账号、不对外发布。' },
  { name: '数据复盘师', role: '让下一次做得更好', step: '整理交付', color: 'sand', icon: 'chart', output: '汇总内容与后续建议。当前没有真实阅读量、粉丝或收益数据。' },
] as const;

export function activity(title: string, detail: string, stage: number): Activity {
  return { id: crypto.randomUUID(), time: new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit' }).format(new Date()), title, detail, stage };
}

export function createDraft(goal: string, format: string, audience: string) {
  const subject = goal.replace(/[。！!\n]+/g, ' ').trim();
  const body = `# ${subject}\n\n你是否也有这样的困扰：想把一件事做好，却不知道从哪一步开始？\n\n这次，我们从「${subject}」出发，为${audience}整理一份可以实践的行动思路。\n\n01 / 先把目标说清楚\n写下你希望解决的问题，以及完成后想看到的结果。具体的目标，能让后续每一步更有方向。\n\n02 / 从一个小场景开始\n选择你最熟悉、最常遇到的场景，先完成一件小事，再根据反馈持续调整。\n\n03 / 留下属于自己的判断\n工具可以帮你梳理和表达，但具体案例、产品信息和效果，需要结合真实素材补充与核实。\n\n${format === '小红书图文' ? '收藏这份思路，试着迈出第一步。你最想先解决哪个问题？\n\n#工作灵感 #实用分享 #从想法到行动' : format === 'X 长帖' ? '你的第一步会是什么？欢迎分享你的做法。\n\n— 以上内容可拆分为 4 条连续帖子。' : '从今天的一件小事开始，把想法变成行动。欢迎留言，聊聊你的实践。'}\n\n---\n本地模板草稿 · 尚未调用 AI 模型。请补充真实案例、来源与品牌信息后再使用。`;
  return body;
}

export function createTask(goal: string, format: string, audience: string, sample = false): WorkspaceTask {
  return { id: crypto.randomUUID(), goal, format, audience, phase: sample ? 3 : 0, paused: false, needsRevision: false,
    draft: createDraft(goal, format, audience), revision: 1, messages: [],
    activities: sample ? [
      activity('事实编辑 · 等你确认', '示例草稿已就绪，请阅读内容并补充真实依据。', 3),
      activity('内容主笔 · 模板草稿已整理', `已按${format}结构编排内容。`, 2),
      activity('选题策划师 · 方向已确定', '从具体问题切入，用行动建议收尾。', 1),
      activity('情报侦察员 · 素材清单已整理', '演示使用本地示例，未检索实时信息。', 0),
    ] : [activity('领航助手 · 机组已就位', '按已确认的计划开始交互演示。', 0)] };
}

export function taskStatus(task: WorkspaceTask) {
  if (task.phase === 6) return '演示已完成';
  if (task.needsRevision) return '待调整';
  if (task.paused) return '已暂停';
  if (task.phase === 3) return '等你确认';
  return '协作演示中';
}

export function nextTask(task: WorkspaceTask): WorkspaceTask {
  if (task.paused || task.phase === 3 || task.phase === 6) return task;
  const phase = task.phase + 1;
  return { ...task, phase, activities: [activity(`${crew[task.phase].name} · ${crew[task.phase].step}已完成`, phase === 3 ? '草稿已就绪，流程会在这里等待你的决定。' : phase === 6 ? '内容与分发清单已整理，可查看或导出。' : '已将成果交给下一位机组成员。', task.phase), ...task.activities] };
}

export function assistantReply(input: string, task: WorkspaceTask): ChatMessage {
  if (/新建|新任务|重新开始/.test(input)) return { role: 'assistant', text: '我们从一个清晰的目标开始。我会带你确认内容方向、受众和平台，再一起查看协作计划。', action: 'new' };
  if (/发布|分发|账号|连接/.test(input)) return { role: 'assistant', text: `这份内容面向${task.format}。当前支持整理草稿和模拟分发清单，尚未连接发布账号。确认后可导出内容，再由你到平台发布。`, ...(task.phase >= 3 ? { action: 'draft' as const } : {}) };
  if (/数据|阅读|收益|粉丝|来源|事实|核实/.test(input)) return { role: 'assistant', text: '当前没有实时检索或平台数据。建议补充：① 官方产品说明；② 真实使用案例；③ 数据原始链接和日期。没有来源的效果承诺，建议删去或改为可验证的描述。', ...(task.phase >= 3 ? { action: 'draft' as const } : {}) };
  if (/修改|优化|简洁|口语|标题|草稿|文案|看看|查看/.test(input)) return { role: 'assistant', text: task.phase < 3 ? '内容主笔还在演示流程中，完成后会停在确认节点。你可以先查看各成员的分工，也可以暂停流程。' : `建议把开头改为一个具体问题，中间保留 3 个行动建议，结尾只留下一个邀请。点击下方打开草稿，可直接编辑并保存；保存后会重新等待你的确认。当前为本地引导，未调用 AI 改写。`, ...(task.phase >= 3 ? { action: 'draft' as const } : {}) };
  return { role: 'assistant', text: task.phase === 6 ? '本次演示已完成。你可以在「交付成果」查看草稿与分发清单，或导出 Markdown。接下来也可以新建任务，试试不同的受众和内容平台。' : task.phase === 3 ? `「${task.goal}」已到确认节点。建议先阅读草稿，检查信息是否准确、语气是否适合${task.audience}。满意后确认继续，需要调整则编辑保存。` : `当前在「${crew[task.phase].step}」阶段${task.paused ? '，流程已暂停，可点击继续协作' : '，机组正按计划进行本地演示'}。到校对与确认节点时会停下来，等你决定下一步。`, ...(task.phase >= 3 ? { action: 'draft' as const } : {}) };
}

export function isSavedTask(value: unknown): value is WorkspaceTask {
  if (!value || typeof value !== 'object') return false;
  const t = value as WorkspaceTask;
  return typeof t.id === 'string' && typeof t.goal === 'string' && typeof t.format === 'string' && typeof t.audience === 'string' && Number.isInteger(t.phase) && t.phase >= 0 && t.phase <= 6 && typeof t.paused === 'boolean' && typeof t.needsRevision === 'boolean' && typeof t.draft === 'string' && Number.isInteger(t.revision) && t.revision > 0 && Array.isArray(t.messages) && t.messages.every(m => m && ['user', 'assistant'].includes(m.role) && typeof m.text === 'string' && (m.action === undefined || ['draft', 'new'].includes(m.action))) && Array.isArray(t.activities) && t.activities.every(a => a && typeof a.id === 'string' && typeof a.title === 'string' && typeof a.detail === 'string' && typeof a.time === 'string' && Number.isInteger(a.stage) && a.stage >= 0 && a.stage <= 6);
}

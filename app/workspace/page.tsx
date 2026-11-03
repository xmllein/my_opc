'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ConfigProvider, Modal } from 'antd';
import { Activity, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Bot, Check, ChevronDown, ChevronRight, CircleHelp, Compass, Copy, FileCheck2, FileText, LayoutDashboard, ListChecks, LoaderCircle, Menu, MessageSquare, MoreHorizontal, Network, Pause, PenLine, Play, Plus, Search, Send, ShieldCheck, Sparkles, TrendingUp, Users, X } from 'lucide-react';
import { activity, assistantReply, createTask, crew, isSavedTask, nextTask, taskStatus, type WorkspaceTask } from '@/lib/workspace';
import './workspace.css';

const iconSet = [Search, Compass, PenLine, ShieldCheck, Send, TrendingUp];
const formats = ['小红书图文', 'X 长帖', '公众号文章'];
const audiences = ['AI 工具探索者', '品牌潜在用户', '内容创作者'];
type View = 'overview' | 'deliveries' | 'activity';
const storageKey = 'opc-workspace-v1';

export default function Workspace() {
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [activeId, setActiveId] = useState('');
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [view, setView] = useState<View>('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [chat, setChat] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [wizard, setWizard] = useState(0);
  const [goal, setGoal] = useState('');
  const [format, setFormat] = useState(formats[0]);
  const [audience, setAudience] = useState(audiences[0]);
  const [draftOpen, setDraftOpen] = useState(false);
  const [editDraft, setEditDraft] = useState('');
  const [stageOpen, setStageOpen] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [smallScreen, setSmallScreen] = useState(false);
  const [compactScreen, setCompactScreen] = useState(false);
  const chatList = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const assistantRef = useRef<HTMLElement>(null);
  const task = tasks.find(t => t.id === activeId) ?? tasks[0];
  const hasRunningTasks = tasks.some(t => !t.paused && t.phase !== 3 && t.phase !== 6);

  useEffect(() => {
    const small = window.matchMedia('(max-width: 640px)');
    const compact = window.matchMedia('(max-width: 1090px)');
    const sync = () => { setSmallScreen(small.matches); setCompactScreen(compact.matches); };
    sync(); small.addEventListener('change', sync); compact.addEventListener('change', sync);
    return () => { small.removeEventListener('change', sync); compact.removeEventListener('change', sync); };
  }, []);

  const overlayOpen = (smallScreen && mobileNav) || (compactScreen && assistantOpen);
  useEffect(() => {
    if (!overlayOpen) return;
    const panel = assistantOpen ? assistantRef.current : sidebarRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),textarea:not(:disabled)') ?? []).filter(el => el.getClientRects().length > 0);
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement | null)?.closest('.ant-modal')) return;
      if (event.key === 'Escape') { setAssistantOpen(false); setMobileNav(false); }
      if (event.key === 'Tab') {
        const elements = focusable();
        const first = elements[0]; const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [overlayOpen, assistantOpen]);

  useEffect(() => {
    let initial: WorkspaceTask[] = [];
    let selected = '';
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved?.version === 1 && Array.isArray(saved.tasks)) {
        initial = saved.tasks.filter(isSavedTask);
        selected = typeof saved.activeId === 'string' ? saved.activeId : '';
      }
    } catch { setStorageError(true); }
    if (!initial.length) initial = [createTask('让 AI 成为你的内容创作搭档', formats[0], audiences[0], true)];
    setTasks(initial);
    setActiveId(initial.some(t => t.id === selected) ? selected : initial[0].id);
    const initialGoal = new URLSearchParams(window.location.search).get('goal');
    if (initialGoal) { setGoal(initialGoal.slice(0, 200)); setNewOpen(true); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, activeId, tasks })); setStorageError(false); }
    catch { setStorageError(true); }
  }, [ready, activeId, tasks]);

  useEffect(() => {
    if (!ready || !hasRunningTasks) return;
    const timer = window.setInterval(() => setTasks(current => current.map(nextTask)), 2400);
    return () => window.clearInterval(timer);
  }, [ready, hasRunningTasks]);

  useEffect(() => { if (chatList.current) chatList.current.scrollTop = chatList.current.scrollHeight; }, [task?.messages.length, assistantOpen]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 3500); return () => window.clearTimeout(timer); }, [toast]);

  function updateTask(change: (t: WorkspaceTask) => WorkspaceTask) { if (task) setTasks(current => current.map(t => t.id === task.id ? change(t) : t)); }
  function openNew() { setWizard(0); setGoal(''); setNewOpen(true); setMobileNav(false); }
  function openDraft() { if (!task || task.phase < 3) return; setEditDraft(task.draft); setDraftOpen(true); }
  function approve() {
    if (!task || task.phase !== 3 || task.needsRevision) return;
    updateTask(t => ({ ...t, phase: 4, paused: false, activities: [activity('你 · 已确认草稿', '继续模拟分发与交付，不会对外发布。', 3), ...t.activities] }));
    setDraftOpen(false); setToast('已确认，机组继续整理交付内容');
  }
  function saveDraft() {
    if (!task || !editDraft.trim()) return;
    const changed = editDraft.trim() !== task.draft;
    if (changed || task.needsRevision) updateTask(t => ({ ...t, draft: editDraft.trim(), revision: changed ? t.revision + 1 : t.revision, phase: 3, paused: false, needsRevision: false, activities: [activity('你 · 已保存草稿', '内容回到确认节点，请重新阅读后确认。', 3), ...t.activities] }));
    setDraftOpen(false); setToast(changed || task.needsRevision ? '草稿已保存，等待你的最终确认' : '草稿未改动，已保留当前版本');
  }
  function reject() {
    updateTask(t => ({ ...t, paused: true, needsRevision: true, activities: [activity('你 · 请求调整内容', '已保留草稿，编辑保存后可重新确认。', 3), ...t.activities] }));
    setDraftOpen(false); setToast('已退回调整。打开草稿，编辑并保存后可继续');
  }
  function sendChat(value = chat) {
    if (!value.trim() || !task) return;
    const input = value.trim().slice(0, 500);
    updateTask(t => ({ ...t, messages: [...t.messages, { role: 'user' as const, text: input }, assistantReply(input, t)].slice(-40) }));
    setChat('');
  }
  function startTask() {
    const created = createTask(goal.trim(), format, audience);
    setTasks(current => [created, ...current]); setActiveId(created.id); setView('overview'); setNewOpen(false); setToast('任务已创建，开始体验机组协作');
  }
  function exportDraft() {
    if (!task) return;
    const text = `${task.draft}\n\n## 分发清单\n- 目标平台：${task.format}\n- 目标受众：${task.audience}\n- 补充真实案例与信息来源\n- 确认标题、段落与平台排版\n- 由你前往平台完成发布\n\n状态：${taskStatus(task)} · 未对外发布`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `OPC-${task.goal.replace(/[\\/:*?"<>|]/g, '').slice(0, 40)}.md`; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); setToast('内容与分发清单已导出');
  }
  async function copyDraft() {
    try { await navigator.clipboard.writeText(editDraft); setToast('草稿已复制'); }
    catch { setToast('复制未成功，请在草稿中选择文字后复制'); }
  }

  if (!ready || !task) return <div className="ws-loading"><img src="/brand/OPC-compact-color.svg" width="112" height="34" alt="OPC" /><LoaderCircle size={22} className="ws-spin" /><p>正在为你准备工作台…</p></div>;
  const complete = task.phase === 6;
  const review = task.phase === 3;
  const progress = Math.round(task.phase / 6 * 100);
  const stageStatus = (i: number) => i < task.phase ? '已完成' : i > task.phase ? '等待接力' : task.paused ? task.needsRevision ? '待调整' : '已暂停' : i === 3 ? '等你确认' : '进行中';
  const changedDraft = editDraft.trim() !== task.draft;

  return <ConfigProvider theme={{ token: { colorPrimary: '#F25A1A', borderRadius: 12, fontFamily: 'inherit' }, components: { Modal: { contentBg: '#fcfbf8' } } }}>
    <div className="ws-app">
      {mobileNav && <button className="ws-nav-backdrop" aria-label="关闭导航" onClick={() => setMobileNav(false)} />}
      <aside ref={sidebarRef} className={`ws-sidebar ${mobileNav ? 'is-open' : ''}`} role={smallScreen ? 'dialog' : undefined} aria-modal={smallScreen && mobileNav ? true : undefined} aria-label="工作空间导航" inert={(smallScreen && !mobileNav) || (compactScreen && assistantOpen)}>
        <Link href="/" className="ws-brand" aria-label="返回 OPC 首页"><img src="/brand/OPC-compact-color.svg" width="100" height="30" alt="OPC" /><span>WORKSPACE</span></Link>
        <div className="ws-space"><span className="ws-space-icon"><Network size={18} /></span><div><strong>我的创作空间</strong><span>YOU PILOT. WE CREW.</span></div><span className="ws-online" /></div>
        <button className="ws-new" onClick={openNew}><Plus size={17} />新建创作任务<span>↗</span></button>
        <div className="ws-nav-caption">工作空间</div>
        <nav className="ws-nav" aria-label="工作台导航">
          {([{ id: 'overview', label: '协作总览', icon: LayoutDashboard }, { id: 'deliveries', label: '交付成果', icon: FileCheck2 }, { id: 'activity', label: '协作动态', icon: Activity }] as const).map(n => <button key={n.id} aria-current={view === n.id ? 'page' : undefined} className={view === n.id ? 'active' : ''} onClick={() => { setView(n.id); setMobileNav(false); }}><n.icon size={17} />{n.label}{n.id === 'overview' && review && <span className="ws-count">1</span>}{n.id === 'deliveries' && <small>{task.phase >= 3 ? '01' : '00'}</small>}</button>)}
        </nav>
        <div className="ws-nav-caption ws-task-caption">我的任务 <span>{String(tasks.length).padStart(2, '0')}</span></div>
        <div className="ws-task-list">{tasks.map(t => <button key={t.id} className={t.id === task.id ? 'selected' : ''} onClick={() => { setActiveId(t.id); setView('overview'); setMobileNav(false); setChat(''); }}><span className={`ws-task-dot ${t.phase === 6 ? 'done' : t.phase === 3 ? 'waiting' : ''}`} /><span>{t.goal}<small>{t.format} · {taskStatus(t)}</small></span></button>)}</div>
        <div className="ws-sidebar-bottom"><div className="ws-sidebar-tip"><Sparkles size={17} /><strong>你定方向，机组接力。</strong><p>不必一次想清所有细节，<br />从一个小目标开始就好。</p><button onClick={() => setHelpOpen(true)}>了解协作方式<ArrowUpRight size={13} /></button></div><button className="ws-help-link" onClick={() => setHelpOpen(true)}><CircleHelp size={16} />工作台使用指南<ArrowUpRight size={13} /></button><Link href="/" className="ws-home-link"><ArrowLeft size={15} />返回任务广场</Link><div className="ws-user"><span>我</span><div><strong>我的工作空间</strong><small>本地体验版</small></div><ShieldCheck size={16} /></div></div>
      </aside>

      <div className="ws-shell">
        <header className="ws-topbar" inert={overlayOpen}><div><button className="ws-icon ws-menu" aria-label="打开工作台导航" onClick={() => setMobileNav(true)}><Menu size={20} /></button><span>工作空间</span><ChevronRight size={13} /><strong>{view === 'overview' ? '协作总览' : view === 'deliveries' ? '交付成果' : '协作动态'}</strong></div><div><span className="ws-demo"><span />交互演示</span><span className="ws-save-state">{storageError ? '当前仅在会话内保留' : '自动保存于此浏览器'}</span><button className="ws-icon" aria-label="打开使用指南" onClick={() => setHelpOpen(true)}><CircleHelp size={18} /></button><span className="ws-avatar">我</span></div></header>
        <div className="ws-content-layout">
          <main className="ws-main" id="workspace-main" inert={overlayOpen}>
            <div className="ws-heading"><div><div className="ws-eyebrow">YOUR IDEAS. IN GOOD HANDS.</div><h1>{view === 'overview' ? '好想法，正在发生' : view === 'deliveries' ? '让成果，随时可用' : '每一步，都有迹可循'}<span className="ws-heading-dot">。</span></h1><p>{view === 'overview' ? '让机组处理繁琐，把重要的判断留给你。' : view === 'deliveries' ? '从草稿到分发清单，在这里查看、修改与带走。' : '查看机组的接力过程，也回顾你做出的每一个决定。'}</p></div><button className="ws-secondary ws-new-desktop" onClick={openNew}><Plus size={15} />新建任务</button></div>

            <section className="ws-mission" aria-label="当前任务"><div className="ws-mission-top"><span className="ws-mission-symbol"><PenLine size={20} /></span><div className="ws-mission-title"><span>当前创作任务 <span className="ws-mission-id">/ {task.format}</span></span><h2>{task.goal}</h2></div><span className={`ws-status ${complete ? 'done' : review ? 'waiting' : ''}`}><span />{taskStatus(task)}</span></div><div className="ws-mission-bottom"><div><Users size={13} /><span>{task.audience}</span><span className="ws-meta-divider" /><Bot size={14} /><span>6 位机组成员</span></div><span className="ws-progress-label">{task.phase}/6 阶段完成 <strong>{progress}%</strong></span></div><div className="ws-progress"><span style={{ width: `${progress}%` }} /></div></section>

            {view === 'overview' && <>
              <section className={`ws-next-action ${complete ? 'is-complete' : ''}`} aria-live="polite"><div className="ws-action-icon">{complete ? <Check size={20} /> : review ? <FileCheck2 size={21} /> : <Network size={20} />}</div><div><span className="ws-small-label">{complete ? '本次交付已就绪' : review ? '下一步，需要你的判断' : task.paused ? '随时可以继续' : '机组正在接力'}</span><h3>{complete ? '内容已整理好，带走你的创作成果。' : task.needsRevision ? '给草稿一点调整，让表达更接近你。' : review ? '草稿已就绪，来做最后一次把关。' : task.paused ? '流程已暂停，成果会为你保留。' : `${crew[task.phase].name}正在${crew[task.phase].step}。`}</h3><p>{complete ? '查看内容、核实信息后，可自行前往平台发布。' : review ? '读一读内容，修改不合适的表达，满意后再继续。' : '到确认节点会自动停下，重要决定始终由你来做。'}</p></div><button className="ws-primary" onClick={complete ? () => setView('deliveries') : review ? openDraft : () => updateTask(t => ({ ...t, paused: !t.paused, activities: [activity(`你 · ${t.paused ? '继续' : '暂停'}协作演示`, '当前进度与草稿已保留。', t.phase), ...t.activities] }))}>{complete ? '查看成果' : review ? task.needsRevision ? '修改草稿' : '查看并确认' : task.paused ? '继续协作' : '暂停协作'}{review || complete ? <ArrowRight size={15} /> : task.paused ? <Play size={14} /> : <Pause size={14} />}</button></section>

              <section className="ws-crew-section"><div className="ws-section-title"><div><h2>你的内容机组<span>CREW IN ACTION</span></h2><p>每个人做好一件事，让好内容一步步成形。</p></div><span className="ws-live-label"><span />{complete ? '本次协作已完成' : review || task.paused ? '等待你的下一步' : '协作演示中'}</span></div>
                <div className="ws-flow-board"><div className="ws-flow-toolbar"><span><Network size={14} />内容生产线</span><span>点击成员，查看分工与成果<ArrowUpRight size={12} /></span></div><div className="ws-crew-grid">{crew.map((member, i) => { const Icon = iconSet[i]; const done = i < task.phase; const current = i === task.phase; return <button key={member.name} className={`ws-crew-node ${current ? 'current' : ''} ${done ? 'completed' : ''} ${i > task.phase ? 'pending' : ''}`} onClick={() => setStageOpen(i)}><div className="ws-node-head"><span className={`ws-agent-symbol ${member.color}`}><Icon size={21} strokeWidth={1.7} /></span><span className={`ws-node-state ${current && i === 3 ? 'waiting' : ''}`}>{done ? <Check size={11} /> : current && !review && !task.paused ? <LoaderCircle size={11} className="ws-spin" /> : <span />}{stageStatus(i)}</span></div><div className="ws-node-title"><h3>{member.name}</h3><ArrowUpRight size={14} /></div><p>{member.role}</p><div className="ws-node-foot"><span>0{i + 1}<span>/</span>{member.step}</span><span>{done ? '100%' : current ? task.needsRevision ? '待调整' : task.paused ? '已暂停' : review ? '待确认' : '进行中' : '—'}</span></div>{i < 5 && <span className="ws-node-connector" aria-hidden="true"><ChevronRight size={15} /></span>}</button>; })}</div><div className="ws-flow-bottom"><div><span className="ws-commander"><Bot size={15} /></span><span><strong>领航助手</strong>协调分工，陪你做决定</span></div><span><ShieldCheck size={13} />关键节点由你确认</span></div></div>
              </section>

              <div className="ws-lower-grid"><section className="ws-activity-card"><div className="ws-card-title"><h2>最近动态</h2><button onClick={() => setView('activity')}>查看全部<ArrowUpRight size={13} /></button></div><div className="ws-timeline">{task.activities.slice(0, 3).map((item, i) => <div className="ws-timeline-item" key={item.id}><span className={`ws-timeline-dot ${i === 0 ? 'latest' : ''}`} /><div><strong>{item.title}</strong><p>{item.detail}</p></div><time>{item.time}</time></div>)}</div></section><section className="ws-delivery-card"><div className="ws-card-title"><h2>本次交付</h2><span>01</span></div><div className="ws-delivery-preview"><span className="ws-file-symbol"><FileText size={23} /></span><div><strong>{task.format} · 内容草稿</strong><p>{task.phase >= 3 ? `V${task.revision} · 可编辑的 Markdown` : '正在准备中，到确认节点即可查看'}</p></div></div><div className="ws-delivery-bottom"><span><span className={`ws-task-dot ${complete ? 'done' : 'waiting'}`} />{complete ? '可导出' : task.phase >= 3 ? '待你审阅' : '等待机组整理'}</span><button disabled={task.phase < 3} onClick={openDraft}>查看草稿<ArrowRight size={14} /></button></div></section></div>
              <div className="ws-bottom-note"><ShieldCheck size={13} /><span>当前为本地交互演示。内容来自模板，未调用模型、检索实时信息或对外发布。</span></div>
            </>}

            {view === 'deliveries' && <section className="ws-results"><div className="ws-section-title"><div><h2>任务交付<span>YOUR DELIVERABLES</span></h2><p>内容由你把关，成果由你带走。</p></div></div>{task.phase < 3 ? <div className="ws-empty"><FileText size={34} /><h3>第一份草稿，还在路上。</h3><p>机组完成创作后，草稿会出现在这里。</p><button className="ws-secondary" onClick={() => setView('overview')}>返回查看进度<ArrowRight size={14} /></button></div> : <><article className="ws-result-item"><span className="ws-file-symbol"><FileText size={26} /></span><div><span className="ws-small-label">内容草稿 / V{task.revision}</span><h3>{task.goal}</h3><p>{task.format} · {task.audience} · {taskStatus(task)}</p></div><button className="ws-secondary" onClick={openDraft}>查看与编辑<ArrowUpRight size={14} /></button></article><div className="ws-distribution"><div><ListChecks size={20} /><h3>发布前，再检查一次。</h3><span>{complete ? '清单已整理' : '建议核对'}</span></div><ul><li><Check size={14} />确认内容符合品牌语气与目标受众</li><li><Check size={14} />补充真实案例，核实数据与来源</li><li><Check size={14} />检查{task.format}的标题、段落与排版</li><li><Check size={14} />导出后，由你前往平台完成发布</li></ul><p>尚未连接发布平台；这里不会自动对外发布。</p></div><button className="ws-primary" onClick={exportDraft}><ArrowDownToLine size={16} />导出草稿与清单</button></>}</section>}

            {view === 'activity' && <section className="ws-full-activity"><div className="ws-section-title"><div><h2>协作记录<span>ACTIVITY LOG</span></h2><p>以新加坡时间记录，最新动态显示在前。</p></div><span>{task.activities.length} 条记录</span></div><div className="ws-timeline">{task.activities.map((item, i) => <div className="ws-timeline-item" key={item.id}><span className={`ws-timeline-dot ${i === 0 ? 'latest' : ''}`} /><div><strong>{item.title}</strong><p>{item.detail}</p></div><time>{item.time}</time></div>)}</div></section>}
          </main>

          {assistantOpen && <button className="ws-chat-backdrop" aria-label="关闭助手面板" onClick={() => setAssistantOpen(false)} />}
          <aside ref={assistantRef} role={compactScreen ? 'dialog' : undefined} aria-modal={compactScreen && assistantOpen ? true : undefined} className={`ws-assistant ${assistantOpen ? 'is-open' : ''}`} aria-label="领航助手" inert={compactScreen && !assistantOpen}><div className="ws-assistant-header"><span className="ws-assistant-mark"><Sparkles size={20} /></span><div><h2>领航助手</h2><p><span className="ws-online" />和你一起，理清下一步</p></div><button className="ws-icon ws-close-chat" aria-label="关闭领航助手" onClick={() => setAssistantOpen(false)}><X size={18} /></button><button className="ws-icon ws-assistant-help" aria-label="了解助手能力" onClick={() => setHelpOpen(true)}><MoreHorizontal size={20} /></button></div><div className="ws-chat-context"><span>正在协助</span><strong>{task.goal}</strong><ChevronDown size={13} /></div><div className="ws-chat-scroll" ref={chatList}><div className="ws-chat-date">本次任务 · 本地引导</div><div className="ws-assistant-message"><span className="ws-chat-bot"><Sparkles size={14} /></span><div><span className="ws-chat-name">OPC 领航助手</span><div className="ws-message-bubble"><p>你好，机长。<span className="ws-wave">很高兴和你一起创作。</span></p><p>{complete ? '这次的内容与分发清单已整理好，你可以查看并导出。' : review ? '机组已整理好第一版草稿，现在轮到你来定方向。' : task.phase > 3 ? '草稿已确认，机组正在整理分发清单与交付内容。' : '我已把你的目标拆成 6 个步骤，机组会依次接力。'}</p><div className="ws-chat-suggestion"><span>{complete ? '交付已就绪' : review ? '建议你先做这一步' : '接下来会发生什么'}</span><strong>{complete ? '把成果带走，再开始新创作' : review ? '花一点时间，看看草稿' : task.phase > 3 ? '整理交付，再带走成果' : '创作完成后，邀请你确认'}</strong><p>{review ? '确认内容准确、语气合适后，再继续。' : '你随时可以查看分工与任务进度。'}</p>{task.phase >= 3 && <button onClick={openDraft}>{complete ? '查看交付内容' : '带我看看草稿'}<ArrowRight size={14} /></button>}</div></div></div></div>
              {task.messages.map((m, i) => <div className={`ws-chat-message ${m.role}`} key={`${task.id}-${i}`}>{m.role === 'assistant' && <span className="ws-chat-bot"><Sparkles size={14} /></span>}<div className="ws-message-bubble"><p>{m.text}</p>{m.action && <button className="ws-chat-inline-action" onClick={m.action === 'draft' ? openDraft : openNew}>{m.action === 'draft' ? '打开内容草稿' : '一起新建任务'}<ArrowRight size={13} /></button>}</div></div>)}
            </div><div className="ws-assistant-compose"><div className="ws-quick-label"><Sparkles size={12} />你也可以问我</div><div className="ws-quick-prompts">{['现在需要我做什么？', '让文案更简洁', '内容会自动发布吗？'].map(q => <button key={q} onClick={() => sendChat(q)}>{q}<Plus size={11} /></button>)}</div><form className="ws-chat-input" onSubmit={e => { e.preventDefault(); sendChat(); }}><label htmlFor="ws-chat" className="ws-sr-only">向领航助手提问</label><textarea id="ws-chat" placeholder="说说你的想法，或问问下一步…" value={chat} maxLength={500} rows={2} onChange={e => setChat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); sendChat(); } }} /><div><span><MessageSquare size={12} />围绕当前任务提供引导</span><button disabled={!chat.trim()} type="submit" aria-label="发送给领航助手"><ArrowUp size={16} /></button></div></form><p className="ws-assistant-disclaimer">情境引导演示 · 尚未接入实时 AI</p></div></aside>
        </div>
      </div>
      <button className="ws-floating-assistant" inert={overlayOpen} onClick={() => setAssistantOpen(true)} aria-label="打开领航助手"><Sparkles size={19} />领航助手{review && <span />}</button>
    </div>

    <Modal open={newOpen} onCancel={() => setNewOpen(false)} footer={null} centered width={600} className="ws-modal" title={null} destroyOnHidden><div className="ws-modal-eyebrow"><Sparkles size={16} />LET’S MAKE SOMETHING</div><div className="ws-wizard-progress">{['说说目标', '确认偏好', '机组就位'].map((s, i) => <span className={i <= wizard ? 'active' : ''} key={s}><span>{i < wizard ? <Check size={11} /> : i + 1}</span>{s}</span>)}</div><h2>{wizard === 0 ? '这次，想创作什么？' : wizard === 1 ? '让内容，更贴近你。' : '你的专属机组，已就位。'}</h2><p className="ws-modal-description">{wizard === 0 ? '不用写复杂的提示词，说清想分享的内容就好。' : wizard === 1 ? '选好平台和受众，让每一句话都有方向。' : '先看清每一步，再决定出发。'}</p>{wizard === 0 ? <><label className="ws-field-label" htmlFor="ws-goal">我想要…</label><textarea id="ws-goal" className="ws-goal-field" autoFocus rows={4} maxLength={200} placeholder="例如：为我的咖啡品牌策划一篇新品介绍，让更多年轻人了解冷萃咖啡。" value={goal} onChange={e => setGoal(e.target.value)} /><div className="ws-goal-count">{goal.length}/200</div><div className="ws-example-goals"><span>还没想好？试试这些灵感</span>{['分享 3 个让工作更轻松的 AI 使用技巧', '为独立咖啡品牌写一篇新品介绍', '记录我从零开始做内容的第一周'].map(g => <button key={g} onClick={() => setGoal(g)}>{g}<ArrowUpRight size={13} /></button>)}</div></> : wizard === 1 ? <><fieldset className="ws-options"><legend>你想在哪里分享？</legend>{formats.map(f => <button type="button" aria-pressed={format === f} className={format === f ? 'active' : ''} key={f} onClick={() => setFormat(f)}><FileText size={16} />{f}{format === f && <Check size={13} />}</button>)}</fieldset><fieldset className="ws-options"><legend>主要写给谁看？</legend>{audiences.map(a => <button type="button" aria-pressed={audience === a} className={audience === a ? 'active' : ''} key={a} onClick={() => setAudience(a)}><Users size={16} />{a}{audience === a && <Check size={13} />}</button>)}</fieldset></> : <><div className="ws-plan-goal"><strong>{goal}</strong><span>{format} · {audience}</span></div><ol className="ws-plan">{crew.map((c, i) => <li key={c.name}><span>0{i + 1}</span><strong>{c.step}</strong><small>{i === 3 ? '在这里等你确认' : c.name}</small>{i === 3 ? <ShieldCheck size={15} /> : <Check size={14} />}</li>)}</ol><p className="ws-plan-note"><CircleHelp size={14} />本次为本地流程演示，使用模板草稿，不产生模型调用或发布费用。</p></>}<div className="ws-modal-footer">{wizard > 0 ? <button className="ws-secondary" onClick={() => setWizard(wizard - 1)}><ArrowLeft size={14} />上一步</button> : <span>从一个小目标开始，就很好。</span>}<button className="ws-primary" disabled={!goal.trim()} onClick={() => wizard < 2 ? setWizard(wizard + 1) : startTask()}>{wizard === 0 ? '继续，一起完善' : wizard === 1 ? '看看协作计划' : '确认计划，开始协作'}<ArrowRight size={15} /></button></div></Modal>

    <Modal open={draftOpen} onCancel={() => setDraftOpen(false)} footer={null} centered width={780} className="ws-modal ws-draft-modal" title={null}><div className="ws-modal-eyebrow"><FileText size={15} />YOUR WORDS. YOUR CALL.<span>V{task.revision}{changedDraft ? ' · 有未保存修改' : ''}</span></div><h2>好内容，也需要你的声音。</h2><p className="ws-modal-description">直接编辑下方草稿，补充你的案例与判断。保存修改后，需要重新确认。</p><div className="ws-draft-toolbar"><span>{task.format} · {task.audience}</span><button onClick={copyDraft}><Copy size={13} />复制内容</button></div><label htmlFor="ws-draft" className="ws-sr-only">内容草稿</label><textarea id="ws-draft" className="ws-draft-editor" value={editDraft} onChange={e => setEditDraft(e.target.value)} /><div className="ws-draft-notice"><ShieldCheck size={15} />本地模板未经过事实核查，请核实具体信息后再使用。</div><div className="ws-draft-actions"><div>{review && !task.needsRevision && <button className="ws-text-button" onClick={reject}>退回调整</button>}</div><button className="ws-secondary" disabled={!editDraft.trim()} onClick={saveDraft}>保存{changedDraft ? '修改' : '草稿'}</button>{review && <button className="ws-primary" disabled={changedDraft || task.needsRevision || !editDraft.trim()} onClick={approve}><Check size={15} />确认，继续协作</button>}{complete && !changedDraft && <button className="ws-primary" onClick={exportDraft}><ArrowDownToLine size={15} />导出成果</button>}</div>{changedDraft && <p className="ws-draft-save-hint">请先保存修改，再打开草稿确认。</p>}</Modal>

    <Modal open={stageOpen !== null} onCancel={() => setStageOpen(null)} footer={null} centered width={480} className="ws-modal" title={null}>{stageOpen !== null && (() => { const member = crew[stageOpen]; const Icon = iconSet[stageOpen]; return <><span className={`ws-agent-symbol ws-stage-symbol ${member.color}`}><Icon size={27} /></span><div className="ws-modal-eyebrow">CREW MEMBER / 0{stageOpen + 1}</div><h2>{member.name}</h2><p className="ws-modal-description">{member.role}</p><div className="ws-stage-detail"><span>负责什么</span><p>{member.output}</p><span>当前状态</span><strong>{stageStatus(stageOpen)}</strong>{stageOpen < task.phase && <><span>本次进展</span><p>{task.activities.find(a => a.stage === stageOpen)?.detail ?? '本阶段已完成演示，结果已交给下一位成员。'}</p></>}</div>{stageOpen === 3 && task.phase >= 3 ? <button className="ws-primary" onClick={() => { setStageOpen(null); openDraft(); }}>查看内容草稿<ArrowRight size={15} /></button> : <button className="ws-secondary" onClick={() => setStageOpen(null)}>了解了，返回协作<ArrowRight size={15} /></button>}</>; })()}</Modal>

    <Modal open={helpOpen} onCancel={() => setHelpOpen(false)} footer={null} centered width={530} className="ws-modal" title={null}><div className="ws-modal-eyebrow"><Compass size={16} />YOU’RE ALWAYS THE PILOT</div><h2>把复杂，交给清晰的下一步。</h2><p className="ws-modal-description">工作台把图中的内容机器，变成可以参与的协作流程。</p><div className="ws-guide">{[['01', '从一个目标出发', '新建任务，告诉助手你想创作什么，再选择平台和受众。'], ['02', '让机组依次接力', '点击成员卡片查看职责。流程到确认节点会自动停下。'], ['03', '内容由你把关', '查看草稿、直接修改、退回调整，满意后确认继续。'], ['04', '把成果带走', '在交付成果中导出 Markdown 草稿与分发清单。']].map(([n, title, text]) => <div key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div><p className="ws-plan-note">当前为本地交互演示。助手通过规则提供情境引导，草稿来自模板；未接入 AI 模型、实时检索与发布平台。任务保存在当前浏览器，清除浏览器数据后会丢失。</p><button className="ws-primary" onClick={() => setHelpOpen(false)}>明白了，开始体验<ArrowRight size={15} /></button></Modal>
    {toast && <div className="ws-toast" role="status"><Check size={15} />{toast}</div>}
  </ConfigProvider>;
}


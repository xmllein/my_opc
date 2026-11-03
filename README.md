# OPC · Orange Pilot Crew

Next.js App Router + React + TypeScript。包含品牌首页与内容协作工作台，使用 OPC 官方品牌 Logo 与 Pilot Orange（#F25A1A）。

## 运行

需要 Node.js 20.9+。

```sh
npm install
npm run dev
```

打开 http://127.0.0.1:3000 。生产校验使用 `npm run build`，生产预览使用 `npm start`。

## 功能范围

- 响应式首页、任务分类、任务介绍弹窗、协作流程、生态介绍、FAQ、轻量领航助手。
- 首页“进入工作台”打开 `/workspace`；任务介绍可携带目标进入工作台的新建向导。
- 工作台包含协作总览、交付成果、协作动态，以及根据当前任务状态提供建议的领航助手。
- 三步创建内容任务：填写目标、选择平台与受众、确认六阶段协作计划。
- 六位成员依次进行本地流程演示；支持暂停、继续，并在校对确认节点自动停止。
- 草稿支持查看、编辑、退回调整与确认；保存修改后重新等待确认，记录版本与操作动态。
- 支持复制草稿、导出 Markdown 草稿与分发清单；确认后仅模拟分发与交付，不对外发布。
- 多任务与对话记录保存在当前浏览器 `localStorage`（`opc-workspace-v1`），刷新可恢复；不跨浏览器同步，清除浏览器数据后会丢失。存储不可用时显示会话保留提示。
- 桌面使用三栏布局，窄屏切换为抽屉式导航与助手。
- Ant Design 提供弹窗，Ant Design Web3 + wagmi 提供实际钱包连接组件。
- MetaMask 与 EIP-6963 钱包发现，Ethereum 主网；连接后由组件显示地址与断开连接操作。
- 钱包连接不触发签名、转账、授权额度或付款。需在装有钱包扩展的浏览器或钱包内置浏览器中完成实际连接；未安装时组件提供安装指引。
- **不包含数据库、AI 模型调用、实时检索、真实发布、订阅与支付**。工作台草稿来自本地模板，助手通过规则提供情境引导；任务推进是演示状态流转，不代表真实 Agent 执行。界面明确标注这些边界。
- 首页目标输入框通过关键词匹配选择模板，不发送内容、不调用模型。

## 文件

- `app/page.tsx`：首页与轻量展示交互。
- `app/globals.css`：品牌样式、布局与移动端适配。
- `app/workspace/page.tsx`：内容协作工作台与交互。
- `app/workspace/workspace.css`：工作台布局、视觉与响应式样式。
- `lib/workspace.ts`：任务状态、草稿模板、情境回复与存储数据校验。
- `components/wallet.tsx`：Ant Design Web3 钱包连接。
- `lib/catalog.ts`：任务展示数据。
- `public/brand/`：从官方品牌资料库下载的素材，未改动官方 Logo 文件。

## 参考

- 品牌：https://library.orangepilotcrew.com/en/
- 布局与格调：https://nextme-agent-os.hh18516800822.chatgpt.site/#tasks
- 钱包：https://web3.ant.design/

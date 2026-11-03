# OPC · Orange Pilot Crew

Next.js App Router + React + TypeScript 页面展示首版。视觉参考 NextMe，使用 OPC 官方品牌 Logo 与 Pilot Orange（#F25A1A）。

## 运行

需要 Node.js 20.9+。

```sh
npm install
npm run dev
```

打开 http://127.0.0.1:3000 。生产校验使用 `npm run build`，生产预览使用 `npm start`。

## 本轮范围

- 响应式首页、任务分类、任务介绍弹窗、协作流程、生态介绍、FAQ、轻量领航助手。
- Ant Design 提供弹窗，Ant Design Web3 + wagmi 提供实际钱包连接组件。
- MetaMask 与 EIP-6963 钱包发现，Ethereum 主网；连接后由组件显示地址与断开连接操作。
- 钱包连接不触发签名、转账、授权额度或付款。需在装有钱包扩展的浏览器或钱包内置浏览器中完成实际连接；未安装时组件提供安装指引。
- 按本轮要求，**不包含数据库、任务创建、模型调用、任务执行、订阅与支付**。任务和助手仅提供明确标注的展示交互。
- 目标输入框仅在浏览器内展示对应任务说明，通过关键词匹配选择模板，不发送内容、不调用模型。

## 文件

- `app/page.tsx`：首页与轻量展示交互。
- `app/globals.css`：品牌样式、布局与移动端适配。
- `components/wallet.tsx`：Ant Design Web3 钱包连接。
- `lib/catalog.ts`：任务展示数据。
- `public/brand/`：从官方品牌资料库下载的素材，未改动官方 Logo 文件。

## 参考

- 品牌：https://library.orangepilotcrew.com/en/
- 布局与格调：https://nextme-agent-os.hh18516800822.chatgpt.site/#tasks
- 钱包：https://web3.ant.design/

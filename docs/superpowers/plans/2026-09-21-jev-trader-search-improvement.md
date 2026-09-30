# Jev Trader 搜索入口改造 Implementation Plan

> **For agentic workers:** 使用 writing-plans 对应的 executing-plans 流程逐项实施；默认在当前任务顺序执行，不自动创建子代理。以下复选框用于跟踪进度。

**Goal:** 让搜索 Jev Trader 的访客直接理解本站身份、与上游关系及体验方式，修复初始 HTML 的市场混淆，并建立可比较的搜索表现基线。

**Architecture:** 保留 `/` 默认展示 Hyperliquid 的行为、现有交易面板和路由。路由提供静态市场身份，接口只提供运行状态；首页补充简短的服务端项目介绍，复用现有教程，不另建重复 SEO 页面。

**Tech Stack:** Next.js 16.3.4、React 19.2.8、TypeScript、Bun 1.3.14、现有 HTTP SEO 检查脚本。

## 全局约束

- 用户已在后续消息授权本地修复；不提交、不部署。
- 当前工作区已有大量未提交修改；实施前重新查看 diff，保留他人工作，不整文件覆盖或批量提交。
- 不变更后端交易、会话、订单执行、账户和 API 行为。
- 不把本站描述为原作者或 TypeSafe 官方产品；不把 mock、模拟成交写成真实 Jev 推理或真实交易。
- URL 保持稳定；`/hyperliquid-hype-usdc` 继续以 `/` 为 canonical，Kuru 自引用，不同时建立竞争性的品牌入口。
- 新增首页介绍固定英文并声明 `lang="en"`，不从 localStorage 决定正文；已有仪表盘界面语言选择保持原行为。完整首页多语言路由不属于本批次。
- 不为排名增加无关页面、关键词重复、虚假评价、FAQPage 或 llms.txt；不增加依赖或通用 SEO 框架。
- 需要中文／韩文内容页时，另按现有语言路由、独立 canonical 和互惠 hreflang 规则实施。
- 核心逻辑注释沿用项目的英文注释约定；方案中文表达。

## 检查依据与不确定性

- 2026-09-21，美国与新加坡英文 Google 的 30 项结果快照中，JevList 目标页为混合结果项 13，本站域名未见；不是全球固定排名，也不是纯自然链接第 13 名。
- 对方围绕 Jarrod Watts 原始项目提供指南；本站主要提供扩展后的市场演示。搜索意图和项目身份差异是优先假设，不是已证明的 Google 排名因果。
- 本站首页 HTTP 200、有正文、自引用 canonical，robots 允许抓取。普通及模拟爬虫 User-Agent 返回相同正文；未验证真实 Googlebot IP 或 Search Console 抓取记录。
- 初始 HTML 的 Hyperliquid 标题与 Kuru 指令／合约标签不一致，已在代码中定位：组件用 `meta?.venue` 分支，初始 `meta=null` 时进入 Kuru 分支。
- 外链、流量、域龄、用户行为没有有效比较数据，不据此制定买链接或性能重构方案。

## Task 1：记录收录与查询基线（P0，运营检查）

**Files:** 不修改应用；结果追加到本计划的执行记录。

- [ ] 在 Search Console 检查 `https://jev-trader.com/`：是否收录、Google 选定 canonical、最后抓取时间、抓取是否成功及渲染结果。
- [ ] 分别导出最近 7 天、28 天的 `Jev Trader` 查询数据：曝光、点击、CTR、平均排名；保留国家、设备、落地页维度，并标注数据延迟或低样本。
- [ ] 确认用户看到的国家、界面语言、设备及是否带引号，记录同条件 SERP；美国／新加坡英文只作为现有参照。
- [ ] 如未收录，先查具体排除原因；如 Google 选错 canonical，查该候选页面及重复内容。不要把所有未收录都当作技术报错，也不要重复提交掩盖原因。

**验收：** 能区分“尚未收录／尚未更新”和“已收录但相关性或排名不足”。没有 Search Console 访问时明确记为未验证，不阻塞下面已确认的前端问题修复。

## Task 2：修复初始市场身份（P0，第一批代码）

**Modify:**
- `web/src/app/MarketDashboard.tsx`：向展示组件传递现有 `venue: Venue`。
- `web/src/components/DecisionPanel/DecisionPanel.tsx`：指令、标题、等待态按路由市场选择。
- `web/src/components/NetworkFooter/NetworkFooter.tsx`：静态市场身份按路由选择，动态字段继续等待接口。
- `web/src/components/TradingExplainer/TradingExplainer.tsx`：市场名、市场机制说明无需等待连接。
- `web/scripts/check-score-faq-seo.mjs`：扩展已有市场 HTML 回归检查。

**Interfaces:** 三个组件都增加必填 `venue: Venue`；`meta: Meta | null` 保持真实，不构造假 Meta。

- [x] 先在已有 HTTP 脚本内增加失败断言：根路径与别名不能出现 Kuru 订单指令／合约标签；Kuru 页面保留正确指令；运行已有构建和 SEO 检查确认复现。导航中的 Kuru 链接允许存在，不可全页禁止 Kuru 字样。

```js
if (path === "/" || path === "/hyperliquid-hype-usdc") {
  assert.ok(!visibleHtml.includes("post a bid or an ask on Kuru"));
  assert.ok(!visibleHtml.includes("Kuru order book contract"));
  assert.ok(visibleHtml.includes("HyperCore"));
} else {
  assert.ok(visibleHtml.includes("post a bid or an ask on Kuru"));
}
```

- [x] 在三个组件的既有 props 中增加 `venue`，入口调用按下面方式传递；保留其余 props。

```tsx
<DecisionPanel venue={venue} meta={feed.meta} latest={feed.latest} messages={messages} />
<NetworkFooter venue={venue} meta={feed.meta} messages={messages} connection={feed.connection} />
<TradingExplainer key={`${feed.meta?.venue}-${feed.meta?.revision}`} venue={venue} meta={feed.meta} messages={messages} requestEvent={requestEvent} />
```

- [x] 将三个组件的市场身份分支统一改为下面的局部布尔值。DecisionPanel 中四处 `meta?.venue === "hyperliquid"` 均使用该值。

```tsx
// The route identifies the market before live metadata arrives.
const isHyperliquid = venue === "hyperliquid";
```

- [x] TradingExplainer 的市场名称直接按路由定义；交易数据窗口、观察周期及 block 含义使用已有对应市场文案。model、dryRun、实际成交状态仍由 meta 决定，未知时显示连接提示。

```tsx
const market = isHyperliquid ? "HYPE/USDC / Hyperliquid" : "MON/USDC / Kuru";
```

- [x] NetworkFooter 的 Hyperliquid 分支现在会在 `meta=null` 时运行，必须同时处理原来的 `meta.marketStatus`、`meta.marketUrl` 非空读取：

```tsx
const marketStatus = connection === "live" ? meta?.marketStatus ?? "connecting" : connection;
// Render the external market link only after its actual URL is available.
{meta?.marketUrl ? <a href={meta.marketUrl} target="_blank" rel="noreferrer">{messages.viewMarket} ↗</a> : null}
```

- [x] 状态显示使用 `marketStatus === "live" ? messages.liveMarket : messages[marketStatus]`；初始阶段只展示确定的市场及网络身份，实时区块、地址、余额、模型和成交不造值。模拟状态也不能因市场分支而默认宣称已经运行。
- [x] 检查修改后孤立的 props/import，仅清理本次造成的无用项；构建并运行 SEO 检查。

**验收：** 三个市场入口不执行 JS、不连接 API 时，市场说明仍正确；连接失败不崩溃；正常连接后行情、决策、切换、刷新与返回行为不变。

## Task 3：首页补足项目身份与体验入口（P1，第一批内容）

**Create:** `web/src/app/ProjectIntro.tsx`，一个小型服务端展示组件。

**Modify:** `web/src/app/hyperliquid-hype-usdc/page.tsx`、`web/src/app/MarketDashboard.tsx`、必要时 `web/src/app/page.module.css`、`web/scripts/check-score-faq-seo.mjs`。

**Interfaces:** `MarketDashboard` 增加可选 `children?: ReactNode`，由服务端页面传入介绍；Kuru 不传即可，无需 feature flag。介绍不新增 H1。

- [x] 创建以下英文初稿；这是独立维护版本的说明，不声称上游官方身份，外链保持可点击。

```tsx
export default function ProjectIntro() {
  return <section lang="en" aria-labelledby="project-intro-title">
    <h2 id="project-intro-title">Explore Jev Trader</h2>
    <p>Jev Trader is an open-source dashboard for exploring public market data, simulated trading and how Jev decisions connect to order execution.</p>
    <p>This independently maintained version builds on Jarrod Watts’s original Jev Trader project and adds a Hyperliquid HYPE/USDC demo alongside Kuru MON/USDC.</p>
    <p>Start with a market, follow a decision and inspect the order and fill feedback. Check the displayed model and execution status: a mock decision is not a Jev inference, and simulated fills are not real trades.</p>
    <nav aria-label="Explore Jev Trader">
      <a href="#trading-dashboard">Explore the Hyperliquid demo</a>{" · "}
      <a href="/kuru-mon-usdc">Open the Kuru demo</a>{" · "}
      <a href="/faq/jev-trading">Read the trading guide</a>
    </nav>
    <p><a href="https://github.com/web3w/jev-trader">Source for this website</a>{" · "}<a href="https://github.com/jarrodwatts/jev-trader">Original project by Jarrod Watts</a></p>
  </section>;
}
```

- [x] 在服务端页面导入 ProjectIntro，并将现有自闭合 Dashboard 替换为：

```tsx
<MarketDashboard key="hyperliquid" venue="hyperliquid">
  <ProjectIntro />
</MarketDashboard>
```

- [x] Dashboard 从 `react` 导入 `type ReactNode`，函数参数增加 `children`，放在现有 Header 后、StatsRow 前。将现有 StatsRow 及图表／决策区域包在 `id="trading-dashboard"` 的 div 中，使入口锚点有真实目标。

```tsx
export default function MarketDashboard({ venue, children }: { venue: Venue; children?: ReactNode }) {
```

- [x] 使用现有字体、间距和颜色；如需样式，只给介绍加局部 class，不改全站视觉。360px 宽度下无横向溢出，链接有可见焦点。
- [x] 初稿控制在约 3 个短段落；介绍始终为英文语义区域，已有 UI 切换不替换这段用于索引的正文。首页翻译版本若后续需要，单独制定路由计划。
- [x] 扩展现有 HTTP 检查，验证三个 User-Agent 得到相同介绍、仅一个 H1、介绍及源码链接位于可见 HTML 中，且不依赖 hydration 或 localStorage。

```js
if (path === "/" || path === "/hyperliquid-hype-usdc") {
  assert.ok(visibleHtml.includes('id="project-intro-title"'));
  assert.ok(visibleHtml.includes('id="trading-dashboard"'));
  assert.ok(visibleHtml.includes("independently maintained version"));
  assert.ok(visibleHtml.includes('href="/faq/jev-trading"'));
}
```

**验收：** 第一次打开就能回答“是什么、谁维护、与上游关系、如何体验”，同时保留单 H1 和可用交易界面。原测试禁止额外 about-market 模块，应保持该约束，不删除旧断言让测试通过。

## Task 4：统一标题与补充上下文内链（P1，紧随第一批）

**Modify:** `web/src/app/hyperliquid-hype-usdc/page.tsx`；`web/src/app/faq/jev-trading/page.tsx`。

- [x] 首页标题在正文落地后采用下列内容；既有 title、description 常量继续统一供 Open Graph 和 Twitter 使用。保持 root canonical、ProjectSchema 和 sitemap，不重复注入结构化数据。

```tsx
const title = "Jev Trader — Trading Demo & Project Guide";
const description = "Explore Jev Trader, an independently maintained dashboard based on the original open-source project, with Hyperliquid and Kuru market data, simulated trading and guides.";
```

- [x] 在英文交易教程的现有正文之后、返回 FAQ 之前补一个与教程操作直接相关的入口。现有品牌返回链接保留；不批量向所有文章插入相同锚文本。

```tsx
<p>Try the workflow in the <Link href="/">Jev Trader Hyperliquid demo</Link> or the <Link href="/kuru-mon-usdc">Kuru demo</Link>. Orders and fills shown in these demos are simulated.</p>
```

- [x] 核对教程入口指向正确 canonical 页面；现有中文与韩文文章的语言切换、canonical 和 hreflang 均不得回退。新增体验段落仅针对本次英文搜索入口；不伪造不存在的翻译。

**验收：** 标题与可见正文一致；从教程可直接进入体验，源码和上游关系一致。仅通过构建和 HTTP 检查不能宣称排名提升。

## Task 5：统一验收与发布边界

- [ ] 在 `web` 目录执行生产构建：

```bash
bun run build
```

- [ ] 独立终端启动本地生产服务器：

```bash
bun run start -- --hostname 127.0.0.1 --port 3010
```

- [ ] 在另一个终端、同一 `web` 目录执行：

```bash
FAQ_BASE_URL=http://127.0.0.1:3010 bun run check:seo
FAQ_BASE_URL=http://127.0.0.1:3010 node scripts/check-release-seo.mjs
```

- [ ] 预期：构建退出码 0；两个脚本退出码 0；全部 canonical、H1、语言、爬虫 HTML 与新市场断言通过。失败时定位是否是本次修改或既有工作区问题，不删除有效断言。
- [ ] 浏览器验证：360px 与桌面、键盘焦点、首页锚点、两市场切换、刷新、返回、三种 UI 语言、断网及恢复。市场不能串流，未知数值不能伪装成实时数据。
- [ ] 无效路径实际返回 404；新段落、标题和结构化数据不矛盾；JSON-LD 保持转义规则。
- [ ] 汇报具体 diff、通过的检查与仍需 GSC 验证的项。部署仅在用户授权后执行，仅更新前端，不重启交易后端；部署后对生产域名重跑 HTTP 验收。

## Task 6：站外识别与效果评估（P2）

**Files:** 不修改应用；必要时再修改 `README.md`，现有域名链接已经存在，无需重复添加。

- [ ] 准备面向 JevList 的建议文案：注明本站为独立维护的扩展版、两个市场的模拟演示与源码链接，请编辑评估是否新增相关入口或独立条目。仅准备草稿；发送消息或提交外部 PR 需要用户明确授权。
- [ ] 不要求目录把原项目链接替换为本站，不冒充官方，不购买批量外链。
- [ ] 若有 GSC 权限，在发布验收后对实质修改页面请求一次重新编入索引，记录最后抓取时间；不是排名承诺。
- [ ] 在重新抓取后按周比较同国家、同设备、同查询的曝光、点击、CTR、落地页和平均排名；观察 2–4 周趋势，低样本延长观察。
- [ ] 工程成功：静态内容正确、可访问、链接与路由稳定。SEO 成功另行判断：目标查询可见性及相关点击改善；收录不等于排名提升，排名不等于业务转化。

## 执行顺序与范围

1. Task 1 与前端准备可并行推进；GSC 不可用时记录缺口。
2. 第一批完成 Task 2–3：优先修正已确认的问题，补清楚首页身份。
3. 第二批完成 Task 4–5：统一标题、教程入口、本地验收；授权后才部署。
4. 发布后推进 Task 6：真实目录引用和固定口径评估。

不在本计划中：完整品牌重命名、首页改为纯营销页、交易后端重构、多语言首页扩建、批量文章、付费外链和未经测量的性能工程。

## 计划自检

- 已对应初始 HTML 混淆、项目身份、搜索意图、标题、内链、抓取及效果验证。
- 组件接口统一为必填 `venue: Venue`；服务端介绍通过 `children?: ReactNode` 传入，不增加状态或伪造 Meta。
- 初始 Hyperliquid 分支新增的 null 风险已明确列出；动态状态仍由真实接口决定。
- 已按后续授权完成本地前端修改；执行证据及未验证项见下文。


## 执行记录 · 2026-09-21

- Task 1：OpenSEO 返回 `not_connected`，Search Console 尚未连接。未获得收录状态、Google canonical 或关键词表现；不可据本次修复宣称排名提升。
- Task 2–4：完成。DecisionPanel 的 meta 在修复后不再使用，因此删除该 prop，避免保留无用接口；其它组件继续接收真实 meta。
- 布局细化：保留 Header 后插入介绍的顺序；首页卡片允许随内容增高，并给交易面板保留独立高度，Kuru 维持原视口卡片。没有更改全局 CSS。
- 红绿验证：修改前 HTTP 检查先因 Hyperliquid 输出 Kuru 指令失败；修复后通过。随后加入首页介绍断言，先失败于介绍不存在，实现后通过。
- 生产构建：`bun run build` 通过，含 TypeScript 检查。
- HTTP：`FAQ_BASE_URL=http://127.0.0.1:3011 bun run check:seo` 通过，包括市场、各语言 FAQ、canonical、hreflang、结构化数据、robots、sitemap、404 和旧路径重定向。
- HTTP：`FAQ_BASE_URL=http://127.0.0.1:3011 node scripts/check-release-seo.mjs` 通过，覆盖 17 个 sitemap 页面与 3 种 User-Agent。
- 浏览器：1440px 桌面、360px 手机均无横向溢出；首页及 Kuru 都只有一个 H1。首页介绍英文语义区、单页锚点、键盘焦点样式、市场切换、刷新和返回通过。
- 浏览器：中／韩／英语言 change 事件切换通过，中文选择刷新后保留；介绍继续声明英文。旧版 agent-browser select 命令报参数错误，验证改用 DOM change 事件，因此不把该 CLI 错误归为应用问题。
- 浏览器：断网时介绍与市场文案仍正确，无页面 JS 异常。现有本地环境使用 `http://localhost:8000`，后端未连接；真实行情、事件流及断网恢复未完成联调，未启动或修改后端。
- 检查：`git diff --check` 通过；对照执行前文件备份复核，仅修改本次所需内容，保留原有未提交改动。未提交、未推送、未部署。
- 本地生产预览：`http://127.0.0.1:3011/`。原有 3010 服务未停止；本次启动独立 3011 预览。

### JevList 建议文案草稿（未发送）

Hello JevList maintainers, I maintain an independent version of Jev Trader at https://jev-trader.com/, with source at https://github.com/web3w/jev-trader. It builds on Jarrod Watts’s original project and provides Hyperliquid HYPE/USDC and Kuru MON/USDC market demonstrations with simulated execution and educational guides. Would you consider listing this version as a related independent demo, or as a separate entry if that fits your editorial policy? Please retain the original project's attribution and repository link. This is not an official TypeSafe or upstream release, and simulated fills are not real trades.

发布后才执行：GSC 重新抓取及表现观察；目前未发送外部消息、未提交目录修改或索引请求。

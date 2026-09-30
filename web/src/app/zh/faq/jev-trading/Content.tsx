import { TradingFlow, InterfaceFlow } from "./Diagrams";
import styles from "./page.module.css";

// Static article content keeps the full explanation readable without client JavaScript.
export default function Content() {
  return <article className={styles.article}>
<p>一个自动交易程序，需要不断重复三个动作：看行情、作判断、处理订单。</p>
<p>在 jev-trader 里，Jev 负责中间的判断。程序把行情整理好，问它更适合买还是卖，再根据回答和账户限制处理挂单。</p>
<p>本文沿着这条流程，介绍业务逻辑、Prompt 设计和接口参数。代码中的字段均附中文注释。</p>
<blockquote>
<p>以下按本文核对的源码描述实现。Hyperliquid 使用 HYPE/USDC 真实现货行情和模拟账户；Kuru 保留链上订单代码，但当前页面入口只启动模拟会话。本文不把它描述成已经完成的合约交易系统。</p>
</blockquote>
<h2 id="workflow">一、业务流程：模型回答以后，才轮到执行</h2>
<p>订单簿是还没有成交的买卖报价清单。程序读取订单簿和近期成交，将它们转换成模型能直接使用的数据。</p>
<TradingFlow />
<p><em>图 1：主业务流程。Hyperliquid 路径中的订单与成交均为模拟。</em></p>
<p>这里有三个不同的时刻：<strong>模型作出选择、程序放置订单、订单真正成交。</strong></p>
<p>例如，Jev 选择买入，程序就考虑挂一张买单。挂单只是报价，还要有人愿意卖给你，才会成交。当前策略偏向 post-only，也就是只挂在订单簿上，不立即吃掉对手方报价。</p>
<p>模型不直接决定订单数量，也不签名或操作钱包。执行层根据预设规则计算订单。如果模型选择的方向受余额或仓位限制，当前代码可能改用另一侧；两侧都不允许时，就不放置新订单。</p>
<h2 id="interface">二、接口结构：材料、问题、答案</h2>
<p>Jev 的接口可以理解成做选择题。你提供材料和选项，它返回选择结果。</p>
<InterfaceFlow />
<p><em>图 2：模型返回的是判断，交易程序继续负责执行。</em></p>
<p><code>state</code> 和 <code>questions</code> 是接口结构；<code>mid</code>、<code>trades</code>、<code>allowed</code> 等名字，是这个项目自己设计的业务字段。<a href="https://docs.typesafe.ai/api">TypeSafe 接口文档</a></p>
<p>先看模型配置：</p>
<pre tabIndex={0} aria-label="带中文注释的接口代码"><code className="language-dotenv">{"# 使用 Jev；项目默认 mock 是本地模拟模型，不请求 Jev。\nMODEL=jev\n\n# 服务端认证密钥，由 provider 读取，不放入行情或调用记录。\nTYPESAFE_AI_API_KEY=你的_API_密钥\n\n# 请求的模型名称，项目默认使用这个别名。\nJEV_MODEL_ID=jev-latest\n"}</code></pre>
<p>模型配置与交易模式是两件事。调用真实 Jev，也可以只做模拟交易。</p>
<p>项目通过 AI SDK 调用模型。下面保留调用结构，<code>state</code> 和 <code>QUESTIONS</code> 在后文解释：</p>
<pre tabIndex={0} aria-label="带中文注释的接口代码"><code className="language-ts">{"import { experimental_evaluate } from \"ai\";\nimport { typeSafeAi } from \"@ai-sdk/typesafe-ai\";\n\n// 实际项目读取 config.jevModelId，这里展示默认值。\nconst model = typeSafeAi.evaluationModel(\"jev-latest\");\n\n// 固定本次材料，避免异步等待期间原对象变化。\nconst input = structuredClone({\n  state,                 // 本次行情和允许方向。\n  questions: QUESTIONS,  // 本次问题集合。\n});\n\nconst result = await experimental_evaluate({\n  model,                       // provider 创建的模型实例，不是字符串。\n  state: input.state,          // 交给模型判断的业务数据。\n  questions: input.questions,  // 问题说明与候选答案。\n  maxRetries: 0,               // 禁用 SDK 自动重试，避免在旧行情上反复请求。\n});\n"}</code></pre>
<p><code>maxRetries: 0</code> 不是超时设置。这段调用没有设置取消信号，不能理解成超过一个区块时间就自动终止。</p>
<h2 id="state">三、state：给模型看什么？</h2>
<p>输入主要回答四件事：交易哪个市场、看多长时间、市场目前怎样、哪些方向允许执行。</p>
<p>下面完整列出当前 <code>TradeState</code>，包括嵌套字段。价格使用计价资产，数量使用基础资产；1 bps 是 0.01%。<code>?</code> 表示类型允许省略，<code>null</code> 表示没有可用值。</p>
<pre tabIndex={0} aria-label="带中文注释的接口代码"><code className="language-ts">{"interface TradeState {\n  market: string;       // 市场名称，例如 MON-USDC 或 HYPE-USDC。\n  venue?: string;       // 交易场所；当前填写 Kuru 或 hyperliquid。\n  baseAsset?: string;   // 基础资产，如 MON、HYPE，也是数量单位。\n  quoteAsset?: string;  // 计价资产，如 USDC，也是价格的计价单位。\n\n  block: number;          // Kuru 为链上区块号；Hyperliquid 为本地事件序号。\n  horizonBlocks: number;  // 向前判断多少个观察单位，不是下单间隔。\n  blockMs: number;        // 每个观察单位的名义时长，毫秒。\n  mid: number;            // 中间价 =（最优买价 + 最优卖价）/ 2。\n  spreadBps: number;      // 价差 =（最优卖价 - 最优买价）/ mid × 10000。\n  bookImbalance: number;  // 中间价上下 1% 内，（买量 - 卖量）/（买量 + 卖量）。\n\n  depth: {                // 各价格范围内的累计挂单数量。\n    [band: string]: {     // 范围键名；当前统计 10、25、50 bps。\n      bid: number;       // 该范围内累计买单量，单位为基础资产。\n      ask: number;       // 该范围内累计卖单量，单位为基础资产。\n    };\n  };\n\n  book: {                // 最优附近的订单簿，每侧最多 5 档。\n    bids: string[];      // 买盘，最好报价在前，元素为“价格 x 数量”。\n    asks: string[];      // 卖盘，最好报价在前，元素为“价格 x 数量”。\n  };\n\n  returnsBps: {          // 相对历史价格的变化，单位 bps。\n    last1: number;       // 相对前 1 个已记录价格样本。\n    last5: number;       // 相对前 5 个已记录价格样本。\n    last20: number;      // 相对前 20 个已记录价格样本。\n    last100: number;     // 相对前 100 个已记录价格样本。\n  };\n\n  recentMids: string;    // 从旧到新的中间价，用空格连接，采样规则见下表。\n\n  trades: {             // 近期整个市场的主动成交统计，不是本策略的成交。\n    count: number;      // 窗口内保留的成交记录条数。\n    buyMon: number;     // 主动买入量，实际单位为 baseAsset。\n    sellMon: number;    // 主动卖出量，实际单位为 baseAsset。\n    cvdMon: number;     // buyMon - sellMon，可为负，仅统计当前窗口。\n    vwap: number | null;       // 成交量加权均价；无有效成交量时为 null。\n    lastPrice: number | null;  // 窗口内最后成交价；无记录时为 null。\n    lastSide: \"buy\" | \"sell\" | null; // 最后成交的主动方方向；无记录时为 null。\n  };\n\n  recentTrades: string[]; // 最近最多 10 条成交，从旧到新；格式见下表。\n\n  allowed: {             // 程序算出的方向许可，执行前仍需检查。\n    buy: boolean;        // 当前是否允许放置一笔买单。\n    sell: boolean;       // 当前是否允许放置一笔卖单。\n  };\n}\n"}</code></pre>
<p>举例来说，买一价为 99.9、卖一价为 100.1，那么 <code>mid = 100</code>，<code>spreadBps = 20</code>。</p>
<p>如果近期主动买入 12 HYPE、主动卖出 8 HYPE，那么 <code>cvdMon = 4</code>。这里沿用了 Mon 的旧名称，实际表示 4 HYPE。</p>
<p><code>bookImbalance</code> 表达买卖挂单量的偏向。它等于 0.5，不表示上涨概率为 50%。</p>
<p>两个市场复用了字段，但采样口径有区别：</p>
<div className={styles.tableWrap} tabIndex={0} role="region" aria-label="两个市场的参数口径对照"><table>
<thead>
<tr><th scope="col">参数</th><th scope="col">Kuru</th><th scope="col">Hyperliquid</th></tr>
</thead>
<tbody>
<tr><td><code>horizonBlocks × blockMs</code></td><td>默认 100 × 300ms，约 30 秒</td><td>30 × 1000ms，约 30 秒</td></tr>
<tr><td><code>depth</code> 键名</td><td>如 <code>"10bps"</code></td><td>如 <code>"10"</code>，单位同样是 bps</td></tr>
<tr><td><code>recentMids</code></td><td>最近 H 个样本中每 5 个取一个，包含最新值</td><td>最近最多 30 个样本</td></tr>
<tr><td><code>trades</code> 窗口</td><td>最近 H 个区块内保留的成交</td><td>最近 30 秒内保留的成交</td></tr>
<tr><td><code>recentTrades</code></td><td>最近 10 条记录，开头是区块号</td><td>最近 30 秒内最多 10 条，开头是毫秒时间戳</td></tr>
<tr><td>收益率历史不足</td><td>对应 <code>returnsBps</code> 值填 0</td><td>与最早保留的样本比较</td></tr>
</tbody>
</table></div>
<p>H 指 <code>horizonBlocks</code>。成交摘要的其余格式是“buy或sell 数量 @ 价格”。样本可能因断线或处理延迟而不等间隔，因此“前 20 个样本”不能直接当成“20 秒前”。</p>
<h2 id="prompt">四、Prompt 设计：把任务说具体</h2>
<p>如果只问“现在应该买还是卖”，模型不知道你准备持有多久，也不知道订单怎样成交。</p>
<p>当前 Prompt 把这些信息拆开：判断目标、预测窗口、成交方式、参考材料和可选动作。</p>
<p>下面保留实际字段结构，将英文说明精简翻译成中文。它用于解释设计，不是源码原文。</p>
<pre tabIndex={0} aria-label="带中文注释的接口代码"><code className="language-ts">{"const QUESTIONS = {\n  direction: {             // 自定义问题名，答案通过 answers.direction 读取。\n    type: \"choice\",        // 选择题，从 criteria 的选项中选择。\n\n    instructions: {        // 问题背景；内部键名是项目自行定义的。\n      question:            // 具体判断：指定观察窗口后，价格高于还是低于当前 mid？\n        \"经过 horizonBlocks 个观察单位后，基础资产价格会高于还是低于当前中间价？\",\n\n      goal:                // 业务用途：选择挂单方向，考虑成本、不利价格变化和库存限制。\n        \"为 venue 的 market 选择 post-only 挂单方向，预测窗口约为 horizonBlocks × blockMs 毫秒，并考虑价差、费用和仓位约束。\",\n\n      timing:              // 成交方式：挂单等待别人来成交，可能先被替换。\n        \"订单等待主动方成交或被替换。挂单不保证成交，也不是立即执行的市价单。\",\n\n      inputs:              // 重点材料与硬约束；两侧都不允许时，执行层不放新单。\n        \"参考 trades.cvdMon、trades.lastSide、recentTrades、depth、book、returnsBps 和 recentMids，并遵守 allowed。\",\n    },\n\n    criteria: {            // 候选答案及其判断标准。\n      buy:                 // 买入方向：偏向上涨，避免刚成交就下跌。\n        \"挂买单，判断未来价格偏强，并遵守 allowed.buy。\",\n\n      sell:                // 卖出方向：偏向下跌，避免卖出后立即上涨。\n        \"挂卖单，判断未来价格偏弱，并遵守 allowed.sell。\",\n    },\n  },\n} as const;\n"}</code></pre>
<p>这种设计把“预测什么”和“怎样使用预测”放在同一个问题里。模型既看到价格方向任务，也知道自己是在为一张等待成交的限价单选择方向。</p>
<p>但有两点要准确理解。</p>
<p>第一，当前只有 <code>buy</code>、<code>sell</code> 两个候选答案，没有主动观望选项。程序中的 <code>hold</code> 不能直接解读成 Jev 选择了观望。</p>
<p>第二，Prompt 虽然要求考虑费用，当前 <code>state</code> 并没有提供明确费率，也没有完整仓位盈亏。写进说明，不等于已经给模型提供了对应数据。</p>
<h2 id="response">五、返回值：怎样变成交易程序的决定？</h2>
<p>下面是项目读取或保存的 SDK 业务字段，不包含响应头等传输信息。</p>
<pre tabIndex={0} aria-label="带中文注释的接口代码"><code className="language-ts">{"interface UsedSdkResult {\n  answers: {                    // 按请求的问题名组织答案。\n    direction: {                // 对应 questions.direction。\n      type: \"choice\";           // 答案类型，与请求一致。\n      choice: \"buy\" | \"sell\";    // 模型选中的方向。\n      probabilities?: {         // 当前安装的 SDK 类型允许概率缺失。\n        buy: number;            // 买入选项概率，正常取值 0 到 1。\n        sell: number;           // 卖出选项概率，正常情况下与 buy 相加为 1。\n      };\n    };\n  };\n\n  usage: {                      // token 用量，不是费用金额。\n    inputTokens: number | undefined;   // 输入量，项目用它估算模型成本。\n    outputTokens: number | undefined;  // 输出量，当前未单独用于费用估算。\n    totalTokens: number | undefined;   // 总量，未单独复制进 Decision。\n  };\n}\n"}</code></pre>
<p>SDK 将 HTTP 用量字段 <code>input_tokens</code>、<code>output_tokens</code> 转成上述驼峰名称。官方 HTTP 文档还描述了 <code>confidence</code>，但当前安装的 SDK Choice 类型未暴露它，项目也没有读取它。<a href="https://docs.typesafe.ai/api">返回值说明</a></p>
<p>接着，项目把答案整理成自己的结果类型，并保留调用记录：</p>
<pre tabIndex={0} aria-label="带中文注释的接口代码"><code className="language-ts">{"interface Decision {\n  action: \"buy\" | \"sell\" | \"hold\"; // Jev 初始为 buy 或 sell；执行层可能调整。\n  probabilities: {              // 整理后的概率分布。\n    buy: number;                // 买入概率；缺失的单个选项补 0。\n    sell: number;               // 卖出概率；缺失的单个选项补 0。\n    hold: number;               // JevModel 的正常结果固定填 0。\n  };\n  upIn10: number;                // 旧字段名，实际等于 buy 概率，不是另一次预测。\n  latencyMs: number;             // 本地测得的模型调用耗时，含请求等待，不含下单。\n  inputTokens: number;           // 输入 token 数，缺失时补 0，不代表实际免费。\n  trace?: ModelTrace;            // 本次输入输出记录，用于审查。\n}\n\ninterface ModelTrace {\n  source: \"jev\" | \"simulation\";  // 判断来自 Jev 或 MockModel，不表示是否实盘。\n  model: string;                // 配置的模型名称，如 jev-latest 或 mock。\n  input: {                      // 调用前固定的输入快照。\n    state: TradeState;          // 本次市场材料，字段见前文。\n    questions?: unknown;        // 本次问题集合；MockModel 不填写。\n  };\n  output: unknown;              // Jev 保存 { answers, usage }，字段见 UsedSdkResult；\n                                // MockModel 保存模拟 Decision，不含 trace。\n}\n"}</code></pre>
<p>如果 SDK 完全没返回概率，当前代码把选中项补成 1，其他项补成 0。此时看到的 100% 是程序补值，不能当作模型的真实确定程度。</p>
<p>即使模型确实返回了 <code>buy: 0.7</code>，也只能先理解为买入选项的概率。<strong>它不自动等于交易胜率。</strong> 成交价格、退出时机和成本都会影响结果。</p>
<h2 id="execution">六、把一次判断串起来</h2>
<p>假设 Jev 返回买入，买入概率为 0.7。</p>
<p>程序接着检查余额和仓位。如果买入允许，就按执行规则报价；如果买入受限而卖出允许，当前代码可能改挂卖单。订单中的 <code>capped</code> 字段会标记这种方向调整。</p>
<p>所以，审查时要区分三份记录：</p>
<ul>
<li><code>trace.output</code>：模型原本选择了什么。</li>
<li>最终订单：程序实际准备执行什么。</li>
<li>成交记录：市场最终成交了什么。</li>
</ul>
<p>目前 Jev 接口只负责第一部分。订单执行和账户更新由代码负责，模型调用记录则让这条链路可以被核对。</p>
<p>文章依据当前工作区的 <a href="https://github.com/web3w/jev-trader/blob/main/src/model.ts">model.ts</a>、<a href="https://github.com/web3w/jev-trader/blob/main/src/trader.ts">trader.ts</a>、<a href="https://github.com/web3w/jev-trader/blob/main/src/hyperliquid.ts">hyperliquid.ts</a>及本地 SDK 类型定义整理。代码块是字段说明，不是一份可直接启动交易的完整脚本。</p>

  </article>;
}

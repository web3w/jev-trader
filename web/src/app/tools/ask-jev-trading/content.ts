import type { Locale } from "@/lib/i18n";
import type { QuestionType, TradingInput } from "./model";

export const toolPaths: Record<Locale, string> = {
  en: "/tools/ask-jev-trading", "zh-CN": "/zh/tools/ask-jev-trading", ko: "/ko/tools/ask-jev-trading",
};
export const toolUrls = Object.fromEntries(Object.entries(toolPaths).map(([locale, path]) => [locale, `https://jev-trader.com${path}`]));

const en = {
  intro: "Explore how Jev turns a trading question and market snapshot into a structured answer. Edit an example and try it.",
  back: "Back to trading", language: "Language", guide: "How to use", workspace: "Your trading question",
  demoNote: "Interactive learning demo: edit the example and submit. Results are randomly generated in Jev’s output format, not model predictions.",


  types: { noul: "Yes / No", choice: "Choice", score: "Score" },
  descriptions: { noul: "Check a trading condition", choice: "Compare possible actions", score: "Rate market liquidity" },
  question: "Question", context: "Market snapshot", contextHint: "Include the market, observation time, spread, fees, depth and any position limits relevant to your question.",
  criteria: "Possible actions", levels: "Rating levels · lowest to highest", add: "Add an option", addLevel: "Add a level", remove: "Remove", option: "Option", level: "Level",
  run: "Submit question", running: "Generating example…", reset: "Reset", loadExample: "Use trading example",
  result: "Judgment", empty: "A question first. A judgment next.", emptyHint: "An example is ready. Edit the question, snapshot or choices, then submit to explore the answer format.",
  mockBadge: "Demo · randomly generated", liveBadge: "Jev · model result", sharedBadge: "Shared snapshot · unverified",
  yes: "Yes", no: "No", uncertain: "Uncertain", yesProbability: "Probability of Yes", distribution: "Probability distribution", confidence: "Distribution confidence", full: "Explore the input and output",
  principle: "How to read this answer", principles: {"noul": "Noul returns the probability of Yes between 0 and 1. The No probability is 1 minus that value. A value near 0.5 means uncertainty, not a medium score.", "choice": "Choice assigns a probability to every option and selects the highest one. The probabilities add up to 100%; changing the options changes the possible answers.", "score": "Score assigns probabilities to ordered levels, starting at 0. The score is the sum of each level number multiplied by its probability, so it can fall between levels."}, confidenceNote: "Demo confidence uses normalized entropy to illustrate concentration. TypeSafe’s documentation does not specify its exact formula.",
  resultNote: "These numbers are random teaching data, not an assessment of your inputs or a profit forecast. Submitting again generates a new example; no trades are executed.",
  share: "Invite another perspective", shareHint: "Share only the conclusion and invite someone to ask their own trading question.", copyText: "Copy conclusion", copyLink: "Copy share link", sharePreview: "Preview shared conclusion", copied: "Copied", copyFailed: "Copy is unavailable. Select and copy the content below.",
  shareDisclosure: "Only the conclusion and its source label are shared. Your question, market snapshot and full response stay out of the link. Nothing is published automatically.",
  sharedNote: "This result came from a share link and has not been verified. It is not a new model evaluation.", participate: "Try your own question", invitation: "What is your trading question? Try Ask Jev Trading and share your perspective.",
  errors: { invalid_input: "Add a question (up to 500 characters) and snapshot (up to 6,000). Supply 2–8 distinct options or 2–10 distinct levels, each up to 160 characters.", rate_limited: "The tool has reached its request limit. Please try again later.", upstream: "The demo could not return a valid answer. Your inputs are still here; try again.", timeout: "The demo took too long to respond. Your inputs are still here; try again.", forbidden: "This request could not be verified. Refresh this page and try again.", invalid_share: "This share link is invalid or too large. Ask the sender to copy only the conclusion as text.", },
  steps: [
    ["Start with a snapshot", "The example snapshot is already filled in. Edit its market, observation time, fees or limits. This material becomes the state supplied to Jev in a real integration."],
    ["Choose the judgment", "Yes / No checks a condition. Choice compares explicit actions, including waiting. Score rates a defined scale from low to high."],
    ["Read, then compare", "Submit to generate a random example. See how the answer is chosen or calculated, then expand the input/output structure. Real Jev inference uses your context; this demo only illustrates the format."],
  ],
  exampleTitle: "Three ways to ask about a trade", sources: "Understand the outputs", privacy: "Privacy policy", faq: "How Jev scores work",
};

type Copy = typeof en;
export const copy: Record<Locale, Copy> = {
  en,
  "zh-CN": {
    intro: "从交易问题和行情快照出发，了解 Jev 如何返回结构化判断。修改下方实例，直接提交体验。",
    back: "返回交易页面", language: "语言", guide: "使用引导", workspace: "你的交易问题",
    demoNote: "交互教学演示：可修改实例并提交。结果按 Jev 格式随机生成，用于理解输出，不代表模型预测。",


    types: { noul: "是 / 否", choice: "操作选择", score: "评分" },
    descriptions: { noul: "检查交易条件", choice: "比较可能的操作", score: "评估市场流动性" },
    question: "问题", context: "行情快照", contextHint: "提供与问题有关的交易对、观察时间、价差、手续费、盘口深度及仓位限制。",
    criteria: "候选操作", levels: "评分等级 · 从低到高", add: "添加选项", addLevel: "添加等级", remove: "删除", option: "选项", level: "等级",
    run: "提交问题", running: "正在生成示例…", reset: "重置", loadExample: "填入交易示例",
    result: "判断结果", empty: "先提出问题，再查看判断。", emptyHint: "已填入交易实例。修改问题、行情或选项，提交后查看结果，了解 Jev 的回答格式。",
    mockBadge: "演示结果 · 随机生成", liveBadge: "Jev · 模型结果", sharedBadge: "分享快照 · 未验证",
    yes: "是", no: "否", uncertain: "不确定", yesProbability: "回答「是」的概率", distribution: "概率分布", confidence: "分布置信度", full: "查看输入与输出结构",
    principle: "这个结果如何理解", principles: {"noul": "Noul 返回 0–1 之间的「是」概率；「否」的概率等于 1 减去该值。接近 0.5 表示不确定，不代表中等评分。", "choice": "Choice 为每个候选项分配概率，取概率最高的一项作为结论。所有概率之和为 100%；修改候选项，也就改变了可返回的答案范围。", "score": "Score 对从 0 开始的有序等级分配概率，用「等级编号 × 对应概率」求和得到评分，因此分数可以落在两个等级之间。"}, confidenceNote: "演示置信度使用归一化熵展示分布的集中程度；TypeSafe 文档未公开其具体计算公式。",
  resultNote: "这些数值是随机教学数据，不是对输入内容的真实评估，也不是盈利预测。再次提交会生成新示例，不会执行交易。",
    share: "邀请别人一起判断", shareHint: "只分享判断结论，邀请别人来提出自己的交易问题。", copyText: "复制结论", copyLink: "复制分享链接", sharePreview: "预览分享结论", copied: "已复制", copyFailed: "无法自动复制，请选择下方内容手动复制。",
    shareDisclosure: "仅分享结论和来源标记，不包含问题、行情快照或完整结果。不会自动发布到社交平台。",
    sharedNote: "此结果来自分享链接，尚未验证，不是一次新的模型判断。", participate: "我也来提问", invitation: "你有什么交易问题？来 Ask Jev Trading 试试，分享你的看法。",
    errors: { invalid_input: "请填写问题（最多 500 字符）和行情（最多 6,000 字符），并提供 2–8 个不同选项或 2–10 个不同等级，每项最多 160 字符。", rate_limited: "工具已达到请求限额，请稍后再试。", upstream: "演示未能生成有效结果。输入已保留，可再次尝试。", timeout: "演示请求超时。输入已保留，可再次尝试。", forbidden: "无法验证此请求，请刷新页面后重试。", invalid_share: "分享链接无效或过长，请让分享者直接复制结论。", },
    steps: [
      ["准备一份行情快照", "下方已填入实例数据，可修改交易对、观察时间、手续费和仓位限制。在真实接入中，这些材料作为 state 交给 Jev。"],
      ["选择判断方式", "「是 / 否」检查条件；「操作选择」比较明确选项，记得包含等待；「评分」需要定义从低到高的等级。"],
      ["阅读结果，邀请讨论", "提交后获得随机示例，查看结论如何选择、评分如何计算，再展开输入与输出结构。真实 Jev 会根据上下文判断；这里仅演示其数据格式。"],
    ],
    exampleTitle: "用三种方式提出交易问题", sources: "了解结果含义", privacy: "隐私政策", faq: "Jev 如何评分",
  },
  ko: {
    intro: "거래 질문과 시장 스냅샷이 Jev의 구조화된 답으로 바뀌는 방식을 배워 보세요. 예제를 수정하고 제출하세요.",
    back: "거래 화면으로", language: "언어", guide: "사용 안내", workspace: "나의 거래 질문",
    demoNote: "대화형 학습 데모입니다. 예제를 수정하고 제출하세요. 결과는 Jev 형식으로 무작위 생성되며 모델 예측이 아닙니다.",


    types: { noul: "예 / 아니요", choice: "행동 선택", score: "점수" },
    descriptions: { noul: "거래 조건 확인", choice: "가능한 행동 비교", score: "시장 유동성 평가" },
    question: "질문", context: "시장 스냅샷", contextHint: "질문에 필요한 거래쌍, 관측 시각, 스프레드, 수수료, 호가 깊이와 포지션 한도를 포함하세요.",
    criteria: "선택 가능한 행동", levels: "평가 단계 · 낮음부터 높음까지", add: "선택지 추가", addLevel: "단계 추가", remove: "삭제", option: "선택지", level: "단계",
    run: "질문 제출", running: "예제 생성 중…", reset: "초기화", loadExample: "거래 예제 사용",
    result: "판단 결과", empty: "먼저 질문하고, 판단을 살펴보세요.", emptyHint: "거래 예제가 준비되어 있습니다. 질문, 스냅샷 또는 선택지를 수정하고 제출해 답변 형식을 살펴보세요.",
    mockBadge: "데모 결과 · 무작위 생성", liveBadge: "Jev · 모델 결과", sharedBadge: "공유 스냅샷 · 미검증",
    yes: "예", no: "아니요", uncertain: "불확실", yesProbability: "예의 확률", distribution: "확률 분포", confidence: "분포 신뢰도", full: "입력과 출력 구조 보기",
    principle: "결과를 이해하는 방법", principles: {"noul": "Noul은 0에서 1 사이의 예 확률을 반환합니다. 아니요 확률은 1에서 이 값을 뺀 값입니다. 0.5에 가까우면 중간 점수가 아니라 불확실함을 뜻합니다.", "choice": "Choice는 각 선택지에 확률을 부여하고 가장 높은 항목을 선택합니다. 확률의 합은 100%입니다. 선택지를 바꾸면 가능한 답도 바뀝니다.", "score": "Score는 0부터 시작하는 순서 있는 단계에 확률을 부여합니다. 단계 번호와 확률의 곱을 모두 더하므로 점수가 단계 사이에 올 수 있습니다."}, confidenceNote: "데모 신뢰도는 정규화 엔트로피로 분포 집중도를 설명합니다. TypeSafe 문서는 정확한 계산식을 공개하지 않습니다.",
  resultNote: "수치는 무작위 학습 데이터이며 입력에 대한 실제 평가나 수익 예측이 아닙니다. 다시 제출하면 새 예제가 생성되며 거래는 실행되지 않습니다.",
    share: "다른 관점 초대하기", shareHint: "결론만 공유하고 다른 사람을 초대해 자신만의 거래 질문을 해 보세요.", copyText: "결론 복사", copyLink: "공유 링크 복사", sharePreview: "공유 결론 미리보기", copied: "복사 완료", copyFailed: "자동 복사를 사용할 수 없습니다. 아래 내용을 선택해 복사하세요.",
    shareDisclosure: "결론과 출처 표시만 공유합니다. 질문, 시장 스냅샷과 전체 응답은 링크에 포함되지 않으며 자동 게시되지 않습니다.",
    sharedNote: "이 결과는 공유 링크에서 가져온 미검증 결과이며 새로운 모델 평가가 아닙니다.", participate: "직접 질문하기", invitation: "어떤 거래 질문이 있나요? Ask Jev Trading을 체험하고 관점을 나눠 보세요.",
    errors: { invalid_input: "질문(최대 500자)과 스냅샷(최대 6,000자)을 입력하세요. 서로 다른 선택지 2–8개 또는 단계 2–10개가 필요하며 각 항목은 최대 160자입니다.", rate_limited: "요청 한도에 도달했습니다. 나중에 다시 시도하세요.", upstream: "데모가 유효한 답을 생성하지 못했습니다. 입력은 보존됩니다. 다시 시도하세요.", timeout: "데모 응답 시간이 초과되었습니다. 입력은 보존됩니다. 다시 시도하세요.", forbidden: "요청을 확인할 수 없습니다. 페이지를 새로 고침하세요.", invalid_share: "공유 링크가 잘못되었거나 너무 깁니다. 발신자에게 결론만 텍스트로 요청하세요.", },
    steps: [
      ["시장 스냅샷 준비", "입력된 예제의 거래쌍, 관측 시각, 수수료와 한도를 수정하세요. 실제 연동에서는 이 자료가 state로 Jev에 전달됩니다."],
      ["판단 방식 선택", "예 / 아니요는 조건을 확인합니다. 행동 선택은 대기를 포함한 선택지를 비교합니다. 점수는 낮음부터 높음까지 단계를 정의합니다."],
      ["결과를 읽고 비교", "제출하여 무작위 예제를 생성하고 선택과 점수 계산 방식을 살펴보세요. 입력과 출력 구조도 펼쳐 보세요. 실제 Jev는 문맥을 평가하지만 이 데모는 데이터 형식만 보여 줍니다."],
    ],
    exampleTitle: "거래에 대해 질문하는 세 가지 방법", sources: "결과 이해하기", privacy: "개인정보 처리방침", faq: "Jev 점수 이해하기",
  },
};

export function example(locale: Locale, type: QuestionType): TradingInput {
  const examples: Record<Locale, Record<QuestionType, { question: string; context: string; criteria: string[] }>> = {
    en: {
      noul: { question: "Does the quoted spread exceed estimated round-trip fees and slippage?", context: "Fictional teaching snapshot, not live data. HYPE/USDC at 12:00 UTC. Bid: 40.00; ask: 40.04 USDC. Quoted spread: 10 bps. Estimated round-trip fees: 4 bps; total slippage: 2 bps. Compare these costs only; fills and profit are not guaranteed.", criteria: [] },
      choice: { question: "Given the costs and conflicting signals, which action is most appropriate for this snapshot?", context: "Fictional teaching snapshot, not live data. HYPE/USDC at 12:00 UTC. Mid: 40.02 USDC; spread: 10 bps. Estimated round-trip costs: 12 bps. Buy/sell depth imbalance: +0.15; last 30-second return: -0.08%. Both buy and sell are allowed. No open position. Waiting is allowed when signals conflict or costs exceed the spread.", criteria: ["Place a buy limit order", "Place a sell limit order", "Wait for a clearer setup"] },
      score: { question: "How liquid is this market for a hypothetical 1,000 USDC order?", context: "Fictional teaching snapshot, not live data. HYPE/USDC at 12:00 UTC. Spread: 10 bps. Depth within 0.1%: bids 80,000 USDC, asks 65,000 USDC. Last-minute volume: 120,000 USDC. Estimated impact for a 1,000 USDC order: 3 bps. Liquidity can change before execution.", criteria: ["Very low: wide spread and insufficient depth", "Low: shallow depth or high price impact", "Moderate: usable depth with noticeable costs", "High: ample depth and limited impact", "Very high: tight spread and deep, stable liquidity"] },
    },
    "zh-CN": {
      noul: { question: "当前报价价差是否超过预估的往返手续费与滑点？", context: "教学用虚构行情，非实时数据。HYPE/USDC，观察时间 12:00 UTC。买一 40.00、卖一 40.04 USDC，报价价差约 10 bps。预估往返手续费 4 bps，总滑点 2 bps。仅比较这些成本，不保证成交或盈利。", criteria: [] },
      choice: { question: "考虑交易成本与相互冲突的信号，这份行情快照更适合哪种操作？", context: "教学用虚构行情，非实时数据。HYPE/USDC，观察时间 12:00 UTC。中间价 40.02 USDC，价差 10 bps，预估往返成本 12 bps。买卖深度不平衡 +0.15，最近 30 秒收益率 -0.08%。允许买入和卖出，当前无仓位。当信号冲突或成本高于价差时，可以等待。", criteria: ["挂买入限价单", "挂卖出限价单", "等待更明确的机会"] },
      score: { question: "针对一笔假设的 1,000 USDC 订单，当前市场流动性如何？", context: "教学用虚构行情，非实时数据。HYPE/USDC，观察时间 12:00 UTC。价差 10 bps；0.1% 范围内买盘深度 80,000 USDC、卖盘 65,000 USDC；最近一分钟成交额 120,000 USDC。1,000 USDC 订单的预估冲击为 3 bps。实际执行前流动性可能变化。", criteria: ["极低：价差大、深度不足", "较低：深度较浅或价格冲击大", "一般：深度可用，但成本明显", "较高：深度充足、价格冲击有限", "极高：价差小、流动性深且稳定"] },
    },
    ko: {
      noul: { question: "호가 스프레드가 예상 왕복 수수료와 슬리피지를 초과하나요?", context: "실시간이 아닌 가상 학습 데이터. HYPE/USDC, 12:00 UTC 관측. 매수 호가 40.00, 매도 호가 40.04 USDC. 스프레드 약 10 bps. 예상 왕복 수수료 4 bps, 총 슬리피지 2 bps. 해당 비용만 비교하며 체결이나 수익을 보장하지 않습니다.", criteria: [] },
      choice: { question: "비용과 상충하는 신호를 고려할 때 이 스냅샷에 가장 적절한 행동은 무엇인가요?", context: "실시간이 아닌 가상 학습 데이터. HYPE/USDC, 12:00 UTC 관측. 중간 가격 40.02 USDC, 스프레드 10 bps, 예상 왕복 비용 12 bps. 매수/매도 깊이 불균형 +0.15, 최근 30초 수익률 -0.08%. 매수와 매도 모두 허용, 현재 포지션 없음. 신호가 충돌하거나 비용이 스프레드를 초과하면 대기할 수 있습니다.", criteria: ["매수 지정가 주문", "매도 지정가 주문", "더 명확한 기회를 기다리기"] },
      score: { question: "가상의 1,000 USDC 주문에 대한 시장 유동성은 어떤가요?", context: "실시간이 아닌 가상 학습 데이터. HYPE/USDC, 12:00 UTC 관측. 스프레드 10 bps. 0.1% 이내 매수 깊이 80,000 USDC, 매도 깊이 65,000 USDC. 최근 1분 거래량 120,000 USDC. 1,000 USDC 주문의 예상 가격 영향 3 bps. 실행 전에 유동성이 바뀔 수 있습니다.", criteria: ["매우 낮음: 넓은 스프레드와 부족한 깊이", "낮음: 얕은 깊이 또는 큰 가격 영향", "보통: 사용 가능한 깊이지만 비용 발생", "높음: 충분한 깊이와 제한된 영향", "매우 높음: 좁은 스프레드와 깊고 안정적인 유동성"] },
    },
  };
  return { type, ...examples[locale][type] };
}

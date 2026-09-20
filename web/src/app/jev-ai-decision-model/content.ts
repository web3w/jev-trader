import type { Locale } from "@/lib/i18n";

export interface GuideContent {
  navTitle: string;
  back: string;
  eyebrow: string;
  title: string;
  tocLabel: string;
  sectionTitles: [string, string, string, string];
  intro: string;
  layerLabels: [string, string, string];
  layerNotes: [string, string, string];
  exampleLabel: string;
  resultLabel: string;
  exampleNote: string;
  scoreFaqTitle: string;
  scoreFaqDescription: string;
  scoreFaqLink: string;
  primitives: Array<{
    name: string;
    question: string;
    description: string;
    prompt: string;
    result: string;
    outcomes: Array<{ label: string; value: number }>;
  }>;
  usesTitle: string;
  uses: Array<{ title: string }>;
  integrationSteps: Array<{ title: string; body: string }>;
  integrationNote: string;
  speedComparisonTitle: string;
  speedComparisonIntro: string;
  speedModelLabel: string;
  speedMultiplierLabel: string;
  speedCostLabel: string;
  speedComparisonNote: string;
  serialTitle: string;
  parallelTitle: string;
  stateLabel: string;
  answerLabel: string;
  diagramNote: string;
  pause: string;
  play: string;
  sourcesTitle: string;
  sourcesNote: string;
  readSource: string;
}

// 教学示例使用固定分布，三种语言保持相同数值，不会发起模型请求。
export const guideContent: Record<Locale, GuideContent> = {
  en: {
    navTitle: "Jev model guide",
    back: "Back to trading",
    eyebrow: "Jev AI Decision Model",
    title: "How Jev turns context into decisions",
    tocLabel: "On this page",
    sectionTitles: ["What is Jev?", "Three ways to ask", "Inside this trader", "Why it can be faster and cheaper"],
    intro: "Jev is an AI decision model by TypeSafe AI, built for structured judgments.",
    layerLabels: ["Application state", "Jev judgment", "Code execution"],
    layerNotes: ["Facts and context", "Typed questions", "Rules and actions"],
    exampleLabel: "Example question",
    resultLabel: "Illustrative result",
    exampleNote: "Fixed teaching data · No live model calls · Probabilities are not guarantees.",
    scoreFaqTitle: "How do I use Jev Score?",
    scoreFaqDescription: "Define a rubric, write a request, and learn how to read scores and confidence.",
    scoreFaqLink: "Read the Score FAQ",
    primitives: [
      {
        name: "Noul",
        question: "Does this condition hold?",
        description: "Returns a value between 0 and 1.",
        prompt: "New-country login, then a large withdrawal. Anomalous?",
        result: "Anomaly likelihood: 94%",
        outcomes: [
          { label: "Anomalous", value: 0.94 },
          { label: "Not anomalous", value: 0.06 },
        ],
      },
      {
        name: "Choice",
        question: "Which allowed option fits best?",
        description: "Returns an option, probabilities and confidence.",
        prompt: "A read-only request timed out. What next?",
        result: "Retry: 65% option probability",
        outcomes: [
          { label: "Retry", value: 0.65 },
          { label: "Fallback", value: 0.2 },
          { label: "Ask user", value: 0.1 },
          { label: "Stop", value: 0.05 },
        ],
      },
      {
        name: "Score",
        question: "Where does this sit on a defined scale?",
        description: "Returns a probability-weighted mean on the defined scale.",
        prompt: "Overwrite production settings without a backup. Risk level, 0–4?",
        result: "Risk score: 2.60 / 4",
        outcomes: [
          { label: "0 Routine", value: 0.05 },
          { label: "1 Minor", value: 0.1 },
          { label: "2 Limited", value: 0.2 },
          { label: "3 Substantial", value: 0.5 },
          { label: "4 Severe", value: 0.15 },
        ],
      },
    ],
    usesTitle: "Common uses",
    uses: [
      { title: "Classification and routing" },
      { title: "Detection and validation" },
      { title: "Scoring and ranking" },
      { title: "Thresholds and human review" },
    ],
    integrationSteps: [
      { title: "Market snapshot", body: "Price · Order book · Recent trades" },
      { title: "Choice: buy or sell?", body: "Market state → Side + probabilities" },
      { title: "Check limits and place an order", body: "Risk limits → Price + size → Order" },
    ],
    integrationNote: "Jev integration in progress · Currently simulating with local rules.",
    speedComparisonTitle: "Model speed & cost",
    speedComparisonIntro: "Baseline: Claude Sonnet 5 = 1×",
    speedModelLabel: "Model / Provider",
    speedMultiplierLabel: "Relative speed",
    speedCostLabel: "Chart cost (USD)",
    speedComparisonNote: "TypeSafe AI chart, not this project's measurements or API prices. Animation differences are compressed; use the labeled ratios.",
    serialTitle: "Generate tokens in sequence",
    parallelTitle: "One state, independent questions",
    stateLabel: "Shared state",
    answerLabel: "Structured results",
    diagramNote: "How it works · Animation is illustrative",
    pause: "Pause animation",
    play: "Play animation",
    sourcesTitle: "Read the original sources",
    sourcesNote: "TypeSafe AI sources · Checked September 18, 2026",
    readSource: "Read source",
  },
  ko: {
    navTitle: "Jev 모델 가이드",
    back: "트레이딩으로 돌아가기",
    eyebrow: "Jev AI 의사결정 모델",
    title: "Jev는 맥락을 어떻게 판단으로 바꿀까요?",
    tocLabel: "페이지 목차",
    sectionTitles: ["Jev란 무엇인가요?", "세 가지 질문 방식", "이 트레이더에서의 역할", "더 빠르고 저렴할 수 있는 이유"],
    intro: "Jev는 구조화된 판단을 위한 TypeSafe AI의 AI 의사결정 모델입니다.",
    layerLabels: ["애플리케이션 상태", "Jev의 판단", "코드 실행"],
    layerNotes: ["사실과 맥락", "결과 형식이 정해진 질문", "규칙과 행동"],
    exampleLabel: "질문 예시",
    resultLabel: "결과 예시",
    exampleNote: "고정된 교육용 데이터 · 모델 호출 없음 · 확률은 결과를 보장하지 않음",
    scoreFaqTitle: "Jev Score는 어떻게 사용하나요?",
    scoreFaqDescription: "평가 기준과 요청을 작성하고 점수와 신뢰도를 읽는 방법을 알아보세요.",
    scoreFaqLink: "Score FAQ 읽기",
    primitives: [
      {
        name: "Noul",
        question: "이 조건이 성립하나요?",
        description: "0에서 1 사이의 값을 반환합니다.",
        prompt: "새로운 국가에서 로그인 후 거액 출금. 이상 징후인가요?",
        result: "이상 징후 가능성: 94%",
        outcomes: [
          { label: "이상 징후 있음", value: 0.94 },
          { label: "이상 징후 없음", value: 0.06 },
        ],
      },
      {
        name: "Choice",
        question: "허용된 선택지 중 무엇이 가장 적절한가요?",
        description: "선택지, 확률 분포와 신뢰도를 반환합니다.",
        prompt: "읽기 전용 요청이 시간 초과되었습니다. 다음 행동은?",
        result: "재시도: 선택지 확률 65%",
        outcomes: [
          { label: "재시도", value: 0.65 },
          { label: "대체 경로", value: 0.2 },
          { label: "사용자에게 질문", value: 0.1 },
          { label: "중단", value: 0.05 },
        ],
      },
      {
        name: "Score",
        question: "정해진 척도에서 어느 정도인가요?",
        description: "정해진 척도에서 확률 가중 평균 점수를 반환합니다.",
        prompt: "백업 없이 운영 설정 덮어쓰기. 위험도는 0–4 중 얼마인가요?",
        result: "위험도 점수: 2.60 / 4",
        outcomes: [
          { label: "0 일반", value: 0.05 },
          { label: "1 경미", value: 0.1 },
          { label: "2 제한적", value: 0.2 },
          { label: "3 상당함", value: 0.5 },
          { label: "4 심각함", value: 0.15 },
        ],
      },
    ],
    usesTitle: "주요 활용 분야",
    uses: [
      { title: "분류와 라우팅" },
      { title: "탐지와 검증" },
      { title: "평가와 순위" },
      { title: "임계값과 사람의 검토" },
    ],
    integrationSteps: [
      { title: "시장 스냅샷", body: "가격 · 호가창 · 최근 체결" },
      { title: "Choice: 매수 또는 매도", body: "시장 상태 → 방향 + 확률" },
      { title: "제한 확인 후 주문", body: "위험 제한 → 가격 + 수량 → 주문" },
    ],
    integrationNote: "Jev 모델 연동 중 · 현재 로컬 규칙으로 시뮬레이션 실행",
    speedComparisonTitle: "모델별 속도와 비용",
    speedComparisonIntro: "기준: Claude Sonnet 5 = 1×",
    speedModelLabel: "모델 / 제공업체",
    speedMultiplierLabel: "상대 속도",
    speedCostLabel: "차트 비용 (USD)",
    speedComparisonNote: "TypeSafe AI 차트 자료이며 프로젝트 실측값이나 API 요금이 아닙니다. 동작 속도 차이는 압축했으며, 정확한 배율은 표시값을 참고하세요.",
    serialTitle: "토큰을 순서대로 생성",
    parallelTitle: "하나의 상태, 독립적인 질문들",
    stateLabel: "공유 상태",
    answerLabel: "구조화된 결과",
    diagramNote: "작동 원리 · 애니메이션은 이해를 돕기 위한 예시",
    pause: "애니메이션 일시 정지",
    play: "애니메이션 재생",
    sourcesTitle: "공식 자료 읽기",
    sourcesNote: "TypeSafe AI 공식 자료 · 2026년 9월 18일 확인",
    readSource: "자료 읽기",
  },
  "zh-CN": {
    navTitle: "Jev 模型原理",
    back: "返回交易页",
    eyebrow: "Jev AI 决策模型",
    title: "Jev：软件里的\nAI 决策层",
    tocLabel: "本页内容",
    sectionTitles: ["Jev 是什么", "三种判断方式", "在这个交易程序中的位置", "为什么能更快、更省"],
    intro: "Jev 是 TypeSafe AI 推出的 AI 决策模型，专注于结构化判断。",
    layerLabels: ["应用状态", "Jev 判断", "代码执行"],
    layerNotes: ["事实与上下文", "指定结果类型的问题", "规则、检查与动作"],
    exampleLabel: "问题示例",
    resultLabel: "示意结果",
    exampleNote: "固定教学数据 · 不调用模型 · 概率不代表结果保证",
    scoreFaqTitle: "Jev Score 如何使用？",
    scoreFaqDescription: "学习定义评分标准、编写请求，以及解读分数和置信度。",
    scoreFaqLink: "阅读 Score FAQ",
    primitives: [
      {
        name: "Noul",
        question: "这个条件成立吗？",
        description: "返回 0 到 1 之间的判断值。",
        prompt: "异国首次登录后立即大额提现，是否异常？",
        result: "异常可能性：94%",
        outcomes: [
          { label: "异常", value: 0.94 },
          { label: "非异常", value: 0.06 },
        ],
      },
      {
        name: "Choice",
        question: "给定的选项中，选哪一个？",
        description: "返回选项、概率分布与置信度。",
        prompt: "只读请求超时，下一步做什么？",
        result: "选择重试，选项概率 65%",
        outcomes: [
          { label: "重试", value: 0.65 },
          { label: "备用方案", value: 0.2 },
          { label: "询问用户", value: 0.1 },
          { label: "停止", value: 0.05 },
        ],
      },
      {
        name: "Score",
        question: "按给定标准，处于什么程度？",
        description: "按给定等级返回概率加权平均分。",
        prompt: "无备份覆盖生产配置，风险等级是多少（0–4）？",
        result: "风险评分：2.60 / 4",
        outcomes: [
          { label: "0 常规", value: 0.05 },
          { label: "1 轻微", value: 0.1 },
          { label: "2 有限损失", value: 0.2 },
          { label: "3 较大损失", value: 0.5 },
          { label: "4 严重", value: 0.15 },
        ],
      },
    ],
    usesTitle: "常见应用",
    uses: [
      { title: "分类与路由" },
      { title: "检测与校验" },
      { title: "评分与排序" },
      { title: "阈值与人工复核" },
    ],
    integrationSteps: [
      { title: "行情快照", body: "价格 · 订单簿 · 近期成交" },
      { title: "Choice 选择买卖", body: "市场状态 → 方向与概率" },
      { title: "检查限制并挂单", body: "风控 → 价格与数量 → 挂单" },
    ],
    integrationNote: "Jev 模型接入中 · 当前使用本地规则模拟运行",
    speedComparisonTitle: "不同模型的速度与成本",
    speedComparisonIntro: "基准：Claude Sonnet 5 = 1×",
    speedModelLabel: "模型 / 提供商",
    speedMultiplierLabel: "相对速度",
    speedCostLabel: "图示成本（USD）",
    speedComparisonNote: "TypeSafe AI 图示数据，非本站实测或 API 单价。动效差距已压缩，以标注倍率为准。",
    serialTitle: "按顺序生成 token",
    parallelTitle: "共享一份状态，处理独立问题",
    stateLabel: "共享状态",
    answerLabel: "结构化结果",
    diagramNote: "工作方式示意 · 动画非实测",
    pause: "暂停动画",
    play: "播放动画",
    sourcesTitle: "查看官方资料",
    sourcesNote: "TypeSafe AI 官方资料 · 2026-09-18 核验",
    readSource: "阅读资料",
  },
};

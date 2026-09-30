import type { Locale } from "@/lib/i18n";
import type { Kind } from "./model";

export const toolPaths: Record<Locale, string> = { en: "/tools/polymarket", "zh-CN": "/zh/tools/polymarket", ko: "/ko/tools/polymarket" };
export const toolUrls = Object.fromEntries(Object.entries(toolPaths).map(([locale, path]) => [locale, `https://jev-trader.com${path}`]));
export const referenceUrl = "https://jev-market-lab.web3w.chatgpt.site/";
export const kinds: Kind[] = ["noul", "choice", "score"];

const en = {
  title: "Jev for Polymarket — Market Analysis", shortTitle: "Jev for Polymarket", tagline: "From market rules to informed decisions.",
  intro: "Turn a market’s settlement rules into a Jev question. Explore three real examples, enter probabilities and compare both sides with buy prices.",
  language: "Language", back: "Back to trading", choose: "Choose a market structure", names: { noul: "Will it happen?", choice: "Which outcome?", score: "Which level?" },
  status: "Manual scenario calculator · no model call or orders", snapshot: "Source quote snapshot", snapshotNote: "Quotes were recorded by the reference demo at the time below. They are editable historical examples, not live offers. Check the original market’s current rules and order book.",
  market: "Open original market ↗", reference: "Reference demo ↗", edit: "1. Prepare the question", question: "Question", rules: "Settlement rules", evidence: "Evidence and observation time", evidenceHint: "Paste relevant facts with sources and dates. Replace the rule summary with the full verified rules before using the request.",
  evidencePlaceholder: "Add dated evidence here…", reset: "Reset this example", request: "Preview Jev request", requestHint: "Add a question, rules and evidence to prepare a request. Choice/Score also require distinct, nonempty outcomes.", requestNote: "Prepared locally; not sent. Call the TypeSafe API separately, then enter the returned probabilities below. Choice uses option_0, option_1…; Score uses level keys 0, 1…; Noul uses noul. Convert 0–1 probabilities to percentages.",
  copy: "Copy request", copied: "Request copied", copyFailed: "Copy unavailable. Select and copy the JSON below.",
  inputs: "2. Enter probabilities and prices", inputNote: "Supply your own estimates or a real model response. Nothing is inferred from the text. All prices and costs are cents per share; probabilities are percentages.",
  outcome: "Outcome / criterion", probability: "YES probability (%)", yes: "Buy YES (¢)", no: "Buy NO (¢)", cost: "Estimated costs per share (¢)", costHint: "Applied to each side separately. Starts at zero; enter applicable fees and execution costs.", calculate: "Compare prices", empty: "Enter probabilities to compare", emptyHint: "Noul needs one YES probability. Choice and Score need a complete distribution totaling 100%. Quotes can be left blank if unavailable.",
  result: "3. Read the comparison", resultBadge: "Calculated from your inputs", yesValue: "YES net value (¢)", noValue: "NO net value (¢)", formula: "In cents per share: YES = entered percentage − buy price − costs. NO = 100 − entered percentage − buy price − costs.",
  resultNote: "Assumes a standard $1 / $0 binary payout. Positive values are conditional estimates, not buy recommendations or guaranteed returns. Verify current quotes, liquidity and settlement rules before trading.",
  score: "Weighted level index", scoreNote: "Σ(level × probability). This is not basis points and not the probability of any one outcome.",
  errors: { criteria: "Outcome labels must be nonempty and distinct; Choice/Score need at least two outcomes.", probability: "Enter a probability from 0 to 100 for every outcome.", sum: "Choice and Score probabilities must total 100%. Values are not automatically normalized.", cost: "Enter costs from 0 to 100 cents per share; use 0 only if assuming no costs.", price: "Enter prices from 0 to 100 cents, or leave missing quotes blank." },
  guide: "From rules to a decision", steps: [
    ["Keep the exact rules", "Dates, timezones, data sources and exceptions define the question. For Choice, outcomes must be mutually exclusive and cover the possible results."],
    ["Match the judgment", "Noul handles one proposition, Choice named alternatives, and Score ordered levels. The probability fields start empty because this tool has not called Jev."],
    ["Verify before execution", "Compare executable prices rather than displayed market probabilities. Use the original market for orders; an order may remain unfilled or fill only partly."],
  ], sources: "Sources and further reading", scoreGuide: "How Jev Score works", priceGuide: "Polymarket prices", orderGuide: "Polymarket limit orders",
};

export const copy: Record<Locale, typeof en> = {
  en,
  "zh-CN": {
    title: "Jev for Polymarket — 市场分析工具", shortTitle: "Jev for Polymarket", tagline: "从市场规则出发，形成有依据的判断。",
    intro: "把市场结算规则转成 Jev 问题。通过三个真实案例，输入概率，比较 YES / NO 两侧的买入价格。",
    language: "语言", back: "返回交易页面", choose: "选择市场问题结构", names: { noul: "会不会发生？", choice: "哪一个会发生？", score: "落在哪个档位？" },
    status: "手动情景计算 · 未调用模型或下单", snapshot: "来源报价快照", snapshotNote: "报价来自参考演示在下列时间记录的页面，可编辑，仅作历史示例，并非实时挂单。请核对原市场当前规则与订单簿。",
    market: "打开原市场 ↗", reference: "参考演示 ↗", edit: "1. 准备判断问题", question: "问题", rules: "结算规则", evidence: "事实依据与观察时间", evidenceHint: "填写带来源和日期的相关事实。使用请求前，请用核实后的完整规则替换这里的规则摘要。",
    evidencePlaceholder: "在此填写带时间的事实依据…", reset: "重置此案例", request: "预览 Jev 请求", requestHint: "填写问题、规则和事实后生成请求。Choice / Score 还需要非空且不重复的结果选项。", requestNote: "请求仅在本地准备，尚未发送。请单独调用 TypeSafe API，再在下方输入返回概率。Choice 对应 option_0、option_1…；Score 对应等级键 0、1…；Noul 对应 noul。将 0–1 概率换算为百分比。",
    copy: "复制请求", copied: "请求已复制", copyFailed: "无法自动复制，请选中并复制下方 JSON。",
    inputs: "2. 输入概率与买价", inputNote: "填写自己的估计或真实模型结果，文字输入不会自动产生预测。价格与成本单位均为美分/份，概率单位为百分比。",
    outcome: "结果 / 判断标准", probability: "YES 概率（%）", yes: "买 YES（¢）", no: "买 NO（¢）", cost: "每份预估成本（¢）", costHint: "分别计入两侧计算。初始为零，请填写适用的手续费和执行成本。", calculate: "比较价格", empty: "输入概率后查看比较", emptyHint: "Noul 只需一个 YES 概率；Choice 和 Score 需要合计 100% 的完整分布。没有报价的一侧可以留空。",
    result: "3. 查看比较结果", resultBadge: "根据你的输入计算", yesValue: "YES 预期净值（¢）", noValue: "NO 预期净值（¢）", formula: "单位为美分/份。YES = 输入的百分数 − 买价 − 成本；NO = 100 − 输入的百分数 − 买价 − 成本。",
    resultNote: "假设标准二元份额按正确 1 美元、错误 0 美元支付。正值是基于输入假设的估计，不是买入建议或保证收益。交易前核对当前报价、流动性和结算规则。",
    score: "加权等级均值", scoreNote: "Σ（等级编号 × 概率）。它不是基点数，也不是某个结果的概率。",
    errors: { criteria: "结果名称必须非空且不重复；Choice / Score 至少需要两个结果。", probability: "请为每个结果填写 0–100 的概率。", sum: "Choice 和 Score 的概率之和必须为 100%，工具不会自动归一化。", cost: "请填写 0–100 美分/份的成本；只有假设无成本时才填 0。", price: "价格须为 0–100 美分，没有报价可留空。" },
    guide: "从市场规则到判断", steps: [
      ["保留完整规则", "日期、时区、数据来源和例外情况决定问题含义。Choice 的结果必须互斥，并覆盖可能发生的情况。"],
      ["选择对应结构", "Noul 对应单个命题，Choice 对应候选结果，Score 对应有序档位。本工具尚未调用 Jev，因此概率默认留空。"],
      ["执行前再次核对", "比较可成交价格，不要直接使用页面显示的市场概率。通过原市场下单；订单可能未成交或仅部分成交。"],
    ], sources: "来源与延伸阅读", scoreGuide: "Jev Score 如何使用", priceGuide: "Polymarket 价格说明", orderGuide: "Polymarket 限价单说明",
  },
  ko: {
    title: "Jev for Polymarket — 시장 분석 도구", shortTitle: "Jev for Polymarket", tagline: "시장 규칙에서 근거 있는 판단으로.",
    intro: "시장 정산 규칙을 Jev 질문으로 구성하세요. 실제 사례 세 가지에서 확률을 입력하고 YES / NO 매수 가격을 비교합니다.",
    language: "언어", back: "거래 화면으로", choose: "시장 질문 구조 선택", names: { noul: "발생할까요?", choice: "어떤 결과일까요?", score: "어느 단계일까요?" },
    status: "수동 시나리오 계산 · 모델 호출 및 주문 없음", snapshot: "출처 가격 스냅샷", snapshotNote: "아래 시점에 참고 데모가 기록한 가격입니다. 수정 가능한 과거 예시이며 실시간 호가가 아닙니다. 원래 시장의 최신 규칙과 주문장을 확인하세요.",
    market: "원래 시장 열기 ↗", reference: "참고 데모 ↗", edit: "1. 판단 질문 준비", question: "질문", rules: "정산 규칙", evidence: "근거와 관측 시점", evidenceHint: "출처와 날짜가 있는 사실을 입력하세요. 요청을 사용하기 전에 규칙 요약을 검증된 전체 규칙으로 바꾸세요.",
    evidencePlaceholder: "날짜가 있는 근거를 입력하세요…", reset: "이 사례 초기화", request: "Jev 요청 미리보기", requestHint: "질문, 규칙, 근거를 입력하면 요청을 준비합니다. Choice / Score의 결과 이름은 비어 있거나 중복되면 안 됩니다.", requestNote: "로컬에서 준비하며 전송하지 않습니다. TypeSafe API를 별도로 호출한 뒤 반환 확률을 입력하세요. Choice는 option_0, option_1…; Score는 단계 키 0, 1…; Noul은 noul을 사용합니다. 0–1 확률을 백분율로 변환하세요.",
    copy: "요청 복사", copied: "요청 복사됨", copyFailed: "자동 복사를 사용할 수 없습니다. 아래 JSON을 선택해 복사하세요.",
    inputs: "2. 확률과 가격 입력", inputNote: "직접 추정한 값이나 실제 모델 응답을 입력하세요. 입력한 글로 예측을 생성하지 않습니다. 가격과 비용은 지분당 센트, 확률은 백분율입니다.",
    outcome: "결과 / 판단 기준", probability: "YES 확률 (%)", yes: "YES 매수 (¢)", no: "NO 매수 (¢)", cost: "지분당 예상 비용 (¢)", costHint: "각 방향에 별도로 적용합니다. 초기값은 0이며 수수료와 실행 비용을 입력하세요.", calculate: "가격 비교", empty: "확률을 입력해 비교하세요", emptyHint: "Noul은 YES 확률 하나가 필요합니다. Choice와 Score는 합계 100%의 분포가 필요합니다. 호가가 없으면 가격을 비워 두세요.",
    result: "3. 비교 결과 확인", resultBadge: "입력값으로 계산한 결과", yesValue: "YES 기대 순가치 (¢)", noValue: "NO 기대 순가치 (¢)", formula: "지분당 센트 기준: YES = 입력한 백분율 수치 − 매수 가격 − 비용. NO = 100 − 입력한 백분율 수치 − 매수 가격 − 비용.",
    resultNote: "정답 1달러, 오답 0달러의 일반적인 이진 지급을 가정합니다. 양수는 입력 가정에 따른 추정이며 매수 권유나 수익 보장이 아닙니다. 거래 전에 최신 호가, 유동성 및 정산 규칙을 확인하세요.",
    score: "가중 단계 평균", scoreNote: "Σ(단계 번호 × 확률). 금리 변동 폭이나 특정 결과의 확률이 아닙니다.",
    errors: { criteria: "결과 이름은 비어 있거나 중복되면 안 됩니다. Choice / Score에는 최소 두 결과가 필요합니다.", probability: "모든 결과에 0–100의 확률을 입력하세요.", sum: "Choice와 Score 확률 합계는 100%여야 합니다. 자동 정규화하지 않습니다.", cost: "지분당 0–100센트의 비용을 입력하세요. 비용이 없다고 가정할 때만 0을 쓰세요.", price: "가격은 0–100센트로 입력하고 호가가 없으면 비워 두세요." },
    guide: "시장 규칙에서 판단까지", steps: [
      ["규칙 보존", "날짜, 시간대, 자료 출처 및 예외가 질문을 정의합니다. Choice 결과는 상호 배타적이며 가능한 결과를 모두 포함해야 합니다."],
      ["판단 구조 선택", "Noul은 단일 명제, Choice는 후보 결과, Score는 순서가 있는 단계를 다룹니다. Jev를 호출하지 않았으므로 확률은 비어 있습니다."],
      ["실행 전 확인", "표시 확률 대신 실제 체결 가능한 가격을 비교하세요. 주문은 원래 시장에서 진행하며 미체결이나 부분 체결이 발생할 수 있습니다."],
    ], sources: "출처와 추가 자료", scoreGuide: "Jev Score 사용법", priceGuide: "Polymarket 가격 안내", orderGuide: "Polymarket 지정가 주문",
  },
};

export const cases: Record<Kind, { url: string; checked: string; quotes: [string, string][]; text: Record<Locale, { title: string; question: string; rules: string; outcomes: string[] }> }> = {
  noul: {
    url: "https://polymarket.com/event/when-will-bitcoin-hit-100k", checked: "2026-09-20T16:47:59Z", quotes: [["28.0", "73.0"]],
    text: {
      en: { title: "Bitcoin · $100,000", question: "Will BTC reach $100,000 by December 31, 2026 under this market’s rules?", rules: "Reference summary: from market creation through December 31, 2026 at 23:59 ET, the final High of any Binance BTC/USDT one-minute candle reaching or exceeding $100,000 resolves YES; otherwise NO. This concerns touching the threshold, not the year-end closing price. Verify the full original rules.", outcomes: ["BTC reaches $100,000 by the selected deadline"] },
      "zh-CN": { title: "比特币 · 10 万美元", question: "按原市场规则，BTC 会在 2026 年 12 月 31 日前达到 10 万美元吗？", rules: "参考摘要：从市场创建到 2026-12-31 23:59 ET，币安 BTC/USDT 任意一分钟 K 线最终最高价达到或超过 100,000 美元即结算为 YES，否则为 NO。判断期间触及，而非年底收盘价。请核对原始完整规则。", outcomes: ["BTC 在指定期限内达到 10 万美元"] },
      ko: { title: "비트코인 · 10만 달러", question: "원래 시장 규칙에 따라 BTC가 2026년 12월 31일까지 10만 달러에 도달할까요?", rules: "참고 요약: 시장 생성부터 2026-12-31 23:59 ET까지 Binance BTC/USDT의 확정된 1분봉 고가가 100,000달러 이상이면 YES, 아니면 NO로 정산합니다. 연말 종가가 아닌 기간 중 도달 여부입니다. 원래 전체 규칙을 확인하세요.", outcomes: ["BTC가 지정 기한 안에 10만 달러 도달"] },
    },
  },
  choice: {
    url: "https://polymarket.com/event/which-exchange-will-anthropic-list-on", checked: "2026-09-20T16:35:00Z", quotes: [["98.6", "14.9"], ["9.9", "99.5"], ["14.2", "98.8"]],
    text: {
      en: { title: "Anthropic · listing venue", question: "Under the original settlement rules, which result describes Anthropic’s first public listing?", rules: "Reference summary: resolve by the primary exchange of first public trading. Other includes other venues, rule-defined merger/SPAC scenarios, or no qualifying IPO/direct-listing trading by December 31, 2027 at 23:59 ET. An announcement alone is not a listing. Verify the full original rules.", outcomes: ["NASDAQ under the original rules", "NYSE under the original rules", "Other, including the rule-defined no-listing cases"] },
      "zh-CN": { title: "Anthropic · 上市交易所", question: "按原结算规则，Anthropic 的首次公开上市将归入哪个结果？", rules: "参考摘要：按首次公开交易的主要上市交易所结算。Other 包括其他场所、规则指定的并购/SPAC 情况，或在 2027-12-31 23:59 ET 前未通过符合要求的 IPO/直接上市开始交易。公告不等于实际上市。请核对原始完整规则。", outcomes: ["原规则定义的 NASDAQ", "原规则定义的 NYSE", "Other，包括规则规定的未上市情形"] },
      ko: { title: "Anthropic · 상장 거래소", question: "원래 정산 규칙상 Anthropic의 최초 공개 상장은 어느 결과에 해당할까요?", rules: "참고 요약: 최초 공개 거래의 주 상장 거래소로 정산합니다. Other에는 다른 거래소, 규칙이 정한 합병/SPAC, 또는 2027-12-31 23:59 ET까지 요건에 맞는 IPO/직접 상장 거래가 없는 경우가 포함됩니다. 발표만으로 상장이 되지는 않습니다. 원래 전체 규칙을 확인하세요.", outcomes: ["원래 규칙에 따른 NASDAQ", "원래 규칙에 따른 NYSE", "규칙이 정한 미상장 사례를 포함한 Other"] },
    },
  },
  score: {
    url: "https://polymarket.com/event/fed-decision-in-october-20260617190323537", checked: "2026-09-20T16:35:00Z", quotes: [["0.4", "99.7"], ["0.6", "99.5"], ["44.0", "57.0"], ["56.0", "45.0"], ["0.9", "99.2"]],
    text: {
      en: { title: "Fed · October 2026", question: "Which ordered category will the October 2026 FOMC rate change fall into under the original rules?", rules: "Reference summary: compare the federal funds target range upper bound before and after the October 27–28, 2026 meeting. Nonstandard changes follow the rule’s upward 25-basis-point bucketing; no statement by the end of the next meeting maps to no change. Verify the full original rules.", outcomes: ["Decrease of 50+ bps", "Decrease of 25 bps", "No change", "Increase of 25 bps", "Increase of 50+ bps"] },
      "zh-CN": { title: "美联储 · 2026 年 10 月", question: "按原市场规则，2026 年 10 月 FOMC 利率变动会落在哪个有序档位？", rules: "参考摘要：比较 2026 年 10 月 27–28 日会议前后联邦基金目标利率区间上限。非标准幅度按原规则向上归至 25 基点档位；到下一次会议结束仍无声明则归入不变。请核对原始完整规则。", outcomes: ["降息至少 50 基点", "降息 25 基点", "利率不变", "加息 25 基点", "加息至少 50 基点"] },
      ko: { title: "연준 · 2026년 10월", question: "원래 규칙에 따라 2026년 10월 FOMC 금리 변화는 어느 순서형 구간에 해당할까요?", rules: "참고 요약: 2026년 10월 27–28일 회의 전후 연방기금 목표금리 범위 상단의 변화를 비교합니다. 비표준 변동 폭은 원래 규칙에 따라 25bp 구간으로 올림하며 다음 회의 종료까지 성명이 없으면 동결로 분류합니다. 원래 전체 규칙을 확인하세요.", outcomes: ["50bp 이상 인하", "25bp 인하", "동결", "25bp 인상", "50bp 이상 인상"] },
    },
  },
};

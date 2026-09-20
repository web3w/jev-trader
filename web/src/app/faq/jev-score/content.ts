import type { Locale } from "@/lib/i18n";

interface ScoreFaqContent {
  title: string;
  intro: string;
  back: string;
  toc: string;
  caseLink: string;
  requestLabel: string;
  requestNote: string;
  formulaLabel: string;
  tableLabel: string;
  columns: [string, string, string, string];
  levels: [string, string, string, string, string];
  subjects: [string, string];
  confidence: string;
  screenshotNote: string;
  sourcesTitle: string;
  sourcesNote: string;
  questions: Array<{ id: string; title: string; paragraphs: string[] }>;
}

// 案例截图数值与请求示例分开保存：展示百分比已舍入，不能冒充原始 API 响应。
export const screenshotResults = [
  { name: "Naruto", score: "3.51", confidence: 59, probabilities: [0, 0, 3, 42, 55] },
  { name: "Slater", score: "1.18", confidence: 68, probabilities: [10, 69, 13, 7, 1] },
];

const criteria = ["None", "Minorly", "Moderately", "Majorly", "Completely"];

// 完整请求仅供阅读；页面不会调用模型，也不会读取 API 密钥。
export const scoreRequest = {
  state: {
    scenario: "Naruto is a Celebes crested macaque living in the Tangkoko nature reserve in North Sulawesi, Indonesia. David Slater, a wildlife photographer shooting macaques in the reserve, leaves his camera unattended, and Naruto repeatedly activates the shutter, producing hundreds of images, including a remarkably sharp, grinning self-portrait reminiscent of a human selfie. Slater later processes and publishes the best photographs in a book that names him as the copyright owner. The book states that Naruto took the photographs, with captions like, 'Surely a sign of self-awareness?' Another caption reads, 'Naruto the macaque smiles at itself while pressing the shutter button on a camera.'",
    subject: "Naruto",
    human: "Slater",
    creative_work: "the grinning self-portrait",
  },
  model: "jev-latest",
  questions: {
    subject_contribution: {
      type: "score",
      instructions: "How much did `subject` contribute to `creative_work`?",
      criteria,
    },
    human_contribution: {
      type: "score",
      instructions: "How much did `human` contribute to `creative_work`?",
      criteria,
    },
  },
};

export const scoreFaqContent: Record<Locale, ScoreFaqContent> = {
  "zh-CN": {
    title: "Jev Score 如何使用？评分标准、分数与置信度详解",
    intro: "从一个评分问题开始，学会定义等级、编写请求和读取结果。用猴子自拍案例，理解一个分数背后的概率分布。",
    back: "返回模型指南",
    toc: "本页问题",
    caseLink: "直接看案例",
    requestLabel: "完整请求示例",
    requestNote: "向下方地址发送 POST 请求；请求头使用 Authorization: Bearer <API_KEY> 和 Content-Type: application/json。密钥应保存在服务端。这里仅展示请求，不执行调用；再次请求不保证得到与截图相同的结果。",
    formulaLabel: "按各等级的概率计算加权平均值",
    tableLabel: "截图中的五档概率分布",
    columns: ["分值", "贡献程度", "猴子 Naruto", "摄影师 Slater"],
    levels: ["没有贡献", "少量贡献", "中等贡献", "主要贡献", "完全贡献"],
    subjects: ["猴子", "摄影师"],
    confidence: "置信度",
    screenshotNote: "以上为案例截图记录，不是本页实时运行的模型结果。概率仅显示整数百分比。",
    sourcesTitle: "继续阅读官方文档",
    sourcesNote: "API 定义与案例解读依据 TypeSafe AI 官方文档；截图记录核验于 2026-09-19。",
    questions: [
      { id: "when-to-use", title: "Score 适合解决什么问题？", paragraphs: ["当答案落在一组有顺序的等级上时，可以使用 Score，例如问题严重程度、技能熟练度或贡献程度。你先描述各档含义，模型再返回沿这条量表的评分。", "Choice 适合从没有高低顺序的选项中选择；Noul 适合判断一个条件是否成立。Score 回答的是“程度如何”，而不只是“是否成立”。"] },
      { id: "request", title: "如何编写一个 Score 请求？", paragraphs: ["state 放事实和上下文；model 选择模型；questions 放需要回答的问题。每道评分题设置 type: score，用 instructions 说明评什么，用 criteria 描述可能的等级。", "示例中，猴子 Naruto 按下摄影师 Slater 留下的相机快门，拍出自拍。摄影师随后处理、挑选并出版照片。两道问题分别评价双方对同一张照片的贡献。", "instructions 中反引号里的 subject、human 和 creative_work 指向 state 的字段。subject_contribution 等问题名称只是结果标识，不参与模型判断，因此问题本身必须写完整。"] },
      { id: "criteria", title: "如何定义评分标准？", paragraphs: ["criteria 按从低到高的顺序排列，至少包含两个等级。数组索引从 0 开始，因此示例的五档 None、Minorly、Moderately、Majorly、Completely 对应 0～4 分。", "实际使用时，先限定评价范围，再用具体行为描述每档。例如明确是否包含设备准备、构图、按快门和后期处理。每道题尽量只评价一个维度，并用已知样例检查等级是否容易区分。"] },
      { id: "read-results", title: "如何读取返回结果？", paragraphs: ["answers 按问题名称返回结果。score 是概率加权后的分值；legend 将等级索引映射回描述；probabilities 给出各档概率，总和为 1；confidence 概括判断的确定程度。", "score = Σ(i × pᵢ)，其中 i 是从 0 开始的等级索引，pᵢ 是该档概率。因此分数可以落在两个整数之间。", "同一个分数可能来自不同分布：所有概率都落在 2 档，或一半在 0 档、一半在 4 档，平均值都是 2。要结合概率分布理解结果。"] },
      { id: "confidence", title: "confidence 应该怎么理解？", paragraphs: ["confidence 是根据完整概率分布计算的 0～1 统计量。它概括分布的确定程度，与评分高低是两个维度：低分也可以有高置信度。", "它不等于最高档位的概率，也不能直接解释为答案的正确率。已核对的官方文档没有给出精确计算公式；即使 confidence 为 1，也不保证判断正确。"] },
      { id: "case-study", title: "猴子自拍案例的结果如何计算？", paragraphs: ["截图中，猴子的概率主要集中在“主要贡献”和“完全贡献”，摄影师主要落在“少量贡献”。先看完整分布，再看它们汇总成的分数。", "按下方显示的整数百分比计算，猴子得到 3.52，摄影师得到 1.20；截图分数为 3.51 和 1.18。微小差异可能来自显示时的舍入，缺少原始响应无法确认具体原因。", "猴子的置信度是 59%，摄影师是 68%。较高的贡献评分并不意味着较高的置信度。"] },
      { id: "common-mistakes", title: "有哪些常见误读？", paragraphs: ["两道题是独立评分，没有要求双方分配同一个总额。因此分数不需要合计为 4；3.51 ÷ 4 只是归一化评分，不代表猴子实际贡献了 87.75%。", "贡献程度也不等于创作意图或版权归属。猴子直接触发拍摄、摄影师提供设备和后续处理，可以帮助理解分数差异，但这是结合故事作出的解读，截图没有返回模型的解释。", "把判断用于实际流程前，先明确贡献的含义，使用已知结果校验标准，并同时读取 score、probabilities 和 confidence。"] },
    ],
  },
  en: {
    title: "How to use Jev Score: rubrics, scores and confidence",
    intro: "Start with a question. Define your levels, write a request and read the result. A monkey-selfie case shows the probability distribution behind a score.",
    back: "Back to model guide",
    toc: "Questions on this page",
    caseLink: "Jump to the case study",
    requestLabel: "Complete request example",
    requestNote: "Send a POST request to the address below, with Authorization: Bearer <API_KEY> and Content-Type: application/json headers. Keep the key on your server. This page displays the request without running it; a new call is not guaranteed to reproduce the screenshot.",
    formulaLabel: "The probability-weighted mean across levels",
    tableLabel: "Five-level distribution shown in the screenshot",
    columns: ["Level", "Contribution", "Naruto", "Slater"],
    levels: ["None", "Minorly", "Moderately", "Majorly", "Completely"],
    subjects: ["Macaque", "Photographer"],
    confidence: "Confidence",
    screenshotNote: "Recorded from the case screenshot, not live model results. Probabilities are displayed as whole percentages.",
    sourcesTitle: "Read the official documentation",
    sourcesNote: "API definitions and interpretation follow TypeSafe AI documentation. Screenshot figures checked on September 19, 2026.",
    questions: [
      { id: "when-to-use", title: "When should I use Score?", paragraphs: ["Use Score when an answer belongs on an ordered scale, such as issue severity, skill level or contribution. Define what each level means, and the model returns a score along that scale.", "Choice selects among options without a ranking. Noul judges whether a condition holds. Score measures a degree rather than just whether something is true."] },
      { id: "request", title: "How do I write a Score request?", paragraphs: ["Put facts and context in state, choose a model with model, and put your questions in questions. Each scoring question uses type: score, instructions to explain what to rate, and criteria to describe the levels.", "In this example, the macaque Naruto triggers the shutter of photographer Slater's unattended camera and takes a selfie. Slater later processes, selects and publishes the photographs. Two questions rate their contributions to the same photograph.", "The backticked names subject, human and creative_work in instructions refer to fields in state. Question IDs such as subject_contribution identify the answers but are not used for inference, so write the complete question in instructions."] },
      { id: "criteria", title: "How do I define a rubric?", paragraphs: ["Order criteria from low to high, with at least two levels. Array indices start at 0, so None, Minorly, Moderately, Majorly and Completely correspond to 0–4 in this example.", "For practical use, define the scope and describe concrete situations at each level. For example, clarify whether preparation, composition, triggering the shutter and editing count. Keep each question to one dimension and test the levels against known examples."] },
      { id: "read-results", title: "How do I read the response?", paragraphs: ["answers returns results under your question IDs. score is the probability-weighted value; legend maps level indices to descriptions; probabilities gives the distribution, summing to 1; confidence summarizes certainty.", "score = Σ(i × pᵢ), where i is the zero-based level index and pᵢ its probability. The score can therefore fall between integer levels.", "Different distributions can produce the same score. All probability on level 2, or half on level 0 and half on level 4, both average to 2. Read the distribution alongside the score."] },
      { id: "confidence", title: "What does confidence tell me?", paragraphs: ["confidence is a statistic from 0 to 1 computed from the full probability distribution. It summarizes certainty in that distribution. Score magnitude and certainty are separate: a low score can have high confidence.", "It is neither the largest level probability nor a directly interpretable accuracy rate. The official pages checked do not specify the exact formula. Even confidence of 1 does not guarantee a correct judgment."] },
      { id: "case-study", title: "How does the monkey-selfie calculation work?", paragraphs: ["The screenshot places most of Naruto's probability on major or complete contribution, and most of Slater's on minor contribution. Read the full distribution before the scores that summarize it.", "Using the displayed whole percentages gives 3.52 for Naruto and 1.20 for Slater; the screenshot reports 3.51 and 1.18. Display rounding may explain the small differences, but the original response is needed to confirm their cause.", "Naruto's confidence is 59%; Slater's is 68%. A higher contribution score does not imply higher confidence."] },
      { id: "common-mistakes", title: "What are the common misinterpretations?", paragraphs: ["These questions are evaluated independently, not as a division of one total. Their scores do not need to add up to 4. Dividing 3.51 by 4 normalizes a score; it does not establish an actual contribution share of 87.75%.", "Contribution also does not establish creative intent or copyright ownership. Naruto triggering the shutter and Slater providing equipment and later processing help interpret the scores, but this is a reading of the story. The screenshot does not provide the model's explanation.", "Before using the judgment in a workflow, define contribution clearly, validate the rubric against known outcomes, and read score, probabilities and confidence together."] },
    ],
  },
  ko: {
    title: "Jev Score 사용법: 평가 기준, 점수와 신뢰도",
    intro: "질문부터 시작해 등급을 정의하고 요청을 작성한 뒤 결과를 읽어 보세요. 원숭이 셀카 사례로 점수 뒤에 있는 확률 분포를 설명합니다.",
    back: "모델 가이드로 돌아가기",
    toc: "이 페이지의 질문",
    caseLink: "사례 바로 보기",
    requestLabel: "전체 요청 예시",
    requestNote: "아래 주소에 POST 요청을 보내고 Authorization: Bearer <API_KEY>와 Content-Type: application/json 헤더를 사용합니다. 키는 서버에 보관하세요. 이 페이지는 요청을 실행하지 않으며, 다시 호출해도 스크린샷과 같은 결과가 보장되지 않습니다.",
    formulaLabel: "등급별 확률로 계산한 가중 평균",
    tableLabel: "스크린샷에 표시된 5단계 확률 분포",
    columns: ["점수", "기여 정도", "Naruto", "Slater"],
    levels: ["기여 없음", "약간 기여", "중간 정도 기여", "주로 기여", "전적으로 기여"],
    subjects: ["원숭이", "사진작가"],
    confidence: "신뢰도",
    screenshotNote: "실시간 모델 결과가 아닌 사례 스크린샷의 기록입니다. 확률은 정수 백분율로 표시됩니다.",
    sourcesTitle: "공식 문서 읽기",
    sourcesNote: "API 정의와 해석은 TypeSafe AI 공식 문서를 따릅니다. 스크린샷 수치는 2026년 9월 19일에 확인했습니다.",
    questions: [
      { id: "when-to-use", title: "Score는 언제 사용하나요?", paragraphs: ["문제의 심각도, 숙련도, 기여도처럼 답에 순서가 있는 척도를 사용할 때 적합합니다. 각 등급의 의미를 정의하면 모델이 그 척도에 따른 점수를 반환합니다.", "Choice는 순서가 없는 선택지 중 하나를 고르고, Noul은 조건이 성립하는지 판단합니다. Score는 참인지 여부뿐 아니라 정도를 평가합니다."] },
      { id: "request", title: "Score 요청은 어떻게 작성하나요?", paragraphs: ["state에 사실과 맥락을 넣고 model로 모델을 선택하며 questions에 질문을 작성합니다. 평가 질문은 type: score를 사용하고, instructions에 평가 대상, criteria에 등급 설명을 지정합니다.", "예시에서 원숭이 Naruto는 사진작가 Slater가 자리를 비운 사이 카메라 셔터를 눌러 셀카를 찍습니다. Slater는 이후 사진을 처리하고 골라 출판합니다. 두 질문은 같은 사진에 대한 각자의 기여를 평가합니다.", "instructions의 백틱으로 감싼 subject, human, creative_work는 state 필드를 가리킵니다. subject_contribution 같은 질문 ID는 결과를 구분할 뿐 추론에 사용되지 않으므로 instructions에 완전한 질문을 작성해야 합니다."] },
      { id: "criteria", title: "평가 기준은 어떻게 정의하나요?", paragraphs: ["criteria를 낮은 등급부터 높은 등급 순서로 나열하고 최소 두 등급을 포함합니다. 배열 인덱스가 0부터 시작하므로 예시의 None, Minorly, Moderately, Majorly, Completely는 0~4점입니다.", "실제로 사용할 때는 평가 범위를 정하고 각 등급을 구체적인 상황으로 설명하세요. 장비 준비, 구도, 셔터 조작, 후처리를 포함하는지 명시하고 질문 하나당 한 측면을 평가합니다. 알려진 사례로 기준을 검증하세요."] },
      { id: "read-results", title: "응답은 어떻게 읽나요?", paragraphs: ["answers는 질문 ID별로 결과를 반환합니다. score는 확률 가중 점수, legend는 등급 인덱스와 설명의 대응, probabilities는 합이 1인 등급별 확률, confidence는 판단의 확실성을 요약한 값입니다.", "score = Σ(i × pᵢ)에서 i는 0부터 시작하는 등급 인덱스, pᵢ는 해당 확률입니다. 따라서 점수는 정수 등급 사이에 위치할 수 있습니다.", "서로 다른 분포가 같은 점수를 만들 수 있습니다. 모든 확률이 2등급에 있거나 0등급과 4등급에 절반씩 있어도 평균은 2입니다. 점수와 분포를 함께 읽어야 합니다."] },
      { id: "confidence", title: "confidence는 무엇을 의미하나요?", paragraphs: ["confidence는 전체 확률 분포에서 계산한 0~1 통계량으로 분포의 확실성을 요약합니다. 점수 크기와 확실성은 별개이므로 낮은 점수에도 높은 신뢰도가 나올 수 있습니다.", "가장 큰 등급 확률과 같지 않으며 정답률로 직접 해석할 수도 없습니다. 확인한 공식 문서에는 정확한 계산식이 공개되어 있지 않습니다. confidence가 1이어도 정답을 보장하지 않습니다."] },
      { id: "case-study", title: "원숭이 셀카 사례의 점수는 어떻게 계산하나요?", paragraphs: ["스크린샷에서 Naruto의 확률은 주로 기여와 전적으로 기여에 집중되고, Slater는 약간 기여에 집중됩니다. 요약 점수를 보기 전에 전체 분포를 살펴보세요.", "표시된 정수 백분율로 계산하면 Naruto는 3.52, Slater는 1.20이지만 스크린샷 점수는 3.51과 1.18입니다. 표시 반올림 때문일 수 있으나 원래 응답 없이 정확한 원인을 확인할 수는 없습니다.", "Naruto의 신뢰도는 59%, Slater는 68%입니다. 기여 점수가 높다고 신뢰도도 높은 것은 아닙니다."] },
      { id: "common-mistakes", title: "어떤 해석을 주의해야 하나요?", paragraphs: ["두 질문은 하나의 총량을 나누지 않고 독립적으로 평가합니다. 점수 합이 4일 필요가 없습니다. 3.51을 4로 나누는 것은 점수 정규화일 뿐 실제 기여 비율이 87.75%라는 뜻은 아닙니다.", "기여도는 창작 의도나 저작권 소유를 확정하지 않습니다. Naruto의 셔터 조작과 Slater의 장비 제공 및 후처리는 점수 해석에 도움이 되지만 이야기로부터의 해석일 뿐입니다. 스크린샷에는 모델의 설명이 없습니다.", "실제 흐름에 적용하기 전에 기여의 의미를 명확히 하고 알려진 결과로 평가 기준을 검증하며 score, probabilities, confidence를 함께 확인하세요."] },
    ],
  },
};

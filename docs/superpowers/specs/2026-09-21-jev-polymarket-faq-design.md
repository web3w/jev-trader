# Jev × Polymarket FAQ: editorial proposal and multilingual draft

Status: restored locally as an independent article after the user clarified that articles and tools are separate. All three language versions are in the FAQ catalog and link to the tool. Not yet deployed.

## Proposed implementation

Use the existing FAQ article layout with server-rendered English, Simplified Chinese and Korean content at `/faq/jev-polymarket`, `/zh/faq/jev-polymarket` and `/ko/faq/jev-polymarket`. Each page gets its own canonical, reciprocal language links, localized metadata and Article structured data. Register the article once in the existing catalog so the FAQ directory, footer and sitemap include it. Preserve existing uncommitted changes.

Recommended approach: an end-to-end educational guide, using the reference site's three cases to explain how model judgments inform a separately executed purchase. A shorter model-selection FAQ would omit the requested purchasing workflow. An automated trading integration would require new functionality beyond an article and would misrepresent the reference demo's capabilities.

The reference site was accessible on 2026-09-21. It explicitly states that Jev has not been called and no orders have been executed. Its September 20 quotations are historical snapshots. The article therefore uses the cases as modeling examples without reproducing stale buy prices or inventing predictions. Market-specific rule summaries are attributed to the reference site, not represented as independently reverified current market rules.

Validation after implementation: FAQ navigation tests; production build; local `check:seo`; HTTP checks for all three pages using ordinary, Googlebot and OAI-SearchBot requests; canonical/hreflang/schema/sitemap/404 checks; mobile overflow, language switching, refresh and back navigation. No deployment is included.

## English article

# How to use Jev to evaluate and buy Polymarket shares

Use Jev to evaluate a precisely defined market outcome, compare that judgment with the price you can actually pay, then submit your purchase on Polymarket. Jev supplies an assessment; your trading interface handles the order.

The [Jev × Polymarket reference demo](https://jev-market-lab.web3w.chatgpt.site/) illustrates this mapping with three real market examples. It reports no completed Jev calls, wallet connection or trades. This guide explains a workflow you can build or follow; the demo itself does not execute it.

## 1. Start with the exact market and its rules

Choose the particular outcome and deadline you want to evaluate. Record the full resolution rules, timezone, evidence source and exceptions. An event can contain several binary markets, so an event title alone does not identify the shares you intend to buy. [Polymarket market structure](https://docs.polymarket.com/concepts/markets-events).

For the reference site's Bitcoin case, the question concerns touching $100,000 before a deadline. That differs from closing above $100,000 on the final day. Reopen the linked original market and check its current rules before using the example.

## 2. Choose the matching Jev question type

| Question | Jev type | Reference example |
| --- | --- | --- |
| Will one proposition be true? | Noul | Bitcoin reaching the specified threshold by the selected deadline |
| Which mutually exclusive outcome occurs? | Choice | Anthropic listing on NASDAQ, NYSE or Other |
| Which ordered category applies? | Score | The October 2026 Fed decision, from a large cut to a large increase |

Noul returns a value for a binary judgment. Choice returns probabilities for named alternatives. Score uses ordered criteria and returns their probabilities plus a weighted level score. [Noul](https://docs.typesafe.ai/primitives/noul), [Choice](https://docs.typesafe.ai/primitives/choice), [Score](https://docs.typesafe.ai/primitives/score).

Preserve the source rules when defining categories. The reference's Anthropic “Other” includes some scenarios with no qualifying listing by the deadline. Its five Fed categories have an order, but their index average is neither a basis-point forecast nor the probability of a particular outcome. These case definitions come from the [reference demo](https://jev-market-lab.web3w.chatgpt.site/); use its original-market links to check the full rules.

## 3. Supply evidence and obtain a real response

Prepare a Jev request containing the market rules and dated evidence in `state`, and the matching question in `questions`. Keep evidence consistent with the decision time. Supplying a market URL alone is not a substitute for collecting the facts to evaluate.

The reference demo's configurations contain no evidence and have not been submitted. Before comparing prices, your integration must make a real request and inspect the corresponding answer. See the existing [Jev trading workflow](/faq/jev-trading) for request handling. A model estimate is not proof that its forecasts are calibrated for this market.

## 4. Compare the selected outcome with its executable price

Keep three quantities separate: the model estimate, the site's displayed market probability, and the price available for your order size. Polymarket's displayed probability can use the bid/ask midpoint or last trade, so it is not necessarily your purchase price. [Price explanation](https://help.polymarket.com/en/articles/13364488-how-are-prices-calculated).

For a standard binary share paying $1 if correct and $0 otherwise, a teaching calculation is:

`estimated net value per share = p − purchase price − costs per share`

For example, suppose—not as a real Jev result—that `p = 0.60`, the purchase price is `$0.55`, and estimated costs are `$0.01` per share. The result is `$0.04` per share under those assumptions. It is an expected-value estimate, not a promised return. If the outcome loses, the purchase cost can be lost. Use the specific market's payout rules and current fees.

## 5. Place and verify the purchase on Polymarket

1. Open the original market and complete Polymarket's account and funding steps applicable to you.
2. Check the exact submarket, deadline and YES/NO side against your Jev question.
3. Inspect available liquidity and the order preview. Choose your amount and maximum acceptable price.
4. If using a limit order, set the price and share quantity, then review the total before submitting.
5. Check orders and positions afterward. An accepted order may be unfilled or partly filled; submission alone does not establish the intended position.

Limit orders can fill partially. Review open orders on the market or Portfolio page, and cancel unwanted outstanding quantities. [Limit-order guide](https://help.polymarket.com/en/articles/13364444-limit-orders).

## 6. Keep a record and follow settlement

Save the rules, evidence time, model response and actual fills. Reassess when facts change. Final settlement follows the original market rules rather than Jev's output. This makes it possible to compare forecast quality and execution costs later without confusing model estimates, screenshots and realized results.

## 中文文章

# 如何使用 Jev 分析并购买 Polymarket 份额

先用 Jev 判断一个定义清楚的市场结果，再把判断与实际可买入价格进行比较，最后在 Polymarket 提交买单。Jev 提供判断，交易界面负责执行订单。

[Jev × Polymarket 参考演示](https://jev-market-lab.web3w.chatgpt.site/)通过三个真实市场案例介绍这套对应关系。页面明确说明：尚未调用 Jev，没有连接钱包，也没有执行交易。本文介绍可搭建或遵循的操作流程，演示页本身尚不执行该流程。

## 1. 先确定买的是哪个市场、哪种结果

明确要判断的结果与截止时间，记录完整结算规则、时区、数据来源及例外情况。一个事件可能包含多个二元市场，只看事件标题，无法准确确定要购买的份额。[Polymarket 市场结构](https://docs.polymarket.com/concepts/markets-events)。

参考页中的比特币案例判断的是：在指定期限内是否曾触及 10 万美元。这与最后一天收盘是否高于 10 万美元不同。使用案例前，应打开原市场重新核对当前规则。

## 2. 按问题结构选择 Jev 类型

| 要判断的问题 | Jev 类型 | 参考案例 |
| --- | --- | --- |
| 一个命题是否成立？ | Noul | BTC 是否在指定期限内达到门槛 |
| 互斥结果中，哪一个发生？ | Choice | Anthropic 在 NASDAQ、NYSE 或 Other 类别上市 |
| 结果落在哪个有序档位？ | Score | 2026 年 10 月美联储决议，从大幅降息到大幅加息 |

Noul 返回二元判断值；Choice 返回各选项的概率；Score 使用有序标准，返回各档概率和加权等级分数。[Noul 文档](https://docs.typesafe.ai/primitives/noul)、[Choice 文档](https://docs.typesafe.ai/primitives/choice)、[Score 文档](https://docs.typesafe.ai/primitives/score)。

定义选项时要保留规则原意。参考页里 Anthropic 的 Other 包括部分未在截止前按要求上市的情形。美联储案例的五个档位可以排序，但档位编号的均值既不是利率变化的基点数，也不是某个结果的概率。这些案例定义来自[参考演示](https://jev-market-lab.web3w.chatgpt.site/)，完整规则应通过其中的原市场链接核对。

## 3. 准备事实，再获取真实模型结果

把市场规则和带时间的事实放入 Jev 请求的 `state`，在 `questions` 中定义对应问题。输入事实的时间应与决策时间一致。只提供市场网址，不能替代对判断所需事实的收集。

参考演示中的配置尚无事实输入，也尚未提交。比较价格前，需要由你的程序真正发起请求，并读取对应问题的结果。请求处理可参考[《Jev 如何驱动交易》](/zh/faq/jev-trading)。模型给出的估计，并不能证明它在这个市场上的预测已经得到校准。

## 4. 比较结果概率与实际买价

区分模型估计、网站显示的市场概率，以及你的订单数量实际能买到的价格。Polymarket 显示的概率可能采用买卖报价中点或最近成交价，并不一定等于买入价格。[价格说明](https://help.polymarket.com/en/articles/13364488-how-are-prices-calculated)。

对于判断正确支付 1 美元、错误支付 0 美元的标准二元份额，可以用下面的教学公式理解：

`每份预期净值 = p − 买入价格 − 每份成本`

假设——并非真实 Jev 输出——`p = 0.60`，买价为 `0.55 美元`，每份预估成本为 `0.01 美元`，则在这些假设下，每份预期净值为 `0.04 美元`。这不是保证收益；结果错误时，买入成本可能全部损失。具体支付规则和费用以原市场当前信息为准。

## 5. 在 Polymarket 买入并核对订单

1. 打开原市场，按 Polymarket 对你的适用要求完成账户和入金步骤。
2. 核对子市场、截止日期以及 YES/NO 方向，确保与 Jev 问题一致。
3. 检查可成交数量和订单预览，确定买入金额与可接受的最高价格。
4. 使用限价单时，设置价格和份额数量，核对总金额后再提交。
5. 提交后检查订单与持仓。订单被接受后，仍可能未成交或仅部分成交，不能把“已提交”直接当成“已持仓”。

限价单可能分批成交。可在市场页或 Portfolio 页面查看挂单，取消不再需要的剩余数量。[限价单说明](https://help.polymarket.com/en/articles/13364444-limit-orders)。

## 6. 保存记录并跟踪结算

记录规则、事实时间、模型结果与实际成交。事实发生变化后重新评估。最终结算遵循原市场规则，由 Jev 给出的概率不会决定市场结果。保留这些记录，才能复盘模型判断与执行成本，避免把模型估计、页面快照和实际收益混在一起。

## 한국어 문서

# Jev로 Polymarket 결과를 분석하고 지분을 매수하는 방법

Jev로 명확하게 정의한 시장 결과를 평가하고, 그 판단을 실제 매수 가능한 가격과 비교한 다음 Polymarket에서 주문을 제출합니다. Jev는 판단을 제공하고 거래 화면은 주문을 실행합니다.

[Jev × Polymarket 참고 데모](https://jev-market-lab.web3w.chatgpt.site/)는 실제 시장 세 가지로 이 관계를 설명합니다. 데모에는 Jev 호출, 지갑 연결, 거래 실행이 아직 없다고 명시되어 있습니다. 이 글은 구성하거나 따라갈 수 있는 절차를 설명하며, 데모 자체가 이를 실행하는 것은 아닙니다.

## 1. 거래할 시장과 정산 규칙 확인하기

평가할 결과와 마감 시점을 정하고 전체 정산 규칙, 시간대, 근거 자료 및 예외를 기록합니다. 하나의 이벤트에 여러 이진 시장이 포함될 수 있으므로 이벤트 제목만으로 매수할 지분을 특정할 수 없습니다. [Polymarket 시장 구조](https://docs.polymarket.com/concepts/markets-events).

참고 데모의 비트코인 사례는 정해진 기간 안에 10만 달러에 도달했는지를 묻습니다. 마지막 날 종가가 10만 달러보다 높은지를 묻는 것과 다릅니다. 사례를 사용하기 전에 원래 시장에서 현재 규칙을 다시 확인하세요.

## 2. 질문 구조에 맞는 Jev 유형 선택하기

| 판단할 질문 | Jev 유형 | 참고 사례 |
| --- | --- | --- |
| 하나의 명제가 참이 되는가? | Noul | BTC가 지정된 기한 안에 기준 가격에 도달하는가 |
| 상호 배타적인 결과 중 무엇이 발생하는가? | Choice | Anthropic의 NASDAQ, NYSE 또는 Other 상장 결과 |
| 순서가 있는 어느 구간에 해당하는가? | Score | 큰 폭의 인하부터 큰 폭의 인상까지 구분한 2026년 10월 연준 결정 |

Noul은 이진 판단값을 반환합니다. Choice는 선택지별 확률을 반환합니다. Score는 순서가 있는 기준에 대해 각 단계의 확률과 가중 단계 점수를 반환합니다. [Noul](https://docs.typesafe.ai/primitives/noul), [Choice](https://docs.typesafe.ai/primitives/choice), [Score](https://docs.typesafe.ai/primitives/score).

선택지를 만들 때 원래 규칙의 의미를 유지해야 합니다. 참고 데모에서 Anthropic의 Other에는 기한 내에 조건에 맞게 상장하지 않는 일부 경우도 포함됩니다. 연준 사례의 다섯 단계에는 순서가 있지만, 단계 번호의 평균은 금리 변동 폭이나 특정 결과의 확률이 아닙니다. 이 사례 정의는 [참고 데모](https://jev-market-lab.web3w.chatgpt.site/)에 따른 것이며 전체 규칙은 데모의 원래 시장 링크에서 확인해야 합니다.

## 3. 근거를 준비하고 실제 응답 받기

Jev 요청의 `state`에 시장 규칙과 시점이 표시된 근거를 넣고 `questions`에 해당 질문을 정의합니다. 근거의 시점은 판단 시점과 일치해야 합니다. 시장 URL만 제공하는 것으로 필요한 사실 수집을 대신할 수는 없습니다.

참고 데모의 설정에는 아직 근거가 입력되지 않았고 요청도 전송되지 않았습니다. 가격을 비교하려면 연동 프로그램이 실제 요청을 보내고 해당 답변을 읽어야 합니다. 요청 구조는 [Jev 거래 과정 가이드(영어)](/faq/jev-trading)를 참고하세요. 모델 추정값만으로 해당 시장에서 예측 확률의 정확성이 검증되었다고 볼 수는 없습니다.

## 4. 결과 확률과 실제 매수 가격 비교하기

모델 추정값, 화면에 표시된 시장 확률, 주문 수량에 적용되는 매수 가격을 구분하세요. Polymarket의 표시 확률은 매수·매도 호가의 중간값이나 최근 체결가를 사용할 수 있어 실제 매수 가격과 다를 수 있습니다. [가격 설명](https://help.polymarket.com/en/articles/13364488-how-are-prices-calculated).

정답이면 1달러, 오답이면 0달러를 지급하는 일반적인 이진 지분의 교육용 계산식은 다음과 같습니다.

`지분당 기대 순가치 = p − 매수 가격 − 지분당 비용`

실제 Jev 응답이 아닌 가정으로 `p = 0.60`, 매수 가격이 `0.55달러`, 지분당 예상 비용이 `0.01달러`라면 기대 순가치는 `0.04달러`입니다. 이는 해당 가정에 따른 기댓값이며 수익 보장이 아닙니다. 결과가 틀리면 매수 비용을 잃을 수 있습니다. 실제 지급 규칙과 수수료는 해당 시장의 최신 정보를 따르세요.

## 5. Polymarket에서 매수하고 주문 확인하기

1. 원래 시장을 열고 본인에게 적용되는 Polymarket 계정 및 자금 충전 절차를 완료합니다.
2. 세부 시장, 마감일, YES/NO 방향이 Jev 질문과 일치하는지 확인합니다.
3. 유동성과 주문 미리보기를 확인하고 매수 금액과 허용할 최대 가격을 정합니다.
4. 지정가 주문을 사용한다면 가격과 지분 수량을 설정하고 총액을 검토한 뒤 제출합니다.
5. 주문과 포지션을 확인합니다. 접수된 주문도 미체결 또는 부분 체결 상태일 수 있으므로 제출만으로 원하는 포지션을 확보했다고 볼 수 없습니다.

지정가 주문은 나누어 체결될 수 있습니다. 시장 또는 Portfolio 페이지에서 미체결 주문을 확인하고 더 이상 필요하지 않은 잔량을 취소할 수 있습니다. [지정가 주문 안내](https://help.polymarket.com/en/articles/13364444-limit-orders).

## 6. 기록을 남기고 정산 추적하기

규칙, 근거 시점, 모델 응답과 실제 체결 내역을 보관하고 사실이 바뀌면 다시 평가합니다. 최종 정산은 Jev 출력이 아닌 원래 시장 규칙을 따릅니다. 이 기록을 통해 모델 추정, 화면 스냅샷, 실현 결과를 구분하면서 예측 품질과 거래 비용을 검토할 수 있습니다.

export const articleContent = {
"en": { introduction: <>
<p>{"A concentrated model answer can look persuasive. That still leaves several research questions: Does the probability match observed outcomes? Can the simulated order fill? Does the result survive costs and a later test period? These questions need separate evidence. This guide outlines an evaluation method for developers and researchers. It reports no backtest results and makes no trade recommendations."}</p>
</>, sections: [
{ id: "quantities", title: "1. Separate the quantities", body: <>
<p>{"For Choice, "}<code>{"probabilities"}</code>{" assigns values across defined options, summing to one; "}<code>{"choice"}</code>{" identifies the largest. The options and their descriptions define what the answer means. See the "}<a href="https://docs.typesafe.ai/primitives/choice">{"official Choice documentation"}</a>{"."}</p>
<p>{"TypeSafe's "}<code>{"confidence"}</code>{" is a 0 to 1 summary derived from the distribution's shape. A concentrated distribution indicates greater certainty. It is not interchangeable with an option probability or a measured success rate. The reviewed page does not specify the exact formula. Choice and Score carry this field; Noul does not. See "}<a href="https://docs.typesafe.ai/confidence">{"TypeSafe's confidence documentation"}</a>{" and "}<a href="https://docs.typesafe.ai/api#answer-types">{"HTTP answer reference"}</a>{"."}</p>
<p>{"An observed win rate is different again. It counts profitable completed trades under a stated accounting rule. Classification accuracy counts correct labels. A directional forecast can be correct while an order remains unfilled or loses after costs. The existing "}<a href="/faq/jev-score">{"Jev Score guide"}</a>{" explains output interpretation; here the focus is testing against outcomes."}</p>
</> },
{ id: "outcomes", title: "2. Define an outcome before collecting predictions", body: <>
<p>{"Write a label that another researcher can reproduce. Specify the market, price source, observation time, horizon, treatment of unchanged prices and missing data. Keep future information out of the input snapshot."}</p>
<p>{""}<strong>{"Illustration only, not a model response or measurement:"}</strong>{" a research question asks whether the mid-price will be strictly higher after 30 seconds. Its two outcomes are "}<code>{"higher"}</code>{" and "}<code>{"not_higher"}</code>{", with illustrative probabilities 0.70 and 0.30. This does not establish a 70% profitable-trade rate. No confidence value is calculated here."}</p>
<p>{"Keep forecast labels separate from action labels. The current trading prompt combines future direction with post-only execution and allowed-side constraints. Its "}<code>{"buy"}</code>{" weight cannot automatically be treated as a calibrated probability of a future price rise. Freeze a prediction-only question for that experiment, and evaluate execution separately. Record the question, criteria, actual model version, timestamps and raw answer before observing the label."}</p>
</> },
{ id: "calibration", title: "3. Test calibration rather than assuming it", body: <>
<p>{"On held-out observations, group forecasts for the same event into probability ranges. For each range, compare the mean predicted probability with the observed event frequency. Show counts alongside the comparison. This is a reliability diagram, as described in "}<a href="https://scikit-learn.org/stable/modules/calibration.html#calibration-curves">{"scikit-learn's calibration guide"}</a>{"."}</p>
<p>{"Then inspect confidence ranges separately: do more concentrated answers show better label accuracy in this dataset? That is an empirical question. Do not replace the event probability with "}<code>{"confidence"}</code>{" on the reliability diagram."}</p>
<p>{"For a defined binary target, also report the Brier score, the mean of "}<code>{"(p − y)²"}</code>{", where "}<code>{"y"}</code>{" is 0 or 1. It evaluates probability predictions; it does not isolate calibration or measure trading returns. See the "}<a href="https://scikit-learn.org/stable/modules/generated/sklearn.metrics.brier_score_loss.html">{"Brier score reference"}</a>{"."}</p>
<p>{"Keep sparse ranges visible. Nearby market observations can be correlated, especially when their forecast windows overlap. Use non-overlapping windows or time-block uncertainty estimates, and report exclusions. If fitting a calibration mapping, fit it on separate development data and evaluate it on untouched later data."}</p>
</> },
{ id: "execution-costs", title: "4. Account for execution and costs", body: <>
<p>{"Run an execution assessment with explicit assumptions. Include maker/taker fees, spread, slippage, latency, partial fills, cancellation and relevant network costs. State which items are modeled and which remain unmeasured. Avoid subtracting spread twice when fill prices already incorporate it."}</p>
<p>{"A quote touching a displayed price does not establish queue priority or a fill. Compare favorable and adverse fill assumptions. Report completed trades, unfilled orders, gross and net results separately. State the denominator of any simulated win rate and how open positions are valued. Include loss magnitude and drawdown; many small wins can coexist with larger losses. These are proposed checks, not results from this site."}</p>
</> },
{ id: "baselines", title: "5. Use later data and simple baselines", body: <>
<p>{"Develop questions, criteria and evaluation rules on an earlier period. Freeze them before testing a later period. Leave a gap that prevents overlapping outcome windows from leaking across the boundary. Changing a threshold after viewing the test results turns that period into development data. The "}<a href="https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html">{"TimeSeriesSplit documentation"}</a>{" explains chronological splits; market-window gaps still require explicit design."}</p>
<p>{"Compare event probabilities against a constant event-frequency baseline estimated only from development data. Compare any execution experiment against predeclared simple rules and a no-order reference, using identical inputs, periods and costs. Report differences and uncertainty, including whether a higher-confidence subset has reduced coverage. A confidence filter is not evidence of improvement by itself."}</p>
</> },
{ id: "demonstration", title: "6. Understand what the current demonstration can show", body: <>
<p>{"The verified Jev Trader source configures the dashboard backend as "}<code>{"MODEL=mock"}</code>{" and dry run. Its local rules combine momentum, order-book imbalance, trade flow and deterministic noise. They do not call Jev. Public market data and simulated fills cannot establish Jev accuracy or real account returns. The "}<a href="/faq/jev-trading">{"trading workflow guide"}</a>{" explains the integration; the current decision adapter does not consume an official "}<code>{"confidence"}</code>{" field."}</p>
<p>{"For an output-format exercise, open "}<a href="/tools/ask-jev-trading">{"Ask Jev Trading"}</a>{", edit a teaching question and inspect the returned structure. It generates random examples, does not evaluate your text, and executes no trades. Its confidence illustration uses normalized entropy, not a verified TypeSafe formula. Use it to practice reading fields, not to build a calibration dataset."}</p>
<p>{"Jev Trader is independently maintained and builds on "}<a href="https://github.com/jarrodwatts/jev-trader">{"Jarrod Watts's original project"}</a>{". This article describes a research protocol; neither the mock dashboard nor the learning tool demonstrates that Jev has passed it."}</p>
</> },
] },
"zh-CN": { introduction: <>
<p>{"模型给出的答案很集中，容易让人觉得可信。但研究者仍要分别验证几个问题：概率与后来发生的结果是否一致？模拟订单能否成交？计入成本后，结果是否还成立？换到更晚的一段数据，结论是否仍然成立？这些问题需要不同的证据。本文给开发者和研究者提供一套评估思路，不报告回测成绩，也不提出交易建议。"}</p>
</>, sections: [
{ id: "quantities", title: "1. 先区分几个数值", body: <>
<p>{"Choice 的 "}<code>{"probabilities"}</code>{" 为已定义的选项分配概率，总和为 1；"}<code>{"choice"}</code>{" 对应概率最高的选项。选项及其描述决定了答案的含义。见 "}<a href="https://docs.typesafe.ai/primitives/choice">{"Choice 官方文档"}</a>{"。"}</p>
<p>{"TypeSafe 的 "}<code>{"confidence"}</code>{" 是根据整个分布形状计算的 0 到 1 概括值。分布越集中，表达的确定性越高。它不能与某个选项的概率互换，也不是已经测得的成功率。此次核对的官方页面没有说明具体公式。Choice 和 Score 有此字段，Noul 没有。见 "}<a href="https://docs.typesafe.ai/confidence">{"confidence 官方说明"}</a>{"与 "}<a href="https://docs.typesafe.ai/api#answer-types">{"HTTP 返回值文档"}</a>{"。"}</p>
<p>{"实际胜率又是另一回事。它按明确的记账规则，统计已完成交易中盈利交易的比例。分类准确率统计的是标签判断正确的比例。方向判断可能正确，但订单没有成交，或扣除成本后仍然亏损。现有 "}<a href="/zh/faq/jev-score">{"Jev Score 指南"}</a>{"介绍了输出字段；本文进一步讨论如何用结果检验这些数值。"}</p>
</> },
{ id: "outcomes", title: "2. 先定义结果，再收集预测", body: <>
<p>{"标签应当让另一位研究者能够复现。明确市场、价格来源、观察时间、预测窗口、价格不变和数据缺失的处理方式。输入快照不能包含未来信息。"}</p>
<p>{""}<strong>{"以下仅为示意，不是模型返回值或实测数据："}</strong>{" 研究问题是“30 秒后的中间价是否严格高于当前中间价”。两个结果是 "}<code>{"higher"}</code>{" 与 "}<code>{"not_higher"}</code>{"，示意概率分别为 0.70 和 0.30。这不能证明有 70% 的交易会盈利。这里也没有计算 confidence。"}</p>
<p>{"预测标签和操作标签应分开。当前交易提示同时涉及未来方向、post-only 挂单和允许操作的限制。因此，"}<code>{"buy"}</code>{" 的权重不能直接当成已经校准的上涨概率。若要研究上涨预测，应先固定一个只判断结果的问题，再单独评估执行。记录问题、标准、实际模型版本、时间和原始回答，然后再观察结果标签。"}</p>
</> },
{ id: "calibration", title: "3. 实测校准，不预设它成立", body: <>
<p>{"在留出的评估数据上，把针对同一事件的预测按概率区间分组。每组比较平均预测概率与实际事件发生比例，并展示样本数。这就是可靠性图。方法可参考 "}<a href="https://scikit-learn.org/stable/modules/calibration.html#calibration-curves">{"scikit-learn 的校准说明"}</a>{"。"}</p>
<p>{"再单独按 confidence 分组，观察分布更集中的回答是否具有更高的标签准确率。这需要数据回答。可靠性图的预测概率不能用 confidence 替代。"}</p>
<p>{"对于定义清楚的二元结果，还可以报告 Brier score，即 "}<code>{"(p − y)²"}</code>{" 的平均值，"}<code>{"y"}</code>{" 取 0 或 1。它评价概率预测，但不能单独证明校准质量，也不衡量交易收益。见 "}<a href="https://scikit-learn.org/stable/modules/generated/sklearn.metrics.brier_score_loss.html">{"Brier score 文档"}</a>{"。"}</p>
<p>{"样本很少的区间也要展示。相邻行情记录可能相关，尤其是预测窗口重叠时。可使用不重叠窗口，或按时间块估计不确定性，并报告剔除规则。如果需要拟合校准映射，应在单独的开发数据上拟合，再用未看过的后续数据评估。"}</p>
</> },
{ id: "execution-costs", title: "4. 单独检查执行与成本", body: <>
<p>{"执行评估必须说明假设。包括 maker/taker 费用、价差、滑点、延迟、部分成交、撤单，以及适用的网络成本。说明哪些因素已经模拟，哪些尚未测量。成交价格已包含价差影响时，避免再次重复扣除。"}</p>
<p>{"报价触及某个显示价格，不代表订单具备排队优先级，也不证明已经成交。比较有利与不利的成交假设。分别报告已完成交易、未成交订单、毛结果和净结果。若报告模拟胜率，要写明分母，以及未平仓部分如何计价。还要观察亏损大小和回撤：多次小额盈利可以被少数较大亏损抵消。这里列出的是待执行的检查，没有声称本站已获得这些结果。"}</p>
</> },
{ id: "baselines", title: "5. 用后续数据和简单基线对照", body: <>
<p>{"先用较早的数据设计问题、标准和评估规则，再固定它们，测试更晚的数据。两段之间留出足够间隔，避免结果窗口重叠导致信息泄漏。如果看完测试结果后再修改阈值，这段数据就已经成为开发数据。按时间切分的原则可参考 "}<a href="https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html">{"TimeSeriesSplit 文档"}</a>{"；行情结果窗口需要另行明确处理。"}</p>
<p>{"概率预测可与一个固定事件频率基线比较，该频率只能从开发数据估计。执行实验可与预先写明的简单规则及不下单的参考组比较。各组使用相同输入、时间段和成本假设。报告差异及不确定性，并说明筛选高 confidence 后覆盖的样本比例。设置了置信度筛选，不代表已经证明效果更好。"}</p>
</> },
{ id: "demonstration", title: "6. 当前演示能说明什么", body: <>
<p>{"已核实的 Jev Trader 源码将看板后端配置为 "}<code>{"MODEL=mock"}</code>{" 和 dry run。它通过本地规则组合动量、盘口不平衡、成交流和确定性噪声，不调用 Jev。公开行情和模拟成交不能证明 Jev 的准确率，也不是实际账户收益。"}<a href="/zh/faq/jev-trading">{"交易流程指南"}</a>{"解释了接入方式；当前决策适配器没有读取官方 "}<code>{"confidence"}</code>{" 字段。"}</p>
<p>{"若想练习阅读输出，可以打开 "}<a href="/zh/tools/ask-jev-trading">{"Ask Jev Trading"}</a>{"，修改一个教学问题，再展开返回结构。工具生成随机示例，不评估你输入的文字，也不执行交易。它用归一化熵演示分布置信度，没有声称复现 TypeSafe 的公式。可以用它理解字段，不能用它建立 Jev 的校准数据集。"}</p>
<p>{"Jev Trader 是基于 "}<a href="https://github.com/jarrodwatts/jev-trader">{"Jarrod Watts 原项目"}</a>{"独立维护的版本。本文说明研究方法。当前 mock 看板和教学工具都没有证明 Jev 已通过这套评估。"}</p>
</> },
] },
};

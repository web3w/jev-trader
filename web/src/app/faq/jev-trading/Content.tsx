import { TradingFlow, InterfaceFlow } from "./Diagrams";
import styles from "../../zh/faq/jev-trading/page.module.css";

// Keep the full translated article in the initial HTML, including examples and diagrams.
export default function Content() {
  return <article className={styles.article}>
<p>An automated trading program repeats three tasks: read the market, make a decision, and manage orders.</p>
<p>In jev-trader, Jev handles the decision. The program prepares market data, asks whether buying or selling is more appropriate, and manages limit orders based on the answer and account constraints.</p>
<p>This guide follows that workflow through the business logic, prompt design, and API fields. The code examples include comments for each field.</p>
<blockquote><p>This describes the implementation reviewed for the original article. Hyperliquid uses real HYPE/USDC spot market data with a simulated account. Kuru retains on-chain order code, but the current page entry point starts only simulated sessions. This is not presented as a completed contract trading system.</p></blockquote>
<h2 id="workflow">1. Trading workflow: execution follows the model’s answer</h2>
<p>An order book lists buy and sell quotes that have not yet been filled. The program reads the order book and recent trades, then converts them into data the model can use.</p>
<TradingFlow />
<p><em>Figure 1. The main trading workflow. Orders and fills on the Hyperliquid path are simulated.</em></p>
<p>There are three distinct events: <strong>the model chooses a direction, the program places an order, and the order actually fills.</strong></p>
<p>For example, if Jev chooses buy, the program considers placing a buy order. An order is only a quote: someone must agree to sell to it before it fills. The current strategy favors post-only orders, which rest on the book rather than immediately taking an opposing quote.</p>
<p>The model does not determine order quantity, sign transactions, or operate a wallet. The execution layer calculates orders using preset rules. If balance or position limits block the chosen direction, the current code may use the opposite side. If neither side is allowed, it places no new order.</p>
<h2 id="interface">2. API structure: context, questions, and answers</h2>
<p>Think of the Jev interface as a multiple-choice question. You provide context and candidate answers; it returns a choice.</p>
<InterfaceFlow />
<p><em>Figure 2. The model returns a decision; the trading program remains responsible for execution.</em></p>
<p><code>state</code> and <code>questions</code> belong to the API structure. Names such as <code>mid</code>, <code>trades</code>, and <code>allowed</code> are application fields defined by this project. See the <a href="https://docs.typesafe.ai/api">TypeSafe API documentation</a>.</p>
<p>Start with the model configuration:</p>
<pre tabIndex={0} aria-label="Annotated model configuration"><code className="language-dotenv">{`# Use Jev. The project's default mock model runs locally and does not call Jev.
MODEL=jev

# Server-side authentication key, read by the provider.
# Do not put it in market data or model traces.
TYPESAFE_AI_API_KEY=your_API_key

# Requested model name; this alias is the project default.
JEV_MODEL_ID=jev-latest
`}</code></pre>
<p>Model configuration and trading mode are separate. You can call the real Jev model while running only simulated trades.</p>
<p>The project calls the model through the AI SDK. This example preserves the call structure; <code>state</code> and <code>QUESTIONS</code> are explained below.</p>
<pre tabIndex={0} aria-label="Annotated model evaluation call"><code className="language-ts">{`import { experimental_evaluate } from "ai";
import { typeSafeAi } from "@ai-sdk/typesafe-ai";

// The project reads config.jevModelId; this shows its default value.
const model = typeSafeAi.evaluationModel("jev-latest");

// Snapshot the inputs so asynchronous work cannot change the recorded context.
const input = structuredClone({
  state,                 // Current market data and allowed directions.
  questions: QUESTIONS,  // Questions for this evaluation.
});

const result = await experimental_evaluate({
  model,                       // Provider-created model instance, not a string.
  state: input.state,           // Application data for the model to evaluate.
  questions: input.questions,   // Instructions and candidate answers.
  maxRetries: 0,                // Disable SDK retries against potentially stale data.
});
`}</code></pre>
<p><code>maxRetries: 0</code> is not a timeout. This call does not set a cancellation signal, so it does not automatically stop after one block interval.</p>
<h2 id="state">3. state: what does the model see?</h2>
<p>The input answers four questions: which market to trade, how far ahead to evaluate, what the market looks like, and which directions execution permits.</p>
<p>The following lists the full <code>TradeState</code>, including nested fields. Prices use the quote asset; quantities use the base asset. One basis point (bps) is 0.01%. A <code>?</code> means the type permits omission; <code>null</code> means no value is available.</p>
<pre tabIndex={0} aria-label="Annotated TradeState fields"><code className="language-ts">{`interface TradeState {
  market: string;       // Market name, such as MON-USDC or HYPE-USDC.
  venue?: string;       // Venue; currently Kuru or hyperliquid.
  baseAsset?: string;   // Base asset, such as MON or HYPE; also the quantity unit.
  quoteAsset?: string;  // Quote asset, such as USDC; also the price unit.

  block: number;          // On-chain block number on Kuru; local event number on Hyperliquid.
  horizonBlocks: number;  // Forward evaluation window in observation units, not order frequency.
  blockMs: number;        // Nominal duration of an observation unit, in milliseconds.
  mid: number;            // Midpoint = (best bid + best ask) / 2.
  spreadBps: number;      // Spread = (best ask - best bid) / mid * 10000.
  bookImbalance: number;  // (Bid volume - ask volume) / their sum, within 1% of mid.

  depth: {               // Cumulative resting quantities within price bands.
    [band: string]: {     // Band keys; currently 10, 25, and 50 bps.
      bid: number;       // Cumulative buy quantity within the band, in base asset.
      ask: number;       // Cumulative sell quantity within the band, in base asset.
    };
  };

  book: {                // Up to five levels per side near the best quotes.
    bids: string[];      // Best bid first; each entry is "price x quantity".
    asks: string[];      // Best ask first; each entry is "price x quantity".
  };

  returnsBps: {          // Price changes relative to historical samples, in bps.
    last1: number;       // Relative to one recorded price sample earlier.
    last5: number;       // Relative to five recorded price samples earlier.
    last20: number;      // Relative to 20 recorded price samples earlier.
    last100: number;     // Relative to 100 recorded price samples earlier.
  };

  recentMids: string;    // Space-separated midpoints, oldest to newest; sampling is below.

  trades: {             // Recent market-wide aggressive trades, not this strategy's fills.
    count: number;      // Number of retained trade records in the window.
    buyMon: number;     // Aggressive buy quantity; the actual unit is baseAsset.
    sellMon: number;    // Aggressive sell quantity; the actual unit is baseAsset.
    cvdMon: number;     // buyMon - sellMon; can be negative; covers this window only.
    vwap: number | null;       // Volume-weighted average price; null without valid volume.
    lastPrice: number | null;  // Last trade price in the window; null without a record.
    lastSide: "buy" | "sell" | null; // Last trade's aggressor side; null without a record.
  };

  recentTrades: string[]; // Up to 10 recent trades, oldest to newest; format is below.

  allowed: {             // Directions permitted by the program; checked again before execution.
    buy: boolean;        // Whether a new buy order is currently allowed.
    sell: boolean;       // Whether a new sell order is currently allowed.
  };
}
`}</code></pre>
<p>If the best bid is 99.9 and the best ask is 100.1, then <code>mid = 100</code> and <code>spreadBps = 20</code>.</p>
<p>If recent aggressive buys total 12 HYPE and aggressive sells total 8 HYPE, then <code>cvdMon = 4</code>. The legacy Mon name is retained, but the value here represents 4 HYPE.</p>
<p><code>bookImbalance</code> describes the balance of resting buy and sell quantities. A value of 0.5 does not mean a 50% probability of a price increase.</p>
<p>The two markets share fields but use different sampling conventions:</p>
<div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Market parameter comparison"><table>
<thead><tr><th scope="col">Parameter</th><th scope="col">Kuru</th><th scope="col">Hyperliquid</th></tr></thead>
<tbody>
<tr><td><code>horizonBlocks × blockMs</code></td><td>Default: 100 × 300ms, about 30 seconds</td><td>30 × 1000ms, about 30 seconds</td></tr>
<tr><td><code>depth</code> keys</td><td>For example, <code>"10bps"</code></td><td>For example, <code>"10"</code>; still measured in bps</td></tr>
<tr><td><code>recentMids</code></td><td>Every fifth sample among the latest H samples, including the latest value</td><td>Up to the latest 30 samples</td></tr>
<tr><td><code>trades</code> window</td><td>Retained trades from the latest H blocks</td><td>Retained trades from the latest 30 seconds</td></tr>
<tr><td><code>recentTrades</code></td><td>Latest 10 records, prefixed with a block number</td><td>Up to 10 from the latest 30 seconds, prefixed with a millisecond timestamp</td></tr>
<tr><td>Insufficient return history</td><td>Corresponding <code>returnsBps</code> value is 0</td><td>Compare against the earliest retained sample</td></tr>
</tbody></table></div>
<p>H means <code>horizonBlocks</code>. The rest of each trade summary is “buy or sell quantity @ price”. Samples may be unevenly spaced because of disconnections or processing delays, so “20 samples earlier” does not necessarily mean “20 seconds ago”.</p>
<h2 id="prompt">4. Prompt design: make the task specific</h2>
<p>Simply asking “should we buy or sell now?” leaves out the intended holding period and how orders will fill.</p>
<p>The current prompt separates the prediction target, forecast window, execution method, reference inputs, and available actions.</p>
<p>The example below retains the actual field structure but paraphrases the instructions for teaching. It is not a verbatim copy of the source prompt.</p>
<pre tabIndex={0} aria-label="Annotated direction prompt"><code className="language-ts">{`const QUESTIONS = {
  direction: {             // Custom question name; read its answer from answers.direction.
    type: "choice",        // Choose among the options in criteria.

    instructions: {        // Question context; nested keys are defined by the project.
      question:            // Prediction target: future price relative to the current mid.
        "After horizonBlocks observation units, will the base asset price be above or below the current midpoint?",

      goal:                // Use: choose a resting order side, considering costs and inventory.
        "Choose a post-only order side for market on venue, over roughly horizonBlocks * blockMs milliseconds, considering spread, fees, and position limits.",

      timing:              // An order waits for an aggressor or may be replaced first.
        "Orders wait to be filled by an aggressor or replaced. Placement does not guarantee a fill and is not immediate market execution.",

      inputs:              // Reference data and constraints; execution skips new orders if neither side is allowed.
        "Consider trades.cvdMon, trades.lastSide, recentTrades, depth, book, returnsBps, and recentMids. Respect allowed.",
    },

    criteria: {            // Candidate answers and their evaluation criteria.
      buy:                 // Expect strength; avoid a drop immediately after a buy fill.
        "Place a buy order when future prices appear stronger, subject to allowed.buy.",

      sell:                // Expect weakness; avoid a rise immediately after a sell fill.
        "Place a sell order when future prices appear weaker, subject to allowed.sell.",
    },
  },
} as const;
`}</code></pre>
<p>This combines “what to predict” with “how the prediction will be used”. The model sees both the price-direction task and its role in choosing a side for a limit order waiting to fill.</p>
<p>Two qualifications matter.</p>
<p>First, the only candidate answers are <code>buy</code> and <code>sell</code>. There is no explicit abstain option. A <code>hold</code> in the program does not directly mean Jev chose to wait.</p>
<p>Second, although the prompt asks the model to consider fees, the current <code>state</code> supplies neither an explicit fee rate nor complete position profit and loss. Mentioning something in the instructions does not supply its underlying data.</p>
<h2 id="response">5. Responses: turning an answer into an application decision</h2>
<p>These are the SDK application fields the project reads or stores, excluding transport details such as response headers.</p>
<pre tabIndex={0} aria-label="Annotated SDK response fields"><code className="language-ts">{`interface UsedSdkResult {
  answers: {                    // Answers keyed by the question names in the request.
    direction: {                // Corresponds to questions.direction.
      type: "choice";           // Answer type, matching the request.
      choice: "buy" | "sell";   // Direction selected by the model.
      probabilities?: {         // The installed SDK type permits missing probabilities.
        buy: number;            // Buy-option probability, normally between 0 and 1.
        sell: number;           // Sell-option probability; normally sums with buy to 1.
      };
    };
  };

  usage: {                      // Token counts, not a monetary charge.
    inputTokens: number | undefined;   // Used by the project to estimate model cost.
    outputTokens: number | undefined;  // Not separately used in the current cost estimate.
    totalTokens: number | undefined;   // Not separately copied into Decision.
  };
}
`}</code></pre>
<p>The SDK converts HTTP usage fields such as <code>input_tokens</code> and <code>output_tokens</code> into the camelCase names above. The official HTTP documentation also describes <code>confidence</code>, but the installed SDK Choice type reviewed for this article does not expose it, and the project does not read it. See the <a href="https://docs.typesafe.ai/api">response documentation</a>.</p>
<p>The project then normalizes the answer into its own result type and retains a trace of the call:</p>
<pre tabIndex={0} aria-label="Annotated decision and trace fields"><code className="language-ts">{`interface Decision {
  action: "buy" | "sell" | "hold"; // Jev initially returns buy or sell; execution may adjust it.
  probabilities: {              // Normalized probability distribution.
    buy: number;                // Buy probability; a missing individual option becomes 0.
    sell: number;               // Sell probability; a missing individual option becomes 0.
    hold: number;               // Always 0 in a normal JevModel result.
  };
  upIn10: number;                // Legacy field name: equals buy probability, not a separate forecast.
  latencyMs: number;             // Locally measured model-call time, including waiting but not order placement.
  inputTokens: number;           // Input tokens; missing values become 0, which does not mean it was free.
  trace?: ModelTrace;            // Recorded input and output for review.
}

interface ModelTrace {
  source: "jev" | "simulation";  // Jev or MockModel; does not indicate live versus simulated trading.
  model: string;                // Configured model name, such as jev-latest or mock.
  input: {                      // Input snapshot taken before the call.
    state: TradeState;          // Market context, described above.
    questions?: unknown;        // Question set; omitted by MockModel.
  };
  output: unknown;              // Jev stores { answers, usage }; see UsedSdkResult.
                                // MockModel stores a simulated Decision without trace.
}
`}</code></pre>
<p>If the SDK returns no probabilities at all, the current code assigns 1 to the chosen option and 0 to the others. That displayed 100% is an application fallback, not the model’s measured certainty.</p>
<p>Even when the model returns <code>buy: 0.7</code>, interpret it first as the probability assigned to the buy option. <strong>It is not automatically the probability of a profitable trade.</strong> Fill price, exit timing, and costs all affect the outcome.</p>
<h2 id="execution">6. Following one decision through execution</h2>
<p>Suppose Jev returns buy with a buy probability of 0.7.</p>
<p>The program checks balances and positions. If buying is allowed, it quotes according to the execution rules. If buying is blocked but selling is allowed, the current code may place a sell order instead. The order’s <code>capped</code> field marks this direction adjustment.</p>
<p>When reviewing a run, distinguish three records:</p>
<ul><li><code>trace.output</code>: what the model originally chose.</li><li>The final order: what the program actually prepared to execute.</li><li>The fill record: what the market ultimately filled.</li></ul>
<p>The Jev API is responsible only for the first part. Code handles order execution and account updates, while model traces make the chain of decisions auditable.</p>
<p>This article is based on the implementation reviewed in <a href="https://github.com/web3w/jev-trader/blob/main/src/model.ts">model.ts</a>, <a href="https://github.com/web3w/jev-trader/blob/main/src/trader.ts">trader.ts</a>, <a href="https://github.com/web3w/jev-trader/blob/main/src/hyperliquid.ts">hyperliquid.ts</a>, and the local SDK type definitions. The code blocks explain fields; they are not a complete script for starting a trading session.</p>
  </article>;
}

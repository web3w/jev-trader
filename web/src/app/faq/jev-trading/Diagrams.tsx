import styles from "../../zh/faq/jev-trading/page.module.css";

// HTML diagrams stay readable and accessible without loading a client-side diagram library.
export function TradingFlow() {
  return <figure className={styles.diagram} aria-label="Trading workflow diagram">
    <div className={styles.flow}>
      <div className={styles.step}><strong>Read market data</strong><span>Quotes, resting quantities, recent trades</span></div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={styles.step}><strong>Prepare state</strong><span>Spread, returns, allowed directions</span></div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={`${styles.step} ${styles.model}`}><strong>Jev chooses buy or sell</strong><span>Provides a decision; does not place orders</span></div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={styles.step}><strong>Execution checks balances and positions</strong><span>Is either direction allowed?</span></div>
      <div className={styles.branches}>
        <div><span className={styles.branchLabel}>Yes ↓</span><div className={styles.step}><strong>Cancel and replace orders</strong><span>Update the account after fills</span></div></div>
        <div><span className={styles.branchLabel}>No ↓</span><div className={styles.step}><strong>Place no new order</strong><span>Record this cycle’s state</span></div></div>
      </div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={styles.step}><strong>Display decisions, orders, and P&L</strong><span>Start another cycle when new data arrives ↻</span></div>
    </div>
  </figure>;
}

export function InterfaceFlow() {
  return <figure className={styles.diagram} aria-label="Jev API data flow diagram">
    <div className={styles.flow}>
      <div className={styles.branches}>
        <div className={styles.step}><strong>state</strong><span>What is happening now</span></div>
        <div className={styles.step}><strong>questions</strong><span>What to evaluate and how to choose</span></div>
      </div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={`${styles.step} ${styles.model}`}><strong>Jev</strong><span>Answer questions using the context</span></div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={styles.step}><strong>answers → Decision</strong><span>Choice and probabilities → application result</span></div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={styles.step}><strong>Execution layer</strong><span>Recheck constraints and manage orders</span></div>
    </div>
  </figure>;
}

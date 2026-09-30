import styles from "./page.module.css";

// HTML diagrams stay readable and accessible without loading a client-side diagram library.
export function TradingFlow() {
  return <figure className={styles.diagram} aria-label="交易流程图">
    <div className={styles.flow}>
      <div className={styles.step}><strong>读取行情</strong><span>报价、挂单量、近期成交</span></div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={styles.step}><strong>整理 state</strong><span>价差、涨跌幅、允许方向</span></div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={`${styles.step} ${styles.model}`}><strong>Jev 选择买入或卖出</strong><span>只提供判断，不直接下单</span></div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={styles.step}><strong>执行层检查余额和仓位</strong><span>有允许执行的方向吗？</span></div>
      <div className={styles.branches}>
        <div><span className={styles.branchLabel}>有 ↓</span><div className={styles.step}><strong>撤换挂单</strong><span>后续成交后更新账户</span></div></div>
        <div><span className={styles.branchLabel}>没有 ↓</span><div className={styles.step}><strong>不放置新订单</strong><span>记录本轮状态</span></div></div>
      </div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={styles.step}><strong>展示判断、订单和盈亏</strong><span>新行情到来，再进入下一轮 ↻</span></div>
    </div>
  </figure>;
}

export function InterfaceFlow() {
  return <figure className={styles.diagram} aria-label="Jev 接口数据流图">
    <div className={styles.flow}>
      <div className={styles.branches}>
        <div className={styles.step}><strong>state</strong><span>现在发生了什么</span></div>
        <div className={styles.step}><strong>questions</strong><span>判断什么，怎样选择</span></div>
      </div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={`${styles.step} ${styles.model}`}><strong>Jev</strong><span>根据材料回答问题</span></div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={styles.step}><strong>answers → Decision</strong><span>选项与概率 → 项目使用的结果</span></div>
      <span className={styles.arrow} aria-hidden="true">↓</span>
      <div className={styles.step}><strong>执行层</strong><span>再次检查约束，处理订单</span></div>
    </div>
  </figure>;
}

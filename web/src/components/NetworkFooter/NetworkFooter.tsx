import type { Messages } from "@/lib/i18n";
import type { ConnectionState, Meta } from "@/lib/types";
import styles from "./NetworkFooter.module.css";

export default function NetworkFooter({ meta, messages, connection }: { meta: Meta | null; messages: Messages; connection: ConnectionState }) {
  const isHyperliquid = meta?.venue === "hyperliquid";
  const isMonad = meta?.venue === "kuru" && meta.chainId === 143;
  // Addresses come from the running backend; HyperCore spot markets do not show EVM contract details.
  const contracts = [
    { label: messages.orderBookContract, address: meta?.market },
    { label: messages.marginContract, address: meta?.marginAccount },
  ];

  return (
    <footer className={styles.footer} aria-label={messages.networkInfo}>
      <dl className={styles.network}>
        <div>
          <dt>{messages.network}</dt>
          <dd>{isHyperliquid ? "Hyperliquid L1" : isMonad ? `Monad ${messages.mainnet}` : "-"}</dd>
        </div>
        <div>
          <dt>{isHyperliquid ? messages.execution : messages.chainId}</dt>
          <dd>{isHyperliquid ? "HyperCore" : meta?.chainId ?? "-"}</dd>
        </div>
        <div>
          <dt>{messages.nativeToken}</dt>
          <dd>{isHyperliquid ? "HYPE" : isMonad ? "MON" : "-"}</dd>
        </div>
        <div>
          <dt>{messages.tradingMarket}</dt>
          <dd>{meta?.symbol ?? "-"}{isHyperliquid ? ` ${messages.spot}` : ""}</dd>
        </div>
        {isHyperliquid ? (
          <div>
            <dt>{messages.dataStatus}</dt>
            <dd>{connection !== "live" ? messages[connection] : meta.marketStatus === "live" ? messages.liveMarket : messages[meta.marketStatus]}</dd>
          </div>
        ) : null}
      </dl>
      {isHyperliquid ? (
        <div className={styles.marketDetails}>
          <a href={meta.marketUrl} target="_blank" rel="noreferrer">{messages.viewMarket} ↗</a>
          <span>{messages.paperTrading}</span>
          <p className={styles.note}>{messages.simulationNote}</p>
        </div>
      ) : (
        <dl className={styles.contracts}>
          {contracts.map(({ label, address }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                {isMonad && address ? (
                  <a
                    href={`https://monadvision.com/address/${address}`}
                    target="_blank"
                    rel="noreferrer"
                    title={messages.viewContract}
                    aria-label={`${label}: ${address}, ${messages.viewContract}`}
                  >
                    {address}
                  </a>
                ) : "-"}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </footer>
  );
}

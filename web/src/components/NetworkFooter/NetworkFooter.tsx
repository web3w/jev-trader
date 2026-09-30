import type { Messages } from "@/lib/i18n";
import type { ConnectionState, Meta, Venue } from "@/lib/types";
import styles from "./NetworkFooter.module.css";

export default function NetworkFooter({ venue, meta, messages, connection }: { venue: Venue; meta: Meta | null; messages: Messages; connection: ConnectionState }) {
  // Static market identity comes from the route, while status and addresses come from the feed.
  const isHyperliquid = venue === "hyperliquid";
  const marketStatus = connection === "live" ? meta?.marketStatus ?? "connecting" : connection;
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
          <dd>{isHyperliquid ? "HYPE/USDC" : "MON/USDC"}{isHyperliquid ? ` ${messages.spot}` : ""}</dd>
        </div>
        {isHyperliquid ? (
          <div>
            <dt>{messages.dataStatus}</dt>
            <dd>{marketStatus === "live" ? messages.liveMarket : messages[marketStatus]}</dd>
          </div>
        ) : null}
      </dl>
      {isHyperliquid ? (
        <div className={styles.marketDetails}>
          {meta?.marketUrl ? <a href={meta.marketUrl} target="_blank" rel="noreferrer">{messages.viewMarket} ↗</a> : null}
          {meta?.dryRun ? <span>{messages.paperTrading}</span> : null}
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

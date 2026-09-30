# JEVM homepage market taxonomy

Research note — 2026-09-23. This is a vocabulary and visual-structure guide, not a claim that JEVM currently supports every item shown.

## 1. What is traded: assets and instruments

| Visual label | Precise meaning |
| --- | --- |
| Equities | Ownership interests, such as stocks. [SEC Investor.gov](https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks) |
| Bonds | Debt securities: a holder lends to an issuer under the bond's terms. A bond is an **instrument**, while lending is an **activity**. [SEC Investor.gov](https://www.investor.gov/introduction-investing/investing-basics/glossary/bonds) |
| Commodities | Underlying physical goods, such as agricultural products, energy and metals; a commodity future is a separate contract, not ownership of the physical good. The CFTC's *legal* definition of “commodity” is broader, so use “physical commodities” if the artwork depicts goods. [CFTC glossary](https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CFTCGlossary/index.htm); [CFTC commodity ETP advisory](https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_CommodityETPs.htm) |
| Currencies / cash | Currency is a financial-asset category and a means of payment; foreign exchange is trading one currency against another. A currency pair is a trading relationship, not a stock or bond. [IMF classification, ch. 4](https://www.imf.org/en/-/media/files/data/guides/mfsmcg-final.pdf); [CFTC glossary](https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CFTCGlossary/index.htm) |
| Futures / options | **Derivative contracts**, whose value or payoff refers to an underlying commodity, asset, rate or index. They can reference several of the rows above and should not be drawn as another underlying asset class. [IMF derivatives definition](https://www.elibrary.imf.org/display/book/9781557759740/ch005.xml); [CFTC futures basics](https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/FuturesMarketBasics/index.htm) |

The IMF classifies currency, debt securities, loans, equity and financial derivatives separately as financial instruments; that classification does **not** turn all underlying commodities into financial assets. “Cash” should mean money or a cash position, not every currency-denominated security. [IMF classification, ch. 4](https://www.imf.org/en/-/media/files/data/guides/mfsmcg-final.pdf)

## 2. What participants do: market activities and functions

**Trading** buys or sells instruments; **market making** is the specific activity of standing ready to buy and sell at quoted prices. **Lending/borrowing** creates credit obligations (a loan may be the resulting instrument); **risk management** measures and controls exposures and may use hedges. These are actions or functions that can apply across asset classes, not peers of equities or bonds. [SEC market centers](https://www.sec.gov/answers/market.htm); [IMF classification, ch. 4](https://www.imf.org/en/-/media/files/data/guides/mfsmcg-final.pdf); [IMF derivatives annex](https://www.elibrary.imf.org/display/book/9781557759740/ch005.xml); [CPMI-IOSCO PFMI](https://www.bis.org/committees/cpmi/pfmi/overview)

**Clearing** processes and reconciles a trade before settlement, potentially including netting and establishing final obligations. For futures/options it can also include daily profit-and-loss balancing and collateral calculations. **Settlement** discharges the obligations under the contract, for example through final transfer of securities and payment. They are related post-trade functions, but are not synonyms; a central counterparty or securities settlement system is an institution/system that may perform a role in them. [BIS CPMI glossary](https://www.bis.org/committees/cpmi/glossary); [CPMI-IOSCO PFMI](https://www.bis.org/committees/cpmi/pfmi/overview)

## 3. Where EVM belongs

The **Ethereum Virtual Machine (EVM)** is the execution environment for smart-contract code and deterministic state transitions. Smart contracts can implement market applications or parts of their workflows, but the EVM is neither an asset class nor, by itself, an exchange, market maker, clearing house or settlement system. Ethereum transaction inclusion and consensus finality are network processes distinct from EVM execution; legal or off-chain settlement of an asset may require additional arrangements. [Ethereum EVM docs](https://ethereum.org/developers/docs/evm/); [Ethereum transactions](https://ethereum.org/developers/docs/transactions); [Ethereum proof-of-stake/finality](https://ethereum.org/developers/docs/consensus-mechanisms/pos/); [CPMI-IOSCO PFMI](https://www.bis.org/committees/cpmi/pfmi/overview)

## Design implications

1. Give the hero two clearly labeled bands: **Assets & instruments** and **Market activities**. Do not mix their labels in one undifferentiated orbit.
2. Group equities, bonds, physical commodities and currencies as underlying exposures; place **futures/options** in a derivative overlay with connectors to possible underlyings.
3. Show **lending/borrowing** as an action between parties, with a loan or bond only as the resulting/related instrument; show **market making** as two-sided quotes around a traded instrument.
4. Where clearing applies, draw **trade → clearing → settlement**; do not imply every trade requires a separate clearing house. Show risk management spanning the process rather than appearing as an asset tile.
5. Put **EVM / smart-contract execution** in a separate infrastructure layer. Use wording such as “can execute market logic”; claim clearing, final settlement or supported markets only where JEVM's actual implementation establishes them.

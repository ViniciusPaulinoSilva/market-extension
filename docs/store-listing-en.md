# Chrome Web Store listing (English)

Everything below is ready to copy and paste into the Developer Dashboard (Store listing and Privacy tabs).
Upload file: `store/market-quotes-1.0.0.zip`. The extension is bilingual: the interface and the Chrome Web Store name/summary follow the browser language (Portuguese for pt-BR and pt-PT, English for everything else).
Default listing language: **English**. Then add **Português (Brasil)** as a second listing language using `docs/loja-textos.md` (dashboard: Store listing > Language).

## Name (max 75 characters; comes from the manifest)
Market Quotes: Currency, Crypto & Index Alerts

## Summary (max 132 characters; comes from the manifest)
Track up to 5 currencies, cryptos or indices and get an alert when one moves fast.

## Detailed description
Follow the prices that matter to you in a Chrome side panel, and get a notification when one of them moves fast.

What it does:
• Shows the price and 24-hour change of up to 5 assets you choose.
• Currencies: US dollar, euro, pound, yen and yuan against the Brazilian real, plus the global pairs EUR/USD, GBP/USD, USD/JPY and USD/CNY.
• Crypto: Bitcoin, Ethereum, BNB, Solana, XRP, TRON, Hyperliquid, Zcash, Dogecoin and Chainlink, always in US dollars.
• Indices: S&P 500, Nasdaq-100, Nikkei 225, KOSPI 200 and the EWZ ETF (Brazil), through contracts traded 24 hours a day.
• 24-hour, 7-day and 30-day charts, with high, low and open.
• Chrome alerts when a saved asset rises or falls more than your limit within the time window you choose.
• A “Stale for …” notice when a data source stops updating.

You control the alerts in the Settings tab: minimum move, time window, time between alerts, and an on/off switch.

Privacy: there is no account, sign-up or server. Your assets and settings stay in your browser. The extension only contacts public price services (AwesomeAPI, Binance and Hyperliquid), with no ads and no trackers. The full policy is in the Settings tab.

Important:
• The indices (and EWZ) come from contracts traded 24 hours a day. They show the direction of the market but are not the official index value.
• Prices may be delayed or wrong. The information is for general information only and is not investment advice.
• Independent extension, not affiliated with Binance, Hyperliquid, AwesomeAPI, Google or the currencies and indices mentioned. Names and logos belong to their owners and are used only to identify each asset.

## Category
Productivity (alternative: News & Weather). Recommended: Productivity.

## Language
English (default), plus Português (Brasil)

## Single purpose (Privacy practices tab)
Show the prices of up to 5 currencies, cryptocurrencies or indices chosen by the user, and alert the user when one of them moves fast.

## Permission justifications
- **storage:** Saves the user's chosen assets, alert settings and the latest price readings in the browser.
- **alarms:** Wakes the service worker every minute to check the prices of the saved assets and detect fast moves.
- **notifications:** Shows the alert when a saved asset moves more than the limit the user set.
- **sidePanel:** Opens the extension's interface in Chrome's side panel.
- **Host access economia.awesomeapi.com.br:** Fetch currency quotes.
- **Host access data-api.binance.vision:** Fetch cryptocurrency quotes and history.
- **Host access api.hyperliquid.xyz:** Fetch quotes and history for the 24-hour contracts that stand in for the indices.

## Remote code
No, the extension does not use remote code. All code is inside the package.

## Data usage (dashboard checkboxes)
- Data types collected: **none** (leave everything unchecked). The chosen assets stay in the user's browser and are not sent to us.
- Certify the three statements: we do not sell user data to third parties; we do not use or transfer data for purposes unrelated to the single purpose; we do not use or transfer data to determine creditworthiness or for lending.

## Privacy policy (URL field)
The dashboard needs a public URL: https://viniciuspaulinosilva.github.io/market-extension/
The page is bilingual (English first, Portuguese below, with a link between them), so one URL serves both listings. It is in `docs/index.html`. **It only goes live after you commit and push the `docs` folder of the `market-extension` repository** (the current URL serves the old Portuguese-only page until then).

## Images
- Screenshots 1280x800 (up to 5 per language): `store/screenshots/en/` for the English listing and `store/screenshots/pt/` for the Portuguese one. Suggested order: home, cripto, detail, indices, config.
- Icon 128x128: `public/icons/icon128.png` (inside the ZIP too).
- Small tile 440x280 and marquee 1400x560: `store/promo/en/` and `store/promo/pt/`.

## Before submitting
- Version 1.0.0 is in the manifest.
- Re-read the terms of AwesomeAPI, Binance and Hyperliquid on the submission date (see `docs/publicar-chrome-web-store.md`).
- Check the publisher's public contact and the “trader” status in the dashboard.

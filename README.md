# Token Platform

A powerful Next.js-based platform for displaying, analyzing, and trading tokens on the Solana blockchain, now with **real-time OHLC candlestick charting** powered by the MEVX API.

-

## 🚀 Features

* 🔁 Real-time token updates via Pump.fun WebSocket
* 🔐 Solana wallet integration (Phantom, Solflare, Backpack)
* 🪙 Buy/sell tokens with a seamless interface
* 📊 View token details, market data, and interactive charts
* 📈 **NEW**: OHLC Candlestick Charts using MEVX API
* 🧠 **NEW**: Intelligent bonding curve detection via gRPC + fallback PDA derivation
* 🪄 Token creation support

---

## 📉 OHLC Charting Workflow (End-to-End)

### ✅ Step-by-Step Flow

1. **WebSocket Listener**

   * Enhanced listener (`useWebSocket.ts`) captures detailed Pump.fun messages
   * Identifies token creation events and logs raw messages

2. **Bonding Curve Extraction**

   * Smart extraction via `extractOrDeriveBondingCurve()`
   * Handles diverse message formats
   * Falls back to deterministic PDA derivation
   * Validates results via Solana PublicKey

3. **Store and Use Curve Address**

   * Curve is saved into the token object
   * Shows green indicator when chart data is available

4. **Fetch OHLC Data via MEVX API**

   * Uses bondingCurveKey as `poolAddress`
   * Auto API calls to `/api/candlesticks` with fallback handling

5. **Render Chart**

   * Uses `lightweight-charts` for beautiful, interactive visuals
   * Displays 24h stats, price changes, volume

---

## ⚙️ Technical Details

### 🔗 Bonding Curve Derivation

```ts
const [bondingCurveAddress] = PublicKey.findProgramAddressSync(
  [Buffer.from("bonding-curve"), mintPublicKey.toBuffer()],
  programPublicKey
);
```

### 🧠 WebSocket Intelligence

* Raw message inspection
* Multiple bonding curve formats
* Auto PDA fallback
* Real-time token updates

### 📡 Chart Data Pipeline

1. Token created ➝ WebSocket triggered
2. Curve extracted/derived ➝ saved in token object
3. API called ➝ `/api/candlesticks?poolAddress=...`
4. Chart rendered with auto-refresh

### 📈 Chart Rendering

* Library: `lightweight-charts`
* Data: MEVX API candlestick feed
* UI: Dark, responsive, with stats and indicators

---

## 🧪 New Chart Features

* 🟢 Green dot indicator for chart-ready tokens
* 🧾 Bonding curve address visible for verification
* ⚠️ Graceful error handling if chart unavailable
* 🔁 Auto-refresh with rate limiting

---

## 🔌 API Details

### MEVX API

```
GET /api/candlesticks
?poolAddress=<address>&timeBucket=1s&limit=10000
```

* Returns: OHLC + volume data

### Other APIs

* `/api/trade` → Trading proxy to PumpPortal
* `/api/proxy/mevx` → Candlestick chart API
* `/api/proxy/dexscreener` → Price screening

---

## 🛠️ Components

* `CandlestickChart` → Renders OHLC
* `TokenDetailModal` → Full token info
* `useCandlestickData` → Handles chart data fetching

---

## 📦 Dependencies

### New

* `lightweight-charts` (v5.0.8)

### Existing

* `next`, `react`
* `@solana/web3.js`
* `@solana/wallet-adapter-*`
* `shadcn/ui`
* `tailwindcss`

---

## 🔐 Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=******************
NEXT_PUBLIC_SUPABASE_ANON_KEY=******************
```

---

## 🧪 Demo Usage Flow

1. Run dev server:

```bash
npm run dev
```

2. Connect wallet
3. Browse tokens by market cap tiers
4. Click "View Details" ➝ Explore tabs:

   * **Overview**
   * **Chart**
   * **Trade**
5. For chart-enabled tokens (green dot): explore candlestick chart with live price & stats
6. Trade instantly using buy/sell interface

---

## ⚠️ Notes

* Bonding curves are now extracted via **gRPC GitHub repo integration**
* Fallback to deterministic PDA remains active
* GitHub link for gRPC extractor coming soon

---

## 📦 Build & Deploy

```bash
npm run build
npm start
```

---

## 🧠 Summary

This Token Platform provides a modern, responsive, and real-time interface for exploring and trading tokens on Solana — complete with intelligent bonding curve detection, WebSocket-powered updates, and beautiful candlestick charts using MEVX API.

You now have:

* Chart-enabled token UI
* Live market stats
* Smooth trading UX
* Full Web3 wallet support
* Chart data refresh with limit handling

### Next Step

Integrate with token metadata storage in Supabase for richer user experiences.

---

*Stay tuned for future enhancements, including price alerts, historical analytics, and portfolio tracking.*

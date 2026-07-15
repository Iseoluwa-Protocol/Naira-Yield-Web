# Naira-Yield-Web

The web-based dashboard and interface for the **Naira-Yield** protocol on the Stellar network. Developed for the **Iseoluwa-Protocol** organization by **@AlAfiz**.

This repository contains the standalone Next.js 14 application styled using Tailwind CSS. It connects with Stellar wallets via the Freighter browser extension, displays real-time APY trends, and lets users execute deposits, withdrawals, and yield claims on the Soroban smart contracts.

## Key Features
- **Next.js 14 (App Router)**: Fast, server-side optimized frontend skeleton.
- **Glassmorphic Theme**: Dark-mode primary design featuring Nigeria-emerald (`#008751`) and gold (`#D4AF37`) accents.
- **Interactive Forms**: Tabbed Deposit/Withdraw panel containing live Monthly & Yearly yield projection estimators.
- **Custom APY History Curve**: High-performance, lightweight vector SVG performance area chart to plot yield indices without third-party bloating.
- **Stellar Wallet Integration**: Boilerplate connectors to communicate with `@stellar/freighter-api` to pull keys and sign transaction payloads.
- **Automatic Fallback State**: Deterministic local mocking if the back-end Fastify API is offline or when the user is disconnected, ensuring a testable demo.

---

## Folder Structure

```
./Naira-Yield-Web/
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── src/
│   ├── lib/
│   │   └── freighter.ts (Freighter Wallet SDK connectors)
│   └── app/
│       ├── globals.css (Base styles, design tokens, blur-orbs)
│       ├── layout.tsx (HTML root header tags and author metadata)
│       └── page.tsx (Core dashboard components, state variables, calculators)
└── README.md
```

---

## Local Setup & Run

### Prerequisites
1. **Node.js**: Ensure Node.js (v18+) is installed.
2. **Freighter Extension**: Install the [Stellar Freighter extension](https://www.freighter.app/) on your web browser to enable Web3 login.

### 1. Install Dependencies
Run from inside the `./Naira-Yield-Web/` directory:
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the dashboard.

### 3. Build & Test Production
```bash
npm run build
npm start
```
The production bundle is optimized and built into the `./.next` directory.

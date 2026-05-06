# 🧱 Trader Box | صندوق المتداول
### Production-Grade FinTech & Trading Platform

Trader Box is a high-performance financial ecosystem designed for signal providers, market analysts, and retail traders. Built with a **Ledger-First Architecture**, it ensures absolute financial integrity and institutional-grade security.

## 🚀 Core Features
- **Ledger-First Accounting**: Atomic financial mutations with 100% auditability. No balance drift.
- **Role-Based Ecosystem**: Specialized dashboards for Admins, Signal Providers, Analysts, and Users.
- **Automated Trading Engine**: Real-time price tracking and automated TP/SL execution for signals.
- **Anti-Fraud System**: IP tracking, withdrawal cooldowns, and idempotency protection.
- **Premium UI/UX**: Stunning Glassmorphism design system optimized for financial data density.

## 🛠 Tech Stack
- **Backend**: Node.js (Express) with Prisma ORM.
- **Database**: PostgreSQL (Hardened with ACID Transactions).
- **Frontend**: Next.js (App Router) with Framer Motion & Tailwind CSS.
- **Real-time**: Integration with Binance API for live price feeds.

## 🛡️ Security Measures
- **Serializable Transactions**: Maximum database isolation to prevent concurrency issues.
- **Audit Logs**: Every administrative action is logged with IP and actor metadata.
- **JWT Auth**: Secure session management via httpOnly cookies.

## 📦 Getting Started
1. **Clone the repo**
2. **Install dependencies**: `npm install` and `cd frontend && npm install`
3. **Setup Database**: Update `.env` with your `DATABASE_URL`.
4. **Initialize Prisma**: `npx prisma db push`
5. **Run Simulation**: `node scripts/simulate.js`
6. **Start Dev**: `npm run dev`

## 👨‍💻 Admin Credentials (Simulation)
- **Email**: `admin@traderbox.com`
- **Password**: `password123`

---
Built with ❤️ by Antigravity AI for the Trader Box Team.

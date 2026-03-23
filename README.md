# TraceChain 🔗

A decentralized supply chain tracking application built on the Polygon blockchain. TraceChain records every product ownership transfer and status update immutably on-chain, while storing rich product metadata on IPFS to keep gas costs minimal.

> 🚧 Currently in active development — following an 8-week build plan from zero to deployed DApp.

---

## 🌐 Live Demo
- **App:** coming soon
- **Contract:** coming soon (Polygon Mumbai testnet)
- **Demo Video:** coming soon

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.28 |
| Dev Environment | Hardhat |
| Blockchain Library | Ethers.js v6 |
| Off-chain Storage | IPFS + Pinata |
| Testnet | Polygon Mumbai |
| Frontend | React + Vite |
| Wallet | MetaMask |
| Hosting | Vercel |

---

## ✅ What I Built This Week (Week 1)

This week I set up the full development environment and learned core Solidity concepts by building three practice contracts from scratch.

- **Counter.sol** — a simple contract with increment, decrement and getCount functions. Used to learn state variables and basic function syntax.
- **SimpleVault.sol** — a contract that lets users deposit and withdraw a balance. Used to learn how Solidity tracks per-address data.
- **ProductRegistry.sol** — a contract that creates and stores products using a struct and a mapping. Includes an owner system with a custom modifier so only the deployer can create products.

Concepts learned: structs, mappings, events, constructors, modifiers, `msg.sender`, `block.timestamp`, `require`, and access control.

---

## ⚙️ Setup

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- [MetaMask](https://metamask.io) browser extension
- [Git](https://git-scm.com)

### Installation

1. Clone the repository
```bash
   git clone https://github.com/yourusername/tracechain.git
   cd tracechain
```

2. Install dependencies
```bash
   npm install
```

3. Compile the contracts
```bash
   npx hardhat compile
```

4. Run the tests
```bash
   npx hardhat test
```

### Frontend (coming Week 4)
```bash
cd frontend
npm install
npm run dev
```

---

## 🗺 Architecture
```
User Browser
     │
     ▼
MetaMask Wallet
     │
     ▼
React App (Vercel)
     │
     ├──► Ethers.js ──► Alchemy RPC ──► Polygon Mumbai
     │                                        │
     │                                  SupplyChain.sol
     │                                  (stores CIDs + ownership)
     │
     └──► Pinata API ──► IPFS Network
                         (stores metadata + images)
```

**Why this architecture:**
- Only hashes and addresses are stored on-chain — keeps gas costs near zero
- Product images and metadata live on IPFS — decentralised and permanent
- Polygon Mumbai gives fast, free transactions for development

---

## 📅 8-Week Build Plan

| Week | Focus | Status |
|---|---|---|
| Week 1 | Blockchain basics + Solidity fundamentals | ✅ Done |
| Week 2 | Main SupplyChain contract + tests | 🔄 In progress |
| Week 3 | IPFS integration + deploy scripts | ⏳ Upcoming |
| Week 4 | React frontend + MetaMask connection | ⏳ Upcoming |
| Week 5 | Deploy to Polygon Mumbai testnet | ⏳ Upcoming |
| Week 6 | Polish — QR scanner, event feed, roles UI | ⏳ Upcoming |
| Week 7 | Final deploy + documentation | ⏳ Upcoming |
| Week 8 | Demo video + portfolio presentation | ⏳ Upcoming |

---

## 🔐 Security

- Role-based access control via OpenZeppelin AccessControl
- Only authorized roles (Manufacturer, Distributor, Retailer) can perform actions
- Full security notes in [SECURITY.md](./SECURITY.md) (coming Week 6)

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
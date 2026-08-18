# TraceChain Codebase Architecture & File Reference 📚

This document details every directory and file in the **TraceChain** repository, explaining its technical purpose, role in the architecture, and how it contributes to the overall decentralized supply chain DApp.

---

## 🏗 Directory Structure Overview

```text
TraceChain/
├── .github/workflows/         # GitHub Actions CI/CD automation
│   └── ci.yml                 # Automated build & test pipeline
├── contracts/                 # Solidity smart contract source code
│   ├── SupplyChain.sol        # Main production supply chain contract
│   └── practice/              # Week 1 learning & foundational contracts
│       ├── Counter.sol        # State variable & basic function practice
│       ├── ProductRegistry.sol# Structs & mappings practice
│       └── SimpleVault.sol    # Deposit & withdrawal practice
├── scripts/                   # Hardhat deployment & IPFS utility scripts
│   ├── deploy.js              # Smart contract deployment script
│   ├── interact.js            # End-to-end IPFS & smart contract interaction
│   └── pinToIPFS.js           # Pinata IPFS pinning helper module
├── test/                      # Hardhat automated unit test suite
│   ├── SupplyChain.test.js    # Unit & end-to-end tests for main contract
│   ├── Counter.test.js        # Unit tests for Counter practice contract
│   └── ProductRegistry.test.js# Unit tests for ProductRegistry contract
├── frontend/                  # React + Vite Web3 user interface
│   ├── public/                # Static public icons and SVGs
│   ├── src/                   # React source code (components, hooks, ABI)
│   │   ├── abi/               # Compiled smart contract JSON ABIs
│   │   ├── assets/            # UI images and icons
│   │   ├── components/        # React UI view components
│   │   ├── hooks/             # Custom Web3 React hooks (wallet & contract)
│   │   ├── App.jsx            # Main React application shell & navigation
│   │   ├── App.css            # Application UI layout styling
│   │   ├── index.css          # Global typography & color theme styles
│   │   └── main.jsx           # React DOM entry point
│   ├── .env                   # Local Vite environment variables
│   ├── .env.example           # Frontend environment template
│   ├── .gitignore             # Frontend git ignore rules
│   ├── index.html             # Vite single-page application entry HTML
│   ├── package.json           # Frontend dependencies & scripts
│   └── vite.config.js         # Vite bundler configuration
├── .env                       # Root environment variables (keys & RPC URLs)
├── .env.example               # Root environment variable template
├── .gitignore                 # Root git ignore rules
├── DEPLOYMENT.md              # Polygon Amoy deployment & verification guide
├── DESIGN.md                  # System design & architecture specifications
├── hardhat.config.js          # Hardhat network, compiler & verification config
├── LICENCE                    # Project open-source license
├── NOTES.md                   # Development notes & Solidity learning log
├── package.json               # Root Node.js dependencies & scripts
├── PROGRESS.md                # 8-Week project roadmap status
└── README.md                  # Master project repository documentation
```

---

## 📜 Complete File-by-File Breakdown

### 1. Smart Contracts (`contracts/`)

| File Path | Description & Purpose |
|---|---|
| [`contracts/SupplyChain.sol`](file:///Users/pranil/Projects/TraceChain/contracts/SupplyChain.sol) | **Core Smart Contract**. Written in Solidity `0.8.20`. Inherits OpenZeppelin `AccessControl`. Manages `MANUFACTURER_ROLE`, `DISTRIBUTOR_ROLE`, and `RETAILER_ROLE`. Stores product records (`productId`, `metadataCID`, `manufacturer`, `status`, `createdAt`, `currentOwner`) and immutable ownership/status history logs. |
| [`contracts/practice/Counter.sol`](file:///Users/pranil/Projects/TraceChain/contracts/practice/Counter.sol) | **Practice Contract**. Simple state counter used during Week 1 to master state variables, `increment`, `decrement`, and `getCount` functions. |
| [`contracts/practice/ProductRegistry.sol`](file:///Users/pranil/Projects/TraceChain/contracts/practice/ProductRegistry.sol) | **Practice Contract**. Foundational product registry contract built to master Solidity `struct`, `mapping`, `event`, and `onlyOwner` modifiers. |
| [`contracts/practice/SimpleVault.sol`](file:///Users/pranil/Projects/TraceChain/contracts/practice/SimpleVault.sol) | **Practice Contract**. Vault contract tracking per-address ETH deposits and withdrawals to learn `msg.sender` and address balances. |

---

### 2. Automated Unit Tests (`test/`)

| File Path | Description & Purpose |
|---|---|
| [`test/SupplyChain.test.js`](file:///Users/pranil/Projects/TraceChain/test/SupplyChain.test.js) | **Main Contract Test Suite**. Contains 15+ Hardhat/Chai unit tests covering deployment, role-based access control, product creation, status updates, ownership transfers, history querying, and end-to-end supply chain journeys. |
| [`test/Counter.test.js`](file:///Users/pranil/Projects/TraceChain/test/Counter.test.js) | **Practice Test Suite**. Unit tests verifying incrementing, decrementing, and initial state of `Counter.sol`. |
| [`test/ProductRegistry.test.js`](file:///Users/pranil/Projects/TraceChain/test/ProductRegistry.test.js) | **Practice Test Suite**. Unit tests verifying `createProduct` logic and owner access control in `ProductRegistry.sol`. |

---

### 3. Deployment & IPFS Scripts (`scripts/`)

| File Path | Description & Purpose |
|---|---|
| [`scripts/deploy.js`](file:///Users/pranil/Projects/TraceChain/scripts/deploy.js) | **Deployment Script**. Deploys `SupplyChain.sol` to configured networks (Localhost or Polygon Amoy/Mumbai) using Hardhat Ethers and logs deployer address & contract address. |
| [`scripts/interact.js`](file:///Users/pranil/Projects/TraceChain/scripts/interact.js) | **CLI Interaction Script**. Integrates Pinata IPFS metadata pinning with smart contract `createProduct` execution, reads product state, and fetches off-chain metadata via Pinata IPFS gateway. |
| [`scripts/pinToIPFS.js`](file:///Users/pranil/Projects/TraceChain/scripts/pinToIPFS.js) | **IPFS Pinning Helper**. Exports `pinToIPFS(jsonMetadata)` utility function that sends JSON metadata payloads to Pinata IPFS API (`pinJSONToIPFS`) and returns Content Identifiers (CIDs). |

---

### 4. Frontend Web Application (`frontend/src/`)

| File Path | Description & Purpose |
|---|---|
| [`frontend/src/main.jsx`](file:///Users/pranil/Projects/TraceChain/frontend/src/main.jsx) | **React Entry Point**. Mounts the root `<App />` component into the HTML DOM. |
| [`frontend/src/App.jsx`](file:///Users/pranil/Projects/TraceChain/frontend/src/App.jsx) | **App Shell & State Controller**. Manages top navigation, views (`list`, `detail`, `add`), wallet connection status, error alerts, and passes `account` state to subcomponents. |
| [`frontend/src/App.css`](file:///Users/pranil/Projects/TraceChain/frontend/src/App.css) | **Component Layout Styles**. CSS styles for navigation header, badges, view switching buttons, and container boundaries. |
| [`frontend/src/index.css`](file:///Users/pranil/Projects/TraceChain/frontend/src/index.css) | **Global Styles**. Global CSS reset, font definitions, background colors, and base element styles. |
| [`frontend/src/abi/SupplyChain.json`](file:///Users/pranil/Projects/TraceChain/frontend/src/abi/SupplyChain.json) | **Contract ABI**. Contains compiled Application Binary Interface (ABI) for `SupplyChain.sol`, allowing Ethers.js to construct `Contract` instances in React. |
| [`frontend/src/hooks/useWallet.js`](file:///Users/pranil/Projects/TraceChain/frontend/src/hooks/useWallet.js) | **Custom Wallet Hook**. Manages MetaMask wallet connection, auto-detects connected accounts (`eth_accounts`) on mount, listens to `accountsChanged` events, and exposes `connectWallet()`. |
| [`frontend/src/hooks/useSupplyChain.js`](file:///Users/pranil/Projects/TraceChain/frontend/src/hooks/useSupplyChain.js) | **Custom Contract Hook**. Connects Ethers v6 BrowserProvider and Signer to `VITE_CONTRACT_ADDRESS`. Exposes `getProduct`, `getHistory`, and `createProduct` methods with rethrown error propagation. |
| [`frontend/src/components/AddProduct.jsx`](file:///Users/pranil/Projects/TraceChain/frontend/src/components/AddProduct.jsx) | **Add Product View**. Form component for creating products. Uploads images and JSON metadata to Pinata IPFS, retrieves CID, invokes `createProduct(cid)` on-chain, and renders Polygonscan transaction links. |
| [`frontend/src/components/ProductList.jsx`](file:///Users/pranil/Projects/TraceChain/frontend/src/components/ProductList.jsx) | **All Products View**. Queries contract `products(id)` mapping in a loop (`1` to `nextId`) to fetch all created products on-chain without RPC log filter restrictions, rendering clickable product cards. |
| [`frontend/src/components/ProductDetail.jsx`](file:///Users/pranil/Projects/TraceChain/frontend/src/components/ProductDetail.jsx) | **Product Detail View**. Displays on-chain status & owner data, fetches full metadata & images from IPFS via gateway, and renders the immutable status history timeline. |
| [`frontend/src/assets/hero.png`](file:///Users/pranil/Projects/TraceChain/frontend/src/assets/hero.png) | **UI Graphic Asset**. Visual image asset used in frontend headers/banners. |
| [`frontend/src/assets/react.svg`](file:///Users/pranil/Projects/TraceChain/frontend/src/assets/react.svg) | **UI Asset**. React framework logo SVG. |
| [`frontend/src/assets/vite.svg`](file:///Users/pranil/Projects/TraceChain/frontend/src/assets/vite.svg) | **UI Asset**. Vite build tool logo SVG. |

---

### 5. Frontend Configuration (`frontend/`)

| File Path | Description & Purpose |
|---|---|
| [`frontend/index.html`](file:///Users/pranil/Projects/TraceChain/frontend/index.html) | Single-page application HTML entry document for Vite. |
| [`frontend/vite.config.js`](file:///Users/pranil/Projects/TraceChain/frontend/vite.config.js) | Configuration for Vite bundler, dev server, and React plugin settings. |
| [`frontend/package.json`](file:///Users/pranil/Projects/TraceChain/frontend/package.json) | Frontend Node.js dependencies (`react`, `react-dom`, `ethers`, `axios`) and scripts (`npm run dev`, `npm run build`). |
| [`frontend/.env`](file:///Users/pranil/Projects/TraceChain/frontend/.env) | Active frontend environment variables (`VITE_CONTRACT_ADDRESS`, `VITE_PINATA_API_KEY`, `VITE_PINATA_API_SECRET`). |
| [`frontend/.env.example`](file:///Users/pranil/Projects/TraceChain/frontend/.env.example) | Frontend environment template file. |
| [`frontend/.gitignore`](file:///Users/pranil/Projects/TraceChain/frontend/.gitignore) | Git ignore rules for frontend build output (`dist/`), `node_modules`, and local `.env` files. |
| [`frontend/eslint.config.js`](file:///Users/pranil/Projects/TraceChain/frontend/eslint.config.js) | ESLint code quality & linting configuration for React frontend. |

---

### 6. Root Configuration & DevOps (`/`)

| File Path | Description & Purpose |
|---|---|
| [`hardhat.config.js`](file:///Users/pranil/Projects/TraceChain/hardhat.config.js) | **Hardhat Master Configuration**. Uses ES modules syntax. Configures Solidity compiler `0.8.20`, networks (`amoy`, `mumbai`), `dotenv` auto-loading, Etherscan API V2 verification, gas reporter, and `solidity-coverage`. |
| [`.github/workflows/ci.yml`](file:///Users/pranil/Projects/TraceChain/.github/workflows/ci.yml) | **GitHub Actions Workflow**. Triggers on pushes and PRs to `main`. Automatically sets up Node.js 18, installs dependencies, compiles contracts (`npx hardhat compile`), and executes unit tests (`npx hardhat test`). |
| [`package.json`](file:///Users/pranil/Projects/TraceChain/package.json) | Root project manifesto declaring `"type": "module"`, project metadata, and devDependencies (`hardhat`, `@nomicfoundation/hardhat-toolbox`, `@nomicfoundation/hardhat-verify`, `dotenv`, `ethers`). |
| [`.env`](file:///Users/pranil/Projects/TraceChain/.env) | Root environment file containing RPC URLs (`ALCHEMY_URL`), MetaMask deployer key (`PRIVATE_KEY`), `POLYGONSCAN_API_KEY`, and Pinata credentials. |
| [`.env.example`](file:///Users/pranil/Projects/TraceChain/.env.example) | Template file documenting required root environment variables without exposing sensitive secrets. |
| [`.gitignore`](file:///Users/pranil/Projects/TraceChain/.gitignore) | Root Git rules ignoring `node_modules/`, `artifacts/`, `cache/`, `coverage/`, `.env` files, and `.DS_Store`. |

---

### 7. Documentation & Project Planning (`/`)

| File Path | Description & Purpose |
|---|---|
| [`README.md`](file:///Users/pranil/Projects/TraceChain/README.md) | Primary repository documentation featuring GitHub Actions CI status badge, live demo links, architecture diagram, tech stack overview, and setup instructions. |
| [`DEPLOYMENT.md`](file:///Users/pranil/Projects/TraceChain/DEPLOYMENT.md) | Complete testnet deployment checklist, deployed contract address (`0xcc7D54C0f4Ae273CD095f1BCbfC4F5AAc9C4a5e5`), Polygonscan verification link, and step-by-step deploy/verify commands. |
| [`DESIGN.md`](file:///Users/pranil/Projects/TraceChain/DESIGN.md) | Technical architecture specifications, data structures, off-chain IPFS vs on-chain tradeoff analysis, and sequence flow diagrams. |
| [`PROGRESS.md`](file:///Users/pranil/Projects/TraceChain/PROGRESS.md) | 8-Week project roadmap tracking build milestones, completed tasks, and upcoming features. |
| [`NOTES.md`](file:///Users/pranil/Projects/TraceChain/NOTES.md) | Developer learning notes, Solidity concepts log, IPFS CID explanations, and Web3 reference notes. |
| [`LICENCE`](file:///Users/pranil/Projects/TraceChain/LICENCE) | Official MIT open-source license for the repository. |

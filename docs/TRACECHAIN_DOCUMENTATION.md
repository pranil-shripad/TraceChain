# TraceChain — Decentralized Web3 Supply Chain Platform
## Technical Architecture, Workflow Specification & Real-World Case Study

---

## 1. Executive Summary & Value Proposition

Traditional global supply chains suffer from severe vulnerabilities: opacity, fraudulent documentation, counterfeit goods, and fragmented custody records across disparate corporate databases. 

**TraceChain** is an enterprise-grade Web3 supply chain tracking platform built on the **Polygon Blockchain (Amoy Testnet)** and **IPFS (InterPlanetary File System)** via **Pinata**. TraceChain enables transparent, immutable, and tamper-proof tracking of physical products from raw material origin to end-consumer delivery.

### Key Value Pillars
- **Immutability & Auditability**: Every ownership transfer and status update is permanently recorded on Polygon with cryptographic signatures and event logs.
- **Decentralized Storage**: Heavy product metadata (high-resolution images, lab certifications, batch parameters, origin credentials) are stored on IPFS, eliminating expensive smart contract gas fees while remaining tamper-evident via Content Identifiers (CIDs).
- **Strict Role-Based Security**: Powered by OpenZeppelin `AccessControl`, defining permissioned roles (`MANUFACTURER`, `DISTRIBUTOR`, `RETAILER`, `ADMIN`).
- **Enforced Lifecycle State Machine**: Prevents illegal status reverts, out-of-order transitions, or post-delivery tampering.
- **Consumer Trust via Scannable QR Codes**: Any end consumer can scan a product QR code to inspect its verified timeline on Polygonscan without needing a crypto wallet.

---

## 2. Technical Architecture & Component Overview

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            REACT FRONTEND                               │
 │               (TanStack Start, TanStack Router, Ethers.js)              │
 └─────────────────┬─────────────────────────────────────┬─────────────────┘
                   │                                     │
                   ▼                                     ▼
 ┌───────────────────────────────────┐ ┌───────────────────────────────────┐
 │     POLYGON AMOY BLOCKCHAIN       │ │       IPFS / PINATA GATEWAY       │
 │  (Solidity 0.8.20 Smart Contract) │ │ (Decentralized Metadata & Media)  │
 ├───────────────────────────────────┤ ├───────────────────────────────────┤
 │ • Role-Based Access Control       │ │ • Product Images (PNG/JPG/WEBP)   │
 │ • State Machine Enforcement       │ │ • Batch Specifications            │
 │ • Immutable Event History Logs    │ │ • Origin Certifications & CIDs    │
 └───────────────────────────────────┘ └───────────────────────────────────┘
```

### Component Breakdown
1. **Smart Contracts (`SupplyChain.sol`)**: Written in Solidity 0.8.20 using OpenZeppelin `AccessControl`. Stores minimalist state on-chain (Product ID, CID, Manufacturer, Status, Timestamp, Current Owner).
2. **IPFS Storage (Pinata Gateway)**: Pinata server functions pin product images and JSON metadata documents to IPFS, returning an immutable CID hash (`ipfs://Qm...`).
3. **Frontend Application**: Built with React 19, TanStack Start (SSR), TanStack Router, Ethers.js v6, and Tailwind CSS. Connects to MetaMask for wallet signing and RPC nodes for read queries.

---

## 3. Role-Based Access Control (RBAC) & Permission Matrix

TraceChain implements strict access management to ensure only verified entities can perform actions appropriate to their role in the supply chain:

| Role Name | Granted By | Primary Responsibilities |
| :--- | :--- | :--- |
| **`DEFAULT_ADMIN_ROLE`** | Contract Deployer | Grants and revokes roles (`MANUFACTURER`, `DISTRIBUTOR`, `RETAILER`). |
| **`MANUFACTURER_ROLE`** | Admin | Mints new product records (`createProduct`), pins initial IPFS metadata. |
| **`DISTRIBUTOR_ROLE`** | Admin | Accepts custody transfer, updates status to `SHIPPED` and `IN TRANSIT`. |
| **`RETAILER_ROLE`** | Admin | Receives final custody transfer, marks status as `DELIVERED`. |
| **Product Owner** | Current Custodian | Only the address matching `currentOwner` can update status or transfer custody. |

---

## 4. Product Lifecycle State Machine

Product status transitions are governed by strict smart contract assertions:

```
 [ 0: CREATED ] ────────► [ 1: SHIPPED ] ────────► [ 2: IN TRANSIT ] ────────► [ 3: DELIVERED ]
       │                         │                        │
       ▼                         ▼                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   [ 4: CANCELLED ]                                          │
 └─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Transition Validation Rules
- **Non-Reversible**: Status can **never** be set back to `Created` (0).
- **Monotonic Forward Progress**: `newStatus` must be strictly greater than `currentStatus`, OR set to `Cancelled` (4).
- **Terminal Locks**: Once status reaches `Delivered` (3) or `Cancelled` (4), the state machine enters a **Terminal Lock**. No further status updates can ever be submitted.

---

## 5. End-to-End Real-World Case Study
### Product Journey: "Specialty Organic Colombian Coffee — Batch #042"

To understand how TraceChain operates in practice, consider the supply chain of **Specialty Organic Arabica Coffee Beans (Batch #042)** traveling from a high-altitude farm in Huila, Colombia to a premium coffee shop in New York City.

```
 ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
 │     MANUFACTURER     │      │     DISTRIBUTOR      │      │       RETAILER       │
 │   El Paraíso Estate  │ ───► │ Andes Global Freight │ ───► │ Roast & Brew NYC Bar │
 │   (Huila, Colombia)  │      │  (Cartagena / Miami) │      │   (Manhattan, NYC)   │
 └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

---

### Step-by-Step Flow

#### Step 1: Product Registration & Minting (Manufacturer)
- **Actor**: El Paraíso Coffee Estate (`0x71C...4A1`) holding `MANUFACTURER_ROLE`.
- **Action**: Registers **Batch #042** on TraceChain.
- **Process**:
  1. Uploads high-res image of organic farm harvest and bean lab test report to IPFS.
  2. Pinata returns IPFS CID: `bafybeic7x2...`
  3. Executes `createProduct("bafybeic7x2...")` on Polygon Amoy.
- **On-Chain State**:
  - `productId`: `42`
  - `status`: `CREATED` (0)
  - `currentOwner`: `0x71C...4A1`
  - `manufacturer`: `0x71C...4A1`

---

#### Step 2: First Custody Transfer & Shipment (Distributor)
- **Actor**: Andes Global Freight (`0x39B...88F`) holding `DISTRIBUTOR_ROLE`.
- **Action**: El Paraíso loads 500kg sealed sacks onto transport truck bound for Port of Cartagena.
- **Process**:
  1. El Paraíso transfers custody: `transferOwnership(42, 0x39B...88F)`.
  2. Andes Global Freight confirms receipt and updates status: `updateStatus(42, SHIPPED, "Port of Cartagena, Colombia")`.
- **On-Chain State**:
  - `status`: `SHIPPED` (1)
  - `currentOwner`: `0x39B...88F`

---

#### Step 3: Maritime Customs & In-Transit Tracking (Logistics)
- **Actor**: Andes Global Freight (`0x39B...88F`).
- **Action**: Coffee cargo container arrives at Customs Distribution Hub in Miami, Florida.
- **Process**:
  - Executes `updateStatus(42, IN_TRANSIT, "Customs Inspection Facility, Port of Miami, FL")`.
- **On-Chain State**:
  - `status`: `IN TRANSIT` (2)
  - `currentOwner`: `0x39B...88F`

---

#### Step 4: Final Delivery & Retail Receipt (Retailer)
- **Actor**: Roast & Brew Artisan Coffee (`0xA14...D92`) holding `RETAILER_ROLE`.
- **Action**: Truck arrives at retail cafe in Manhattan, NYC. Coffee beans inspected and accepted into store inventory.
- **Process**:
  1. Andes Global Freight transfers ownership: `transferOwnership(42, 0xA14...D92)`.
  2. Roast & Brew NYC marks final status: `updateStatus(42, DELIVERED, "Roast & Brew Store #1, Manhattan, NYC")`.
- **On-Chain State**:
  - `status`: `DELIVERED` (3) *(Terminal State)*
  - `currentOwner`: `0xA14...D92`

---

#### Step 5: Consumer QR Code Verification (End Consumer)
- **Actor**: Consumer purchasing a $25 bag of specialty coffee at Roast & Brew NYC.
- **Action**: Scans the QR code printed on the coffee bag.
- **Verification**:
  - Opens `https://tracechain.app/products/42`.
  - Views verified timeline: Farm origin location, harvest date, lab metadata CID, timestamped shipping checkpoints, and final retail delivery.
  - Verifies Polygonscan transaction hashes confirming no record was tampered with or modified.

---

## 6. Smart Contract Reference API

```solidity
// Core Smart Contract Interface
function createProduct(string calldata metadataCID) external returns (uint256);
function updateStatus(uint256 productId, Status status, string memory location) external;
function transferOwnership(uint256 productId, address newOwner) external;
function getHistory(uint256 productId) external view returns (StatusUpdate[] memory);
```

---

## 7. Containerization & Deployment

TraceChain is containerized using multi-stage Docker builds:
- **Build Stage**: Compiles TypeScript, TanStack Start routes, and Vite assets.
- **Production Stage**: Runs lightweight Node.js runtime exposing port `8080`.
- **Docker Compose**: Orchestrates frontend, network configurations, and environment secrets.

---
*Documentation compiled for TraceChain Web3 Platform — Polygon Amoy Network.*

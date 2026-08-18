# TraceChain Deployment Guide & Checklist 🚀

This document tracks the deployment details, network configurations, verification steps, and post-deployment workflow for the **TraceChain** smart contracts and frontend application.

> ℹ️ **Note on Testnets**: Polygon officially deprecated Mumbai testnet in April 2024 and replaced it with **Polygon Amoy** testnet (`Chain ID: 80002`). This repository supports both `amoy` (recommended) and `mumbai`.

---

## 📌 Deployed Contract & Environment Details

| Information | Details / Value |
|---|---|
| **Network** | Polygon Amoy Testnet (or Polygon Mumbai) |
| **Chain ID** | `80002` (Amoy) / `80001` (Mumbai) |
| **Deployed Contract Address** | `0xcc7D54C0f4Ae273CD095f1BCbfC4F5AAc9C4a5e5` |
| **Polygonscan Explorer Link** | [View Contract on Polygonscan](https://amoy.polygonscan.com/address/0xcc7D54C0f4Ae273CD095f1BCbfC4F5AAc9C4a5e5#code) |
| **Live Frontend URL (Vercel)** | [https://trace-chain.vercel.app](https://trace-chain.vercel.app) *(Replace with actual URL)* |
| **Compiler Version** | `Solidity 0.8.20` |
| **Optimization** | Disabled (`runs: 200`) |

---

## 📋 Pre-Deployment Checklist

Before deploying smart contracts to Polygon Amoy or Mumbai Testnet, ensure the following steps are complete:

- [ ] **1. Dependencies Installed**
  ```bash
  npm install
  ```
- [ ] **2. Hardhat Compilation Check**
  ```bash
  npx hardhat compile
  ```
- [ ] **3. Hardhat Test Suite Verification**
  ```bash
  npx hardhat test
  ```
- [ ] **4. Environment Variables Configured**
  Ensure root `.env` contains valid values for:
  - `ALCHEMY_URL` (Alchemy RPC URL for Polygon Amoy `https://polygon-amoy.g.alchemy.com/v2/...` or Mumbai)
  - `PRIVATE_KEY` (Deployer wallet private key with testnet MATIC/POL)
  - `POLYGONSCAN_API_KEY` (Polygonscan API Key for source code verification)
  - `PINATA_API_KEY` & `PINATA_API_SECRET` / `PINATA_JWT`
- [ ] **5. Testnet MATIC / POL Balance**
  Ensure deployer address has sufficient testnet MATIC/POL balance via [faucet.polygon.technology](https://faucet.polygon.technology) or Alchemy Faucet.

---

## 🚀 Step-by-Step Deployment Instructions

### 1. Deploy Contract to Polygon Amoy (or Mumbai)

Run the deployment script pointing to `amoy` (or `mumbai`):

```bash
npx hardhat run scripts/deploy.js --network amoy
```

Or for Mumbai (if using custom RPC):
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

**Expected Terminal Output:**
```text
Deploying with: 0xYourDeployerAddress...
SupplyChain deployed to: 0x1234567890abcdef1234567890abcdef12345678
```

> 💡 **Save the printed contract address!** You will need it for verification and frontend configuration.

---

### 2. Verify Smart Contract Source Code on Polygonscan

Run the `hardhat verify` task using the deployed contract address:

```bash
npx hardhat verify --network amoy <CONTRACT_ADDRESS>
```

**Example:**
```bash
npx hardhat verify --network amoy 0x1234567890abcdef1234567890abcdef12345678
```

**Expected Terminal Output:**
```text
Successfully submitted source code for contract contracts/SupplyChain.sol:SupplyChain at 0x1234567890abcdef1234567890abcdef12345678
Successfully verified contract SupplyChain on the block explorer.
https://amoy.polygonscan.com/address/0x1234567890abcdef1234567890abcdef12345678#code
```

---

## 🔄 Post-Deployment Updates Checklist

After successful contract deployment and verification, perform the following updates:

- [ ] **1. Update DEPLOYMENT.md**
  Replace `0x0000000000000000000000000000000000000000` above with your newly deployed contract address and update the Polygonscan link.
- [ ] **2. Update Frontend Environment File**
  Update `frontend/.env` (or project root environment settings) with:
  ```env
  VITE_CONTRACT_ADDRESS=0xYourNewlyDeployedAddress
  ```
- [ ] **3. Update Vercel Environment Variables**
  If hosting on Vercel:
  1. Go to project settings in Vercel Dashboard.
  2. Select **Environment Variables**.
  3. Set `VITE_CONTRACT_ADDRESS` to your deployed contract address.
  4. Trigger a redeploy of the frontend.
- [ ] **4. Test End-to-End Flow on Testnet**
  - Connect MetaMask on Polygon Amoy Testnet.
  - Create a new product as a Manufacturer.
  - Update product status and transfer ownership to a Distributor address.
  - Verify that events and transactions appear correctly on Polygonscan.

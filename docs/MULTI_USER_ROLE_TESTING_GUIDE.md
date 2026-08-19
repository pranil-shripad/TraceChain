# TraceChain — Multi-User & Role Testing Guide

This guide walks you step-by-step through testing the **TraceChain DApp** using multiple MetaMask accounts to simulate a full real-world Web3 supply chain ecosystem.

---

## 📋 Overview of Test Roles & Setup

TraceChain uses **Role-Based Access Control (RBAC)** enforced on-chain via OpenZeppelin's `AccessControl`.

| Role | Wallet Persona | Primary Actions | Dashboard View |
| :--- | :--- | :--- | :--- |
| 🛡️ **Admin** | Contract Deployer | Grants/revokes roles, views global registry, approves role requests | `AdminDashboard` (Red Badge) |
| 🏭 **Manufacturer** | Coffee Producer / Farm | Registers new products on-chain with IPFS metadata, views origin records | `ManufacturerDashboard` (Green Badge) |
| 🚚 **Distributor** | Freight & Logistics | Manages custody, updates in-transit shipping status & locations | `DistributorDashboard` (Blue Badge) |
| 🏪 **Retailer** | Coffee Shop / Store | Receives goods, confirms final store delivery (`DELIVERED` lock) | `RetailerDashboard` (Purple Badge) |
| 👤 **No Role** | Unassigned User | Browses public product ledger, submits access request form | `NoRoleDashboard` (Yellow Card) |

---

## 🛠️ Step 1: Prepare 5 Test Accounts in MetaMask

1. Open your browser with **MetaMask** installed and connected to **Polygon Amoy Testnet** (Chain ID `80002` or `80001`).
2. Create or import **5 distinct accounts** in MetaMask:
   - **Account 1 (Admin)**: `0x71C84074c77579122393F421C0074218C8384A1` (Contract Deployer)
   - **Account 2 (Manufacturer)**: Create new account named `MetaMask - Manufacturer`
   - **Account 3 (Distributor)**: Create new account named `MetaMask - Distributor`
   - **Account 4 (Retailer)**: Create new account named `MetaMask - Retailer`
   - **Account 5 (No-Role User)**: Create new account named `MetaMask - User`

> 💡 **Tip:** Ensure Account 1 (Admin) has testnet MATIC from the Polygon Amoy Faucet to pay for gas fees when granting roles.

---

## 🧪 Step 2: Test Scenario 1 — Admin Role Management

1. In MetaMask, select **Account 1 (Admin)**.
2. Open **`http://localhost:8080`**.
3. Click **Connect Wallet** if prompted.
4. **Verification**:
   - The UI automatically renders **`AdminDashboard`** with a red **`ADMIN`** badge.
5. Navigate to **TAB 1 — "Role Management"**.
6. Grant roles to test accounts:
   - Paste **Account 2's address**, select **`MANUFACTURER`** from dropdown ➔ Click **`GRANT ROLE`**.
   - Paste **Account 3's address**, select **`DISTRIBUTOR`** from dropdown ➔ Click **`GRANT ROLE`**.
   - Paste **Account 4's address**, select **`RETAILER`** from dropdown ➔ Click **`GRANT ROLE`**.
7. Confirm each transaction in MetaMask.
8. **Result**: The **Current Role Holders On-Chain** table will update live showing the granted roles for all three addresses.

---

## ☕ Step 3: Test Scenario 2 — Manufacturer Product Creation

1. In MetaMask, switch to **Account 2 (Manufacturer)**.
2. Refresh the page or click your wallet address to reconnect.
3. **Verification**:
   - The UI detects the `MANUFACTURER_ROLE` and displays **`ManufacturerDashboard`** with a green **`MANUFACTURER`** badge.
4. Click **TAB 2 — "+ Create Product"**.
5. Fill out the registration form:
   - **Product Name**: `Specialty Colombian Arabica Coffee #042`
   - **Origin**: `El Paraíso Estate, Huila, Colombia`
   - **Upload Image**: Select an image file (e.g. coffee beans).
6. Click **`REGISTER PRODUCT ON BLOCKCHAIN`**:
   - Step 1: Image pinned to IPFS via Pinata.
   - Step 2: Metadata JSON pinned to IPFS.
   - Step 3: `createProduct()` transaction signed in MetaMask.
7. Click **TAB 1 — "My Products"**:
   - **Result**: Product `#001` appears in your products list with status **`CREATED (0)`** and custodian set to **`YOU (ORIGINAL MANUFACTURER)`**.

---

## 🚛 Step 4: Test Scenario 3 — Custody Transfer & Distributor Logistics

### 4.1 Transfer Custody from Manufacturer to Distributor
1. Remaining logged in as **Account 2 (Manufacturer)**, locate Product `#001` card.
2. Click **`VIEW DETAILS & TRACK`** (or go to `/products/1`).
3. Under **Transfer Ownership**, paste **Account 3's address (Distributor)** and click **`TRANSFER OWNERSHIP`**.
4. Confirm transaction in MetaMask.

### 4.2 Distributor Custody & Status Updates
1. Switch MetaMask to **Account 3 (Distributor)**.
2. Refresh page / reconnect wallet.
3. **Verification**:
   - The UI displays **`DistributorDashboard`** with a blue **`DISTRIBUTOR`** badge.
4. Go to **TAB 1 — "In My Custody"**:
   - Product `#001` appears under custody.
5. **Update Shipping Status**:
   - Select **`SHIPPED (1)`** from dropdown.
   - Enter Location: `Port of Cartagena, Colombia`.
   - Click **`UPDATE STATUS`** and confirm in MetaMask.
6. **Transfer Custody to Retailer**:
   - Under **Transfer Custody to Next Owner**, paste **Account 4's address (Retailer)**.
   - Click **`TRANSFER OWNERSHIP`** and confirm transaction.

---

## 🏪 Step 5: Test Scenario 4 — Retailer Receipt & Terminal Lock

1. Switch MetaMask to **Account 4 (Retailer)**.
2. Refresh page / reconnect wallet.
3. **Verification**:
   - The UI displays **`RetailerDashboard`** with a purple **`RETAILER`** badge.
4. Go to **TAB 1 — "Pending Delivery"**:
   - Product `#001` appears with current status `SHIPPED (1)`.
5. **Mark as Delivered**:
   - Enter Receiving Store Location: `Roast & Brew NYC, Store #42`.
   - Click **`MARK AS DELIVERED`** and confirm in MetaMask.
6. **Result**:
   - Transaction completes ➔ Product card automatically transitions to **TAB 2 — "Delivered"**.
   - Smart contract locks status at **`DELIVERED (3)`**. Further attempts to revert or update status are blocked on-chain.

---

## 👤 Step 6: Test Scenario 5 — Role Request & Admin Approval Flow

1. Switch MetaMask to **Account 5 (Unassigned User)**.
2. Reconnect wallet on `http://localhost:8080`.
3. **Verification**:
   - The UI displays **`NoRoleDashboard`** with message: *"YOUR WALLET HAS NO ROLE ASSIGNED"*.
4. Click **`REQUEST ACCESS & ROLE`**:
   - **Company / Entity Name**: `Apex Specialty Roasters Ltd.`
   - **Role in Supply Chain**: Select `Retailer`
   - **Description**: `Organic micro-roaster based in Brooklyn, NY.`
   - Click **`SUBMIT REQUEST`**.
5. **Result**: A pending request card appears confirming submission to JSONBin.
6. **Admin Approval**:
   - Switch MetaMask back to **Account 1 (Admin)**.
   - Go to **TAB 3 — "Role Requests"** on **`AdminDashboard`**.
   - Observe the pending badge **`Role Requests (1)`**.
   - Click **`APPROVE`**:
     - Step 1: Admin signs `grantRole(RETAILER_ROLE, Account 5)` transaction on Polygon.
     - Step 2: Request status updates to `approved` in JSONBin.
7. **Role Update Verification**:
   - Switch MetaMask back to **Account 5**.
   - Refresh page ➔ Dashboard instantly upgrades from `NoRoleDashboard` to **`RetailerDashboard`**!

---

## 🔍 Test Matrix Summary

| Test Phase | Account Active | Expected Dashboard | Key Verification |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Account 1 | `AdminDashboard` | Can grant/revoke roles & view requests |
| **Phase 2** | Account 2 | `ManufacturerDashboard` | Can mint products & view "My Products" |
| **Phase 3** | Account 3 | `DistributorDashboard` | Can update custody locations & transfer items |
| **Phase 4** | Account 4 | `RetailerDashboard` | Can mark products as `DELIVERED` |
| **Phase 5** | Account 5 | `NoRoleDashboard` ➔ `RetailerDashboard` | Submits access request ➔ gets upgraded upon admin approval |

---

## 🛠️ Troubleshooting & Notes

- **Polygon Amoy Gas Override**: All transactions include an automated `maxPriorityFeePerGas` override set to `30 Gwei` to comply with Polygon node RPC requirements.
- **Switching Accounts**: When switching MetaMask accounts, click **Refresh** or disconnect/reconnect your wallet if MetaMask doesn't emit `accountsChanged` automatically.
- **Contract State Locks**: Remember that `DELIVERED` (3) and `CANCELLED` (4) are terminal states — products in these states cannot be updated or transferred further.

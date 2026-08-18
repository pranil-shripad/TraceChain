import { createRequire } from "module";
const require = createRequire(import.meta.url);
globalThis.require = require;

import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import dotenv from "dotenv";

dotenv.config();

const rawKey = (process.env.PRIVATE_KEY || "").replace(/['"]/g, "").trim();
const cleanKey = rawKey.startsWith("0x") ? rawKey.slice(2) : rawKey;
const isValidHexKey = cleanKey.length === 64 && /^[0-9a-fA-F]{64}$/.test(cleanKey);

if (rawKey && !isValidHexKey) {
  console.log(`\n⚠️  [TraceChain Warning] PRIVATE_KEY in .env is invalid (length: ${cleanKey.length}, expected 64 hex chars).`);
  console.log("   Please export your account's private key from MetaMask and paste it into .env as PRIVATE_KEY=0x...\n");
}

const accounts = isValidHexKey ? [`0x${cleanKey}`] : [];

export default {
  solidity: "0.8.20",
  networks: {
    mumbai: {
      url: process.env.ALCHEMY_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: accounts,
      chainId: 80001,
    },
    amoy: {
      url: process.env.ALCHEMY_URL || "https://polygon-amoy-bor-rpc.publicnode.com",
      accounts: accounts,
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY || "",
  },
  sourcify: {
    enabled: false,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};
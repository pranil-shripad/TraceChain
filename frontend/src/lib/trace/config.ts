/** TraceChain network + contract configuration (Polygon Amoy). */

export const CHAIN_ID = 80002;
export const CHAIN_ID_HEX = "0x1388a";
export const CHAIN_NAME = "Polygon Amoy";
export const EXPLORER = "https://amoy.polygonscan.com";
export const RPC_URL = "https://polygon-amoy-bor-rpc.publicnode.com";

export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || "0xcc7D54C0f4Ae273CD095f1BCbfC4F5AAc9C4a5e5";

export const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
];

export const getIpfsUrls = (cid?: string): string[] => {
  if (!cid) return [];
  if (cid.startsWith("http://") || cid.startsWith("https://")) return [cid];
  const cleanCid = cid.replace(/^ipfs:\/\//, "");
  return IPFS_GATEWAYS.map((gw) => `${gw}${cleanCid}`);
};

export const ipfsUrl = (cid?: string) => {
  if (!cid) return "";
  const urls = getIpfsUrls(cid);
  return urls[0] || "";
};

export const NETWORK_PARAMS = {
  chainId: CHAIN_ID_HEX,
  chainName: CHAIN_NAME,
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: [EXPLORER],
};

export type StatusCode = 0 | 1 | 2 | 3 | 4;

export const STATUS_LABELS: Record<StatusCode, string> = {
  0: "CREATED",
  1: "SHIPPED",
  2: "IN TRANSIT",
  3: "DELIVERED",
  4: "CANCELLED",
};

/** Tailwind background token per status. Never the only status signal. */
export const STATUS_COLORS: Record<StatusCode, string> = {
  0: "bg-blue",
  1: "bg-orange",
  2: "bg-purple",
  3: "bg-green",
  4: "bg-red",
};

export const STATUS_OPTIONS = (
  [0, 1, 2, 3, 4] as StatusCode[]
).map((code) => ({ value: String(code), label: STATUS_LABELS[code] }));

export const ROLES = ["MANUFACTURER", "DISTRIBUTOR", "RETAILER"] as const;
export type RoleName = (typeof ROLES)[number];

export const ROLE_COLORS: Record<RoleName, string> = {
  MANUFACTURER: "bg-purple",
  DISTRIBUTOR: "bg-blue",
  RETAILER: "bg-yellow",
};

export const TRACECHAIN_ABI = [
  "function products(uint256 productId) view returns (uint256 productId, string metadataCID, address manufacturer, uint8 status, uint256 createdAt, address currentOwner)",
  "function getHistory(uint256 productId) view returns (tuple(uint8 newStatus, address updatedBy, string location, uint256 timestamp)[])",
  "function createProduct(string metadataCID) returns (uint256)",
  "function updateStatus(uint256 productId, uint8 newStatus, string location)",
  "function transferOwnership(uint256 productId, address newOwner)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function MANUFACTURER_ROLE() view returns (bytes32)",
  "function DISTRIBUTOR_ROLE() view returns (bytes32)",
  "function RETAILER_ROLE() view returns (bytes32)",
  "event ProductCreated(uint256 indexed productId, address indexed manufacturer, string metadataCID)",
  "event StatusUpdated(uint256 indexed productId, uint8 newStatus, string location, address indexed updatedBy)",
  "event OwnershipTransferred(uint256 indexed productId, address indexed oldOwner, address indexed newOwner)",
  "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
  "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
] as const;

export const shortAddr = (a?: string | null, size = 4) =>
  !a ? "—" : `${a.slice(0, 6)}...${a.slice(-size).toUpperCase()}`;

export const sameAddress = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();

export const formatDate = (seconds: number | bigint) => {
  const ms = Number(seconds) * 1000;
  if (!ms) return "—";
  return new Date(ms)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
};

export const relativeTime = (ms: number) => {
  const diff = Math.max(0, Date.now() - ms) / 1000;
  if (diff < 60) return `${Math.floor(diff)}S AGO`;
  if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`;
  return `${Math.floor(diff / 86400)}D AGO`;
};

export const TOKENS = {
  PC: {
    symbol: "PC",
    name: "Push Chain Native",
    address: "NATIVE",
    decimals: 18,
  },
  WPC: {
    symbol: "WPC",
    name: "Wrapped Push Coin",
    address: "0xE17DD2E0509f99E9ee9469Cf6634048Ec5a3ADe9",
    decimals: 18,
  },
  PSOL: {
    symbol: "pSOL",
    name: "Wrapped Solana",
    address: "0x5D525Df2bD99a6e7ec58b76aF2fd95F39874EBed",
    decimals: 9, // ⚠️ SOL uses 9 decimals!
  },
  PETH: {
    symbol: "pETH",
    name: "Wrapped Ethereum", // From Ethereum Sepolia
    address: "0x2971824Db68229D087931155C2b8bB820B275809",
    decimals: 18,
  },
  "USDC.eth": {
    symbol: "USDC.eth",
    name: "USD Coin (Ethereum)",
    address: "0x387b9C8Db60E74999aAAC5A2b7825b400F12d68E",
    decimals: 6,
  },
  "USDT.eth": {
    symbol: "USDT.eth",
    name: "Tether (Ethereum)",
    address: "0xCA0C5E6F002A389E1580F0DB7cd06e4549B5F9d3",
    decimals: 6,
  },
};

// All available pools (from the JSON)
export const AVAILABLE_POOLS = [
  { token0: "pSOL", token1: "WPC", fee: 500 },
  { token0: "pETH", token1: "WPC", fee: 500 },
  { token0: "USDT.eth", token1: "WPC", fee: 500 },
  { token0: "USDC.eth", token1: "WPC", fee: 500 },
];

export const SWAP_ROUTER = "0x5D548bB9E305AAe0d6dc6e6fdc3ab419f6aC0037";
export const WPC_ADDRESS = "0xE17DD2E0509f99E9ee9469Cf6634048Ec5a3ADe9";
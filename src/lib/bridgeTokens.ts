export const BRIDGEABLE_TOKENS = [
  // Ethereum Sepolia
  {
    chain: "eip155:11155111",
    chainName: "Ethereum Sepolia",
    symbol: "ETH",
    decimals: 18,
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    mechanism: "native",
    pushAddress: "0x2971824Db68229D087931155C2b8bB820B275809", // PETH on Push
  },
  {
    chain: "eip155:11155111",
    chainName: "Ethereum Sepolia",
    symbol: "USDT",
    decimals: 6,
    address: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
    mechanism: "approve",
    pushAddress: "0xCA0C5E6F002A389E1580F0DB7cd06e4549B5F9d3", // USDT.eth on Push
  },
  {
    chain: "eip155:11155111",
    chainName: "Ethereum Sepolia",
    symbol: "WETH",
    decimals: 18,
    address: "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
    mechanism: "approve",
    pushAddress: "0x2971824Db68229D087931155C2b8bB820B275809",
  },
  // Solana Devnet
  {
    chain: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    chainName: "Solana Devnet",
    symbol: "SOL",
    decimals: 9,
    address: "solana-native",
    mechanism: "native",
    pushAddress: "0x5D525Df2bD99a6e7ec58b76aF2fd95F39874EBed", // PSOL on Push
  },
  {
    chain: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    chainName: "Solana Devnet",
    symbol: "USDT",
    decimals: 6,
    address: "EiXDnrAg9ea2Q6vEPV7E5TpTU1vh41jcuZqKjU5Dc4ZF",
    mechanism: "approve",
    pushAddress: "0xCA0C5E6F002A389E1580F0DB7cd06e4549B5F9d3",
  },
  // Arbitrum Sepolia
  {
    chain: "eip155:421614",
    chainName: "Arbitrum Sepolia",
    symbol: "ETH",
    decimals: 18,
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    mechanism: "native",
    pushAddress: "0xc0a821a1AfEd1322c5e15f1F4586C0B8cE65400e", // PETH.arb on Push
  },
  {
    chain: "eip155:421614",
    chainName: "Arbitrum Sepolia",
    symbol: "USDT",
    decimals: 6,
    address: "0x1419d7C74D234fA6B73E06A2ce7822C1d37922f0",
    mechanism: "approve",
    pushAddress: "0x76Ad08339dF606BeEDe06f90e3FaF82c5b2fb2E9", // USDT.arb on Push
  },
  // Base Sepolia
  {
    chain: "eip155:84532",
    chainName: "Base Sepolia",
    symbol: "ETH",
    decimals: 18,
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    mechanism: "native",
    pushAddress: "0xc7007af2B24D4eb963fc9633B0c66e1d2D90Fc21", // PETH.base on Push
  },
  {
    chain: "eip155:84532",
    chainName: "Base Sepolia",
    symbol: "USDT",
    decimals: 6,
    address: "0x9FF5a186f53F6E6964B00320Da1D2024DE11E0cB",
    mechanism: "approve",
    pushAddress: "0x2C455189D2af6643B924A981a9080CcC63d5a567", // USDT.base on Push
  },
  // BNB Testnet
  {
    chain: "eip155:97",
    chainName: "BNB Testnet",
    symbol: "ETH",
    decimals: 18,
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    mechanism: "native",
    pushAddress: "0x2971824Db68229D087931155C2b8bB820B275809",
  },
  {
    chain: "eip155:97",
    chainName: "BNB Testnet",
    symbol: "USDT",
    decimals: 6,
    address: "0xBC14F348BC9667be46b35Edc9B68653d86013DC5",
    mechanism: "approve",
    pushAddress: "0xCA0C5E6F002A389E1580F0DB7cd06e4549B5F9d3",
  },
];

export function getAvailableTokensForChain(chainId: string) {
  return BRIDGEABLE_TOKENS.filter((token) => token.chain === chainId);
}

export function getTokenBySymbol(chainId: string, symbol: string) {
  return BRIDGEABLE_TOKENS.find(
    (token) => token.chain === chainId && token.symbol === symbol
  );
}
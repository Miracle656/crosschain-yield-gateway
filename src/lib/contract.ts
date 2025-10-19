export const CONTRACT_ADDRESS = "0xc8e3D30aC6F4C71FC98137270FA0b04c28abdd0A";

export const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "address", name: "_feeRecipient", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "positionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "DepositMade",
    type: "event",
  },
  {
    inputs: [],
    name: "strategyCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "getStrategy",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "strategyId", type: "uint256" },
          { internalType: "string", name: "protocolName", type: "string" },
          { internalType: "string", name: "sourceChain", type: "string" },
          { internalType: "address", name: "prc20Token", type: "address" },
          { internalType: "uint256", name: "apy", type: "uint256" },
          { internalType: "uint256", name: "tvl", type: "uint256" },
          { internalType: "uint256", name: "minDeposit", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct CrossChainDeFiAggregator.YieldStrategy",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalPlatformTVL",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "strategyId", type: "uint256" },
      { internalType: "uint256", name: "minPRC20Amount", type: "uint256" },
    ],
    name: "depositWithNativeToken",
    outputs: [{ internalType: "uint256", name: "positionId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserPositions",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "getPosition",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "positionId", type: "uint256" },
          { internalType: "uint256", name: "strategyId", type: "uint256" },
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "depositedAmount", type: "uint256" },
          { internalType: "uint256", name: "shares", type: "uint256" },
          { internalType: "uint256", name: "depositTimestamp", type: "uint256" },
          { internalType: "string", name: "originChainNamespace", type: "string" },
          { internalType: "string", name: "originChainId", type: "string" },
          { internalType: "bytes", name: "originOwner", type: "bytes" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct CrossChainDeFiAggregator.UserPosition",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "positionId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// src/config/contract.ts

export const CONTRACT_ADDRESS = '0x5e873BF3f54694A7Dd922Eb185Bf3D7212E989C2';

export const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_feeRecipient",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "positionId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "DepositMade",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountIn",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountOut",
				"type": "uint256"
			}
		],
		"name": "NativeSwap",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "strategyId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "protocolName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "prc20Token",
				"type": "address"
			}
		],
		"name": "StrategyAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "positionId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "WithdrawalMade",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "PETH",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "PSOL",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SWAP_ROUTER",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "UEA_FACTORY",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "USDC_ETH",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "USDT_ETH",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "WPC",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "protocolName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "sourceChain",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "prc20Token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "apy",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tvl",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "minDeposit",
				"type": "uint256"
			}
		],
		"name": "addStrategy",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "strategyId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "deposit",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "positionId",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "strategyId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "minPRC20Amount",
				"type": "uint256"
			}
		],
		"name": "depositWithNativeToken",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "positionId",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "feeRecipient",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getPosition",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "positionId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "strategyId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "user",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "depositedAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "shares",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "depositTimestamp",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "originChainNamespace",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "originChainId",
						"type": "string"
					},
					{
						"internalType": "bytes",
						"name": "originOwner",
						"type": "bytes"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					}
				],
				"internalType": "struct CrossChainDeFiAggregator.UserPosition",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getStrategy",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "strategyId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "protocolName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "sourceChain",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "prc20Token",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "apy",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "tvl",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "minDeposit",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					}
				],
				"internalType": "struct CrossChainDeFiAggregator.YieldStrategy",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserOrigin",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserPositions",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "platformFeeRate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "positionCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "positions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "positionId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "strategyId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "depositedAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "shares",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "depositTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "originChainNamespace",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "originChainId",
				"type": "string"
			},
			{
				"internalType": "bytes",
				"name": "originOwner",
				"type": "bytes"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newRate",
				"type": "uint256"
			}
		],
		"name": "setPlatformFeeRate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "strategies",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "strategyId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "protocolName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "sourceChain",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "prc20Token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "apy",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tvl",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "minDeposit",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "strategyCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "strategyTotalDeposits",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "strategyTotalShares",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalPlatformTVL",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userPositionIds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "positionId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
];
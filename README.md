# PushYield

> 🚀 The first cross-chain DeFi yield aggregator built on Push Chain

PushYield is a decentralized finance platform that enables users to deposit assets from any blockchain and earn yield from strategies across multiple chains - all through a single, unified interface powered by Push Chain's Universal Accounts.

## 🌟 Features

### ✨ Universal Account Integration
- **One account, all chains**: Connect from Ethereum, Solana, Polygon, Arbitrum, or any supported chain
- **Seamless cross-chain**: No manual bridging or network switching required
- **Unified balance**: View and manage positions from all chains in one place

### 💰 Multi-Chain Yield Strategies
- **Marinade Finance** (Solana) - Liquid staking with 7.2% APY
- **AAVE Protocol** (Ethereum) - Supply assets and earn 1.8% APY
- **Compound Finance** (Ethereum) - Automated lending at 3.2% APY
- More strategies added regularly

### 🔄 Built-in Token Swap
- Swap between PC, WPC, PSOL, PETH, USDC, and USDT
- Multi-hop routing for optimal prices
- No external DEX needed

### 🌉 Cross-Chain Bridge (Coming Soon)
- Bridge tokens between Ethereum Sepolia and Push Chain
- Low fees and fast processing
- Support for USDT, ETH, and more

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        User Wallet                          │
│         (Ethereum / Solana / Base    / etc.)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Push Chain Gateway                        │
│              (Universal Account System)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 PushYield Smart Contract                    │
│                     (Push Chain)                            │
│  • Strategy Management  • Position Tracking                 │
│  • Fee Distribution     • Cross-Chain State                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼               ▼
   ┌─────────┐   ┌─────────┐    ┌─────────┐
   │ Solana  │   │Ethereum │    │ Base    │
   │Protocols│   │Protocols│    │Protocols│
   └─────────┘   └─────────┘    └─────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask, Phantom, or another Web3 wallet

### Installation
```bash
# Clone the repository
git clone https://github.com/Miracle656/crosschain-yield-gateway.git

# Navigate to the project directory
cd crosschain-yield-gateway

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

Create a `.env.local` file:
```env
VITE_CONTRACT_ADDRESS=0x6bD978ebc0e0626675EFe3Dd180B5ecc49852C7D
VITE_PUSH_CHAIN_RPC=https://evm.rpc-testnet-donut-node1.push.org/
VITE_PUSH_NETWORK=testnet
```

## 📱 Usage

### 1. Connect Your Wallet
Click "Connect Wallet" and select your preferred wallet. PushYield works with:
- MetaMask (Ethereum)
- Phantom (Solana)
- WalletConnect (Any chain)

### 2. Explore Strategies
Browse available yield strategies and their APYs. Each strategy shows:
- Protocol name and blockchain
- Current APY
- Total Value Locked (TVL)
- Minimum deposit

### 3. Deposit Assets
Select a strategy and deposit:
- Native tokens (PC, ETH, SOL)
- Wrapped tokens (PSOL, PETH)
- Stablecoins (USDC, USDT)

### 4. Track Positions
View all your positions across chains:
- Active deposits
- Accumulated rewards
- Historical performance

### 5. Withdraw Anytime
Withdraw your principal + rewards at any time with a small 2% platform fee on profits.

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library

### Smart Contracts
- **Solidity 0.8.22** - Contract language
- **OpenZeppelin** - Security standards
- **Hardhat** - Development environment

### Blockchain Integration
- **Push Chain SDK** (`@pushchain/ui-kit`) - Universal Accounts
- **ethers.js v6** - Ethereum interactions
- **Uniswap V3** - DEX integration for swaps

## 📄 Smart Contract

The PushYield contract is deployed on Push Chain Testnet:

**Contract Address:** `0x6bD978ebc0e0626675EFe3Dd180B5ecc49852C7D`

### Key Functions
```solidity
// Deposit native tokens (PC)
function depositWithNativeToken(uint256 strategyId, uint256 minPRC20Amount) external payable

// Deposit PRC20 tokens (PSOL, PETH, USDC, etc.)
function deposit(uint256 strategyId, uint256 amount) external

// Withdraw from a position
function withdraw(uint256 positionId, uint256 amount) external

// View your positions
function getUserPositions(address user) external view returns (uint256[] memory)

// Get strategy details
function getStrategy(uint256 id) external view returns (YieldStrategy memory)
```

## 🔒 Security

- **Audited Patterns**: Uses OpenZeppelin's battle-tested contracts
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Access Control**: Owner-only admin functions
- **Testing**: Comprehensive unit and integration tests

> ⚠️ **Testnet Only**: Currently deployed on Push Chain Donut Testnet. Use at your own risk.

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] Universal Account integration
- [x] Basic yield strategies
- [x] Token swapping
- [x] Position management

### Phase 2: Enhanced Features 🚧
- [ ] Bridge integration (Ethereum ↔ Push Chain)
- [ ] More yield strategies (10+ protocols)
- [ ] Portfolio analytics dashboard
- [ ] Auto-compound feature

### Phase 3: Advanced Features 📅
- [ ] Strategy vaults (pooled deposits)
- [ ] Governance token launch
- [ ] DAO governance
- [ ] Mobile app
- [ ] Mainnet deployment

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support (not active)

- **Twitter**: [@PushYield](https://twitter.com/pushyield)
- **Discord**: [Join our community](https://discord.gg/pushyield)
- **Email**: support@pushyield.finance

## ⚡ Quick Links

- [Live Demo (Testnet)](https://crosschain-yield-gateway.vercel.app/)
- [Smart Contract on Explorer](https://donut.push.network/address/0x6bD978ebc0e0626675EFe3Dd180B5ecc49852C7D)
- [Push Chain Docs](https://docs.push.org)

---

**Built with ❤️ on Push Chain**

*Making DeFi truly cross-chain*

---

## 💡 Why PushYield?

### The Problem
Traditional DeFi platforms force users to:
- Manage multiple wallets across different chains
- Manually bridge assets between networks
- Track positions across various protocols
- Pay high gas fees on expensive chains

### The Solution
PushYield leverages Push Chain's Universal Accounts to:
- ✅ Use one account across all chains
- ✅ Eliminate manual bridging complexity  
- ✅ Aggregate yields in one interface
- ✅ Reduce transaction costs significantly

### The Vision
Become the **Zapper.fi of Push Chain** - the go-to platform for managing cross-chain DeFi positions with the best UX in the space.

---

## 📊 Supported Networks

| Network | Status | Supported Tokens |
|---------|--------|------------------|
| Push Chain | ✅ Live | PC, WPC |
| Ethereum Sepolia | ✅ Live | pETH, USDC, USDT |
| Solana Devnet | ✅ Live | pSOL |
| Polygon Mumbai | 🚧 Coming Soon | - |
| Arbitrum Sepolia | 🚧 Coming Soon | - |

---

## 📈 Stats

- **Total Value Locked**: $104.00
- **Active Users**: 5+
- **Supported Chains**: 3
- **Available Strategies**: 3
- **Average APY**: 3.73%

---

## 🐛 Known Issues

- Token swaps limited to WPC pairs due to testnet liquidity
- Bridge functionality pending Push Protocol gateway updates
- Some external chain deposits require manual UEA discovery

---


<div align="center">

### Star ⭐ this repo if you find it useful!

Made with 💜 by the PushYield team

</div>

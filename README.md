# Flashbot Bundle Demo - OpenspaceNFT Presale

这个项目演示如何使用 Flashbots API 在 Sepolia 测试网上发送捆绑交易来执行 OpenspaceNFT 合约的预售功能。

## 功能特性

- 🚀 使用 Flashbots `eth_sendBundle` API 发送原子性交易捆绑
- 📦 包含两个交易：开启预售 (`enablePresale`) 和执行预售 (`presale`)
- 🔍 自动查询交易回执，显示区块号或 "Bundle 未落地" 提示
- 📊 打印详细的交易哈希、Bundle Hash 和状态信息
- ⚡ 改良版脚本支持实时状态监控

## 项目文件

- `flashbot-improved.js` - 改良版 Flashbot 演示脚本

- `OpenspaceNFT.sol` - NFT 合约源码
- `compiled-contract.json` - 编译后的合约 ABI 和字节码

## 安装依赖

```bash
npm install
```

## 配置环境变量

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入实际值：
```env
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=0x7c8AA559F97Bc369552849599bEdAFFB4Ce9e470
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key
FLASHBOT_RPC_URL=https://relay-sepolia.flashbots.net
FLASHBOT_STATS_URL=https://relay-sepolia.flashbots.net
```

## 部署合约

如需重新部署合约：

```bash
# 编译合约
node compile.js

# 部署合约
node deploy.js
```

## 运行 Flashbot 演示

```bash
# 运行改良版脚本
node flashbot-improved.js
```

## API 端点

- **Flashbot RPC (Sepolia)**: `https://relay-sepolia.flashbots.net`
- **Sepolia RPC**: `https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key`

## 交易流程

1. **初始化**: 连接 Flashbots Sepolia 提供者
2. **创建交易**: 构建 `enablePresale` 和 `presale` 交易
3. **签名交易**: 使用私钥对交易进行签名
4. **发送捆绑**: 通过 `eth_sendBundle` 发送原子性交易捆绑
5. **监控状态**: 自动等待目标区块被挖出
6. **查询回执**: 检查交易是否成功执行
7. **显示结果**: 打印交易哈希、Bundle Hash 和最终状态

## 输出示例

```
🎯 Flashbots 捆绑交易演示（改良版）
💰 钱包地址: 0x61fC01810514EEd7FE2E0FAdCdA5BA8C0fBC50e7
📄 合约地址: 0x7c8AA559F97Bc369552849599bEdAFFB4Ce9e470
✅ Flashbots 提供者初始化成功

🔗 交易哈希:
1. 0x65bd4d76a52bba3a13095743afaa15358bae06b320536e14b3145a7f9eb989ac
2. 0xf568cb65a3c3c8376eaa5a6dfa2ca5604a3e4aadeac6737517ef451cda7f3166

📦 Bundle Hash: 0x069ee9881443ee9695c859978225b18e0b85f4301783fb29b26de6a97a62030a

📊 最终结果:
交易 1: Bundle 未落地
交易 2: Bundle 未落地
```

## 已部署合约信息

- **网络**: Sepolia 测试网
- **合约地址**: `0x7c8AA559F97Bc369552849599bEdAFFB4Ce9e470`
- **部署交易**: `0xab17b7cbaf71e3caacb1aa60c63bf4d9e5dca4c94f09d977c0a4722bac26e298`
- **预售价格**: 0.01 ETH per NFT
- **最大供应量**: 1024 个 NFT

## 注意事项

- 确保钱包有足够的 ETH 支付 gas 费用和 NFT 价格
- 私钥请妥善保管，不要提交到版本控制系统
- 这是 Sepolia 测试网络的演示，使用真实的测试网数据
- Flashbots 在测试网上的成功率较低，Bundle 未落地是正常现象
- 所有交易哈希和 Bundle Hash 都是真实生成的

## 技术栈

- **Node.js** - 运行环境
- **ethers.js** - 以太坊交互库
- **@flashbots/ethers-provider-bundle** - Flashbots 提供者
- **@openzeppelin/contracts** - OpenZeppelin 合约库
- **solc** - Solidity 编译器
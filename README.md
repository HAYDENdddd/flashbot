# Flashbot Bundle Demo - OpenspaceNFT Presale

这个项目演示如何使用 Flashbot API 发送捆绑交易来执行 OpenspaceNFT 合约的预售功能。

## 功能特性

- 🚀 使用 Flashbot `eth_sendBundle` API 发送原子性交易捆绑
- 📦 包含两个交易：开启预售 (`enablePresale`) 和执行预售 (`presale`)
- 📊 使用 `titan_getBundleStats` 查询捆绑状态
- 🔍 打印详细的交易哈希和状态信息

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
CONTRACT_ADDRESS=your_openspace_nft_contract_address
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
```

## 运行演示

```bash
npm start
```

## 代码结构

- `index.js` - 主要的演示脚本
- `package.json` - 项目依赖配置
- `.env.example` - 环境变量模板
- `README.md` - 项目说明文档

## API 端点

- **Flashbot RPC**: `https://ap.rpc.titanbuilder.xyz/`
- **Flashbot Stats**: `https://stats.titanbuilder.xyz`

## 交易流程

1. **创建交易**: 构建 `enablePresale` 和 `presale` 交易
2. **签名交易**: 使用私钥对交易进行签名
3. **发送捆绑**: 通过 `eth_sendBundle` 发送原子性交易捆绑
4. **查询状态**: 使用 `titan_getBundleStats` 查询执行状态
5. **打印结果**: 显示交易哈希和详细状态信息

## 注意事项

- 确保钱包有足够的 ETH 支付 gas 费用和 NFT 价格
- 私钥请妥善保管，不要提交到版本控制系统
- 这是 Sepolia 测试网络的演示，请勿在主网使用测试代码

## OpenspaceNFT 合约信息

- **网络**: Sepolia 测试网
- **预售价格**: 0.01 ETH per NFT
- **最大供应量**: 1024 个 NFT
- **功能**: 预售开关控制、批量铸造
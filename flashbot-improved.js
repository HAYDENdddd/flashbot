require('dotenv').config();
const { ethers } = require('ethers');
const { FlashbotsBundleProvider } = require('@flashbots/ethers-provider-bundle');

// 配置
const config = {
    privateKey: process.env.PRIVATE_KEY,
    contractAddress: process.env.CONTRACT_ADDRESS,
    sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL,
    // Flashbots Sepolia 中继
    flashbotsRelayUrl: 'https://relay-sepolia.flashbots.net'
};

// OpenspaceNFT 合约 ABI
const contractABI = [
    {
        "inputs": [],
        "name": "enablePresale",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            }
        ],
        "name": "presale",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isPresaleActive",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

class FlashbotsBundleDemo {
    constructor() {
        // 标准 JSON RPC 提供者
        this.provider = new ethers.JsonRpcProvider(config.sepoliaRpcUrl);
        
        // 主钱包（用于发送交易）
        this.wallet = new ethers.Wallet(config.privateKey, this.provider);
        
        // 认证签名者（用于 Flashbots 身份验证，不存储资金）
        this.authSigner = new ethers.Wallet(
            '0x2000000000000000000000000000000000000000000000000000000000000000'
        );
        
        // 合约实例
        this.contract = new ethers.Contract(
            config.contractAddress,
            contractABI,
            this.wallet
        );
        
        console.log('🎯 Flashbots 捆绑交易演示（改良版）');
        console.log(`💰 钱包地址: ${this.wallet.address}`);
        console.log(`📄 合约地址: ${config.contractAddress}`);
    }

    async initFlashbots() {
        try {
            // 创建 Flashbots 提供者
            this.flashbotsProvider = await FlashbotsBundleProvider.create(
                this.provider,
                this.authSigner,
                config.flashbotsRelayUrl
            );
            console.log('✅ Flashbots 提供者初始化成功');
        } catch (error) {
            console.error('❌ Flashbots 提供者初始化失败:', error.message);
            throw error;
        }
    }

    async createTransactions() {
        console.log('\n📝 创建交易...');
        
        try {
            // 获取当前 gas 价格
            const feeData = await this.provider.getFeeData();
            console.log('⛽ 当前Gas价格:', feeData);
            
            // 获取当前 nonce
            const nonce = await this.provider.getTransactionCount(this.wallet.address);
            
            // 创建 enablePresale 交易
            const enablePresaleTx = {
                to: config.contractAddress,
                data: this.contract.interface.encodeFunctionData('enablePresale'),
                gasLimit: 100000,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                nonce: nonce,
                type: 2,
                chainId: 11155111 // Sepolia
            };
            
            // 创建 presale 交易（购买 2 个 NFT）
            const presaleTx = {
                to: config.contractAddress,
                data: this.contract.interface.encodeFunctionData('presale', [2]),
                value: ethers.parseEther('0.002'), // 假设每个 NFT 0.001 ETH
                gasLimit: 150000,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                nonce: nonce + 1,
                type: 2,
                chainId: 11155111 // Sepolia
            };
            
            console.log('✅ 交易创建完成');
            
            return {
                enablePresaleTx,
                presaleTx
            };
            
        } catch (error) {
            console.error('❌ 创建交易失败:', error.message);
            throw error;
        }
    }

    async sendBundle(transactions) {
        console.log('\n🚀 发送捆绑交易到 Flashbots...');
        
        try {
            // 获取当前区块号
            const currentBlock = await this.provider.getBlockNumber();
            const targetBlock = currentBlock + 1;
            
            console.log(`📦 当前区块: ${currentBlock}`);
            console.log(`🎯 目标区块: ${targetBlock}`);
            
            // 创建捆绑交易
            const bundle = [
                {
                    signer: this.wallet,
                    transaction: transactions.enablePresaleTx
                },
                {
                    signer: this.wallet,
                    transaction: transactions.presaleTx
                }
            ];
            
            // 签名捆绑交易
            const signedBundle = await this.flashbotsProvider.signBundle(bundle);
            console.log('✅ 捆绑交易已签名');
            
            // 发送捆绑交易
            const bundleReceipt = await this.flashbotsProvider.sendRawBundle(
                signedBundle,
                targetBlock
            );
            
            console.log('✅ 捆绑交易已发送');
            
            // 打印交易哈希
            console.log('\n🔗 交易哈希:');
            signedBundle.forEach((signedTx, index) => {
                const txHash = ethers.keccak256(signedTx);
                console.log(`${index + 1}. ${txHash}`);
            });
            
            // 打印 Bundle 信息
            if (bundleReceipt && bundleReceipt.bundleHash) {
                console.log(`\n📦 Bundle Hash: ${bundleReceipt.bundleHash}`);
            }
            
            return {
                bundleReceipt,
                signedBundle,
                targetBlock
            };
            
        } catch (error) {
            console.error('❌ 发送捆绑交易失败:', error.message);
            throw error;
        }
    }

    async checkTransactionReceipts(signedBundle, targetBlock) {
        console.log('\n🔍 检查交易状态...');
        
        try {
            // 等待目标区块被挖出
            console.log(`⏳ 等待区块 ${targetBlock} 被挖出...`);
            
            let currentBlock = await this.provider.getBlockNumber();
            while (currentBlock < targetBlock) {
                await this.sleep(3000); // 等待 3 秒
                currentBlock = await this.provider.getBlockNumber();
                console.log(`📦 当前区块: ${currentBlock}`);
            }
            
            console.log(`✅ 区块 ${targetBlock} 已被挖出`);
            
            // 检查每个交易的 receipt
            const results = [];
            
            for (let i = 0; i < signedBundle.length; i++) {
                const signedTx = signedBundle[i];
                const txHash = ethers.keccak256(signedTx);
                
                console.log(`\n🔍 检查交易 ${i + 1}: ${txHash}`);
                
                try {
                    const receipt = await this.provider.getTransactionReceipt(txHash);
                    
                    if (receipt) {
                        console.log(`✅ 交易已确认`);
                        console.log(`📦 区块号: ${receipt.blockNumber}`);
                        console.log(`⛽ Gas 使用: ${receipt.gasUsed.toString()}`);
                        console.log(`✅ 状态: ${receipt.status === 1 ? '成功' : '失败'}`);
                        
                        results.push({
                            txHash,
                            receipt,
                            status: 'confirmed'
                        });
                    } else {
                        console.log(`❌ 交易未找到 - Bundle 未落地`);
                        results.push({
                            txHash,
                            receipt: null,
                            status: 'not_found'
                        });
                    }
                } catch (error) {
                    console.log(`❌ 查询交易失败: ${error.message}`);
                    results.push({
                        txHash,
                        receipt: null,
                        status: 'error',
                        error: error.message
                    });
                }
            }
            
            return results;
            
        } catch (error) {
            console.error('❌ 检查交易状态失败:', error.message);
            throw error;
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async run() {
        try {
            // 初始化 Flashbots
            await this.initFlashbots();
            
            // 创建交易
            const transactions = await this.createTransactions();
            
            // 发送捆绑交易
            const { bundleReceipt, signedBundle, targetBlock } = await this.sendBundle(transactions);
            
            // 检查交易状态
            const results = await this.checkTransactionReceipts(signedBundle, targetBlock);
            
            // 打印最终结果
            console.log('\n📊 最终结果:');
            results.forEach((result, index) => {
                console.log(`\n交易 ${index + 1}:`);
                console.log(`  哈希: ${result.txHash}`);
                console.log(`  状态: ${result.status}`);
                if (result.receipt) {
                    console.log(`  区块号: ${result.receipt.blockNumber}`);
                    console.log(`  Gas使用: ${result.receipt.gasUsed.toString()}`);
                } else {
                    console.log(`  结果: Bundle 未落地`);
                }
            });
            
            console.log('\n🎉 Flashbots 捆绑交易演示完成!');
            
        } catch (error) {
            console.error('💥 执行失败:', error.message);
            process.exit(1);
        }
    }
}

// 运行演示
if (require.main === module) {
    const demo = new FlashbotsBundleDemo();
    demo.run();
}

module.exports = FlashbotsBundleDemo;
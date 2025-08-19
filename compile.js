const solc = require('solc');
const fs = require('fs');
const path = require('path');

// 读取合约源码
function readContract() {
    const contractPath = path.join(__dirname, 'OpenspaceNFT.sol');
    return fs.readFileSync(contractPath, 'utf8');
}

// 读取OpenZeppelin合约源码
function findImports(importPath) {
    try {
        if (importPath.startsWith('@openzeppelin/')) {
            const contractPath = path.join(__dirname, 'node_modules', importPath);
            return {
                contents: fs.readFileSync(contractPath, 'utf8')
            };
        }
        return { error: 'File not found' };
    } catch (error) {
        return { error: 'File not found' };
    }
}

// 编译合约
function compileContract() {
    console.log('📦 开始编译 OpenspaceNFT.sol...');
    
    const contractSource = readContract();
    
    // 设置编译输入
    const input = {
        language: 'Solidity',
        sources: {
            'OpenspaceNFT.sol': {
                content: contractSource
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            }
        }
    };
    
    try {
        // 编译
        const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
        
        // 检查编译错误
        if (output.errors) {
            output.errors.forEach(error => {
                if (error.severity === 'error') {
                    console.error('❌ 编译错误:', error.formattedMessage);
                    throw new Error('合约编译失败');
                } else {
                    console.warn('⚠️ 编译警告:', error.formattedMessage);
                }
            });
        }
        
        // 获取编译结果
        const contract = output.contracts['OpenspaceNFT.sol']['OpenspaceNFT'];
        
        if (!contract) {
            throw new Error('未找到编译后的合约');
        }
        
        const abi = contract.abi;
        const bytecode = '0x' + contract.evm.bytecode.object;
        
        console.log('✅ 合约编译成功!');
        console.log(`📄 字节码长度: ${bytecode.length} 字符`);
        console.log(`🔧 ABI 方法数量: ${abi.length}`);
        
        // 保存编译结果
        const compiledContract = {
            abi: abi,
            bytecode: bytecode
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'compiled-contract.json'),
            JSON.stringify(compiledContract, null, 2)
        );
        
        console.log('💾 编译结果已保存到 compiled-contract.json');
        
        return compiledContract;
        
    } catch (error) {
        console.error('❌ 编译失败:', error.message);
        throw error;
    }
}

if (require.main === module) {
    compileContract();
}

module.exports = { compileContract };
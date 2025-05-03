const ethers = require('ethers');
const inquirer = require('inquirer');
const fs = require('fs');
const solc = require('solc');
const path = require('path');
require('dotenv').config();
const chalk = require('chalk');

const rpcURL = process.env.RPC_URL;
const privateKey = process.env.PRIVATE_KEY;

// Validate environment variables
if (!rpcURL || !privateKey) {
    console.error(chalk.red('Error: RPC_URL or PRIVATE_KEY is not set in .env file'));
    process.exit(1);
}

// Define network (updated chainId based on detected network)
const CALDERA_CHAIN_ID = 33111; // Updated to match detected chainId
const network = {
    chainId: CALDERA_CHAIN_ID,
    name: 'unknown' // Name is unknown for chainId 33111
};

// Initialize provider with custom network
const provider = new ethers.providers.JsonRpcProvider(rpcURL, network);
const wallet = new ethers.Wallet(privateKey, provider);

// Verify network chainId
async function verifyNetwork() {
    try {
        const network = await provider.getNetwork();
        if (network.chainId !== CALDERA_CHAIN_ID) {
            console.error(chalk.red(`Error: Connected to wrong network. Expected chainId ${CALDERA_CHAIN_ID}, got ${network.chainId}`));
            process.exit(1);
        }
        console.log(chalk.blue(`Connected to network: ${network.name} (chainId: ${network.chainId})`));
    } catch (error) {
        console.error(chalk.red(`Failed to verify network: ${error.message}`));
        process.exit(1);
    }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    // Verify network before proceeding
    await verifyNetwork();

    console.log(chalk.green(` 

        ██╗   ██╗██╗   ██╗ ██████╗  █████╗ ██╗      █████╗ ██████╗ ███████╗
        ╚██╗ ██╔╝██║   ██║██╔════╝ ██╔══██╗██║     ██╔══██╗██╔══██╗██╔════╝
         ╚████╔╝ ██║   ██║██║  ███╗███████║██║     ███████║██████╔╝███████╗
          ╚██╔╝  ██║   ██║██║   ██║██╔══██║██║     ██╔══██║██╔══██╗╚════██║
           ██║   ╚██████╔╝╚██████╔╝██║  ██║███████╗██║  ██║██████╔╝███████║
           ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝
                                                                    TESTNET                     
        
`));

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an action:',
            choices: ['Send Tokens', 'Deploy New Token'],
        },
    ]);

    if (action === 'Send Tokens') {
        await sendToken();
    } else if (action === 'Deploy New Token') {
        await deployToken();
    }
}

async function sendToken() {
    const input = await inquirer.prompt([
        { name: 'contract', message: 'Token Contract address?' },
        { name: 'symbol', message: 'Token Symbol?' },
        { name: 'decimals', message: 'Token Decimals?', default: 18 },
        { name: 'amount', message: 'Amount per transaction (without decimals)?' },
        { name: 'count', message: 'How many transactions?' },
        { name: 'delay', message: 'Delay between transactions (in seconds)?', default: 1 }
    ]);

    // Validate contract address
    if (!ethers.utils.isAddress(input.contract)) {
        console.log(chalk.red('Invalid token contract address'));
        process.exit(1);
    }

    const abi = [
        "function transfer(address to, uint amount) public returns (bool)",
        "function balanceOf(address account) public view returns (uint256)"
    ];
    const token = new ethers.Contract(input.contract, abi, wallet);

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(chalk.blue(`Wallet balance: ${ethers.utils.formatEther(balance)} ETH`));
    if (balance.isZero()) {
        console.log(chalk.red('Wallet has no ETH for gas. Please fund the wallet.'));
        process.exit(1);
    }

    // Check token balance
    const tokenBalance = await token.balanceOf(wallet.address);
    console.log(chalk.blue(`Token balance: ${ethers.utils.formatUnits(tokenBalance, input.decimals)} ${input.symbol}`));

    // Load and validate addresses
    const address = fs.readFileSync('address.txt', 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .filter(addr => {
            if (!ethers.utils.isAddress(addr)) {
                console.log(chalk.yellow(`Skipping invalid address: ${addr}`));
                return false;
            }
            return true;
        });
    if (address.length === 0) {
        console.log(chalk.red('No valid addresses found in address.txt'));
        process.exit(1);
    }

    // Shuffle addresses
    for (let i = address.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [address[i], address[j]] = [address[j], address[i]];
    }

    const fluctuationPercentages = [3, 4, 5];

    for (let i = 0; i < Math.min(input.count, address.length); i++) {
        const baseAmount = parseFloat(input.amount);
        const fluctuationPercentage = fluctuationPercentages[Math.floor(Math.random() * fluctuationPercentages.length)];
        const fluctuation = (baseAmount * (fluctuationPercentage / 100)) - (baseAmount * (fluctuationPercentage / 200));
        const finalAmount = baseAmount + fluctuation;
        const amountInWei = ethers.utils.parseUnits(finalAmount.toString(), input.decimals);

        console.log(chalk.blue(`Attempting TX ${i + 1} to address: ${address[i]}`));

        try {
            const gasLimit = await token.estimateGas.transfer(address[i], amountInWei).catch((err) => {
                console.log(chalk.yellow(`Gas estimation failed for TX ${i + 1}. Error: ${err.message}`));
                console.log(chalk.yellow(`Setting default gas limit.`));
                return ethers.BigNumber.from(500000);
            });

            const tx = await token.transfer(address[i], amountInWei, { gasLimit: gasLimit });
            await tx.wait();

            console.log(chalk.green(`TX ${i + 1} Successful! ✅ ${finalAmount.toFixed(3)}`));
            console.log(chalk.blue(`Sending to ${address[i]}`));
            console.log(chalk.green(`[View on Explorer: https://curtis.explorer.caldera.xyz/tx/${tx.hash}]`));
        } catch (error) {
            console.log(chalk.red(`TX ${i + 1}: Failed to send to ${address[i]}. Error: ${error.message}`));
        }

        await delay(input.delay * 1000);
    }
}

async function deployToken() {
    const input = await inquirer.prompt([
        { name: 'name', message: 'Token Name?' },
        { name: 'symbol', message: 'Token Symbol?' },
        { name: 'supply', message: 'Total Supply (without decimals)?' }
    ]);

    // Sanitize contract name by replacing spaces with underscores
    const contractName = input.name.replace(/\s+/g, '_');

    // Define the Solidity contract source
    const contractSource = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.20;

        import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
        import "@openzeppelin/contracts/access/Ownable.sol";

        contract ${contractName} is ERC20, Ownable {
            constructor(string memory name, string memory symbol, uint256 initialSupply, address owner) 
                ERC20(name, symbol) 
                Ownable(owner) 
            {
                _mint(owner, initialSupply);
            }
        }
    `;

    // Save contract source to a temporary file
    const contractPath = path.resolve(`${contractName}.sol`);
    fs.writeFileSync(contractPath, contractSource);

    console.log(chalk.yellow('⏳ Compiling contract...'));

    // Function to handle imports for solc
    function findImports(importPath) {
        const fullPath = path.resolve('node_modules', importPath);
        if (fs.existsSync(fullPath)) {
            return { contents: fs.readFileSync(fullPath, 'utf8') };
        } else {
            return { error: `File not found: ${importPath}` };
        }
    }

    // Prepare solc input
    const solcInput = {
        language: 'Solidity',
        sources: {
            [`${contractName}.sol`]: { content: contractSource }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode.object']
                }
            }
        }
    };

    // Compile contract
    let contractData;
    try {
        const output = JSON.parse(solc.compile(JSON.stringify(solcInput), { import: findImports }));
        
        if (output.errors && output.errors.length > 0) {
            const errors = output.errors.filter(e => e.severity === 'error');
            if (errors.length > 0) {
                console.log(chalk.red('❌ Compilation failed:'));
                errors.forEach(err => console.log(chalk.red(err.formattedMessage)));
                return;
            }
        }

        if (!output.contracts || !output.contracts[`${contractName}.sol`] || !output.contracts[`${contractName}.sol`][contractName]) {
            console.log(chalk.red(`❌ Compilation error: Contract ${contractName} not found in output.`));
            return;
        }

        contractData = output.contracts[`${contractName}.sol`][contractName];
    } catch (error) {
        console.log(chalk.red(`❌ Compilation failed: ${error.message}`));
        return;
    }

    // Deploy contract
    console.log(chalk.yellow('⏳ Deploying contract...'));
    try {
        const contractFactory = new ethers.ContractFactory(
            contractData.abi,
            contractData.evm.bytecode.object,
            wallet
        );

        const initialSupply = ethers.utils.parseUnits(input.supply.toString(), 18);
        const contract = await contractFactory.deploy(input.name, input.symbol, initialSupply, wallet.address);
        
        console.log(chalk.yellow('Waiting for deployment confirmation...'));
        await contract.deployed();

        const contractAddress = contract.address;
        console.log(chalk.green(`✅ Contract deployed successfully!`));
        console.log(chalk.green(`Contract address: ${contractAddress}`));
        console.log(chalk.green(`Transaction hash: ${contract.deployTransaction.hash}`));
        console.log(chalk.green(`[View on Explorer: https://curtis.explorer.caldera.xyz/tx/${contract.deployTransaction.hash}]`));

        // Save contract info
        const contractInfo = {
            address: contractAddress,
            name: input.name,
            symbol: input.symbol,
            supply: input.supply,
            deployTx: contract.deployTransaction.hash
        };
        fs.writeFileSync(`${contractName}_contract.json`, JSON.stringify(contractInfo, null, 2));

        // Clean up temporary contract file
        fs.unlinkSync(contractPath);

    } catch (error) {
        console.log(chalk.red(`❌ Deployment failed: ${error.message}`));
        // Clean up temporary contract file in case of error
        if (fs.existsSync(contractPath)) {
            fs.unlinkSync(contractPath);
        }
    }
}

main().catch((err) => {
    console.error(chalk.red(err));
    process.exit(1);
});
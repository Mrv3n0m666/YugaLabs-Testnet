# YugaLabs Testnet - AIRDROP!
![Screenshot 2025-04-28 140553](https://github.com/user-attachments/assets/1c56a07f-4afd-4d65-a103-1ec6489d0769)

![Screenshot 2025-04-28 140527](https://github.com/user-attachments/assets/dc406c86-d24f-4008-9caa-dd3293f206ad)
## You can deploy your own token on testnet and make mass transaction with your token contract address!


A simple Node.js application to interact with Ethereum testnets. This project allows you to:

- **Send Tokens** to a list of addresses with configurable amounts and delays.
- **Deploy New ERC-20 Tokens** with customizable names, symbols, and initial supply.

 ## 🔍Features

- **Send Tokens:**
  - Choose the token contract, symbol, and decimals.
  - Specify the amount and number of transactions.
  - Set a delay between transactions.
  - Option to randomize sending amounts with configurable fluctuation.
  
- **Deploy ERC-20 Token:**
  - Provide token name, symbol, and total supply.
  - Compile and deploy the token contract on the testnet.
  - View deployment status and transaction details.

## Prerequisites

Before running the project, you need:

- **Node.js** (version 14 or higher) - [Download Node.js](https://nodejs.org/)
- **Ethereum Testnet RPC URL** - For example, Alchemy or Infura.
- **Private Key** - To interact with the testnet.

## Setup

1. **Clone the Repository and install dependencies**:

   ```bash
   git clone https://github.com/your-username/YugaLabs-Testnet.git
   cd YugaLabs-Testnet
   ```
   ```bash
   npm install
   ```
2. **Creat file .env pfor your privatekey configuration**:
   ```bash
   nano .env
   ```
   ```bash
   RPC_URL=https://curtis.rpc.caldera.xyz/http
   PRIVATE_KEY=0x...
   ```
## Usage:
   ```bash
   node app.js
   ```


## Disclaimer and Warning

- **Use Responsibly**: The use of this bot for airdrops or mass token transfers may be considered as fraudulent activity on some networks or could violate the terms of service of certain platforms. Ensure you have permission before sending tokens to these addresses.
- **Private Key Safety**: Never share your private key. Store your private key securely and only use it for legitimate purposes.
- **Testnet Usage**: This project is intended to be used on the Ethereum testnet and does not apply to real transactions on the mainnet.

### Airdrop Bot Usage Warning:

Using bots for mass token distribution or airdrops may result in account restrictions or bans from the network or service you are using. Always use this bot responsibly and ensure that you comply with platform policies.

## Donations

If you find this project useful and would like to support its development, you can donate to the following cryptocurrency wallets:

  ### 🍻:

- **SOLANA (SOL):**  
  `95JSb5DrCcjLDwUMtCxTHW2MvnKsKCNaYegk6Gipj8EB`
  
- **Ethereum (ETH):**  
  `0x7d8d9E268Ab62C038d163B6aF37ccaa013e5606a`

Thank you for your support!

## Contributing

Feel free to fork this repository and contribute by adding bug fixes, new features, or documentation improvements. Please ensure you test your changes before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Ethers.js](https://docs.ethers.io/) for interacting with Ethereum.
- [OpenZeppelin](https://openzeppelin.com/contracts/) for secure and tested smart contracts.
- [Inquirer.js](https://www.npmjs.com/package/inquirer) for CLI prompts.
- [Solc](https://github.com/ethereum/solidity) for Solidity contract compilation.


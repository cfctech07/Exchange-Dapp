require("babel-register");
require("babel-polyfill");
const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 9545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    goerli: {
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, process.env.ALCHEMY_WSS),
      network_id: 5,
      gas: 5500000,
      confirmations: 1,
      timeoutBlocks: 100,
      skipDryRun: true,
    },
  },

  contracts_directory: "./src/contracts/",
  contracts_build_directory: "./src/abis/",

  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.8.0", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      optimizer: {
        enabled: false,
        runs: 200,
      },
    },
  },
};

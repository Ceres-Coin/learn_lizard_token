/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
  solc: {
    // version: "0.8.0", 
    version: "0.6.12",    // Fetch exact version from solc-bin (default: truffle's version)
    // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
    settings: {          // See the solidity docs for advice about optimization and evmVersion
     optimizer: {
       enabled: true,
       runs: 9900000
     }
    //  evmVersion: "byzantium"
    }
  }
};

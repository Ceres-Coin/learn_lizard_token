const MetaCoin = artifacts.require("MetaCoin");
const LizMiner = artifacts.require("LizMiner");
const LizToken = artifacts.require("LIZToken");

const chalk = require('chalk');

contract("LizMiner test script", async accounts => {
  it("LizMiner_test001", async () => {
    const instantceLizMiner = await LizMiner.deployed()
    const instanceLizToken = await LizToken.deployed();
    
    // Print
    console.log(chalk.redBright.bold("instantceLizMiner: ",instantceLizMiner.address));
    console.log(chalk.redBright.bold("instanceLizToken: ",instanceLizToken.address));
  });


});
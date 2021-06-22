const MetaCoin = artifacts.require("MetaCoin");
const LizMiner = artifacts.require("LizMiner");
const LizToken = artifacts.require("LIZToken");
const WETH = artifacts.require("BEP20/WETH");

const chalk = require('chalk');

contract("LizMiner test script", async accounts => {

    it("LizMiner_test001", async () => {
        const instantceLizMiner = await LizMiner.deployed()
        const instanceLizToken = await LizToken.deployed();
        const wethInstance = await WETH.deployed();

        // Print
        // console.log(chalk.redBright.bold("instantceLizMiner: ",instantceLizMiner.address));
        // console.log(chalk.redBright.bold("instanceLizToken: ",instanceLizToken.address));

        const poolInfo = await instantceLizMiner.getPoolInfo(wethInstance.address);
        console.log(chalk.yellow("poolInfo: ",poolInfo));
    });

    it("should put 10000 MetaCoin in the first account", async () => {
        const instance = await MetaCoin.deployed();
        const balance = await instance.getBalance.call(accounts[0]);
        assert.equal(balance.valueOf(), 10000);
      });


});
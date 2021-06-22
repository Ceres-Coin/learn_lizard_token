const MetaCoin = artifacts.require("MetaCoin");
const LizMiner = artifacts.require("LizMiner");
const LizToken = artifacts.require("LIZToken");
const LpWallet = artifacts.require("LpWallet");
const WETH = artifacts.require("BEP20/WETH");

const chalk = require('chalk');

contract("LizMiner test script", async (accounts,network) => {
    const account0 = accounts[0];
    const OWNER = account0;
    const account1 = accounts[1];
    const account2 = accounts[2];

    it("LizMiner_test001", async () => {
        const instantceLizMiner = await LizMiner.deployed()
        const instanceLizToken = await LizToken.deployed();
        const wethInstance = await WETH.deployed();

        // Print instantceLizMiner.address & instanceLizToken.address
        // console.log(chalk.redBright.bold("instantceLizMiner: ",instantceLizMiner.address));
        // console.log(chalk.redBright.bold("instanceLizToken: ",instanceLizToken.address));

        const poolInfo = await instantceLizMiner.getPoolInfo(wethInstance.address);
        // Print poolInfo
        console.log(chalk.yellow("poolInfo: ",poolInfo));
        console.log(chalk.yellow("poolInfo.poolwallet",poolInfo.poolwallet));
        console.log(chalk.yellow("poolInfo.hashrate",poolInfo.hashrate));
        console.log(chalk.yellow("poolInfo.tradeContract",poolInfo.tradeContract));
        console.log(chalk.yellow("poolInfo.totaljthash",poolInfo.totaljthash));
        console.log(chalk.yellow("poolInfo.minpct",poolInfo.minpct));
        console.log(chalk.yellow("poolInfo.maxpct",poolInfo.maxpct));

        const poolInfo_poolwallet_address = poolInfo.poolwallet;
        // console.log(poolInfo_poolwallet_address);

        const instanceLpWallet = await LpWallet.at(poolInfo_poolwallet_address);
        console.log(chalk.yellow(await instanceLpWallet.getBalance(account0,true)));
        console.log(chalk.yellow(await instanceLpWallet.getBalance(account0,false)));

        console.log(chalk.yellow(await instanceLpWallet.getBalance(account1,true)));
        console.log(chalk.yellow(await instanceLpWallet.getBalance(account1,false)));

        console.log(chalk.yellow(await instanceLpWallet.getBalance(account2,true)));
        console.log(chalk.yellow(await instanceLpWallet.getBalance(account2,false)));

        
    });

    it("should put 10000 MetaCoin in the first account", async () => {
        const instance = await MetaCoin.deployed();
        const balance = await instance.getBalance.call(accounts[0]);
        assert.equal(balance.valueOf(), 10000);
      });


});
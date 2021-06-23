const MetaCoin = artifacts.require("MetaCoin");
const LizMiner = artifacts.require("LizMiner");
const LizToken = artifacts.require("LIZToken");
const LpWallet = artifacts.require("LpWallet");

const { expect,assert,should } = require('chai'); 
const BigNumber = require('bignumber.js');

const chalk = require('chalk');

// FAKE token
const WETH = artifacts.require("BEP20/WETH");
const FakeCollateral_USDC = artifacts.require("FakeCollateral/FakeCollateral_USDC");
const FakeCollateral_USDT = artifacts.require("FakeCollateral/FakeCollateral_USDT");

contract("LizMiner test script", async (accounts,network) => {
    // Print Accounts list
    const account0 = accounts[0];
    const CONTRACT_OWNER = account0;
    const FEE_OWNER = account0;
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];
    const account4 = accounts[4];
    const account5 = accounts[5];
    const account6 = accounts[6];
    const account7 = accounts[7];
    let wethInstance;
    let instanceLizToken;
    let instanceLizMiner;
    let col_instance_USDC;
    let instanceLpWallet_LIZToken;
    let instanceLpWallet_WETH;

    beforeEach(async () => {
        wethInstance = await WETH.deployed();
        instanceLizMiner = await LizMiner.deployed()
        instanceLizToken = await LizToken.deployed();
        col_instance_USDC = await FakeCollateral_USDC.deployed(); 

        const getWalletAddress_LIZToken = await instanceLizMiner.getWalletAddress(instanceLizToken.address);
        instanceLpWallet_LIZToken= await LpWallet.at(getWalletAddress_LIZToken);

        const getWalletAddress_WETH = await instanceLizMiner.getWalletAddress(wethInstance.address);
        instanceLpWallet_WETH= await LpWallet.at(getWalletAddress_WETH);
      });

    it("check LizMiner.getPoolTotal default value is 0", async () => {
        const instanceLizMiner = await LizMiner.deployed()
        const instanceLizToken = await LizToken.deployed();
        const wethInstance = await WETH.deployed();
        
        const getPoolTotal = (new BigNumber(await instanceLizMiner.getPoolTotal(wethInstance.address))).toNumber();
        expect(getPoolTotal).to.equal(0);
        

        // Print instantceLizMiner.address & instanceLizToken.address
        // console.log(chalk.redBright.bold("instantceLizMiner: ",instantceLizMiner.address));
        // console.log(chalk.redBright.bold("instanceLizToken: ",instanceLizToken.address));

        // const poolInfo = await instantceLizMiner.getPoolInfo(wethInstance.address);
        // Print poolInfo
        // console.log(chalk.yellow("poolInfo: ",poolInfo));
        // console.log(chalk.yellow("poolInfo.poolwallet",poolInfo.poolwallet));
        // console.log(chalk.yellow("poolInfo.hashrate",poolInfo.hashrate));
        // console.log(chalk.yellow("poolInfo.tradeContract",poolInfo.tradeContract));
        // console.log(chalk.yellow("poolInfo.totaljthash",poolInfo.totaljthash));
        // console.log(chalk.yellow("poolInfo.minpct",poolInfo.minpct));
        // console.log(chalk.yellow("poolInfo.maxpct",poolInfo.maxpct));

        // const poolInfo_poolwallet_address = poolInfo.poolwallet;
        // console.log(poolInfo_poolwallet_address);

        // const instanceLpWallet = await LpWallet.at(poolInfo_poolwallet_address);
        // console.log(chalk.yellow(await instanceLpWallet.getBalance(account0,true)));
        // console.log(chalk.yellow(await instanceLpWallet.getBalance(account0,false)));

        // console.log(chalk.yellow(await instanceLpWallet.getBalance(account1,true)));
        // console.log(chalk.yellow(await instanceLpWallet.getBalance(account1,false)));

        // console.log(chalk.yellow(await instanceLpWallet.getBalance(account2,true)));
        // console.log(chalk.yellow(await instanceLpWallet.getBalance(account2,false)));

        
    });

    it ("check LizMiner_getOwner() = CONTRACT_OWNER", async () => {
        const instantceLizMiner = await LizMiner.deployed();
        expect(await instantceLizMiner.getOwner()).to.equal(CONTRACT_OWNER);
    });

    it ("check default CurrentBlockReward = 0",async() => {
        const instantceLizMiner = await LizMiner.deployed();
        expect(new BigNumber(await instantceLizMiner.CurrentBlockReward()).toNumber()).to.equal(0);
    });

    it ("check default getTotalHash = 0",async() => {
        const instantceLizMiner = await LizMiner.deployed();
        expect(new BigNumber(await instantceLizMiner.getTotalHash()).toNumber()).to.equal(0);
    });

    it ("check default getFeeOnwer() = FEE_OWNER",async() => {
        const instantceLizMiner = await LizMiner.deployed();
        expect(await instantceLizMiner.getFeeOnwer()).to.equal(FEE_OWNER);
    });

    it ("check default getMyLpInfo() = 0",async() => {
        const instanceLizMiner = await LizMiner.deployed();
        const getMyLpInfo = await instanceLizMiner.getMyLpInfo(account0,wethInstance.address);
        expect(new BigNumber(getMyLpInfo[0]).toNumber()).to.equal(0);
        expect(new BigNumber(getMyLpInfo[1]).toNumber()).to.equal(0);
        expect(new BigNumber(getMyLpInfo[2]).toNumber()).to.equal(0);
    });

    it ("check getExchangeCountOfOneUsdt",async() => {
        const getExchangeCountOfOneUsdt = (new BigNumber(await instanceLizMiner.getExchangeCountOfOneUsdt(instanceLizToken.address))).toNumber();
        // console.log(chalk.yellow("getExchangeCountOfOneUsdt: ",getExchangeCountOfOneUsdt));
    });

    it ("getWalletAddress()",async() => {
        const getWalletAddress_weth = await instanceLizMiner.getWalletAddress(wethInstance.address);
        const getWalletAddress_usdc = await instanceLizMiner.getWalletAddress(col_instance_USDC.address);
        const getWalletAddress_LIZToken = await instanceLizMiner.getWalletAddress(instanceLizToken.address);

        // console.log(chalk.yellow("getWalletAddress_weth: ",getWalletAddress_weth));
        // console.log(chalk.yellow("getWalletAddress_usdc: ",getWalletAddress_usdc));
        // console.log(chalk.yellow("getWalletAddress_LIZToken: ",getWalletAddress_LIZToken));
    });

    // TODO: add test scripts of wethInstance's LPWallet
    it ("get LPWallet instance at wethInstance()",async() => {
        const getWalletAddress_weth = await instanceLizMiner.getWalletAddress(wethInstance.address);
        const instanceLpWallet = await LpWallet.at(getWalletAddress_weth);
    });

    // TODO: add test scripts of LIZToken's LPWallet
    it ("get LPWallet instance at LIZToken()",async() => {
        const getWalletAddress_LIZToken = await instanceLizMiner.getWalletAddress(instanceLizToken.address);
        const instanceLpWallet = await LpWallet.at(getWalletAddress_LIZToken);
        
    });

    it ("get LPWallet.getBalance()",async() => {
        // const getWalletAddress_LIZToken = await instanceLizMiner.getWalletAddress(instanceLizToken.address);
        // const instanceLpWallet = await LpWallet.at(getWalletAddress_LIZToken);

        const getBalance_account0_true = (new BigNumber(instanceLpWallet_LIZToken.getBalance(account0,true))).toNumber();
        const getBalance_account0_false = (new BigNumber(instanceLpWallet_LIZToken.getBalance(account0,false))).toNumber();

        // console.log(chalk.yellow("getBalance_account0_true: ",getBalance_account0_true));
        // console.log(chalk.yellow("getBalance_account0_false: ",getBalance_account0_false));
    });

    it ("check LPWallet_LIZToken.getMainContract() = instanceLizMiner.address ",async() => {
        expect(await instanceLpWallet_LIZToken.getMainContract()).to.equal(instanceLizMiner.address);
    });

    it ("check LPWallet_WETH.getMainContract() = instanceLizMiner.address ",async() => {
        expect(await instanceLpWallet_WETH.getMainContract()).to.equal(instanceLizMiner.address);
    });

    it ("check getlptoken()",async() => {
        const getlptoken = await instanceLpWallet_LIZToken.getlptoken();
        const getliztoken = await instanceLpWallet_LIZToken.getliztoken();
        const get_feeowner = await instanceLpWallet_LIZToken.get_feeowner();

        console.log(chalk.yellow("getlptoken: ",getlptoken));
        console.log(chalk.yellow("getliztoken: ",getliztoken));
        console.log(chalk.yellow("get_feeowner: ",get_feeowner));
    })





    


});
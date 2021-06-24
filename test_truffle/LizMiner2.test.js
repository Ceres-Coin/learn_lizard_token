const MetaCoin = artifacts.require("MetaCoin");
const LizMiner = artifacts.require("LizMiner");
const LizToken = artifacts.require("LIZToken");
const LizMinePool = artifacts.require("LizMinePool");
const LpWallet = artifacts.require("LpWallet");

const { expect,assert,should } = require('chai'); 
const BigNumber = require('bignumber.js');

const chalk = require('chalk');

// FAKE token
const WETH = artifacts.require("BEP20/WETH");
const FakeCollateral_USDC = artifacts.require("FakeCollateral/FakeCollateral_USDC");
const FakeCollateral_USDT = artifacts.require("FakeCollateral/FakeCollateral_USDT");

// set constants
console.log(chalk.yellow('===== SET CONSTANTS ====='));
const ONE_MILLION_DEC18 = new BigNumber("1000000e18");
const FIVE_MILLION_DEC18 = new BigNumber("5000000e18");
const TEN_MILLION_DEC18 = new BigNumber("10000000e18");
const ONE_HUNDRED_MILLION_DEC18 = new BigNumber("100000000e18");
const ONE_HUNDRED_MILLION_DEC6 = new BigNumber("100000000e6");
const ONE_BILLION_DEC18 = new BigNumber("1000000000e18");
const COLLATERAL_SEED_DEC18 = new BigNumber(508500e18);
const SIX_HUNDRED_DEC18 = new BigNumber(600e18);
const SIX_HUNDRED_DEC6 = new BigNumber(600e6);
const ONE_DEC18 = new BigNumber(1e18);
const TWO_DEC18 = new BigNumber(2e18);
const ONE_HUNDRED_DEC18 = new BigNumber(100e18);
const ONE_HUNDRED_DEC6 = new BigNumber(100e6);
const Number133_DEC18 = new BigNumber(133e18);
const EIGHT_HUNDRED_DEC18 = new BigNumber(800e18);

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
    let instanceMinerPool;

    beforeEach(async () => {
        wethInstance = await WETH.deployed();
        instanceLizMiner = await LizMiner.deployed()
        instanceLizToken = await LizToken.deployed();
        col_instance_USDC = await FakeCollateral_USDC.deployed(); 

        const getWalletAddress_LIZToken = await instanceLizMiner.getWalletAddress(instanceLizToken.address);
        instanceLpWallet_LIZToken= await LpWallet.at(getWalletAddress_LIZToken);

        const getWalletAddress_WETH = await instanceLizMiner.getWalletAddress(wethInstance.address);
        instanceLpWallet_WETH= await LpWallet.at(getWalletAddress_WETH);

        const getMinerPoolAddress = await instanceLizMiner.getMinerPoolAddress();
        instanceMinerPool = await LizMinePool.at(getMinerPoolAddress);
      });

    it ("helloworld", async() => {
        let acc = await web3.eth.getAccounts();
        let tmp;
        for (var i=0;i<10;i++)
        { 
            // console.log(chalk.yellow(`acc${i}: ${acc[i]}`));
            tmp = acc[i];
        }
    });
    it ("check web3.eth.getBlockNumber()", async() => {
        // console.log(chalk.yellow((new BigNumber(await web3.eth.getBlockNumber())).toNumber()));
        expect((new BigNumber(await web3.eth.getBlockNumber())).toNumber()).to.gt(3000);
    });

    // check getPoolInfo for LIZToken/WETH/USDC
    it ("check getPoolInfo()", async() => {        
        const poolInfo_liztoken = await instanceLizMiner.getPoolInfo(instanceLizToken.address);
        // console.log(chalk.yellow("poolInfo: ",poolInfo));
        expect(poolInfo_liztoken).to.be.ok;

        expect(await instanceLizMiner.getPoolInfo(wethInstance.address)).to.be.ok;
        expect(await instanceLizMiner.getPoolInfo(col_instance_USDC.address)).to.be.ok;
    })

    // check getUserInfo
    it ("[func][getUserInfo]: add test scripts of getUserInfo", async() => {
        await instanceLizMiner.SetUserLevel(account0,0);
        await instanceLizMiner.SetUserLevel(account1,1);
        await instanceLizMiner.SetUserLevel(account2,2);

        expect(await instanceLizMiner.getUserInfo(account0)).to.not.be.empty;
        expect(await instanceLizMiner.getUserInfo(account1)).to.not.be.empty;
        expect(await instanceLizMiner.getUserInfo(account2)).to.not.be.empty;

        // console.log(chalk.yellow(`getUserInfo(account1): ${await instanceLizMiner.getUserInfo(account1)}`));
        // console.log(chalk.yellow((await instanceLizMiner.getUserInfo(account0)).selfhash));

        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).selfhash)).toNumber()).to.equal(0);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).teamhash)).toNumber()).to.equal(0);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).userlevel)).toNumber()).to.equal(1);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).pendingreward)).toNumber()).to.equal(0);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).lastcheckpoint)).toNumber()).to.equal(0);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).lastblock)).toNumber()).to.equal(0);
        
    })

    it ("[func][ChangeWithDrawPoint] add test cases of ChangeWithDrawPoint", async() => {
        // Prepare
        await instanceLizMiner.SetUserLevel(account1,1);
        // Assertion for Before ChangeWithDrawPoint() func
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).selfhash)).toNumber()).to.equal(0);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).teamhash)).toNumber()).to.equal(0);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).userlevel)).toNumber()).to.equal(1);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).pendingreward)).toNumber()).to.equal(0);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).lastcheckpoint)).toNumber()).to.equal(0);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).lastblock)).toNumber()).to.equal(0);
        // Action
        await instanceLizMiner.ChangeWithDrawPoint(account1,lastblock=100,pendingreward=200);
        // Assertion for After ChangeWithDrawPoint() func
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).selfhash)).toNumber()).to.equal(0);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).teamhash)).toNumber()).to.equal(0);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).userlevel)).toNumber()).to.equal(1);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).pendingreward)).toNumber()).to.equal(200);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).lastcheckpoint)).toNumber()).to.equal(0);
        expect((new BigNumber((await instanceLizMiner.getUserInfo(account1)).lastblock)).toNumber()).to.equal(100);
    })

});
import {expect, use} from 'chai';
import {Contract} from 'ethers';
import {deployContract, MockProvider, solidity} from 'ethereum-waffle';
import LIZToken from '../build/contracts/LIZToken.json';
import LizMiner from '../build/contracts/LizMiner.json';
import WETH from '../build/contracts/WETH.json'
import FakeCollateral_USDC from '../build/contracts/FakeCollateral_USDC.json'
import FakeCollateral_USDT from '../build/contracts/FakeCollateral_USDT.json'
import {loadFixture} from 'ethereum-waffle';

import chalk from 'chalk';

use(solidity);
// Constants
const GAS_LIMIT = 3000000;
const LIZ_TRANSFER_AMOUNT = 10000;
const LIZ_TOTAL_SUPPLY = 100000000;
const addressONE = "0x1111111111111111111111111111111111111111";
const ALLOWANCE_AMOUNT = 1000000;

const STARTBLOCK_INITIAL = 40000;
const TOTALHASH_INITIAL = 1;
const TRADINGPOOL_HASHRATE = 1;
const TRADINGPOOL_PCTMIN = 1;
const TRADINGPOOL_PCTMAX = 10000;




describe('LizMiner', () => {
  const [wallet, account1,account2,account3,account4,account5] = new MockProvider().getWallets();
  let FEE_OWNER = account5;
  let instanceLizMiner: Contract;
  let instanceLIZToken: Contract;
  let instanceWETH : Contract;
  let instanceFakeCollateral_USDC: Contract;
  let instanceFakeCollateral_USDT: Contract;

  let instanceLIZToken_fromAccount1;
  let instanceLIZToken_fromAccount2;
  let instanceLizMiner_fromAccount1;
  let instanceLizMiner_fromAccount2;
  let testToken_address:any;

  beforeEach(async () => {
    instanceLizMiner = await deployContract(wallet, LizMiner,[]);
    instanceLIZToken = await deployContract(wallet, LIZToken,[]);
    instanceWETH = await deployContract(wallet,WETH,[wallet.address]);
    instanceFakeCollateral_USDC = await deployContract(wallet,FakeCollateral_USDC,[wallet.address,1000000,"USDC",6]);
    instanceFakeCollateral_USDT = await deployContract(wallet,FakeCollateral_USDT,[wallet.address,1000000,"USDC",6]);
    

    // console.log(chalk.blue("instanceLizMiner.address: ",instanceLizMiner.address));
    // console.log(chalk.blue("instanceLIZToken.address: ",instanceLIZToken.address));
    // console.log(chalk.blue("instanceWETH.address: ",instanceWETH.address));
    // console.log(chalk.blue("instanceFakeCollateral_USDC.address: ",instanceFakeCollateral_USDC.address));
    // console.log(chalk.blue("instanceFakeCollateral_USDT.address: ",instanceFakeCollateral_USDT.address));
    
    // console.log(chalk.blue("wallet.address: ",wallet.address));
    // console.log(chalk.blue("account1.address: ",account1.address));
    // console.log(chalk.blue("account2.address: ",account2.address));
    // console.log(chalk.blue("account3.address: ",account3.address));
    // console.log(chalk.blue("account4.address: ",account4.address));

    // console.log(chalk.redBright.bold("========= initial contract ========="));
    await instanceLizMiner.InitalContract(instanceLIZToken.address,instanceWETH.address,instanceWETH.address,instanceWETH.address,instanceWETH.address,FEE_OWNER.address);
  });


    async function buildConnWalletToAccount1ToAccount2() {
        // Set Parent
        await instanceLizMiner.SetParentByAdmin(account1.address,wallet.address);
        await instanceLizMiner.SetParentByAdmin(account2.address,account1.address);
        // transfer LIZ_TRANSFER_AMOUNT to account1
        await expect(instanceLIZToken.transfer(account1.address, LIZ_TRANSFER_AMOUNT))
        .to.emit(instanceLIZToken, 'Transfer')
        .withArgs(wallet.address, account1.address, LIZ_TRANSFER_AMOUNT);
        // transfer LIZ_TRANSFER_AMOUNT to account2
        await expect(instanceLIZToken.transfer(account2.address, LIZ_TRANSFER_AMOUNT))
        .to.emit(instanceLIZToken, 'Transfer')
        .withArgs(wallet.address, account2.address, LIZ_TRANSFER_AMOUNT);

        // account1 buyVIP(7)
        instanceLIZToken_fromAccount1 = instanceLIZToken.connect(account1);
        await Promise.all([
            instanceLIZToken_fromAccount1.approve(instanceLizMiner.address, ALLOWANCE_AMOUNT)
        ]);	
        instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
        await instanceLizMiner_fromAccount1.buyVip(7,{gasLimit:GAS_LIMIT});

        // account2 buyVIP(1)
        instanceLIZToken_fromAccount2 = instanceLIZToken.connect(account2);
        await Promise.all([
            instanceLIZToken_fromAccount2.approve(instanceLizMiner.address, 1000000)
        ]);	
        instanceLizMiner_fromAccount2 = instanceLizMiner.connect(account2);
        await instanceLizMiner_fromAccount2.buyVip(1,{gasLimit:GAS_LIMIT});
    };

    async function addTradingPool() {
        const addTradingPool_address = instanceWETH.address;
        await instanceLizMiner.addTradingPool(addTradingPool_address,addTradingPool_address,TRADINGPOOL_HASHRATE,TRADINGPOOL_PCTMIN,TRADINGPOOL_PCTMAX);
    };

    it('getOwner()', async () => {
        await loadFixture(buildConnWalletToAccount1ToAccount2);
        
        expect(await instanceLizMiner.getOwner()).to.equal(wallet.address);
    });

    it('test for addTradingPool()', async() => {
        const testToken_address = instanceWETH.address;
        await instanceLizMiner.addTradingPool(testToken_address,testToken_address,1,1,10000);

        const getPoolTotal = await instanceLizMiner.getPoolTotal(testToken_address);
        // check getPoolTotal default value is 0;
        expect(getPoolTotal).to.equal(0);

    });

    it('test for _lpPools', async() => {
        const testToken_address = instanceWETH.address;
        await instanceLizMiner.addTradingPool(testToken_address,testToken_address,TRADINGPOOL_HASHRATE,TRADINGPOOL_PCTMIN,TRADINGPOOL_PCTMAX);

        const PoolInfo = await instanceLizMiner._lpPools(testToken_address);
        // console.log(chalk.yellow("testToken_address = WETH & address is : ",testToken_address))
        // console.log(chalk.yellow("PoolInfo: ",PoolInfo));
        // console.log(chalk.yellow("PoolInfo.minpct",PoolInfo.minpct))
        expect(PoolInfo.hashrate).to.equal(TRADINGPOOL_HASHRATE);
        expect(PoolInfo.tradeContract).to.equal(testToken_address);
        expect(PoolInfo.totaljthash).to.equal(0);
        expect(PoolInfo.minpct).to.equal(TRADINGPOOL_PCTMIN);
        expect(PoolInfo.maxpct).to.equal(TRADINGPOOL_PCTMAX);

    });

    it ('test for getWalletAddress()', async() => {
        await loadFixture(addTradingPool);
        
        testToken_address = instanceWETH.address;
        const getWalletAddress = await instanceLizMiner.getWalletAddress(testToken_address);
        // console.log(chalk.yellow("getWalletAddress: ",getWalletAddress));
        // const tmp = await instanceLizMiner._lpPools(testToken_address);
        // console.log(chalk.yellow(tmp.poolwallet));
    });

    it ('test for fixTradingPool()', async() => {
        const addTradingPool_address = instanceWETH.address;
        await instanceLizMiner.addTradingPool(addTradingPool_address,addTradingPool_address,TRADINGPOOL_HASHRATE,TRADINGPOOL_PCTMIN,TRADINGPOOL_PCTMAX);

        testToken_address = instanceWETH.address;
        const PoolInfo = await instanceLizMiner._lpPools(testToken_address);
        // console.log(chalk.yellow("PoolInfo: ",PoolInfo));
        expect(PoolInfo.hashrate).to.equal(TRADINGPOOL_HASHRATE);
        expect(PoolInfo.tradeContract).to.equal(testToken_address);
        expect(PoolInfo.minpct).to.equal(TRADINGPOOL_PCTMIN);
        expect(PoolInfo.maxpct).to.equal(TRADINGPOOL_PCTMAX);

        const hashrate_modified = 2;
        const tradecontract_modified = instanceFakeCollateral_USDC.address;
        const pctmin_modified = 5;
        const pctmax_modified = 5000;
        await instanceLizMiner.fixTradingPool(testToken_address,tradecontract_modified,hashrate_modified,pctmin_modified,pctmax_modified);

        const PoolInfo_modified = await instanceLizMiner._lpPools(testToken_address);
        // console.log(chalk.yellow("PoolInfo_modified: ",PoolInfo_modified));
        expect(PoolInfo_modified.hashrate).to.equal(hashrate_modified);
        expect(PoolInfo_modified.tradeContract).to.equal(tradecontract_modified);
        expect(PoolInfo_modified.minpct).to.equal(pctmin_modified);
        expect(PoolInfo_modified.maxpct).to.equal(pctmax_modified);
    });


});
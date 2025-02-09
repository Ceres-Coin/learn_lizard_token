import {expect, use} from 'chai';
import {Contract} from 'ethers';
import {deployContract, MockProvider, solidity} from 'ethereum-waffle';
import LIZToken from '../build/contracts/LIZToken.json';
import LizMiner from '../build/contracts/LizMiner.json';
import WETH from '../build/contracts/WETH.json'
import FakeCollateral_USDC from '../build/contracts/FakeCollateral_USDC.json'
import FakeCollateral_USDT from '../build/contracts/FakeCollateral_USDT.json'

import chalk from 'chalk';

use(solidity);
// Constants
const GAS_LIMIT = 3000000;
const LIZ_TRANSFER_AMOUNT = 100000;
const LIZ_TOTAL_SUPPLY = 100000000;
const addressONE = "0x1111111111111111111111111111111111111111";

describe('LizMiner', () => {
  const [wallet, account1,account2,account3,account4,account5] = new MockProvider().getWallets();
  let FEE_OWNER = account5;
  let instanceLizMiner: Contract;
  let instanceLIZToken: Contract;
  let instanceWETH : Contract;
  let instanceFakeCollateral_USDC: Contract;
  let instanceFakeCollateral_USDT: Contract;

  beforeEach(async () => {
    instanceLizMiner = await deployContract(wallet, LizMiner,[]);
    instanceLIZToken = await deployContract(wallet, LIZToken,[]);
    instanceWETH = await deployContract(wallet,WETH,[wallet.address]);
    instanceFakeCollateral_USDC = await deployContract(wallet,FakeCollateral_USDC,[wallet.address,1000000,"USDC",6]);
    instanceFakeCollateral_USDT = await deployContract(wallet,FakeCollateral_USDT,[wallet.address,1000000,"USDC",6]);
    
    await Promise.all([
      instanceLIZToken.approve(instanceLizMiner.address, 1000000)
    ]);	

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

    it('getOwner()', async () => {
        expect(await instanceLizMiner.getOwner()).to.equal(wallet.address);
    });

    // bind account1's parent is wallet;
    it('bindParent()', async () => {
        // console.log(chalk.red.bold("bind account1's parent = wallet "));
        const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
        await instanceLizMiner_fromAccount1.bindParent(wallet.address,{gasLimit:GAS_LIMIT});
        expect(await instanceLizMiner._parents(account1.address)).to.equal(wallet.address);
    });

    // bind account1 & account2's parent is wallet;
    it('bindParent_P2()', async () => {
        const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
        await instanceLizMiner_fromAccount1.bindParent(wallet.address,{gasLimit:GAS_LIMIT});

        const instanceLizMiner_fromAccount2 = instanceLizMiner.connect(account2);
        await instanceLizMiner_fromAccount2.bindParent(wallet.address,{gasLimit:GAS_LIMIT});

        expect(await instanceLizMiner._parents(account1.address)).to.equal(wallet.address);
        expect(await instanceLizMiner._parents(account2.address)).to.equal(wallet.address);
    });

    // getParent()
    it('getParent()', async () => {
        const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
        await instanceLizMiner_fromAccount1.bindParent(wallet.address,{gasLimit:GAS_LIMIT});
        expect(await instanceLizMiner.getParent(account1.address)).to.equal(wallet.address);
    });

    // getParent_P2
    it('getParent_P2()', async () => {
        const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
        await instanceLizMiner_fromAccount1.bindParent(wallet.address,{gasLimit:GAS_LIMIT});

        const instanceLizMiner_fromAccount2 = instanceLizMiner.connect(account2);
        await instanceLizMiner_fromAccount2.bindParent(wallet.address,{gasLimit:GAS_LIMIT});

        expect(await instanceLizMiner.getParent(account1.address)).to.equal(wallet.address);
        expect(await instanceLizMiner.getParent(account2.address)).to.equal(wallet.address);
    });

    // getTotalHash()
    // Check Default TotalHash = 0
    it('getTotalHash()', async () => {
        expect(await instanceLizMiner.getTotalHash()).to.equal(0);
    });

    // CurrentBlockReward()
    // Check Default CurrentBlockReward = 0
    it('CurrentBlockReward()', async () => {
        expect(await instanceLizMiner.CurrentBlockReward()).to.equal(0);
    });

    // getUserLevel(wallet)
    // getUserLevel(account1)
    // getUserLevel(account2)
    it('check getUserLevel(wallet/account1/account2)', async () => {
        const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
        await instanceLizMiner_fromAccount1.bindParent(wallet.address,{gasLimit:GAS_LIMIT});

        const instanceLizMiner_fromAccount2 = instanceLizMiner.connect(account2);
        await instanceLizMiner_fromAccount2.bindParent(wallet.address,{gasLimit:GAS_LIMIT});

        expect(await instanceLizMiner.getUserLevel(wallet.address)).to.equal(0);
        expect(await instanceLizMiner.getUserLevel(account1.address)).to.equal(0);
        expect(await instanceLizMiner.getUserLevel(account2.address)).to.equal(0);

        // const level_wallet = await instanceLizMiner.getUserLevel(wallet.address);
        // console.log(chalk.yellow("level_wallet: ",level_wallet));
        // const level_account1 = await instanceLizMiner.getUserLevel(account1.address);
        // console.log(chalk.yellow("level_account1: ",level_account1));
        // const level_account2 = await instanceLizMiner.getUserLevel(account2.address);
        // console.log(chalk.yellow("level_account2: ",level_account2));
    });


    // check getUserTeamHash() default = 0;
    it('check getUserTeamHash(wallet/account1/account2)', async () => {
        const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
        await instanceLizMiner_fromAccount1.bindParent(wallet.address,{gasLimit:GAS_LIMIT});

        const instanceLizMiner_fromAccount2 = instanceLizMiner.connect(account2);
        await instanceLizMiner_fromAccount2.bindParent(wallet.address,{gasLimit:GAS_LIMIT});

        expect(await instanceLizMiner.getUserTeamHash(wallet.address)).to.equal(0);
        expect(await instanceLizMiner.getUserTeamHash(account1.address)).to.equal(0);
        expect(await instanceLizMiner.getUserTeamHash(account2.address)).to.equal(0);

        // const getUserTeamHash_wallet = await instanceLizMiner.getUserTeamHash(wallet.address);
        // console.log(chalk.yellow("getUserTeamHash_wallet: ",getUserTeamHash_wallet));
        // const getUserTeamHash_account1 = await instanceLizMiner.getUserTeamHash(account1.address);
        // console.log(chalk.yellow("getUserTeamHash_account1: ",getUserTeamHash_account1));
        // const getUserTeamHash_account2 = await instanceLizMiner.getUserTeamHash(account2.address);
        // console.log(chalk.yellow("getUserTeamHash_account2: ",getUserTeamHash_account2));
    });

    // check getUserSelfHash() default = 0;
    it('check getUserSelfHash(wallet/account1/account2) defult = 0', async () => {
        const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
        await instanceLizMiner_fromAccount1.bindParent(wallet.address,{gasLimit:GAS_LIMIT});

        const instanceLizMiner_fromAccount2 = instanceLizMiner.connect(account2);
        await instanceLizMiner_fromAccount2.bindParent(wallet.address,{gasLimit:GAS_LIMIT});

        expect(await instanceLizMiner.getUserSelfHash(wallet.address)).to.equal(0);
        expect(await instanceLizMiner.getUserSelfHash(account1.address)).to.equal(0);
        expect(await instanceLizMiner.getUserSelfHash(account2.address)).to.equal(0);

        // const getUserSelfHash_wallet = await instanceLizMiner.getUserSelfHash(wallet.address);
        // console.log(chalk.yellow("getUserSelfHash_wallet: ",getUserSelfHash_wallet));
        // const getUserSelfHash_account1 = await instanceLizMiner.getUserSelfHash(account1.address);
        // console.log(chalk.yellow("getUserSelfHash_account1: ",getUserSelfHash_account1));
        // const getUserSelfHash_account2 = await instanceLizMiner.getUserSelfHash(account2.address);
        // console.log(chalk.yellow("getUserSelfHash_account2: ",getUserSelfHash_account2));
    });

    // getFeeOnwer()
    // Check Default getFeeOnwer = account5
    it('check getFeeOnwer() default is account5', async () => {
        expect(await instanceLizMiner.getFeeOnwer()).to.equal(account5.address);
    });

    // getExchangeCountOfOneUsdt()
    it('check getExchangeCountOfOneUsdt() for lizToken', async () => {
        const getExchangeCountOfOneUsdt_LIZToken = await instanceLizMiner.getExchangeCountOfOneUsdt(instanceLIZToken.address);
        expect(getExchangeCountOfOneUsdt_LIZToken).to.equal(1);
    });

    // check SetUserLevel() func
    it('check SetUserLevel(account1 = 1) & (account2 = 2)', async () => {
        await instanceLizMiner.SetUserLevel(account1.address,1);
        await instanceLizMiner.SetUserLevel(account2.address,2);

        expect(await instanceLizMiner.getUserLevel(wallet.address)).to.equal(0);
        expect(await instanceLizMiner.getUserLevel(account1.address)).to.equal(1);
        expect(await instanceLizMiner.getUserLevel(account2.address)).to.equal(2);
    });

    // check buyVipPrice(account1,1) func
    it('check buyVipPrice(account1,1)', async () => {
        const buyVipPrice_account1_vip1 = await instanceLizMiner.buyVipPrice(account1.address,1,{gasLimit:GAS_LIMIT});
        expect(buyVipPrice_account1_vip1).to.equal(100);

    });

    // check buyVipPrice(2) func
    it('check buyVipPrice(2) = 300', async () => {
        expect(await instanceLizMiner.buyVipPrice(account1.address,2,{gasLimit:GAS_LIMIT})).to.equal(300);
    });

    // check buyVipPrice(3) func
    it('check buyVipPrice(3) = 500', async () => {
        expect(await instanceLizMiner.buyVipPrice(account1.address,3,{gasLimit:GAS_LIMIT})).to.equal(500);
    });

    // check buyVipPrice(4) func
    it('check buyVipPrice(4) = 800', async () => {
        expect(await instanceLizMiner.buyVipPrice(account1.address,4,{gasLimit:GAS_LIMIT})).to.equal(800);
    });

    // check buyVipPrice(5) func
    it('check buyVipPrice(5) = 1200', async () => {
        expect(await instanceLizMiner.buyVipPrice(account1.address,5,{gasLimit:GAS_LIMIT})).to.equal(1200);
    });

    // check buyVipPrice(6) func
    it('check buyVipPrice(6) = 1600', async () => {
        expect(await instanceLizMiner.buyVipPrice(account1.address,6,{gasLimit:GAS_LIMIT})).to.equal(1600);
    });

    // check buyVipPrice(7) func
    it('check buyVipPrice(7) = 2000', async () => {
        expect(await instanceLizMiner.buyVipPrice(account1.address,7,{gasLimit:GAS_LIMIT})).to.equal(2000);
    });

    // check buyVipPrice(8) func
    it('check buyVipPrice(8) = 0', async () => {
        expect(await instanceLizMiner.buyVipPrice(account1.address,8,{gasLimit:GAS_LIMIT})).to.equal(0);
        expect(await instanceLizMiner.buyVipPrice(account1.address,9,{gasLimit:GAS_LIMIT})).to.equal(0);
        expect(await instanceLizMiner.buyVipPrice(account1.address,10,{gasLimit:GAS_LIMIT})).to.equal(0);
    });

    // check buyVip(1) func
    it('check buyVip(1) = 100', async () => {

        await expect(instanceLIZToken.transfer(account1.address, LIZ_TRANSFER_AMOUNT))
        .to.emit(instanceLIZToken, 'Transfer')
        .withArgs(wallet.address, account1.address, LIZ_TRANSFER_AMOUNT);

        expect(await instanceLIZToken.balanceOf(account1.address)).to.equal(LIZ_TRANSFER_AMOUNT);

        const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
        const instanceLIZToken_fromAccount1 = instanceLIZToken.connect(account1);

        await Promise.all([
          instanceLIZToken_fromAccount1.approve(instanceLizMiner.address, 1000000)
        ]);	
        await instanceLizMiner_fromAccount1.bindParent(wallet.address,{gasLimit:GAS_LIMIT});
        await instanceLizMiner_fromAccount1.buyVip(1,{gasLimit:GAS_LIMIT});
        expect(await instanceLIZToken.balanceOf(account1.address)).to.equal(LIZ_TRANSFER_AMOUNT-100);  
        expect(await instanceLIZToken.totalSupply()).to.equal(LIZ_TOTAL_SUPPLY-100);  
    });

    // check buyVip(2) func
    it('check buyVip(2) = 300', async () => {
      // Prepare-transfer
      await expect(instanceLIZToken.transfer(account1.address, LIZ_TRANSFER_AMOUNT))
      .to.emit(instanceLIZToken, 'Transfer')
      .withArgs(wallet.address, account1.address, LIZ_TRANSFER_AMOUNT);
      // Prepare-approve lizToken
      const instanceLIZToken_fromAccount1 = instanceLIZToken.connect(account1);
      await Promise.all([
        instanceLIZToken_fromAccount1.approve(instanceLizMiner.address, 1000000)
      ]);	
      // BindParent & BuyVIP
      const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
      await instanceLizMiner_fromAccount1.bindParent(wallet.address,{gasLimit:GAS_LIMIT});
      await instanceLizMiner_fromAccount1.buyVip(2,{gasLimit:GAS_LIMIT});
      // Assertion
      expect(await instanceLIZToken.balanceOf(account1.address)).to.equal(LIZ_TRANSFER_AMOUNT-300); 
      expect(await instanceLIZToken.totalSupply()).to.equal(LIZ_TOTAL_SUPPLY-300);   
    });

    // check buyVip(3) = 500 func
    it('check buyVip(3) = 500', async () => {
        // Prepare-transfer
        await expect(instanceLIZToken.transfer(account1.address, LIZ_TRANSFER_AMOUNT))
        .to.emit(instanceLIZToken, 'Transfer')
        .withArgs(wallet.address, account1.address, LIZ_TRANSFER_AMOUNT);
        // Prepare-approve lizToken
        const instanceLIZToken_fromAccount1 = instanceLIZToken.connect(account1);
        await Promise.all([
          instanceLIZToken_fromAccount1.approve(instanceLizMiner.address, 1000000)
        ]);	
        // BindParent & BuyVIP
        const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
        await instanceLizMiner_fromAccount1.bindParent(wallet.address,{gasLimit:GAS_LIMIT});
        await instanceLizMiner_fromAccount1.buyVip(3,{gasLimit:GAS_LIMIT});
        // Assertion
        expect(await instanceLIZToken.balanceOf(account1.address)).to.equal(LIZ_TRANSFER_AMOUNT-500); 
        expect(await instanceLIZToken.totalSupply()).to.equal(LIZ_TOTAL_SUPPLY-500);   
    });

    // check buyVip(2) then buyVIP(3) = 500 func
    it('check buyVip(2) then buyVIP(3) = 500', async () => {
      // Prepare-transfer
      await expect(instanceLIZToken.transfer(account1.address, LIZ_TRANSFER_AMOUNT))
      .to.emit(instanceLIZToken, 'Transfer')
      .withArgs(wallet.address, account1.address, LIZ_TRANSFER_AMOUNT);
      // Prepare-approve lizToken
      const instanceLIZToken_fromAccount1 = instanceLIZToken.connect(account1);
      await Promise.all([
        instanceLIZToken_fromAccount1.approve(instanceLizMiner.address, 1000000)
      ]);	
      // BindParent & BuyVIP(2)
      const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
      await instanceLizMiner_fromAccount1.bindParent(wallet.address,{gasLimit:GAS_LIMIT});
      await instanceLizMiner_fromAccount1.buyVip(2,{gasLimit:GAS_LIMIT});
      // Assertion
      expect(await instanceLIZToken.balanceOf(account1.address)).to.equal(LIZ_TRANSFER_AMOUNT-300); 
      expect(await instanceLIZToken.totalSupply()).to.equal(LIZ_TOTAL_SUPPLY-300);   
      // BuyVIP(3)
      await instanceLizMiner_fromAccount1.buyVip(3,{gasLimit:GAS_LIMIT});
      // Assertion
      expect(await instanceLIZToken.balanceOf(account1.address)).to.equal(LIZ_TRANSFER_AMOUNT-500); 
      expect(await instanceLIZToken.totalSupply()).to.equal(LIZ_TOTAL_SUPPLY-500);   
      
  });

    // check getBalanceIBEP20_wallet func
    it('check getBalanceIBEP20_wallet', async () => {
        const getBalanceIBEP20 = await instanceLizMiner.getBalanceIBEP20();
        // console.log(chalk.blue("getBalanceIBEP20: ",getBalanceIBEP20));
        expect(getBalanceIBEP20).to.equal(LIZ_TOTAL_SUPPLY);
    });

    // check getBalanceIBEP20_account1 func
    it('check getBalanceIBEP20_account1', async () => {
        await instanceLIZToken.transfer(account1.address, LIZ_TRANSFER_AMOUNT);

        const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
        const getBalanceIBEP20 = await instanceLizMiner_fromAccount1.getBalanceIBEP20();
        // console.log(chalk.blue("getBalanceIBEP20: ",getBalanceIBEP20));
        expect(getBalanceIBEP20).to.equal(LIZ_TRANSFER_AMOUNT);
    });


    
});
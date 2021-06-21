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
  }

    // it('getOwner()', async () => {
    //     expect(await instanceLizMiner.getOwner()).to.equal(wallet.address);
    // });

    // it('SetParentByAdmin()', async () => {
    //     await instanceLizMiner.SetParentByAdmin(account1.address,wallet.address);
    //     await instanceLizMiner.SetParentByAdmin(account2.address,account1.address);

    //     expect(await instanceLizMiner.getParent(account1.address)).to.equal(wallet.address);
    //     expect(await instanceLizMiner.getParent(account2.address)).to.equal(account1.address);
    // });

    // it('wallet-->account1-->account2, account1 buyVIP7 + account2 buyVIP1', async () => {
    //     // Set Parent
    //     await instanceLizMiner.SetParentByAdmin(account1.address,wallet.address);
    //     await instanceLizMiner.SetParentByAdmin(account2.address,account1.address);

    //     expect(await instanceLizMiner.getParent(account1.address)).to.equal(wallet.address);
    //     expect(await instanceLizMiner.getParent(account2.address)).to.equal(account1.address);

    //     // transfer LIZ_TRANSFER_AMOUNT to account1
    //     await expect(instanceLIZToken.transfer(account1.address, LIZ_TRANSFER_AMOUNT))
    //     .to.emit(instanceLIZToken, 'Transfer')
    //     .withArgs(wallet.address, account1.address, LIZ_TRANSFER_AMOUNT);
    //     // transfer LIZ_TRANSFER_AMOUNT to account2
    //     await expect(instanceLIZToken.transfer(account2.address, LIZ_TRANSFER_AMOUNT))
    //     .to.emit(instanceLIZToken, 'Transfer')
    //     .withArgs(wallet.address, account2.address, LIZ_TRANSFER_AMOUNT);

    //     // account1 buyVIP(7)
                

    //             // Prepare-approve lizToken
    //             const instanceLIZToken_fromAccount1 = instanceLIZToken.connect(account1);
    //             await Promise.all([
    //                 instanceLIZToken_fromAccount1.approve(instanceLizMiner.address, ALLOWANCE_AMOUNT)
    //             ]);	
    //             const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
    //             await instanceLizMiner_fromAccount1.buyVip(7,{gasLimit:GAS_LIMIT});

    //             console.log(chalk.yellow(await instanceLIZToken.balanceOf(wallet.address)));
    //             console.log(chalk.yellow(await instanceLIZToken.balanceOf(account1.address)));
    //             console.log(chalk.yellow(await instanceLIZToken.balanceOf(account2.address)));

    //     // account2 buyVIP(2)

    //     // Prepare-approve lizToken
    //     const instanceLIZToken_fromAccount2 = instanceLIZToken.connect(account2);
    //     await Promise.all([
    //         instanceLIZToken_fromAccount2.approve(instanceLizMiner.address, 1000000)
    //     ]);	
    //     const instanceLizMiner_fromAccount2 = instanceLizMiner.connect(account2);
    //     await instanceLizMiner_fromAccount2.buyVip(1,{gasLimit:GAS_LIMIT});

    //     console.log(chalk.red.bold("================= P2 ==============="))
    //     console.log(chalk.yellow(await instanceLIZToken.balanceOf(wallet.address)));
    //     console.log(chalk.yellow(await instanceLIZToken.balanceOf(account1.address)));
    //     console.log(chalk.yellow(await instanceLIZToken.balanceOf(account2.address)));

    //     console.log(chalk.red.bold("================= getPendingCoin ==============="))
    //     console.log(chalk.yellow(await instanceLizMiner.getPendingCoin(wallet.address)));
    //     console.log(chalk.yellow(await instanceLizMiner.getPendingCoin(account1.address)));
    //     console.log(chalk.yellow(await instanceLizMiner.getPendingCoin(account2.address)));

    //     // GetTotalHash
    //     console.log(chalk.red.bold("================= GetTotalHash ==============="))
    //     console.log(chalk.yellow(await instanceLizMiner.getTotalHash()));

    //     console.log(chalk.red.bold("================= WithDrawCredit ==============="))
    //     await instanceLizMiner_fromAccount1.WithDrawCredit({gasLimit:GAS_LIMIT});
    //     await instanceLizMiner_fromAccount2.WithDrawCredit({gasLimit:GAS_LIMIT});
    //     console.log(chalk.yellow("Print balanceOf AFTER WithDrawCredit"));
    //     console.log(chalk.yellow(await instanceLIZToken.balanceOf(wallet.address)));
    //     console.log(chalk.yellow(await instanceLIZToken.balanceOf(account1.address)));
    //     console.log(chalk.yellow(await instanceLIZToken.balanceOf(account2.address)));

        
    //     console.log(chalk.red.bold("================= getTotalHash ==============="));
    //     console.log(chalk.yellow(await instanceLizMiner.getTotalHash()));


    // });

    // it('getMinerPoolAddress()', async () => {
    //     expect(await instanceLizMiner.getMinerPoolAddress()).to.equal(await instanceLizMiner.getParent(wallet.address));
    // });

    // it('wallet-->account1-->account2, test for getMyChilders()', async () => {
        
    //     await instanceLizMiner.SetParentByAdmin(account1.address,wallet.address);
    //     await instanceLizMiner.SetParentByAdmin(account2.address,account1.address);

    //     const wallet_childer = (await instanceLizMiner.getMyChilders(wallet.address))[0];
    //     expect(wallet_childer).to.equal(account1.address);

    //     const account1_childer = (await instanceLizMiner.getMyChilders(account1.address))[0];
    //     expect(account1_childer).to.equal(account2.address);
    // });

    // it('check getTotalHash() default is 0', async () => {
    //     expect(await instanceLizMiner.getTotalHash()).to.equal(0);
    // });

    // it('wallet-->account1-->account2, getUserTeamHash()', async () => {
    //     // Set Parent
    //     await instanceLizMiner.SetParentByAdmin(account1.address,wallet.address);
    //     await instanceLizMiner.SetParentByAdmin(account2.address,account1.address);

    //     expect(await instanceLizMiner.getParent(account1.address)).to.equal(wallet.address);
    //     expect(await instanceLizMiner.getParent(account2.address)).to.equal(account1.address);

    //     // transfer LIZ_TRANSFER_AMOUNT to account1
    //     await expect(instanceLIZToken.transfer(account1.address, LIZ_TRANSFER_AMOUNT))
    //     .to.emit(instanceLIZToken, 'Transfer')
    //     .withArgs(wallet.address, account1.address, LIZ_TRANSFER_AMOUNT);
    //     // transfer LIZ_TRANSFER_AMOUNT to account2
    //     await expect(instanceLIZToken.transfer(account2.address, LIZ_TRANSFER_AMOUNT))
    //     .to.emit(instanceLIZToken, 'Transfer')
    //     .withArgs(wallet.address, account2.address, LIZ_TRANSFER_AMOUNT);

    //     // account1 buyVIP(7)
                

    //             // Prepare-approve lizToken
    //             const instanceLIZToken_fromAccount1 = instanceLIZToken.connect(account1);
    //             await Promise.all([
    //                 instanceLIZToken_fromAccount1.approve(instanceLizMiner.address, ALLOWANCE_AMOUNT)
    //             ]);	
    //             const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
    //             await instanceLizMiner_fromAccount1.buyVip(7,{gasLimit:GAS_LIMIT});

    //     // account2 buyVIP(2)

    //     // Prepare-approve lizToken
    //     const instanceLIZToken_fromAccount2 = instanceLIZToken.connect(account2);
    //     await Promise.all([
    //         instanceLIZToken_fromAccount2.approve(instanceLizMiner.address, 1000000)
    //     ]);	
    //     const instanceLizMiner_fromAccount2 = instanceLizMiner.connect(account2);
    //     await instanceLizMiner_fromAccount2.buyVip(1,{gasLimit:GAS_LIMIT});

    //     console.log(chalk.red.bold("================= getTotalHash & getUserTeamHash ==============="))
    //     console.log(chalk.yellow("getTotalHash: ",await instanceLizMiner.getTotalHash()));
    //     console.log(chalk.yellow("getUserTeamHash(wallet.address)",await instanceLizMiner.getUserTeamHash(wallet.address)));
    //     console.log(chalk.yellow("getUserTeamHash(account1.address)",await instanceLizMiner.getUserTeamHash(account1.address)));
    //     console.log(chalk.yellow("getUserTeamHash(account2.address)",await instanceLizMiner.getUserTeamHash(account2.address)));

    //     expect(await instanceLizMiner.getTotalHash()).to.equal(0);
    //     expect(await instanceLizMiner.getUserTeamHash(wallet.address)).to.equal(0);
    //     expect(await instanceLizMiner.getUserTeamHash(account1.address)).to.equal(0);
    //     expect(await instanceLizMiner.getUserTeamHash(account2.address)).to.equal(0);

    //     console.log(chalk.red.bold("================= getUserSelfHash ==============="));
    //     console.log(chalk.yellow("getUserSelfHash(wallet.address)",await instanceLizMiner.getUserSelfHash(wallet.address)));
    //     console.log(chalk.yellow("getUserSelfHash(account1.address)",await instanceLizMiner.getUserSelfHash(account1.address)));
    //     console.log(chalk.yellow("getUserSelfHash(account2.address)",await instanceLizMiner.getUserSelfHash(account2.address)));
    //     expect(await instanceLizMiner.getUserSelfHash(wallet.address)).to.equal(0);
    //     expect(await instanceLizMiner.getUserSelfHash(account1.address)).to.equal(0);
    //     expect(await instanceLizMiner.getUserSelfHash(account2.address)).to.equal(0);


    // });

    // it('wallet-->account1-->account2, setUserLevel() & getUserLevel()', async () => {
    //     // Set Parent
    //     await instanceLizMiner.SetParentByAdmin(account1.address,wallet.address);
    //     await instanceLizMiner.SetParentByAdmin(account2.address,account1.address);

    //     expect(await instanceLizMiner.getParent(account1.address)).to.equal(wallet.address);
    //     expect(await instanceLizMiner.getParent(account2.address)).to.equal(account1.address);

    //     // transfer LIZ_TRANSFER_AMOUNT to account1
    //     await expect(instanceLIZToken.transfer(account1.address, LIZ_TRANSFER_AMOUNT))
    //     .to.emit(instanceLIZToken, 'Transfer')
    //     .withArgs(wallet.address, account1.address, LIZ_TRANSFER_AMOUNT);
    //     // transfer LIZ_TRANSFER_AMOUNT to account2
    //     await expect(instanceLIZToken.transfer(account2.address, LIZ_TRANSFER_AMOUNT))
    //     .to.emit(instanceLIZToken, 'Transfer')
    //     .withArgs(wallet.address, account2.address, LIZ_TRANSFER_AMOUNT);

    //     // account1 buyVIP(7)
    //     const instanceLIZToken_fromAccount1 = instanceLIZToken.connect(account1);
    //     await Promise.all([
    //         instanceLIZToken_fromAccount1.approve(instanceLizMiner.address, ALLOWANCE_AMOUNT)
    //     ]);	
    //     const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
    //     await instanceLizMiner_fromAccount1.buyVip(7,{gasLimit:GAS_LIMIT});

    //     // account2 buyVIP(1)
    //     const instanceLIZToken_fromAccount2 = instanceLIZToken.connect(account2);
    //     await Promise.all([
    //         instanceLIZToken_fromAccount2.approve(instanceLizMiner.address, 1000000)
    //     ]);	
    //     const instanceLizMiner_fromAccount2 = instanceLizMiner.connect(account2);
    //     await instanceLizMiner_fromAccount2.buyVip(1,{gasLimit:GAS_LIMIT});

    //     expect(await instanceLizMiner.getUserLevel(account1.address)).to.equal(7);
    //     expect(await instanceLizMiner.getUserLevel(account2.address)).to.equal(1);

    //     // set account1 = 6; set account2 = 2;
    //     await instanceLizMiner.SetUserLevel(account1.address,6);
    //     await instanceLizMiner.SetUserLevel(account2.address,2);

    //     expect(await instanceLizMiner.getUserLevel(account1.address)).to.equal(6);
    //     expect(await instanceLizMiner.getUserLevel(account2.address)).to.equal(2);
    // });


    // it('wallet-->account1-->account2, test for fixture & setUserLevel & getUserLevel)', async () => {
    //     await loadFixture(buildConnWalletToAccount1ToAccount2);
    //     expect(await instanceLizMiner.getUserLevel(account1.address)).to.equal(7);
    //     expect(await instanceLizMiner.getUserLevel(account2.address)).to.equal(1);

    //     // set account1 = 5; set account2 = 3;
    //     await instanceLizMiner.SetUserLevel(account1.address,5);
    //     await instanceLizMiner.SetUserLevel(account2.address,3);

    //     expect(await instanceLizMiner.getUserLevel(account1.address)).to.equal(5);
    //     expect(await instanceLizMiner.getUserLevel(account2.address)).to.equal(3);
    // });

    // it('test for userInfo', async() => {
    //     await loadFixture(buildConnWalletToAccount1ToAccount2);
        
    //     const userInfo = await instanceLizMiner._userInfos(account1.address);
    //     console.log(chalk.yellow("userInfo.selfhash: ",userInfo.selfhash));
    //     console.log(chalk.yellow("userInfo.teamhash: ",userInfo.teamhash));
    //     console.log(chalk.yellow("userInfo.userlevel: ",userInfo.userlevel));
    //     console.log(chalk.yellow("userInfo.pendingreward: ",userInfo.pendingreward));
    //     console.log(chalk.yellow("userInfo.lastcheckpoint: ",userInfo.lastcheckpoint));
    //     console.log(chalk.yellow("userInfo.lastblock: ",userInfo.lastblock));

    //     console.log(chalk.yellow("UserInfo: ",userInfo));
    // });

    // it ('test for _checkpoints[]', async() => {
    //     await loadFixture(buildConnWalletToAccount1ToAccount2);
    //     const checkPoint_0 = (await instanceLizMiner._checkpoints(0));
    //     expect(checkPoint_0.startblock).to.equal(STARTBLOCK_INITIAL);
    //     expect(checkPoint_0.totalhash).to.equal(TOTALHASH_INITIAL);
    // });

    it ('handle Array in Solidity in Waffle', async() => {
        await loadFixture(buildConnWalletToAccount1ToAccount2);

        
        const checkPoint_0 = await instanceLizMiner._checkpoints(0);
        // const checkPoint_1 = await instanceLizMiner._checkpoints(1);
        // const checkPoint_2 = await instanceLizMiner._checkpoints(2);
        console.log(chalk.yellow(checkPoint_0));
        // console.log(chalk.yellow(checkPoint_1));
        // console.log(chalk.yellow(checkPoint_2));

    });

    
    



    
});
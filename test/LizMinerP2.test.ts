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
const LIZ_TRANSFER_AMOUNT = 10000;
const LIZ_TOTAL_SUPPLY = 100000000;
const addressONE = "0x1111111111111111111111111111111111111111";
const ALLOWANCE_AMOUNT = 1000000;

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

    it('SetParentByAdmin()', async () => {
        await instanceLizMiner.SetParentByAdmin(account1.address,wallet.address);
        await instanceLizMiner.SetParentByAdmin(account2.address,account1.address);

        expect(await instanceLizMiner.getParent(account1.address)).to.equal(wallet.address);
        expect(await instanceLizMiner.getParent(account2.address)).to.equal(account1.address);
    });

    it('wallet-->account1-->account2, account1 buyVIP7 + account2 buyVIP1', async () => {
        // Set Parent
        await instanceLizMiner.SetParentByAdmin(account1.address,wallet.address);
        await instanceLizMiner.SetParentByAdmin(account2.address,account1.address);

        expect(await instanceLizMiner.getParent(account1.address)).to.equal(wallet.address);
        expect(await instanceLizMiner.getParent(account2.address)).to.equal(account1.address);

        // transfer LIZ_TRANSFER_AMOUNT to account1
        await expect(instanceLIZToken.transfer(account1.address, LIZ_TRANSFER_AMOUNT))
        .to.emit(instanceLIZToken, 'Transfer')
        .withArgs(wallet.address, account1.address, LIZ_TRANSFER_AMOUNT);
        // transfer LIZ_TRANSFER_AMOUNT to account2
        await expect(instanceLIZToken.transfer(account2.address, LIZ_TRANSFER_AMOUNT))
        .to.emit(instanceLIZToken, 'Transfer')
        .withArgs(wallet.address, account2.address, LIZ_TRANSFER_AMOUNT);

        // account1 buyVIP(7)
                

                // Prepare-approve lizToken
                const instanceLIZToken_fromAccount1 = instanceLIZToken.connect(account1);
                await Promise.all([
                    instanceLIZToken_fromAccount1.approve(instanceLizMiner.address, ALLOWANCE_AMOUNT)
                ]);	
                const instanceLizMiner_fromAccount1 = instanceLizMiner.connect(account1);
                await instanceLizMiner_fromAccount1.buyVip(7,{gasLimit:GAS_LIMIT});

                console.log(chalk.yellow(await instanceLIZToken.balanceOf(wallet.address)));
                console.log(chalk.yellow(await instanceLIZToken.balanceOf(account1.address)));
                console.log(chalk.yellow(await instanceLIZToken.balanceOf(account2.address)));

        // account2 buyVIP(2)

        // Prepare-approve lizToken
        const instanceLIZToken_fromAccount2 = instanceLIZToken.connect(account2);
        await Promise.all([
            instanceLIZToken_fromAccount2.approve(instanceLizMiner.address, 1000000)
        ]);	
        const instanceLizMiner_fromAccount2 = instanceLizMiner.connect(account2);
        await instanceLizMiner_fromAccount2.buyVip(1,{gasLimit:GAS_LIMIT});

        console.log(chalk.red.bold("================= P2 ==============="))
        console.log(chalk.yellow(await instanceLIZToken.balanceOf(wallet.address)));
        console.log(chalk.yellow(await instanceLIZToken.balanceOf(account1.address)));
        console.log(chalk.yellow(await instanceLIZToken.balanceOf(account2.address)));

        console.log(chalk.red.bold("================= getPendingCoin ==============="))
        console.log(chalk.yellow(await instanceLizMiner.getPendingCoin(wallet.address)));
        console.log(chalk.yellow(await instanceLizMiner.getPendingCoin(account1.address)));
        console.log(chalk.yellow(await instanceLizMiner.getPendingCoin(account2.address)));

        console.log(chalk.red.bold("================= WithDrawCredit ==============="))
        await instanceLizMiner_fromAccount1.WithDrawCredit({gasLimit:GAS_LIMIT});
        await instanceLizMiner_fromAccount2.WithDrawCredit({gasLimit:GAS_LIMIT});
        console.log(chalk.yellow("Print balanceOf AFTER WithDrawCredit"));
        console.log(chalk.yellow(await instanceLIZToken.balanceOf(wallet.address)));
        console.log(chalk.yellow(await instanceLIZToken.balanceOf(account1.address)));
        console.log(chalk.yellow(await instanceLIZToken.balanceOf(account2.address)));


    });

    


    
});
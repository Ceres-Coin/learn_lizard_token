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

describe('LizMiner', () => {
  const [wallet, account1,account2,account3,account4] = new MockProvider().getWallets();
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
    

    console.log(chalk.blue("instanceLizMiner.address: ",instanceLizMiner.address));
    console.log(chalk.blue("instanceLIZToken.address: ",instanceLIZToken.address));
    console.log(chalk.blue("instanceWETH.address: ",instanceWETH.address));
    console.log(chalk.blue("instanceFakeCollateral_USDC.address: ",instanceFakeCollateral_USDC.address));
    console.log(chalk.blue("instanceFakeCollateral_USDT.address: ",instanceFakeCollateral_USDT.address));
    
    console.log(chalk.blue("wallet.address: ",wallet.address));
    console.log(chalk.blue("account1.address: ",account1.address));
    console.log(chalk.blue("account2.address: ",account2.address));
    console.log(chalk.blue("account3.address: ",account3.address));
    console.log(chalk.blue("account4.address: ",account4.address));

  });

  it('getOwner()', async () => {
    expect(await instanceLizMiner.getOwner()).to.equal(wallet.address);
  });

//   it('bindParent()', async () => {
//     console.log(chalk.red.bold("bind walletTo's parent = wallet "))
//     await instanceLizMiner.bindParent(walletTo.address,{from:wallet.address,gasLimit:3000000});
//   });

});
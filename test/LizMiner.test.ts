import {expect, use} from 'chai';
import {Contract} from 'ethers';
import {deployContract, MockProvider, solidity} from 'ethereum-waffle';
import LIZToken from '../build/contracts/LIZToken.json';
import LizMiner from '../build/contracts/LizMiner.json';

import chalk from 'chalk';

use(solidity);

describe('LizMiner', () => {
  const [wallet, walletTo] = new MockProvider().getWallets();
  let instanceLizMiner: Contract;

  beforeEach(async () => {
    instanceLizMiner = await deployContract(wallet, LizMiner,[]);
    // console.log(chalk.blue("wallet: ",wallet.address));
    // console.log(chalk.blue("walletTo: ",walletTo.address));
  });

  it('getOwner()', async () => {
    expect(await instanceLizMiner.getOwner()).to.equal(wallet.address);
  });

});
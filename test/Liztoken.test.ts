import {expect, use} from 'chai';
import {Contract} from 'ethers';
import {deployContract, MockProvider, solidity} from 'ethereum-waffle';
import LIZToken from '../build/contracts/LIZToken.json';

import chalk from 'chalk';
const initial_number = 100000000; //initialNumber = 100 million 
use(solidity);

describe('LIZToken', () => {
  const [wallet, walletTo] = new MockProvider().getWallets();
  let token: Contract;

  beforeEach(async () => {
    token = await deployContract(wallet, LIZToken,[]);
    // console.log(chalk.blue("wallet: ",wallet.address));
    // console.log(chalk.blue("walletTo: ",walletTo.address));
  });

  it('getOwner()', async () => {
    expect(await token.getOwner()).to.equal(wallet.address);
  });

  it('name()', async () => {
    expect(await token.name()).to.equal('LIZ');
  });

  it('symbol()', async () => {
    expect(await token.symbol()).to.equal('Lizard');
  });

  it('decimals()', async () => {
    expect(await token.decimals()).to.equal(18);
  });

  it('mint(2000)', async () => {
    await token.mint(2000);
    expect(await token.balanceOf(wallet.address)).to.equal(initial_number+2000);
  });

  it('Assigns initial balance', async () => {
    expect(await token.balanceOf(wallet.address)).to.equal(initial_number);
  });

  it('Transfer adds amount to destination account', async () => {
    await token.transfer(walletTo.address, 7);
    expect(await token.balanceOf(walletTo.address)).to.equal(7);
  });

  it('Transfer emits event', async () => {
    await expect(token.transfer(walletTo.address, 7))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, walletTo.address, 7);
  });

  it('Can not transfer above the amount', async () => {
    await expect(token.transfer(walletTo.address, initial_number+7)).to.be.reverted;
  });

  it('Can not transfer from empty account', async () => {
    const tokenFromOtherWallet = token.connect(walletTo);
    await expect(tokenFromOtherWallet.transfer(wallet.address, 1))
      .to.be.reverted;
  });

  it('Calls totalSupply on LIZToken contract', async () => {
    await token.totalSupply();
    expect('totalSupply').to.be.calledOnContract(token);
  });

  it('Calls balanceOf with sender address on LIZToken contract', async () => {
    await token.balanceOf(wallet.address);
    expect('balanceOf').to.be.calledOnContractWith(token, [wallet.address]);
  });
});
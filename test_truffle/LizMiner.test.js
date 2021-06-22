const MetaCoin = artifacts.require("MetaCoin");

contract("LizMiner test script", async accounts => {
  it("should put 10000 MetaCoin in the first account", async () => {
    const instance = await MetaCoin.deployed();
    const balance = await instance.getBalance.call(accounts[0]);
    assert.equal(balance.valueOf(), 10000);
  });

  it("should call a function that depends on a linked library", async () => {
    const meta = await MetaCoin.deployed();
    const outCoinBalance = await meta.getBalance.call(accounts[0]);
    const metaCoinBalance = outCoinBalance.toNumber();
    const outCoinBalanceEth = await meta.getBalanceInEth.call(accounts[0]);
    const metaCoinEthBalance = outCoinBalanceEth.toNumber();
    assert.equal(metaCoinEthBalance, 2 * metaCoinBalance);
  });
});
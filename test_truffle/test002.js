const MetaCoin = artifacts.require("MetaCoin");

contract("2nd MetaCoin test", async accounts => {
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

  it("should send coin correctly", async () => {
    // Get initial balances of first and second account.
    const account_one = accounts[0];
    const account_two = accounts[1];

    const amount = 10;

    const instance = await MetaCoin.deployed();
    const meta = instance;

    const balance = await meta.getBalance.call(account_one);
    const account_one_starting_balance = balance.toNumber();

    const balance2 = await meta.getBalance.call(account_two);
    const account_two_starting_balance = balance2.toNumber();
    await meta.sendCoin(account_two, amount, { from: account_one });

    const balance_after = await meta.getBalance.call(account_one);
    const account_one_ending_balance = balance_after.toNumber();

    const balance2_after = await meta.getBalance.call(account_two);
    const account_two_ending_balance = balance2_after.toNumber();

    assert.equal(
      account_one_ending_balance,
      account_one_starting_balance - amount,
      "Amount wasn't correctly taken from the sender"
    );
    assert.equal(
      account_two_ending_balance,
      account_two_starting_balance + amount,
      "Amount wasn't correctly sent to the receiver"
    );
  });
});
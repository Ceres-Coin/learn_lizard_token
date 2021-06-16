const Migrations = artifacts.require("Migrations");
const BigNumber = require('bignumber.js');

const chalk = require('chalk');
const { assert } = require('chai');

const ONE_BILLION_DEC9 = new BigNumber("1000000000e9");
const ONE_E_DEC9 = new BigNumber("100000000e9");
const ONE_MILLION_DEC9 = new BigNumber("1000000e9");
const BIG6 = new BigNumber("1e6")
const BIG9 = new BigNumber("1e9")
const BIG18 = new BigNumber("1e18")

const LizToken = artifacts.require("LIZToken");




// Make sure Ganache is running beforehand
module.exports = async function(deployer, network, accounts) {

    console.log(chalk.green.bold("=================== START Test Scripts 2_test_P1 ==================="));
    console.log(chalk.green.bold("=================== START Test Scripts 2_test_P1 ==================="));
    console.log(chalk.green.bold("=================== START Test Scripts 2_test_P1 ==================="));

    const account0 = accounts[0];
    const CONTRACT_OWNER = account0;
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];
    const account4 = accounts[4];
    const account5 = accounts[5];
    const account6 = accounts[6];
    const account7 = accounts[7];
    console.log(chalk.blue("============= account0 ",account0," ================"));
    console.log(chalk.blue("============= account1 ",account1," ================"));
    console.log(chalk.blue("============= account2 ",account2," ================"));

    const instantceLizToken = await LizToken.deployed()
    console.log(chalk.redBright.bold("instantceLizToken: ",instantceLizToken.address));

    const ar_name = await instantceLizToken.name();
    console.log(chalk.yellow("ar_name: ",ar_name.toString()));

    const ar_symbol = await instantceLizToken.symbol();
    console.log(chalk.yellow("ar_symbol: ",ar_symbol.toString()));

    const ar_decimals = await instantceLizToken.decimals();
    console.log(chalk.yellow("ar_decimals: ",ar_decimals.toString()));




}

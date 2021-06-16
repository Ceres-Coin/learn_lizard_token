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

const LizMiner = artifacts.require("LizMiner");




// Make sure Ganache is running beforehand
module.exports = async function(deployer, network, accounts) {

    console.log(chalk.green.bold("=================== START Test 3_test_LizMiner ==================="));
    console.log(chalk.green.bold("=================== START Test 3_test_LizMiner ==================="));
    console.log(chalk.green.bold("=================== START Test 3_test_LizMiner ==================="));
    
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

    const instantceLizMiner = await LizMiner.deployed()
    console.log(chalk.redBright.bold("instantceLizMiner: ",instantceLizMiner.address));

    const ar_getOwner = await instantceLizMiner.getOwner();
    console.log(chalk.yellow("ar_getOwner: ",ar_getOwner.toString()));

    const ar_CurrentBlockReward = await instantceLizMiner.CurrentBlockReward();
    console.log(chalk.yellow("ar_CurrentBlockReward: ",ar_CurrentBlockReward.toString()));

    const ar_getTotalHash = await instantceLizMiner.getTotalHash();
    console.log(chalk.yellow("ar_getTotalHash: ",ar_getTotalHash.toString()));

    const ar_getFeeOnwer = await instantceLizMiner.getFeeOnwer();
    console.log(chalk.yellow("ar_getFeeOnwer: ",ar_getFeeOnwer.toString()));






}

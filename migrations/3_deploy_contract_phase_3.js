const path = require('path');
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const BigNumber = require('bignumber.js');

const { expectEvent, send, shouldFail, time, constants } = require('@openzeppelin/test-helpers');
const BIG6 = new BigNumber("1e6");
const BIG18 = new BigNumber("1e18");
const chalk = require('chalk');

// const UniswapV2ERC20 = artifacts.require("Uniswap/UniswapV2ERC20");
// const UniswapV2OracleLibrary = artifacts.require("Uniswap/UniswapV2OracleLibrary");
// const UniswapV2Library = artifacts.require("Uniswap/UniswapV2Library");
// const UniswapV2Pair = artifacts.require("Uniswap/UniswapV2Pair");
// const UniswapV2Factory = artifacts.require("Uniswap/UniswapV2Factory");
// const SafeERC20 = artifacts.require("ERC20/SafeERC20");

const DUMP_ADDRESS = "0x1111111111111111111111111111111111111111";







// Make sure Ganache is running beforehand
module.exports = async function(deployer, network, accounts) {
	// Deploy Contracts P3
	console.log(chalk.red('====== Deploy Contracts P3 ======='));

    // await deployer.deploy(UniswapV2ERC20);
    // await deployer.deploy(UniswapV2OracleLibrary);
    // await deployer.deploy(UniswapV2Library);

    // await deployer.deploy(UniswapV2Pair);
    // await deployer.deploy(UniswapV2Factory, DUMP_ADDRESS);
    // await deployer.deploy(SafeERC20);

    // await deployer.deploy(ChainlinkETHUSDPriceConsumer);
	// await deployer.deploy(ChainlinkETHUSDPriceConsumerTest);
    // await deployer.deploy(ChainlinkETHUSDPriceConsumerTest2);



}

const path = require('path');
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const BigNumber = require('bignumber.js');

const { expectEvent, send, shouldFail, time, constants } = require('@openzeppelin/test-helpers');
const BIG6 = new BigNumber("1e6");
const BIG18 = new BigNumber("1e18");
const chalk = require('chalk');

const UniswapV2ERC20 = artifacts.require("Uniswap/UniswapV2ERC20");
const UniswapV2OracleLibrary = artifacts.require("Uniswap/UniswapV2OracleLibrary");
const UniswapV2Library = artifacts.require("Uniswap/UniswapV2Library");
const UniswapV2Pair = artifacts.require("Uniswap/UniswapV2Pair");
const UniswapV2Factory = artifacts.require("Uniswap/UniswapV2Factory");
const UniswapV2Router02_Modified = artifacts.require("Uniswap/UniswapV2Router02_Modified");

// FAKE token
const WETH = artifacts.require("BEP20/WETH");
const FakeCollateral_USDC = artifacts.require("FakeCollateral/FakeCollateral_USDC");
const FakeCollateral_USDT = artifacts.require("FakeCollateral/FakeCollateral_USDT");
const LizToken = artifacts.require("LIZToken");

// set constants
const ONE_MILLION_DEC18 = new BigNumber("1000000e18");
const FIVE_MILLION_DEC18 = new BigNumber("5000000e18");
const TEN_MILLION_DEC18 = new BigNumber("10000000e18");
const ONE_HUNDRED_MILLION_DEC18 = new BigNumber("100000000e18");
const ONE_HUNDRED_MILLION_DEC6 = new BigNumber("100000000e6");
const ONE_BILLION_DEC18 = new BigNumber("1000000000e18");
const COLLATERAL_SEED_DEC18 = new BigNumber(508500e18);



const DUMP_ADDRESS = "0x1111111111111111111111111111111111111111";







// Make sure Ganache is running beforehand
module.exports = async function(deployer, network, accounts) {
	// Deploy Contracts P3
	console.log(chalk.red('====== Deploy Contracts P3 ======='));
    const IS_MAINNET = (network == 'mainnet');
	const IS_ROPSTEN = (network == 'ropsten');
	const IS_DEV = (network == 'development');
    const IS_BSC_TESTNET = (network == 'testnet');
    console.log(chalk.blue.bold("IS_DEV: ",IS_DEV));
    console.log(chalk.blue.bold("IS_BSC_TESTNET: ",IS_BSC_TESTNET));

        // Print Accounts list
        const account0 = accounts[0];
        const CONTRACT_OWNER = account0;
        const FEE_OWNER = account0;
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

    let routerInstance;
	let uniswapFactoryInstance;
    let wethInstance;
    let col_instance_USDC;

    if (IS_DEV) {
        console.log(chalk.yellow('===== FAKE COLLATERAL ====='));

		await deployer.deploy(WETH, CONTRACT_OWNER);
        await deployer.deploy(FakeCollateral_USDC, CONTRACT_OWNER, ONE_HUNDRED_MILLION_DEC6, "USDC", 6);
        await deployer.deploy(FakeCollateral_USDT, CONTRACT_OWNER, ONE_HUNDRED_MILLION_DEC6, "USDC", 6);

        wethInstance = await WETH.deployed();
		col_instance_USDC = await FakeCollateral_USDC.deployed(); 
		console.log("wethInstance: ",wethInstance.address);
		console.log("col_instance_USDC: ",col_instance_USDC.address);
    }

    if (IS_DEV) {
        await deployer.deploy(UniswapV2ERC20);
        await deployer.deploy(UniswapV2OracleLibrary);
        await deployer.deploy(UniswapV2Library);

        await deployer.deploy(UniswapV2Pair);
        await deployer.deploy(UniswapV2Factory, DUMP_ADDRESS);

        await deployer.deploy(UniswapV2Router02_Modified, UniswapV2Factory.address, wethInstance.address);
		routerInstance = await UniswapV2Router02_Modified.deployed(); 
		uniswapFactoryInstance = await UniswapV2Factory.deployed(); 

        console.log(chalk.yellow('===== RouterInstantce & Uniswap Factory address ====='));
        console.log(chalk.yellow("routerInstance: ",routerInstance.address));
        console.log(chalk.yellow("uniswapFactoryInstance: ",uniswapFactoryInstance.address));
    }

    const instanceLizToken = await LizToken.deployed();

    // ======== Set the Uniswap pairs CERES_WETH & CERES_USDC ========
	console.log(chalk.yellow('===== SET UNISWAP PAIRS ====='));
	console.log(chalk.blue('=== instanceLizToken / XXXX ==='));
	console.log("instanceLizToken - WETH");
	console.log("instanceLizToken - USDC");
	await Promise.all([
		uniswapFactoryInstance.createPair(instanceLizToken.address, wethInstance.address, { from: CONTRACT_OWNER }),
		uniswapFactoryInstance.createPair(instanceLizToken.address, col_instance_USDC.address, { from: CONTRACT_OWNER }),
	]);

    	// ======== Get the addresses of the pairs CERES_WETH & CERES_USDC ========
	console.log(chalk.yellow('===== GET THE ADDRESSES OF THE PAIRS ====='));
	const pair_addr_LIZ_WETH = await uniswapFactoryInstance.getPair(instanceLizToken.address, wethInstance.address, { from: CONTRACT_OWNER });
	const pair_addr_LIZ_USDC = await uniswapFactoryInstance.getPair(instanceLizToken.address, col_instance_USDC.address, { from: CONTRACT_OWNER });
	console.log(chalk.blue("pair_addr_LIZ_WETH: ",pair_addr_LIZ_WETH));
	console.log(chalk.blue("pair_addr_LIZ_USDC: ",pair_addr_LIZ_USDC));
	
	console.log(chalk.yellow('===== GET VARIOUS PAIR INSTANCES ====='));
	const pair_instance_LIZ_WETH = await UniswapV2Pair.at(pair_addr_LIZ_WETH);
	const pair_instance_LIZ_USDC = await UniswapV2Pair.at(pair_addr_LIZ_USDC);
	console.log(chalk.red.bold("pair_instance_LIZ_WETH: ",pair_instance_LIZ_WETH.address));
	console.log(chalk.red.bold("pair_instance_LIZ_USDC: ",pair_instance_LIZ_USDC.address));
	








}

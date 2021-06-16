const Migrations = artifacts.require("Migrations");
const LizToken = artifacts.require("LIZToken");
const LizMiner = artifacts.require("LizMiner");

module.exports = function (deployer) {
  deployer.deploy(Migrations);

  deployer.deploy(LizToken); //deploy LizToken

  deployer.deploy(LizMiner);


};

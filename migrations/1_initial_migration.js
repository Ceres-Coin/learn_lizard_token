const Migrations = artifacts.require("Migrations");
const LizToken = artifacts.require("LIZToken");

module.exports = function (deployer) {
  deployer.deploy(Migrations);

  deployer.deploy(LizToken); //deploy LizToken


};

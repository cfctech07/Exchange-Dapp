const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");
require("dotenv").config();

module.exports = async function (deployer) {
  const feeAccount = process.env.FEE_ADDRESS;
  const feePercent = 1;
  let dexAddress;

  const dex = await deployer.deploy(Exchange, feeAccount, feePercent).then((instance) => {
    console.log(`Exchange contract deployed at address: ${instance.address}`);
    dexAddress = instance.address;
  });

  const token = await deployer.deploy(Token, dexAddress).then((instance) => {
    console.log(`Token contract deployed at address: ${instance.address}`);
  });
};

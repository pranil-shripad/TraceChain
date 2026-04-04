require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");

module.exports = {
  solidity: "0.8.20",
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};
const CardanocliJs = require("cardanocli-js");

const cardano = new CardanocliJs({
  network: "mainnet-magic 764824073",
  shelleyGenesisPath: "../config/shelley-genesis.json",
  cliPath: "../binary/cardano-cli",
  socketPath: "../node.socket",
  dir: "../cli"
});

module.exports = cardano;

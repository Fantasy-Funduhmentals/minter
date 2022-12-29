const CardanocliJs = require("cardanocli-js");

const cardano = new CardanocliJs({
  network: "testnet-magic 1",
  shelleyGenesisPath: "../config/shelley-genesis.json",
  cliPath: "../binary/cardano-cli",
  socketPath: "../node.socket",
  dir: "../cli"
});

module.exports = cardano;

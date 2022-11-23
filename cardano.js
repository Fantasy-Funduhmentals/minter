const CardanocliJs = require("cardanocli-js");

const cardano = new CardanocliJs({
  network: "testnet-magic 1",
  shelleyGenesisPath: "/var/www/Cardano/config/shelley-genesis.json",
  cliPath: "/var/www/Cardano/binary",
  socketPath: "/var/www/Cardano/node.socket"
});

module.exports = cardano;

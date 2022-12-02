const CardanocliJs = require("cardanocli-js");

const cardano = new CardanocliJs({
  network: "testnet-magic 1",
  shelleyGenesisPath: "/var/www/Cardano/config/shelley-genesis.json",
  cliPath: "/var/www/Cardano/binary/cardano-cli",
  socketPath: "/var/www/Cardano/node.socket",
  dir: "/var/www/Cardano/cli"
});

module.exports = cardano;

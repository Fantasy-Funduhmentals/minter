const cardano = require("./cardano");

async function createWallet (account) {
    const payment = cardano.addressKeyGen(account);
    const stake = cardano.stakeAddressKeyGen(account);
    cardano.stakeAddressBuild(account);
    cardano.addressBuild(account, {
        paymentVkey: payment.vkey,
        stakeVkey: stake.vkey,
    });
    const wallet = cardano.wallet(account);
    console.log(wallet);
    return wallet;
}
createWallet("Fasih");
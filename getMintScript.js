const cardano = require("./cardano");

async function getMintScript(wallet) {
    const mintScript = {
        keyHash: cardano.addressKeyHash(wallet),
        type: "sig"
    }
    console.log(mintScript);
    return mintScript;
}
getMintScript("Fasih")
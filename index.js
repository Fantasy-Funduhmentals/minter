const cardano = require("./cardano");

async function getUtxo(address) {
    const utxo = await cardano.queryUtxo(address);
    console.log("Utxo:", utxo);
    return utxo;
}
//getUtxo("addr_test1qr94r8rg0hmyrwe37up3lldkcv7hln99kwkd6gnwv2wzqq3gxj6v24vdrm9c7kt36wxe0yl8aft9vkj5kqzkjnycugjsxr3sa8");

async function verifyTransaction(to, txHash) {
    const utxo = await getUtxo(to);
    var found = false;
    for(var i = 0; i < utxo.length; i++) {
        if (utxo[i].txHash == txHash) {
            found = true;
            break;
        }
    }
    console.log("Found:", found);
    return found;
}
//verifyTransaction("addr_test1qr94r8rg0hmyrwe37up3lldkcv7hln99kwkd6gnwv2wzqq3gxj6v24vdrm9c7kt36wxe0yl8aft9vkj5kqzkjnycugjsxr3sa8", "b72667be2b045635e9131a12d441808ff5cdf276db4bcc4ab23daab4139d42ad");



const cardano = require("../helpers/cardano");

async function getUtxo(address) {
    const utxo = await cardano.queryUtxo(address);
    console.log("Utxo:", utxo);
    return utxo;
}

async function mint(policyId, mintScript, name, quantity, imageUrl, description, signerAddress, signerPath) {
    const POLICY_ID = policyId.toString();
    const ASSET_NAME = name.toString();
    const ASSET_NAME_HEX = name.split("").map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
    const ASSET_ID = POLICY_ID + "." + ASSET_NAME_HEX;
    const metadata = {
        721: {
            [POLICY_ID]: {
                [name]: {
                    name: ASSET_NAME,
                    image: imageUrl,
                    description: description,
                },
            },
        },
    };
    const txIn = await cardano.queryUtxo(signerAddress);
    console.log(txIn);
    var txOut = {address: signerAddress, value : {lovelace: 0, [ASSET_ID]: quantity}};
    for (var i = 0; i < txIn.length; i++) {
        var assets = Object.keys(txIn[i].value);
        console.log(i, assets);
        for (var j = 0; j < assets.length; j++) {
            if (txOut["value"][assets[j]]) 
                txOut["value"][assets[j]] += txIn[i]["value"][assets[j]];
            else
                txOut["value"][assets[j]] = txIn[i]["value"][assets[j]];
        }
    }
    console.log(txOut);
    const tx = {
        txIn: txIn,
        txOut: [txOut],
        mint: [
            { action: "mint", quantity: quantity, asset: ASSET_ID, script: mintScript },
        ],
        metadata,
        witnessCount: 2
    }
    const buildTransaction = (tx) => {
        const raw = cardano.transactionBuildRaw(tx);
        const fee = cardano.transactionCalculateMinFee({
            ...tx,
            txBody: raw
        });
        tx.txOut[0].value.lovelace -= fee;
        return cardano.transactionBuildRaw({ ...tx, fee });
    }
    const raw = buildTransaction(tx);
    const signTransaction = (signerPath, tx) => {
        return cardano.transactionSign({
            signingKeys: [signerPath, signerPath],
            txBody: tx
        })
    };
    const signed = signTransaction(signerPath, raw);
    const txHash = cardano.transactionSubmit(signed);
    console.log(txHash);
    return txHash;
}

async function mintTo(policyId, mintScript, name, quantity, imageUrl, description, receiverAddress, signerAddress, signerPath) {
    const POLICY_ID = policyId.toString();
    const ASSET_NAME = name.toString();
    const ASSET_NAME_HEX = name.split("").map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
    const ASSET_ID = POLICY_ID + "." + ASSET_NAME_HEX;
    const metadata = {
        721: {
            [POLICY_ID]: {
                [name]: {
                    name: ASSET_NAME,
                    image: imageUrl,
                    description: description,
                },
            },
        },
    };
    const txIn = await cardano.queryUtxo(signerAddress);
    console.log(txIn);
    var txOut = {address: signerAddress, value : {lovelace: cardano.toLovelace(-1.5)}};
    for (var i = 0; i < txIn.length; i++) {
        var assets = Object.keys(txIn[i].value);
        console.log(i, assets);
        for (var j = 0; j < assets.length; j++) {
            if (txOut["value"][assets[j]]) 
                txOut["value"][assets[j]] += txIn[i]["value"][assets[j]];
            else
                txOut["value"][assets[j]] = txIn[i]["value"][assets[j]];
        }
    }
    console.log(txOut);
    const tx = {
        txIn: txIn,
        txOut: [txOut, {address: receiverAddress, value: {lovelace: cardano.toLovelace(1.5), [ASSET_ID]: quantity}}],
        mint: [
            { action: "mint", quantity: quantity, asset: ASSET_ID, script: mintScript },
        ],
        metadata,
        witnessCount: 2
    }
    const buildTransaction = (tx) => {
        const raw = cardano.transactionBuildRaw(tx);
        const fee = cardano.transactionCalculateMinFee({
            ...tx,
            txBody: raw
        });
        tx.txOut[0].value.lovelace -= fee;
        return cardano.transactionBuildRaw({ ...tx, fee });
    }
    const raw = buildTransaction(tx);
    const signTransaction = (signerPath, tx) => {
        return cardano.transactionSign({
            signingKeys: [signerPath, signerPath],
            txBody: tx
        })
    };
    const signed = signTransaction(signerPath, raw);
    const txHash = cardano.transactionSubmit(signed);
    console.log(txHash);
    return txHash;
}

async function burn(mintScript, nftId, quantity, signerAddress, signerPath) {
    const txIn = await cardano.queryUtxo(signerAddress);
    console.log(txIn);
    var txOut = {address: signerAddress, value : {lovelace: 0, [nftId]: -1 * quantity}};
    for (var i = 0; i < txIn.length; i++) {
        var assets = Object.keys(txIn[i].value);
        console.log(i, assets);
        for (var j = 0; j < assets.length; j++) {
            if (txOut["value"][assets[j]]) 
                txOut["value"][assets[j]] += txIn[i]["value"][assets[j]];
            else
                txOut["value"][assets[j]] = txIn[i]["value"][assets[j]];
        }
    }
    console.log(txOut);
    const tx = {
        txIn: txIn,
        txOut: [txOut],
        mint: [
            { action: "mint", quantity: -1 * quantity, asset: nftId, script: mintScript },
        ],
        witnessCount: 2
    }
    const buildTransaction = (tx) => {
        const raw = cardano.transactionBuildRaw(tx);
        const fee = cardano.transactionCalculateMinFee({
            ...tx,
            txBody: raw
        });
        tx.txOut[0].value.lovelace -= fee;
        return cardano.transactionBuildRaw({ ...tx, fee });
    }
    const raw = buildTransaction(tx);
    const signTransaction = (signerPath, tx) => {
        return cardano.transactionSign({
            signingKeys: [signerPath, signerPath],
            txBody: tx
        })
    };
    const signed = signTransaction(signerPath, raw);
    const txHash = cardano.transactionSubmit(signed);
    console.log(txHash);
    return txHash;
}

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

async function getMintScript(wallet) {
    const mintScript = {
        keyHash: cardano.addressKeyHash(wallet),
        type: "sig"
    }
    console.log(mintScript);
    return mintScript;
}

async function getPolicyId(mintScript) {
    const policyId = cardano.transactionPolicyid(mintScript);
    console.log(policyId);
    return policyId;
}

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

async function transfer(nftId, quantity, receiverAddress, signerAddress, signerPath) {
    const txIn = await cardano.queryUtxo(signerAddress);
    console.log(txIn);
    var txOut = {address: signerAddress, value : {lovelace: cardano.toLovelace(-1.5), [nftId]: -1 * quantity}};
    for (var i = 0; i < txIn.length; i++) {
        var assets = Object.keys(txIn[i].value);
        for (var j = 0; j < assets.length; j++) {
            if (txOut["value"][assets[j]]) 
                txOut["value"][assets[j]] += txIn[i]["value"][assets[j]];
            else
                txOut["value"][assets[j]] = txIn[i]["value"][assets[j]];
        }
    }
    console.log(txOut);
    const tx = {
        txIn: txIn,
        txOut: [txOut, {address: receiverAddress, value: {lovelace: cardano.toLovelace(1.5), [nftId]: quantity}}],
        witnessCount: 2
    }
    const buildTransaction = (tx) => {
        const raw = cardano.transactionBuildRaw(tx);
        const fee = cardano.transactionCalculateMinFee({
            ...tx,
            txBody: raw
        });
        tx.txOut[0].value.lovelace -= fee;
        return cardano.transactionBuildRaw({ ...tx, fee });
    }
    const raw = buildTransaction(tx);
    const signTransaction = (signerPath, tx) => {
        return cardano.transactionSign({
            signingKeys: [signerPath, signerPath],
            txBody: tx
        })
    };
    const signed = signTransaction(signerPath, raw);
    const txHash = cardano.transactionSubmit(signed);
    console.log(txHash);
    return txHash;
}
//transfer("d08e14c9e788d16d5b8fde7baccad116b6c7edb0aea245c7e56bb50a.4669727374204e4654", 1, "addr_test1qznnk0ap083y9pr945ggdesyx33dqdskrcc6ucfw2vc3ak3dk4lut7ppcfk2640fhvn0r85x4yvk2luqrmjjj60yc52q7mlefk", "addr_test1qznnk0ap083y9pr945ggdesyx33dqdskrcc6ucfw2vc3ak3dk4lut7ppcfk2640fhvn0r85x4yvk2luqrmjjj60yc52q7mlefk", "./priv/wallet/Fasih/Fasih.payment.skey");

module.exports = {
    getUtxo,
    mint,
    mintTo,
    burn
}
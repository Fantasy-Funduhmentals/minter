const cardano = require("../helpers/cardano");
const fs = require('fs');

const getUtxo = async (address)  => {
    const utxo = await cardano.queryUtxo(address);
    console.log("Utxo:", utxo);
    return utxo;
}

const createWallet = async (account) => {
    try {
        const payment = cardano.addressKeyGen(account);
        cardano.addressBuild(account, {
            paymentVkey: payment.vkey
        });
        const wallet = cardano.wallet(account);
        const address = fs.readFileSync(wallet.payment.addr, 'utf8');
        console.log(address);
        return address;
    }
    catch(err) {
        return null;
    }
}

const exportWallet = async (account) => {
    try {
        const wallet = cardano.wallet(account);
        const skey = fs.readFileSync(wallet.payment.skey, 'utf8');
        const vkey = fs.readFileSync(wallet.payment.vkey, 'utf8');
        const address = fs.readFileSync(wallet.payment.addr, 'utf8');
        const result = {
            address,
            publicKey: JSON.parse(vkey),
            privateKey: JSON.parse(skey)
        }
        console.log(result);
        return result;
    } 
    catch (err) {
        console.log(err);
        return null;
    }
}

const getMintScript = async (wallet) => {
    const mintScript = {
        keyHash: cardano.addressKeyHash(wallet),
        type: "sig"
    }
    console.log(mintScript);
    return mintScript;
}

const getPolicyId = async (mintScript) => {
    const policyId = cardano.transactionPolicyid(mintScript);
    console.log(policyId);
    return policyId;
}

const mint = async (policyId, mintScript, name, quantity, imageUrl, description, signerAddress, signerPath) => {
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
    /*const buildTransaction = (tx) => {
        const raw = cardano.transactionBuildRaw(tx);
        const fee = cardano.transactionCalculateMinFee({
            ...tx,
            txBody: raw
        });
        tx.txOut[0].value.lovelace -= fee;
        return cardano.transactionBuildRaw({ ...tx, fee });
    }*/
    const raw = await buildTransaction(tx);
    /*const signTransaction = (signerPath, tx) => {
        return cardano.transactionSign({
            signingKeys: [signerPath, signerPath],
            txBody: tx
        })
    };*/
    const signed = await signTransaction(signerPath, raw);
    const txHash = cardano.transactionSubmit(signed);
    console.log(txHash);
    return txHash;
}

const mintTo = async (policyId, mintScript, name, quantity, videoUrl, playerId, receiverAddress, signerAddress, signerPath) => {
    const POLICY_ID = policyId.toString();
    const ASSET_NAME = name.toString();
    const ASSET_NAME_HEX = name.split("").map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
    const ASSET_ID = POLICY_ID + "." + ASSET_NAME_HEX;
    const metadata = {
        721: {
            [POLICY_ID]: {
                [name]: {
                    name: ASSET_NAME,
                    videoUrl: videoUrl,
                    playerId: playerId,
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
    /*const buildTransaction = (tx) => {
        const raw = cardano.transactionBuildRaw(tx);
        const fee = cardano.transactionCalculateMinFee({
            ...tx,
            txBody: raw
        });
        tx.txOut[0].value.lovelace -= fee;
        return cardano.transactionBuildRaw({ ...tx, fee });
    }*/
    const raw = await buildTransaction(tx);
    /*const signTransaction = (signerPath, tx) => {
        return cardano.transactionSign({
            signingKeys: [signerPath, signerPath],
            txBody: tx
        })
    };*/
    const signed = await signTransaction(signerPath, raw);
    const txHash = cardano.transactionSubmit(signed);
    console.log(txHash);
    return {nftId: ASSET_ID, txHash};
}

const transfer = async (nftId, quantity, receiverAddress, signerAddress, signerPath) => {
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
    /*const buildTransaction = (tx) => {
        const raw = cardano.transactionBuildRaw(tx);
        const fee = cardano.transactionCalculateMinFee({
            ...tx,
            txBody: raw
        });
        tx.txOut[0].value.lovelace -= fee;
        return cardano.transactionBuildRaw({ ...tx, fee });
    }*/
    const raw = await buildTransaction(tx);
    /*const signTransaction = (signerPath, tx) => {
        return cardano.transactionSign({
            signingKeys: [signerPath, signerPath],
            txBody: tx
        })
    };*/
    const signed = await signTransaction(signerPath, raw);
    const txHash = cardano.transactionSubmit(signed);
    console.log(txHash);
    return txHash;
}

const burn = async (mintScript, nftId, quantity, signerAddress, signerPath) => {
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
    /*const buildTransaction = (tx) => {
        const raw = cardano.transactionBuildRaw(tx);
        const fee = cardano.transactionCalculateMinFee({
            ...tx,
            txBody: raw
        });
        tx.txOut[0].value.lovelace -= fee;
        return cardano.transactionBuildRaw({ ...tx, fee });
    }*/
    const raw = await buildTransaction(tx);
    /*const signTransaction = (signerPath, tx) => {
        return cardano.transactionSign({
            signingKeys: [signerPath, signerPath],
            txBody: tx
        })
    };*/
    const signed = await signTransaction(signerPath, raw);
    const txHash = cardano.transactionSubmit(signed);
    console.log(txHash);
    return txHash;
}

const verifyTransaction = async (to, txHash) => {
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

const buildTransaction = async (tx) => {
    const raw = cardano.transactionBuildRaw(tx);
    const fee = cardano.transactionCalculateMinFee({
        ...tx,
        txBody: raw
    });
    tx.txOut[0].value.lovelace -= fee;
    return cardano.transactionBuildRaw({ ...tx, fee });
}

const signTransaction = async (signerPath, tx) => {
    return cardano.transactionSign({
        signingKeys: [signerPath, signerPath],
        txBody: tx
    })
};

module.exports = {
    getUtxo,
    createWallet,
    exportWallet,
    getMintScript,
    getPolicyId,
    mintTo,
    transfer,
    burn
}
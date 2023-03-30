const cardano = require("../helpers/cardanoMain");
const fs = require('fs');

const createWallet = async (account) => {
    try {
        const payment = cardano.addressKeyGen(account);
        const stake = cardano.stakeAddressKeyGen(account);
        cardano.stakeAddressBuild(account);
        cardano.addressBuild(account, {
            paymentVkey: payment.vkey,
            stakeVkey: stake.vkey
        });
        const wallet = cardano.wallet(account);
        const address = fs.readFileSync(wallet.payment.addr, 'utf8');
        return address;
    }
    catch(err) {
        console.log(err);
        return false;
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
        return result;
    } 
    catch(err) {
        console.log(err);
        return false;
    }
}

const getUtxo = async (address)  => {
    try {
        const utxo = await cardano.queryUtxo(address);
        return utxo;
    }
    catch(err) {
        console.log(err);
        return false;
    }
}

const getMintScript = async (wallet) => {
    try {
        const mintScript = {
            keyHash: cardano.addressKeyHash(wallet),
            type: "sig"
        }
        return mintScript;
    }
    catch(err) {
        console.log(err);
        return false;
    }
}

const getPolicyId = async (mintScript) => {
    try {
        const policyId = cardano.transactionPolicyid(mintScript);
        return policyId;
    }
    catch(err) {
        console.log(err);
        return false;
    }
}

const mint = async (policyId, mintScript, name, quantity, imageUrl, description, signerAddress, signerPath) => {
    try {
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
        var txOut = {address: signerAddress, value : {lovelace: 0, [ASSET_ID]: quantity}};
        for (var i = 0; i < txIn.length; i++) {
            var assets = Object.keys(txIn[i].value);
            for (var j = 0; j < assets.length; j++) {
                if (txOut["value"][assets[j]]) 
                    txOut["value"][assets[j]] += txIn[i]["value"][assets[j]];
                else
                    txOut["value"][assets[j]] = txIn[i]["value"][assets[j]];
            }
        }
        const tx = {
            txIn: txIn,
            txOut: [txOut],
            mint: [
                { action: "mint", quantity: quantity, asset: ASSET_ID, script: mintScript },
            ],
            metadata,
            witnessCount: 2
        }
        const raw = await buildTransaction(tx);
        const signed = await signTransaction(signerPath, raw);
        const txHash = cardano.transactionSubmit(signed);
        return {nftId: ASSET_ID, txHash};
    }
    catch(err) {
        console.log(err);
        return false;
    }
}

const mintTo = async (policyId, mintScript, name, quantity, videoUrl, playerId, receiverAddress, signerAddress, signerName) => {
    try {
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
        const tx = {
            txIn: txIn,
            txOut: [txOut, {address: receiverAddress, value: {lovelace: cardano.toLovelace(1.5), [ASSET_ID]: quantity}}],
            mint: [
                { action: "mint", quantity: quantity, asset: ASSET_ID, script: mintScript },
            ],
            metadata,
            witnessCount: 2
        }
        const raw = await buildTransaction(tx);
        const signer = cardano.wallet(signerName);
        console.log(signer);
        const signed = await signTransaction(signer.payment.skey, raw);
        const txHash = cardano.transactionSubmit(signed);
        return {nftId: ASSET_ID, txHash};
    }
    catch(err) {
        console.log(err);
        return false;
    }
}

const transfer = async (nftId, quantity, receiverAddress, signerAddress, signerName) => {
    try {
        const txIn = await cardano.queryUtxo(signerAddress);
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
        const tx = {
            txIn: txIn,
            txOut: [txOut, {address: receiverAddress, value: {lovelace: cardano.toLovelace(1.5), [nftId]: quantity}}],
            witnessCount: 2
        }
        const raw = await buildTransaction(tx);
        const signer = cardano.wallet(signerName);
        const signed = await signTransaction(signer.payment.skey, raw);
        const txHash = cardano.transactionSubmit(signed);
        return txHash;
    }
    catch(err) {
        console.log(err);
        return false;
    }
}

const burn = async (mintScript, nftId, quantity, signerAddress, signerName) => {
    try {
        const txIn = await cardano.queryUtxo(signerAddress);
        var txOut = {address: signerAddress, value : {lovelace: 0, [nftId]: -1 * quantity}};
        for (var i = 0; i < txIn.length; i++) {
            var assets = Object.keys(txIn[i].value);
            for (var j = 0; j < assets.length; j++) {
                if (txOut["value"][assets[j]]) 
                    txOut["value"][assets[j]] += txIn[i]["value"][assets[j]];
                else
                    txOut["value"][assets[j]] = txIn[i]["value"][assets[j]];
            }
        }
        const tx = {
            txIn: txIn,
            txOut: [txOut],
            mint: [
                { action: "mint", quantity: -1 * quantity, asset: nftId, script: mintScript },
            ],
            witnessCount: 2
        }
        const raw = await buildTransaction(tx);
        const signer = cardano.wallet(signerName);
        const signed = await signTransaction(signer.payment.skey, raw);
        const txHash = cardano.transactionSubmit(signed);
        return txHash;
    }
    catch(err) {
        console.log(err);
        return false;
    }
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
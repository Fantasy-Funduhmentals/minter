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
//createWallet("Fasih");

async function getUtxo(address) {
    const utxo = await cardano.queryUtxo(address);
    console.log("Utxo:", utxo);
    return utxo;
}
//getUtxo("addr_test1qznnk0ap083y9pr945ggdesyx33dqdskrcc6ucfw2vc3ak3dk4lut7ppcfk2640fhvn0r85x4yvk2luqrmjjj60yc52q7mlefk");

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

async function getMintScript(wallet) {
    const mintScript = {
        keyHash: cardano.addressKeyHash(wallet),
        type: "sig"
    }
    console.log(mintScript);
    return mintScript;
}
//getMintScript("Fasih")

async function getPolicyId(mintScript) {
    const policyId = cardano.transactionPolicyid(mintScript);
    console.log(policyId);
    return policyId;
}
//getPolicyId({ keyHash: 'a73b3fa179e2428465ad1086e6043462d036161e31ae612e53311eda', type: 'sig'});

async function test() {
    let keyHash1 = cardano.addressKeyHash("Fasih");
    let accountInfo = cardano.addressInfo("addr_test1qznnk0ap083y9pr945ggdesyx33dqdskrcc6ucfw2vc3ak3dk4lut7ppcfk2640fhvn0r85x4yvk2luqrmjjj60yc52q7mlefk");
    let _accountInfo = accountInfo.base16;
    let keyHash2 = _accountInfo.toString().slice(2, 58);
    console.log(keyHash1);
    console.log(keyHash2);
}
//test();

async function mintTo(signerAddress, policyId, mintScript, assetName, amount, imageUrl, description, receiverAddress, signerPath) {
    const POLICY_ID = policyId.toString();
    const ASSET_NAME = assetName.toString();
    const ASSET_NAME_HEX = ASSET_NAME.split("").map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
    const ASSET_ID = POLICY_ID + "." + ASSET_NAME_HEX;

    const metadata = {
        721: {
            [POLICY_ID]: {
                [ASSET_NAME]: {
                    name: ASSET_NAME,
                    image: imageUrl,
                    description: description,
                },
            },
        },
    };

    const _balanceSigner = await cardano.queryUtxo(signerAddress);
    const _balanceReceiver = await cardano.queryUtxo(receiverAddress);

    // minting to other address along with some ADA... 
    const tx = {
        txIn: _balanceSigner,
        txOut: [
            {
                address: signerAddress.toString(),
                value: {..._balanceSigner[0].value, lovelace: _balanceSigner[0].value.lovelace - cardano.toLovelace(1.5)}
            },
            {
                address: receiverAddress.toString(),
                value: {..._balanceReceiver[0].value,lovelace: cardano.toLovelace(1.5), [ASSET_ID]: amount}
            }
        ],
        mint: [
            { action: "mint", quantity: amount, asset: ASSET_ID, script: mintScript },
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
}

/*mintTo("addr_test1qznnk0ap083y9pr945ggdesyx33dqdskrcc6ucfw2vc3ak3dk4lut7ppcfk2640fhvn0r85x4yvk2luqrmjjj60yc52q7mlefk",
    "d08e14c9e788d16d5b8fde7baccad116b6c7edb0aea245c7e56bb50a",
    {keyHash: 'a73b3fa179e2428465ad1086e6043462d036161e31ae612e53311eda', type: 'sig'},
    "First NFT",
    1,
    "https://dull.com",
    "This is the first NFT",
    "addr_test1qznnk0ap083y9pr945ggdesyx33dqdskrcc6ucfw2vc3ak3dk4lut7ppcfk2640fhvn0r85x4yvk2luqrmjjj60yc52q7mlefk",
    "./priv/wallet/Fasih/Fasih.payment.skey")*/

async function burnNFT(signerAddress, nftId, amount, signerPath) {
    const balanceSender = await cardano.queryUtxo(signerAddress);
    const _txIn = [...balanceSender];
    console.log(balanceSender);
    const nftIndex = balanceSender.findIndex(elem => elem.value[nftId] > 0);
    console.log(nftIndex);
    if (balanceSender[nftIndex]["value"][nftId] == amount)
        balanceSender.splice(nftIndex, 1);
    else
        balanceSender[nftIndex]["value"][nftId] -= amount;
    const _txOut = [...balanceSender];
    const txInfo = {
        txIn: _txIn,
        txOut: [{address: signerAddress, value: {lovelace: _txOut[0].value.lovelace + 1500000}}],
        mint: [
            { action: "mint", quantity: -1, asset: nftId, script: {keyHash: 'a73b3fa179e2428465ad1086e6043462d036161e31ae612e53311eda', type: 'sig'} },
        ],
        // mint: {
        //     actions: [{ type: "mint", quantity: -1, asset: nftId }],
        //     script: [{keyHash: 'a73b3fa179e2428465ad1086e6043462d036161e31ae612e53311eda', type: 'sig'}]
        //   },
        witnessCount: 2
    };
    console.log(txInfo);
    //return;
    const raw = cardano.transactionBuildRaw(txInfo);
    console.log(raw);
    const fee = cardano.transactionCalculateMinFee({
        ...txInfo,
        txBody: raw,
        witnessCount: 1,
    });
    txInfo.txOut[0].value.lovelace -= fee;
    const tx = cardano.transactionBuildRaw({ ...txInfo, fee });
    const txSigned = cardano.transactionSign({
        txBody: tx,
        signingKeys: [signerPath, signerPath],
    });
    console.log("All good");
    const txHash = cardano.transactionSubmit(txSigned);
    console.log("TxHash: " + txHash);
}

//burnNFT("addr_test1qznnk0ap083y9pr945ggdesyx33dqdskrcc6ucfw2vc3ak3dk4lut7ppcfk2640fhvn0r85x4yvk2luqrmjjj60yc52q7mlefk", "d08e14c9e788d16d5b8fde7baccad116b6c7edb0aea245c7e56bb50a.4669727374204e4654", 1, "./priv/wallet/Fasih/Fasih.payment.skey");

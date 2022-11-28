const cardano = require("./cardano");

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
}

mint("d08e14c9e788d16d5b8fde7baccad116b6c7edb0aea245c7e56bb50a",
    {keyHash: 'a73b3fa179e2428465ad1086e6043462d036161e31ae612e53311eda', type: 'sig'},
    "First NFT",
    1,
    "https://dull.com",
    "This is the first NFT",
    "addr_test1qznnk0ap083y9pr945ggdesyx33dqdskrcc6ucfw2vc3ak3dk4lut7ppcfk2640fhvn0r85x4yvk2luqrmjjj60yc52q7mlefk",
    "./priv/wallet/Fasih/Fasih.payment.skey");
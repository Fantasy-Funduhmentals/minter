const cardano = require("./cardano");

async function getPolicyId(mintScript) {
    const policyId = cardano.transactionPolicyid(mintScript);
    console.log(policyId);
    return policyId;
}
getPolicyId({ keyHash: 'a73b3fa179e2428465ad1086e6043462d036161e31ae612e53311eda', type: 'sig'});
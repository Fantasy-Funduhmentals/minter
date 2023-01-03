var express = require("express");
var {query, body, validationResult} = require("express-validator");
const nftController = require("../controllers/nftController");

var router = express.Router();

router.post("/createWallet", [
    body('name').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({success: false, result: errors.array()});
        }
        const name = req.body.name;
        const result = await nftController.createWallet(name);
        if (!result) {
            return res.status(500).send({success: false});
        }
        res.send({success: true, result});
    }
);

// router.get("/exportWallet", [
//     query('name').not().isEmpty()
//     ],
//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(422).send({success: false, result: errors.array()});
//         }
//         const name = req.query.name;
//         const result = await nftController.exportWallet(name);
//         if (!result) {
//             return res.status(500).send({success: false});
//         }
//         res.send({success: true, result});  
//     }
// );

router.get("/utxo", [
    query('address').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({success: false, result: errors.array()});
        }
        const address = req.query.address;
        const result = await nftController.getUtxo(address);
        if (!result) {
            return res.status(500).send({success: false});
        }
        res.send({success: true, result});
    }
);

router.get("/getMintScript", [
    query('name').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({success: false, result: errors.array()});
        }
        const name = req.query.name;
        const result = await nftController.getMintScript(name);
        if (!result) {
            return res.status(500).send({success: false});
        }
        res.send({success: true, result});

    }
);

router.get("/getPolicyId", [
    query('keyHash').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({success: false, result: errors.array()});
        }
        const keyHash = req.query.keyHash;
        const mintScript = {
            keyHash,
            type: "sig"
        };
        const result = await nftController.getPolicyId(mintScript);
        if (!result) {
            return res.status(500).send({success: false});
        }
        res.send({success: true, result});
    }
);

router.post("/mintTo", async (req, res) => {
    const policyId = req.body.policyId;
    const mintScript = req.body.mintScript; 
    const name = req.body.name;
    const quantity = req.body.quantity;
    const videoUrl = req.body.videoUrl;
    const playerId = req.body.playerId;
    const receiverAddress = req.body.receiverAddress;
    const signerAddress = req.body.signerAddress;
    const signerPath = req.body.signerPath;
    const result = await nftController.mintTo(policyId, mintScript, name, quantity, videoUrl, playerId, receiverAddress, signerAddress, signerPath);
    res.send({"success": true, result});
});

router.post("/transfer", async (req, res) => {
    const nftId = req.body.nftId;
    const quantity = req.body.quantity;
    const receiverAddress = req.body.receiverAddress;
    const signerAddress = req.body.signerAddress;
    const signerPath = req.body.signerPath;
    const result = await nftController.transfer(nftId, quantity, receiverAddress, signerAddress, signerPath);
    res.send({"success": true, result});
});

router.post("/burn", async (req, res) => {
    const mintScript = req.body.mintScript; 
    const nftId = req.body.nftId;
    const quantity = req.body.quantity;
    const signerAddress = req.body.signerAddress;
    const signerPath = req.body.signerPath;
    console.log(mintScript);
    const result = await nftController.burn(mintScript, nftId, quantity, signerAddress, signerPath);
    res.send({"success": true, result});
});



module.exports = router;

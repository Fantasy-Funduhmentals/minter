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

router.post("/mintTo", [
    body('policyId').isString().not().isEmpty(),
    body('mintScript').not().isEmpty(),
    body('name').isString().not().isEmpty(),
    body('quantity').isNumeric().not().isEmpty(),
    //body('imageUrl').isArray().not().isEmpty(),
    body('videoUrl').isArray().not().isEmpty(),
    body('playerId').isString().not().isEmpty(),
    body('receiverAddress').isString().not().isEmpty(),
    body('signerAddress').isString().not().isEmpty(),
    body('signerName').isString().not().isEmpty()
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({success: false, result: errors.array()});
        }
        const policyId = req.body.policyId;
        const mintScript = req.body.mintScript; 
        const name = req.body.name;
        const quantity = req.body.quantity;
        const imageUrl = req.body.imageUrl;
        const videoUrl = req.body.videoUrl;
        const playerId = req.body.playerId;
        const receiverAddress = req.body.receiverAddress;
        const signerAddress = req.body.signerAddress;
        const signerName = req.body.signerName;
        const result = await nftController.mintTo(policyId, mintScript, name, quantity, imageUrl, videoUrl, playerId, receiverAddress, signerAddress, signerName);
        if (!result) {
            return res.status(500).send({success: false});
        }
        res.send({"success": true, result});
    }
);

router.post("/transfer", [
    body('nftId').isString().not().isEmpty(),
    body('quantity').isNumeric().not().isEmpty(),
    body('receiverAddress').isString().not().isEmpty(),
    body('signerAddress').isString().not().isEmpty(),
    body('signerName').isString().not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({success: false, result: errors.array()});
        }
        const nftId = req.body.nftId;
        const quantity = req.body.quantity;
        const receiverAddress = req.body.receiverAddress;
        const signerAddress = req.body.signerAddress;
        const signerName = req.body.signerName;
        const result = await nftController.transfer(nftId, quantity, receiverAddress, signerAddress, signerName);
        if (!result) {
            return res.status(500).send({success: false});
        }
        res.send({"success": true, result});
    }
);

router.post("/burn", [
    body('mintScript').not().isEmpty(),
    body('nftId').isString().not().isEmpty(),
    body('quantity').isNumeric().not().isEmpty(),
    body('signerAddress').isString().not().isEmpty(),
    body('signerName').isString().not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({success: false, result: errors.array()});
        }
        const mintScript = req.body.mintScript; 
        const nftId = req.body.nftId;
        const quantity = req.body.quantity;
        const signerAddress = req.body.signerAddress;
        const signerName = req.body.signerName;
        const result = await nftController.burn(mintScript, nftId, quantity, signerAddress, signerName);
        if (!result) {
            return res.status(500).send({success: false});
        }
        res.send({"success": true, result});
    }
);

module.exports = router;

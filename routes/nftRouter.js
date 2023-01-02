var express = require("express");
const nftController = require("../controllers/nftController");

var router = express.Router();

router.get("/utxo", async (req, res) => {
    const address = req.query.address;
    const result = await nftController.getUtxo(address);
    res.send({"success": true, "result": result});
});

router.post("/createWallet", async (req, res) => {
    const name = req.body.name;
    const result = await nftController.createWallet(name);
    res.send({"success": true, result});
});

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

router.post("/burn", async (req, res) => {
    const mintScript = req.body.mintScript; 
    const nftId = req.body.nftId;
    const quantity = req.body.quantity;
    const signerAddress = req.body.signerAddress;
    const signerPath = req.body.signerPath;
    console.log(mintScript);
    const result = await nftController.burn(mintScript, nftId, quantity, signerAddress, signerPath);
    res.send({"success": true, "result": result});
});

router.post("/transfer", async (req, res) => {
    const nftId = req.body.nftId;
    const quantity = req.body.quantity;
    const receiverAddress = req.body.receiverAddress;
    const signerAddress = req.body.signerAddress;
    const signerPath = req.body.signerPath;
    const result = await nftController.transfer(nftId, quantity, receiverAddress, signerAddress, signerPath);
    res.send({"success": true, "result": result});
});

module.exports = router;

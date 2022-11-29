var express = require("express");
const nftController = require("../controllers/nftController");

var router = express.Router();

router.get("/utxo", async (req, res) => {
    const address = req.query.address;
    const result = await nftController.getUtxo(address);
    res.send({"success": true, "result": result});
});

router.post("/mintTo", async (req, res) => {
    const policyId = req.body.policyId;
    const mintScript = req.body.mintScript; 
    const name = req.body.name;
    const quantity = req.body.quantity;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const receiverAddress = req.body.receiverAddress;
    const signerAddress = req.body.signerAddress;
    const signerPath = req.body.signerPath;
    const result = await nftController.mintTo(policyId, mintScript, name, quantity, imageUrl, description, receiverAddress, signerAddress, signerPath);
    res.send({"success": true, "result": result});
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

module.exports = router;

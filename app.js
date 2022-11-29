var express = require("express");
var cors = require("cors");

var nftRouter = require("./routes/nftRouter");
const port = 3000;

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//To allow cross-origin requests
app.use(cors());

//Route Prefixes
app.use("/nft", nftRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

module.exports = app;
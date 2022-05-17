const express = require('express');
const app = express();
const cors = require('cors');
const ethers = require('ethers');
require('dotenv').config('../.env');
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);

const port = process.env.SERVER_PORT;

// To avoid cross origin errors on localhost
app.use(cors());
app.use(express.json());

// Console.log server start message
app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});

// Get balance at address
app.get('/balance/:address', async (req, res) => {
    const {address} = req.params;
    // console.log(address);
    try {    
        const balance = await provider.getBalance(address);
        res.send({ balance });
    }
    catch {}   
});

// Get block at block number (or latest)
app.get('/block/:blockNumber', async (req, res) => {
    const {blockNumber} = req.params;
    // console.log(blockNumber);
    try {    
        const block = await provider.getBlockWithTransactions(blockNumber);
        // console.log(block);
        res.send(block);
    }
    catch {}   
});
const express = require('express');
const app = express();

// Module to Read/ parse the body content
const bodyParser = require('body-parser');

// Enforcing the express app to use parser in the pipeline
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Importing the Blockchain data structure
const Blockchain = require('./blockchain');

// creating a new instance/ object from the template
const myChain =  new Blockchain();

// Importing uuid/v1 module to determine the unique address of the node
// This unique id is useful when we decentralize the network
const uuid = require('uuid/v1');

// the uuid has '-' in the string and we replace them below
const nodeAddress = uuid().split('-').join('');

// Retrieve the complete ledger - chain
app.get('/blockchain', function(req, res) {
    res.send(myChain);
});

// Add a new txn
app.post('/transaction', function(req, res){
    // variable to hold the request body
    const reqJSON = req.body;
    // Log the body
    // console.log(req.body);
    // Send back the amount in the response
    // res.send(`The amount of the transaction is ${req.body.amount} bitcoin`);

    // variable to hold the index of the newly created txn
    const processIndex = myChain.createNewTransaction(reqJSON.amount, reqJSON.sender, reqJSON.receiver);

    // Send back the index as reference to the caller
    res.json({ result: `The transaction has been added and will be processed in ${processIndex} block.`});

}); 

// Mine the block of txn's to add to the block
app.get('/mine', function(req,res){

    // Get the last/ final block in the ledger
    const lastBlock = myChain.getLastBlock();

    // retrieve the hash from the last block
    const previousBlockHash = lastBlock['hash'];

    // Populate the new block data that needs to put into the ledger
    const currentBlockData = {
        transactions: myChain.pendingTransactions,
        // Increment the index which will define the index of this new txn set
        index: lastBlock['index'] + 1
    };

    // Find the nonce by calling the PoW method using the old hash & new data set
    const nonce = myChain.proofOfWork(previousBlockHash, currentBlockData);

    // From the nonce, hash the new block
    const hashBlock = myChain.hashBlock(previousBlockHash, currentBlockData, nonce);

    // Before the new block is added to ledger, we issue an incentive to the miner for adding this block to the ledger
    myChain.createNewTransaction(12.5,"00",nodeAddress);

    // Issue the creating of new block to the ledger
    const newBlock = myChain.createNewBlock(nonce,previousBlockHash,hashBlock);

    // send back the response to the client on the status
    res.json({
        result: "New block mined successfully",
        block: newBlock
    });

});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});
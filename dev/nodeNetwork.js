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

const PORT = process.argv[2];

// Import the request-promise module to facilitate the register/broadcast functionality
const rp = require('request-promise');

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

// Register a node and broadcast it over the network
// Call is made to one API on the network and it in-t urn calls the register node endpoint on other nodes
app.post('/register-and-broadcast-node', function(req, res){

    // Read the new node url from the request body
    const newNodeUrl = req.body.newNodeUrl;

    // Add the new node url to the processing node's networkNodes array [if it's not already present]
    if (myChain.networkNodes.indexOf(newNodeUrl) == -1) myChain.networkNodes.push(newNodeUrl);

    // declare a var to hold the register node promises
    const regNodePromises = [];
    // Call the register node endpoint to broadcast the new url to the network nodes
    myChain.networkNodes.forEach(networkNodeUrl => {
       
        // Populate the requestOptions object to facilitate request-promise
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };

        // Add the promises issued by calling request-promise module
        regNodePromises.push(rp(requestOptions));
    });

    // Processing the async calls after the register-node event to call the register-bulk-nodes endpoint
    Promise.all(regNodePromises)
    .then (data => {

        // declare variable to populate the buldRegisterOptions
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: { allNetworkNodes: [ ...myChain.networkNodes, myChain.currentNetworkNode ]},
            json: true
        };


        return rp(bulkRegisterOptions);
    // Send a response back to the caller on the registration status
    }).then ( data => {
        res.json( {result: 'New node registered with the network successfully.' } )
    });


});

// Register the new node on the network [successive to above method]
app.post('/register-node', function(req, res){

    // read the new node url from the request body
    const newNodeUrl = req.body.newNodeUrl;
    // declare a var to check if the new node url is already in the array
    const nodeNotAlreadyPresent = myChain.networkNodes.indexOf(newNodeUrl) == -1;
    // declare a var to check if the new node url is not the current node url
    const notCurrentNode = myChain.currentNetworkNode !== newNodeUrl;

    // register and send back the response if the above to var results to true
    if (nodeNotAlreadyPresent && notCurrentNode) myChain.networkNodes.push(newNodeUrl);
    res.json({result: 'New node registered successfully.'})
});

// The intial API will send back a request to the new node on the network information [complete node information]
app.post('/register-nodes-bulk', function(req, res){

    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach (networkNodeUrl => {
        // declare a var to check if the new node url is already in the array
        const nodeNotAlreadyPresent = myChain.networkNodes.indexOf(networkNodeUrl) == -1;
        // declare a var to check if the new node url is not the current node url
        const notCurrentNode = myChain.currentNetworkNode !== networkNodeUrl;

        if (nodeNotAlreadyPresent && notCurrentNode) myChain.networkNodes.push(networkNodeUrl);

    });
    res.json({ result: 'Bulk registration successful.'})
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});
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

// read the current node's URL from the config file [package.json]
const PORT = process.argv[2];

// Import the request-promise module to facilitate the register/broadcast functionality
const rp = require('request-promise');

// Retrieve the complete ledger - chain
app.get('/blockchain', function(req, res) {
    res.send(myChain);
});

// Add a new txn specific to every node
app.post('/transaction', function(req, res){

    /*

    Sep 23: Re-factoring for the synchronization module
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

    */

    // read the new txn data from the body
    const newTxn = req.body;
    // read the index of the next block by calling the method on the executing node
    const blockIndex = myChain.addTxnToPendingTxns(newTxn);
    // send back the status referring to the block to which the txn will be added
    res.json({ result: `Transaction will be added in block: ${blockIndex}.`})

});

// Adding a new txn to the network
app.post('/transaction/broadcast', function(req, res){

    // read the request body and assign to a var
    const reqBody = req.body;
    // invoke the createNewTxn method and store the newTxn data
    const newTxn = myChain.createNewTransaction(reqBody.amount, reqBody.sender, reqBody.receiver);
    // Add the new txn to the pending txn of the current node
    myChain.addTxnToPendingTxns(newTxn);

    // Block to loop through each node and adding the new txn
    const requestPromises = [];
    myChain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTxn,
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data => {
        res.json({ result: 'Transaction created and broadcasted successfully.'})
    });
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

    // Issue the creating of new block to the ledger
    const newBlock = myChain.createNewBlock(nonce,previousBlockHash,hashBlock);

    // Flow to broadcast the new block to all nodes
    const newBlockPromises = [];
    myChain.networkNodes.forEach(networkNodeUrl => {

        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        };
        newBlockPromises.push(rp(requestOptions));
    });

    Promise.all(newBlockPromises)
    .then(data => {
        // After the new block is added, reward the miner by broadcasting a mined txn
        const requestOptions = {
            uri: myChain.currentNetworkNode + '/transaction/broadcast',
            method: 'POST',
            body: {
                amount: 12.5,
                sender: '00',
                receiver: nodeAddress
            },
            json: true
        };

        return rp(requestOptions);
    }).then (data => {
        // send back the response to the client on the status
        res.json({
            result: "New block mined and broadcast successfully",
            block: newBlock
            });
    });
});

// Broadcast the mined block to all the nodes in the network
app.post('/receive-new-block', function(req, res){
    // read the new block from the body
    const newBlock = req.body.newBlock;
    // get the last mined block from the ledger/chain
    const lastBlock = myChain.getLastBlock();
    // check if the previous hash and the last index matches with the newly mined block
    const isValidPreviousHash = lastBlock['hash'] === newBlock.previousHash;
    const isValidPreviousIndex = lastBlock['index'] + 1 === newBlock['index'];

    // if the conditions match, the network nodes add the new block to their ledgers, else rejected
    if (isValidPreviousHash && isValidPreviousIndex) {
        myChain.chain.push(newBlock);
        myChain.pendingTransactions = [];
        res.json ({ result: 'New block received and accepted.',
                    newBlock: newBlock
                });
    } else {
        res.json ({
            result: 'New block rejected.',
            newBlock: newBlock
        });
    }
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

// API to merge/ correct the executing node to match with the ledger data in the network
app.get('/consensus', function(req, res){

    // Get the ledger from all the nodes in the network
    const requestPromises = [];
    myChain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

    // Loop through each node and check if the current ledger is the most recent. Else replace the chain
    Promise.all(requestPromises)
    .then(blockchains => {
        const currentChainLength = myChain.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTxns = null;

        blockchains.forEach(blockchain => {
            if(blockchain.chain.length > maxChainLength){
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newPendingTxns = blockchain.pendingTransactions;
            };
        });

        if (!newLongestChain || (newLongestChain && !myChain.isChainValid(newLongestChain))){
            res.json({ 
                result: 'Chain is not replaced',
                chain: myChain.chain
            });
        } else {
            myChain.chain = newLongestChain;
            myChain.pendingTransactions = newPendingTxns;
            res.json({
                result: 'Chain has been replaced.',
                chain: newLongestChain
            })
        }
    });
});

// API to fetch a specific block based on the block's hash
app.get('/block/:blockHash', function(req, res){

    // get the blockHash value from the URI
    const blockHash = req.params.blockHash;
    const resBlock = myChain.getBlock(blockHash);

    if (resBlock) res.json( 
        { 
            block: resBlock,
            isPresent: true
        } );

    else res.json( 
        { 
            isPresent: false
        } );

});

// API to fetch a specific block based on the block's transactionId
app.get('/transaction/:transactionId', function(req, res){

    // get the transactionId value from the URI
    const transactionId = req.params.transactionId;
    const resObj = myChain.getTransaction(transactionId);

    if (resObj.transaction) res.json( 
        { 
            resObj,
            isTxnPresent: true
        } );

    else res.json( 
        { 
            isTxnPresent: false
        } );
});

// API to fetch a specific block based on the sender/ receiver address and display the balance
app.get('/address/:address', function(req, res){

    // get the transactionId value from the URI
    const address = req.params.address;
    const resObj = myChain.getAddress(address);

    if (resObj.transactions) res.json( 
        { 
            resObj,
            isAddressPresent: true
        } );

    else res.json( 
        { 
            isAddressPresent: false
        } );
});

app.get('/block-explorer', function(req, res){


    res.sendFile('./block-explorer/index.html', { root: __dirname });
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});
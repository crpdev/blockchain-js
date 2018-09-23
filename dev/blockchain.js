// importing sha256 module
const sha256 = require('sha256');

// Get the current processing node URL
const currentNetworkNode = process.argv[3];

// Importing the uuid module to define a unique id for every txn
const uuid = require('uuid/v1');

// Blockchain constructor function
function Blockchain(){
    // chain is to store the actual ledger [MINED]
    this.chain = []; 
    // pendingTransactions hold tnx which are not yet added to ledger [NEW]
    this.pendingTransactions = [];

    // Adding the current network node to Blockchain data structure
    this.currentNetworkNode = currentNetworkNode;

    // Populate all the participating nodes in the network
    this.networkNodes = [];

    // method call on createNewBlock to create a genesis block

    this.createNewBlock(0,'0','0');
}

// A method createNewBlock which takes in the unique PoW, hash's to push data to ledger
// param: nonce, previousHash, hash
Blockchain.prototype.createNewBlock = function(nonce, previousHash, hash){

    // creates a new block from the new transactions
    const newBlock = {
        index: this.chain.length + 1,
        timeStamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        previousHash: previousHash,
        hash: hash
    };

    // reset the pendingTransactions to an empty array
    this.pendingTransactions = [];
    // Add the new block to the chain/ ledger
    this.chain.push(newBlock);

    return newBlock;
}

// Method to get the last block from the ledger
// param: 
Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1];
}

// Method to create a new txn and add to the pendingTxn array
// Param: amount, sender, receiver
Blockchain.prototype.createNewTransaction = function(amount, sender, receiver){

    const newTransaction = {
        amount: amount,
        sender: sender,
        receiver: receiver,
        // Adding txnId to specify unique txn id for every txn
        transactionId: uuid().split('-').join('')
    };

    // Sep 23: Modified for Synchronizing the network 

    /*
    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock()['index'] + 1;

    */

    return newTransaction;
}

// Sep23: Created a new method to add the new txn to the pending txns
// param: txnData -> newTxn created from the above method
Blockchain.prototype.addTxnToPendingTxns = function(txnData){
    this.pendingTransactions.push(txnData);
    return this.getLastBlock['index'] + 1;
}

// Method to create a unique hash
// param: previousBlockHash, currentBlockData, nonce
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce){

    // Append the data to form a unique string
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    // retrieve a hash value from the unique string obtained
    const hash = sha256(dataAsString); 
    // Return the hash as a result
    return hash;
}

// Method to claim PoW but finding a unique nonce from the previous datasets and current block
// param: previousBlockHash, currentBlockData
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData){
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);

    while(hash.substring(0,4) !== '0000'){
        nonce++;
        hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);
        // use when needed to view the hash's generated to receive at a stable state
        // console.log(hash);
    }

    return nonce;

}

Blockchain.prototype.isChainValid = function(blockchain){
    
    let isChainValid = true;

    for (var i = 1; i < blockchain.length; i++){
        const currentBlock = blockchain[i];
        const previousBlock = blockchain[i - 1];
        const blockHash = this.hashBlock(previousBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index']}, currentBlock['nonce']);

        if (blockHash.substring(0,4) !== '0000') isChainValid = false;
        if (currentBlock['previousHash'] !== previousBlock['hash']) isChainValid = false;        
    };

    const genesisBlock = blockchain[0];
    const genesisNonce = genesisBlock['nonce'] === 0;
    const genesisPreviousHash = genesisBlock['previousHash'] === '0';
    const genesisHash = genesisBlock['hash'] === '0';
    const genesisTxnLength = genesisBlock['transactions'].length === 0;

    if (!genesisNonce || !genesisPreviousHash || !genesisHash || !genesisTxnLength) isChainValid = false;

    return isChainValid;
}

module.exports = Blockchain;
// importing sha256 module
const sha256 = require('sha256');

// Get the current processing node URL
const currentNetworkNode = process.argv[3];

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
        receiver: receiver
    };

    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock()['index'] + 1;
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

module.exports = Blockchain;
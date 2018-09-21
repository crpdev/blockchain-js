// Blockchain constructor function
function Blockchain(){
    // chain is to store the actual ledger [MINED]
    this.chain = []; 
    // pendingTransactions hold tnx which are not yet added to ledger [NEW]
    this.pendingTransactions = [];
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

    return this.getLastBlock()['index'] + 1
}

module.exports = Blockchain;
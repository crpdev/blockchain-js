// Blockchain constructor function
function Blockchain(){
    // chain is to store the actual ledger [MINED]
    this.chain = []; 
    // newTransactions hold tnx which are not yet added to ledger [NEW]
    this.newTransactions = [];
}

// A method createNewBlock which takes in the unique PoW, hash's to push data to ledger
Blockchain.prototype.createNewBlock = function(nonce, previousHash, hash){

    // creates a new block from the new transactions
    const newBlock = {
        index: this.chain.length + 1,
        timeStamp: Date.now(),
        transactions: this.newTransactions,
        nonce: nonce,
        previousHash: previousHash,
        hash: hash
    };

    // reset the newTransactions to an empty array
    this.newTransactions = [];
    // Add the new block to the chain/ ledger
    this.chain.push(newBlock);

    return newBlock;
}

// Method to get the last block from the ledger
Blockchain.prototype.getLastBlock = function(){
    return chain[this.chain.length - 1];
}

module.exports = Blockchain;
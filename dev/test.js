// Import the Blockchain module

const Blockchain = require('./blockchain');

// create an instance of the Blockchain constructor

// instance to reference a new Blockchain Object
const myChain = new Blockchain();

/*

Code to test the createNewBlock method

// creating a new block to add to the ledger [MINING]
myChain.createNewBlock(1234, 'AJAJJA7656', 'HHAJAKK7678');

// blocks to testls the object
myChain.createNewBlock(4567, 'HHAJAKK7678', 'JJAHAJAJ5455');
myChain.createNewBlock(7891, 'JJAHAJAJ5455', 'JAJAJAAJ7845');

*/


/*

// Code to test the createNewTransaction method

// creating a new block to add to the ledger [MINING]
myChain.createNewBlock(1234, 'AJAJJA7656', 'HHAJAKK7678');

// Create a new txn which is in pending state
myChain.createNewTransaction(1000,'RAJA5457ADDD', 'SAI7656HAGG');

// Mine a new block to add the txn to the ledger
myChain.createNewBlock(4567, 'HGAT454HT', 'YTSS2556JGAF');

// Adding few more txns
myChain.createNewTransaction(1000,'RAJA5457ADDD', 'SAI7656HAGG');
myChain.createNewTransaction(1000,'RAJA5457ADDD', 'SAI7656HAGG');
myChain.createNewTransaction(1000,'RAJA5457ADDD', 'SAI7656HAGG');

// Mine a new block to add the txn to the ledger
myChain.createNewBlock(6789, 'YAHAT7667', 'HHAJAJ7644');

// To view the chain/ ledger
console.log(myChain);
console.log('<<<<<<< >>>>>>>')
// To view the chain at a specific index
console.log(myChain.chain[2]);

*/

/*

// Test case to validate hashBlock method

// create test variables
const previousBlockHash =  '8eaff03f84ecf29991a73fc7e64949d78d0e532f92b90ada0a9b8fd8490c2855';

const currentBlockData = [

    {
        amount: 150,
        sender: 'Raja',
        receiver: 'Sai'
    },
    {
        amount: 200,
        sender: 'Gokul',
        receiver: 'Raja'
    },
    {
        amount: 10,
        sender: 'Sai',
        receiver: 'Raja'
    }
    
];

const nonce = 123;

console.log(myChain.hashBlock(previousBlockHash,currentBlockData,nonce));

*/

/*
// Test case to validate PoW method

// create test variables
const previousBlockHash =  '8eaff03f84ecf29991a73fc7e64949d78d0e532f92b90ada0a9b8fd8490c2855';

const currentBlockData = [

    {
        amount: 150,
        sender: 'Raja',
        receiver: 'Sai'
    },
    {
        amount: 200,
        sender: 'Gokul',
        receiver: 'Raja'
    },
    {
        amount: 10,
        sender: 'Sai',
        receiver: 'Raja'
    }
    
];

// use the statement below to view the unique nonce of the passed data
console.log(myChain.proofOfWork(previousBlockHash, currentBlockData));

// use the statement below to check if the nonce satisfies the condition ^'0000'

console.log(myChain.hashBlock(previousBlockHash, currentBlockData, 12781));

*/

// Test case to validate genesis block

console.log(myChain);
    
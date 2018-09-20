// Import the Blockchain module

const Blockchain = require('./blockchain');

// create an instance of the Blockchain constructor

// instance to reference a new Blockchain Object
const myChain = new Blockchain();

// creating a new block to add to the ledger
myChain.createNewBlock(1234, 'AJAJJA7656', 'HHAJAKK7678');

// blocks to test the object
myChain.createNewBlock(4567, 'HHAJAKK7678', 'JJAHAJAJ5455');
myChain.createNewBlock(7891, 'JJAHAJAJ5455', 'JAJAJAAJ7845');

console.log(myChain);
const express = require('express');
const app = express();

// Module to Read/ parse the body content
const bodyParser = require('body-parser');

// Enforcing the express app to use parser in the pipeline
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const Blockchain = require('./blockchain');
const myChain =  new Blockchain();

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

});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});
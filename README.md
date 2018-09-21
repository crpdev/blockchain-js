# blockchain-js
Implementing a full blown, working Proof of Work blockchain using JS

Majority of the code uses ES5 syntax

21/09/2018:

1. Building a Blockchain

  - consturctor function for Blockchain data structure
  - prototypes:
    - createNewBlock
    - getLastBlock
    - createNewTransaction
    - hashBlock
    - proofOfWork
  - test cases to validate the methods
  
2. Accessing the Blockchain through an API
  
  - This section re-uses the entire blockchain infra that was created earlier and exposes the functionality as API's

  - blockchain
    - GET: to view the complete ledger
  
  - transaction
    - POST: add new transactions [pending] to the ledger, which will then be mined
  
  - mine
    - GET: process the pending txn's and add them to the ledger
    
  - This sample API infrastructure will be re-used to create a de-centralized Blockchain network in the next section.

The code has detailed comments added to every section, to express clarity and functionality.

This is an ongoing PoC and the src files will be updated as and when the changes are tested.

For any queries, feel free to mail to rajapandianc@outlook.in

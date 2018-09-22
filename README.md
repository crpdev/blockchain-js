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
    - Sample request:
      {
    	  "amount": 200,
	      "sender": "Rajapandian",
	      "receiver": "Sainath"
      }
  
  - mine
    - GET: process the pending txn's and add them to the ledger
    
  - This sample API infrastructure will be re-used to create a de-centralized Blockchain network in the next section.
  
22/09/2018:

3. Building a de-centralized network [5 nodes]

  - This section exposes the API implementation of a single node network and replicates it to create a de-centralized network
  
  - /register-and-broadcast-node
    - POST: receive a newNodeUrl and register it over the blockchain network
    - The registration happens in 3 steps:
      - add the new node to the node which received the request
      - call the nodes in the network and register the new node via /register-node endpoint
      - call the new node's /register-nodes-bulk endpoint to add all existing nodes
    - Sample request:
        {
	        "newNodeUrl": "http://localhost:3002"
        }
  
  - /register-node
    - POST: receive the newNodeUrl and register the new node to the called node's registry
    - Sample request:
        {
	        "newNodeUrl": "http://localhost:3002"
        }
        
   - /register-nodes-bulk
    - POST: receive the complete node url array on the new network and add them to the registry
        - Sample request:
        {
	        "allNetworkNodes": [
		          "http://localhost:3001",
		          "http://localhost:3003",
		          "http://localhost:3004",
		          "http://localhost:3005"
		          ]
        }

When a new node is added to an existing node [payload passed via the endpoint], the other 2 endpoints are invoked as part of the process to create a de-centralized network.

The existing implementation will be tweaked to facilitate synchronization and to build a consensus in the following sections.

The code has detailed comments added to every section, to express clarity and functionality.

This is an ongoing PoC and the src files will be updated as and when the changes are tested.

For any queries, feel free to mail to rajapandianc@outlook.in

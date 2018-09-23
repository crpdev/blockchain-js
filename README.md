# blockchain-js
Implementing a full blown, de-centralized, Proof of Work blockchain using JS

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

  - /blockchain
    - GET: to view the complete ledger
  
  - /transaction
    - POST: add new transactions [pending] to the ledger, which will then be mined
    - Sample request:
      {
    	  "amount": 200,
	      "sender": "Rajapandian",
	      "receiver": "Sainath"
      }
  
  - /mine
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

23/09/2018:

4. Synchronizing the blockchain network

The de-centralized network created in the previous section is modified and a couple of endpoints are added, which are called from within the process to synchronize the blockchain network

 - /transaction/broadcast
   - POST: the /transaction endpoint is now called within this new endpoint. This endpoint receives the new txn's and then 	      broadcasts over the network. Internally, the flow is to create a new txn, add to the pending txn array of the      	    current processing node and then broadcast over to the network to replicate the state to all nodes.
 - /receive-new-block
   - POST: The /mine endpoint is now equiped with the new endpoint to facilitate block confirmation to all nodes.
   	   Upon a mine request to a node in the network, the process internally calls the new endpoint to broadcast the new 	       block to all the nodes in the network. Once the block is added to the ledger, the miner [processing node] is 		   rewarded, which is then added to the pending txn by calling the /transaction/broadcast endpoint.
	   
By adding of these two endpoints to the process and modifying the process flow, the entire blockchain network now has the exact same data at any given time.

This synchronized blockchain network will now be used to create the consensus protocol in the next section.

The code has detailed comments added to every section, to express clarity and functionality.

This is an ongoing PoC and the src files will be updated as and when the changes are tested.

For any queries, feel free to mail to rajapandianc@outlook.in

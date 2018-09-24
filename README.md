# blockchain-js
Implementing a full blown, de-centralized, Proof of Work blockchain using JS

This implementation is the result of a self study on Blockchain using JS, based on the Udemy course by Eric Traub. I recommend enrolling to the course (https://www.udemy.com/build-a-blockchain-in-javascript/), where Eric discusses on every aspect of Blockchain in much detail.

The sections implemented are as follows:

	- Building A Blockchain
	- Accessing the Blockchain through an API
	- Building a de-centralized network
	- Synchronizing the blockchain network
	- Adding consensus protocol to the blockchain implementation
	- Block Explorer - Web Interface to view the ledger based on filters

Note: Majority of the code uses ES5 syntax

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

5. Adding consensus protocol to the blockchain implementation

Consensus is added to the blockchain implementation, where a newly added node can access the /consensus endpoint to fetch the latest chain from the network. This is based on the longest chain rule, where the chain from every node is read and the most recent [longest] chain in the network is fetched and replicated to the newly added node.

This is made possible with the isChainValid method added to the blockchain data structure, which validates the entire ledger for tampered data and then the chain is replicated to the new node.

 - /consensus
   - GET: When a new node invokes the /consensus endpoint, data [chain] from all the nodes are analyzed, longest chain is 	    taken into account and validated against the isChainValid method. The isChainValid analyses the entire chain for 	       correctness and then adds the chain to this new node. This makes the new node own the exact data as the other 		  nodes over the network.
   
This completes the core blockchain implementation using JS. The next section will discuss on implementing a UI to visualize the ledger data on a web interface and by using filters to view specific data from the ledger.

24/09/2018:

6. Block Explorer - Web Interface to view the ledger based on filters [block hash, transaction Id, address]

The Block Explorer is a UI interface, which eases users to view the blockchain data based on specific filters. The interface invokes specific endpoints to fetch the data from the ledger.

 - /block/:blockHash
   - GET: Querying to this endpoint by passing a specific block's hash will return the block data.
   
 - /transaction/:transactionId
   - GET: Querying to this endpoint by passing a specific transaction id will return the block data.
   
 - /address/:address
   - GET: Querying to this endpoint by passing a sender/ receiver address will return the relevant transactions and also 	   displays the balance of the specific address.

The code has detailed comments added to every section, to express clarity and functionality.

This is an ongoing PoC and the src files will be updated as and when the changes are tested.

For any queries, feel free to mail to rajapandianc@outlook.in

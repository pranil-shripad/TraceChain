Block - A block is a unit of data storage which is used to store multiple transactions into one, transactions may vary from dozens to hundreds.

Hashes - Hashes are fixed size cryptographic value that are generated from the input data of block, it is generated based on data, nonce, prev. hash, timestamp, etc.

Consensus - Consensus is a mechanism in blockchain which is used to verify transactions over a blockchain network in which all the nodes in blockchain network agree on the validity of transaction and current state of blockchain.

+----------------------+
| 1. Transaction       |
|    Creation          |
| (User creates TX)    |
+----------+-----------+
           |
           v
+----------------------+
| 2. Transaction       |
|    Broadcast         |
| Sent to network      |
| nodes                |
+----------+-----------+
           |
           v
+----------------------+
| 3. Transaction       |
|    Validation        |
| Nodes verify         |
| signature & balance  |
+----------+-----------+
           |
           v
+----------------------+
| 4. Added to Mempool  |
| Waiting to be        |
| included in a block  |
+----------+-----------+
           |
           v
+----------------------+
| 5. Block Creation    |
| Miner/Validator      |
| adds TX to block     |
+----------+-----------+
           |
           v
+----------------------+
| 6. Consensus         |
| Network agrees on    |
| the block            |
+----------+-----------+
           |
           v
+----------------------+
| 7. Block Added to    |
| Blockchain           |
+----------+-----------+
           |
           v
+----------------------+
| 8. Transaction       |
| Confirmed            |
+----------------------+
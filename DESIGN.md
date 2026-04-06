Section 1 — The Product struct
What uniquely identifies a product? - productId (uint256)
Where is the rich metadata like name and image stored? - IPFS CID on-chain and actual name/image lives on IPFS on-chain - metadataCID (string)
Who currently owns this product at any point in the supply chain? currentOwner (address)
What is the current stage of the product's journey? - Status enum
When was it first created? - block.timestamp (uint256)


Section 2 — The Status enum
Created → Packed → InTransit → Delivered


Section 3 — The StatusUpdate struct
What was the new status? - Status enum (Created / Shipped / InTransit / Delivered / Cancelled)
Who made the update? - address updatedBy
Where was the product at that point? - (string - city name)
When did it happen? - block.timestamp (uint256)

Section 4 — The roles
Who creates products? - MANUFACTURER_ROLE
Who moves them between locations? - DISTRIBUTOR_ROLE
Who receives them at the end? - RETAILER_ROLE

Section 5 — Function signatures
A function to create a new product
    func : createProduct(string memory metadataCID) returns (uint256)
A function to update a product's status
    func : updateStatus(uint256 id, Status status, string memory location)
A function to transfer ownership to another address
    func : transferOwnership(uint256 id, address newOwner)
A function to read a product's full history
    func : getHistory(uint256 id) returns (StatusUpdate[] memory)


Section 6 — ASCII flowchart
    Manufacturer
     │
     │ createProduct(metadataCID)
     ▼
  [Created] ──────────────────────────────┐
     │                                    │
     │ updateStatus(id, InTransit, city)  │
     ▼                                    │
 [InTransit]                              │
     │                                    │ transferOwnership()
     │ updateStatus(id, Packed, city)     │ at each handoff
     ▼                                    │
  [Packed]                                │
     │                                    │
     │ updateStatus(id, Delivered, city)  │
     ▼                                    │
[Delivered] ◄───────────────────────────--┘

### DATA FLOW
                 ┌──────────────────────────┐
                 │   Developer / Frontend   │
                 └────────────┬─────────────┘
                              │
                              │ 1. Upload metadata JSON
                              │    { name, origin, batchId, image }
                              ▼
                 ┌──────────────────────────┐
                 │       Pinata API         │
                 └────────────┬─────────────┘
                              │
                              │ 2. Returns CID (Qm...)
                              ▼
                 ┌──────────────────────────┐
                 │   scripts/interact.js    │
                 └────────────┬─────────────┘
                              │
                              │ 3. createProduct(CID)
                              ▼
                 ┌──────────────────────────┐
                 │   SupplyChain.sol        │
                 │   (Polygon Mumbai)       │
                 └────────────┬─────────────┘
                              │
                              │ 4. Store on-chain:
                              │    - productId
                              │    - metadataCID
                              │    - owner
                              │    - status
                              ▼
                 ┌──────────────────────────┐
                 │        Blockchain        │
                 │   (Immutable Record)     │
                 └────────────┬─────────────┘
                              │
                              │ 5. Read Request: products(id)
                              ▼
                 ┌──────────────────────────┐
                 │   SupplyChain.sol        │
                 └────────────┬─────────────┘
                              │
                              │ 6. Returns:
                              │    { productId, metadataCID,
                              │      owner, status }
                              ▼
                 ┌──────────────────────────┐
                 │   Frontend / Script      │
                 └────────────┬─────────────┘
                              │
                              │ 7. Fetch metadata:
                              │    /ipfs/{CID}
                              ▼
                 ┌──────────────────────────┐
                 │     IPFS (via Pinata)    │
                 └────────────┬─────────────┘
                              │
                              │ 8. Returns full JSON metadata
                              ▼
                 ┌──────────────────────────┐
                 │      Display to User     │
                 └──────────────────────────┘
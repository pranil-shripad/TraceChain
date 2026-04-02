// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";


contract SupplyChain is AccessControl {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTER_ROLE = keccak256("DISTRIBUTER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    enum Status { Created, Shipped, InTransit, Delivered, Cancelled }

    struct Product{
            uint256 productId;
            string metadataCID;
            address manufacturer;
            Status status;
            uint256 createdAt;
            address currentOwner;
    }

    struct StatusUpdate{
        Status newStatus;
        address updatedBy;
        string location;
        uint256 timestamp;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => StatusUpdate[]) public history;

    uint256 private _nextId = 1;
    event ProductCreated(uint256 indexed productId, address indexed manufacturer, string metadataCID);
    event StatusUpdated(uint256 indexed productId, Status status, string location, address updatedBy);
    event OwnershipTransferred(uint256 indexed productId, address oldOwner, address newOwner);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createProduct(string calldata metadataCID) external onlyRole(MANUFACTURER_ROLE) returns (uint256){
        uint256 productId = _nextId;
        _nextId++;
        products[productId] = Product({
            productId: productId,
            metadataCID: metadataCID,
            manufacturer: msg.sender,
            status: Status.Created,
            createdAt: block.timestamp,
            currentOwner: msg.sender
        });

        history[productId].push(StatusUpdate({newStatus: Status.Created, updatedBy: msg.sender, location: "Origin", timestamp: block.timestamp}));

        emit ProductCreated(productId, msg.sender, metadataCID);
        return productId;


    }

    function updateStatus(uint256 productId, Status status, string memory location) external {
        require(products[productId].currentOwner == msg.sender, "You are not the owner!");
        products[productId].status = status;
        history[productId].push(StatusUpdate({newStatus: status, updatedBy: msg.sender, location: location, timestamp: block.timestamp}));
        emit StatusUpdated(productId, status, location, msg.sender);
    }

    function transferOwnership(uint256 productId, address newOwner) external{
        require(products[productId].currentOwner == msg.sender, "Only the current owner can transfer this item.");
        require(newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = products[productId].currentOwner;
        products[productId].currentOwner = newOwner;
        emit OwnershipTransferred(productId, oldOwner, newOwner);
    }

    function getHistory(uint256 productId) external view returns (StatusUpdate[] memory){
        return history[productId];
    }
}
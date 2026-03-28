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
    mapping(uint256 => Product) public products;

    uint256 private _nextId = 1;
    event ProductCreated(uint256 indexed productId, address indexed manufacturer, string metadataCID);

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

        emit ProductCreated(productId, msg.sender, metadataCID);
        return productId;


    }
}
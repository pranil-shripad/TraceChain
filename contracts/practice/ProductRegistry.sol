// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

contract ProductRegistry {
    struct Product{
        uint256 id;
        string name;
        string origin;
        address manufacturer;
        uint256 createdAt;
}

uint256 private _nextId = 1;
mapping(uint256 => Product) public products;

event ProductCreated(uint256 indexed id, address indexed manufacturer, string name);

function createProduct(string memory name, string memory origin) public returns (uint){
    uint id = _nextId;
    _nextId++;

    products[id] = Product({
        id : id,
        name : name,
        origin : origin,
        manufacturer : msg.sender,
        createdAt : block.timestamp
    });

    emit ProductCreated(id, msg.sender, name);

    return id;
}
}
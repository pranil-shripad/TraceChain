// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProductRegistry {
    struct Product{
        uint256 id;
        string name;
        string origin;
        address manufacturer;
        uint256 createdAt;
}

address public owner;
uint256 private _nextId = 1;
mapping(uint256 => Product) public products;

event ProductCreated(uint256 indexed id, address indexed manufacturer, string name);

constructor() {
    owner = msg.sender;
}

modifier onlyOwner(){
    require(msg.sender == owner, "Not the contract owner!");
    _;
}

function createProduct(string memory name, string memory origin) public onlyOwner returns (uint){
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
function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0), "New owner cannot be zero address");
    owner = newOwner;
}

function getProduct(uint id) public view returns (Product memory){
    require(products[id].id != 0, "Product does not exist");
    return products[id];
}
}
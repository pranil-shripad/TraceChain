# TraceChain — Progress Journal

---

## Week 1 — Blockchain Basics + Solidity Fundamentals

### What I built each day
- **Day 1** — Set up GitHub repo, folder structure, README and .gitignore
- **Day 2** — Installed Hardhat, initialised the project, confirmed compile and test work
- **Day 3** — Read Ethereum docs, wrote blockchain notes, set up MetaMask and got test MATIC
- **Day 4** — Wrote Counter.sol and SimpleVault.sol in Remix, deployed to in-browser VM
- **Day 5** — Wrote ProductRegistry.sol with a Product struct, mapping, and ProductCreated event
- **Day 6** — Added owner state variable, constructor, onlyOwner modifier and transferOwnership function
- **Day 7** — Updated README, created this progress file, reviewed all Week 1 work

### Hardest concept this week
 - Modifiers confused me at first — I didn't understand what the _; line did
 - Mappings was hard to understand.
 - Constructor in solidity was new to understand


### What clicked for me
<!-- Example: Once I saw msg.sender in action in Remix it all made sense -->


### What I want to revisit
 - I want to understand memory vs storage more deeply before Week 2 
 - Understand modifier and constructor fully.

---

## Week 2 — Main Contract + Tests

### What I built each day
- **Day 8** — Hardhat testing basics
                Learned the structure of a Hardhat test file — describe, it, beforeEach. Wrote your first tests for Counter.sol. Learned how to deploy a contract inside beforeEach so every test gets a fresh instance. Used expect().to.equal() for basic assertions.

- **Day 9** — Testing ProductRegistry, Wrote three tests for ProductRegistry.sol. Also learned that contract.connect(otherAccount) lets you call a function from a different wallet in tests.

- **Day 10** — Gas profiling + Hardhat Console
Added hardhat-gas-reporter to see how much gas each function costs. Learned that storage writes are expensive and reading is cheap. Opened the Hardhat console and interacted with a deployed contract manually by typing commands — like a REPL for your blockchain.

- **Day 11** — Designed the data model. Created DESIGN.md — the blueprint for SupplyChain.sol
- **Day 12** — Scaffolded SupplyChain.sol Set up the main contract skeleton
- **Day 13** — Implemented createProduct() Wrote the first real function in SupplyChain.sol
- **Day 14** — Implemented updateStatus() + tests, Wrote the second function updateStatus()

### Hardest concept this week
- Writing hardhat tests

### What I want to revisit
- Learn how does contract.connect work.

---

## Week 3 — IPFS Integration + Deploy Scripts

### What I built each day
- **Day 15** — Implemented product ownership transfer and on-chain history tracking
- **Day 16** — Built a complete end-to-end test suite with edge cases
- **Day 17** — Created deploy and interaction scripts for local blockchain
- **Day 18** — Learned IPFS fundamentals and set up Pinata
- **Day 19** — Built script to upload (pin) metadata to IPFS via API
- **Day 20** — Integrated IPFS with smart contract (full off-chain + on-chain flow)
- **Day 21** — Reviewed system and documented full architecture & flow

### Hardest concept this week
Understanding how IPFS and blockchain connect asynchronously—especially how off-chain data (metadata) stays trustworthy using just a CID on-chain.


### What I want to revisit
- Writing clean, production-level test cases (edge cases + coverage)
- Deep understanding of IPFS internals (content addressing, pinning, gateways)
- Structuring scripts for better modularity and reuse

---

## Week 4 — React Frontend

### What I built each day
- **Day 22** —
- **Day 23** —
- **Day 24** —
- **Day 25** —
- **Day 26** —
- **Day 27** —
- **Day 28** —

### Hardest concept this week


### What clicked for me


### What I want to revisit

---

## Week 5 — Testnet Deployment

### What I built each day
- **Day 29** —
- **Day 30** —
- **Day 31** —
- **Day 32** —
- **Day 33** —
- **Day 34** —
- **Day 35** —

### Hardest concept this week


### What clicked for me


### What I want to revisit

---

## Week 6 — Polish + Features

### What I built each day
- **Day 36** —
- **Day 37** —
- **Day 38** —
- **Day 39** —
- **Day 40** —
- **Day 41** —
- **Day 42** —

### Hardest concept this week


### What clicked for me


### What I want to revisit

---

## Final Weeks — Ship It

### What I built each day
- **Day 43** —
- **Day 44** —
- **Day 45** —
- **Day 46** —
- **Day 47** —
- **Day 48** —

### Hardest concept this week


### What clicked for me


### What I want to revisit

---

## Overall Retrospective
> Fill this in on Day 56

### What I'm most proud of


### What I'd do differently


### What I learned that surprised me


### What's next after TraceChain
# FHEVM Rock-Paper-Scissors Hardhat ✊✋✌️

This package contains the smart contract development and deployment setup for the FHEVM Rock-Paper-Scissors project
using Hardhat. It handles installation, compilation, generation of artifacts and types, and deployments.

## Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager

## Installation

Install the package dependencies.

```bash
pnpm install
```

## Configuration

Set the required variables using Hardhat's built-in variable system.

```
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
```

## Compilation

Compile the smart contracts.

```bash
pnpm compile
```

TypeChain types are generated automatically after compilation and are available at `types/`.

## Deployment

Deploy the factory contract that will manage Rock-Paper-Scissors games.

### Local network

Start a local node in one terminal.

```bash
pnpm chain
```

Deploy the factory contract in another terminal.

```bash
pnpm deploy:localhost
```

### Sepolia testnet

Deploy to Sepolia.

```bash
pnpm deploy:sepolia
```

## Documentation

- [Hardhat - Quick Start](../../docs/hardhat-quick-start.md)
- [Hardhat - Technical Reference](../../docs/hardhat-technical-reference.md)

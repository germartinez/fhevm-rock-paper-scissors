# FHEVM Rock-Paper-Scissors SDK ✊✋✌️

This package contains the TypeScript SDK to interact with the FHEVM Rock-Paper-Scissors smart contracts.

## Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager

## Configuration

Rename the `.env.example` file to `.env`, then set the required environment variables. Ensure the first and second
accounts derived from the `MNEMONIC` have sufficient Sepolia testnet funds to run the tests.

## Installation

Install the package dependencies.

```bash
pnpm install
```

## Compile

In the root folder of the monorepo, compile the smart contracts.

```bash
pnpm hardhat:compile
```

## Build

Build the SDK.

```bash
pnpm build
```

TypeChain types are generated automatically after compilation and are available at `src/types/`.

## Test

Run the SDK tests.

```bash
pnpm test
```

## Documentation

- [SDK - Quick Start](../../docs/sdk-quick-start.md)
- [SDK - Technical Reference](../../docs/sdk-technical-reference.md)

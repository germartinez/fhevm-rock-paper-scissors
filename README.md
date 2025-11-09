# FHEVM Rock-Paper-Scissors ✊✋✌️

## About

A Rock-Paper-Scissors game with Fully Homomorphic Encryption (FHE) enabled Solidity smart contracts using the FHEVM
protocol by Zama.

## Packages

| Package                                                   | Release | Description                                                                                             |
| --------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| [`fhevm-rock-paper-scissors-hardhat`](./packages/hardhat) | `0.1.0` | Hardhat project for the development of the FHEVM Rock-Paper-Scissors smart contracts.                   |
| [`fhevm-rock-paper-scissors`](./packages/sdk)             | `0.1.0` | TypeScript library that facilitates the interaction with the FHEVM Rock-Paper-Scissors smart contracts. |

## Get Started

Execute the following steps from the **root folder** of the monorepo.

### Installation

Install the package dependencies.

```bash
pnpm install
```

### Configuration

Inside the `packages/hardhat/` folder, set the required variables using Hardhat's built-in variable system:

```
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
```

Inside the `packages/sdk/` folder, rename the `.env.example` file to `.env`, then set the required environment
variables. Ensure the first and second accounts derived from the `MNEMONIC` have sufficient Sepolia testnet funds to run
the tests.

### Compilation

Compile the smart contracts.

```bash
pnpm hardhat:compile
```

TypeChain types are generated automatically after compilation and are available at `packages/hardhat/types/` and
`packages/sdk/src/types/`.

### Build

Build the TypeScript SDK.

```bash
pnpm sdk:build
```

### Test

Run the TypeScript SDK tests.

```bash
pnpm sdk:test
```

## Project Structure

```
fhevm-rock-paper-scissors/
├── packages/
│   ├── hardhat/                                  # Hardhat package
│   │   ├── contracts/                            # Smart contract source files
│   │   │   ├── FHERockPaperScissors.sol          # FHEVM Rock-Paper-Scissors contract
│   │   │   └── FHERockPaperScissorsFactory.sol   # FHEVM Rock-Paper-Scissors factory contract
│   │   ├── deploy/                               # Deployment scripts
│   │   ├── tasks/                                # Hardhat custom tasks
│   │   │   ├── FHERockPaperScissors.ts           # FHEVM Rock-Paper-Scissors tasks
│   │   │   └── FHERockPaperScissorsFactory.ts    # FHEVM Rock-Paper-Scissors factory tasks
│   │   ├── hardhat.config.ts                     # Hardhat configuration
│   │   └── package.json                          # Dependencies and scripts
│   └── sdk/                                      # SDK package
│       ├── src/                                  # Source files
│       ├── test/                                 # Test files
│       └── package.json                          # Dependencies and scripts
├── docs/                                         # Documentation and guides
└── package.json                                  # Dependencies and scripts
```

## Available Scripts

| Script                        | Description                                              |
| ----------------------------- | -------------------------------------------------------- |
| `pnpm lint`                   | Run linting checks                                       |
| `pnpm format`                 | Apply Prettier format                                    |
| `pnpm clean`                  | Clean build artifacts                                    |
| `pnpm hardhat:compile`        | Compile all contracts                                    |
| `pnpm hardhat:chain`          | Run a local development chain                            |
| `pnpm hardhat:deploy`         | Deploy all contracts on localhost and generate the types |
| `pnpm hardhat:deploy:sepolia` | Deploy all contracts on Sepolia and generate the types   |
| `pnpm sdk:build`              | Build the TypeScript SDK                                 |
| `pnpm sdk:test`               | Run all SDK tests                                        |

## Documentation

To interact with the FHEVM Rock-Paper-Scissors contracts, you can use either the TypeScript SDK or the Hardhat tasks.

**Quick start guides:**

- [SDK - Quick Start](./docs/sdk-quick-start.md)
- [Hardhat - Quick Start](./docs/hardhat-quick-start.md)

**Technical references:**

- [SDK - Technical Reference](./docs/sdk-technical-reference.md)
- [Hardhat - Technical Reference](./docs/hardhat-technical-reference.md)

## License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](./packages/hardhat/LICENSE) file for
details.

---

**Built with ❤️ by Germán, based on a template from the Zama team**

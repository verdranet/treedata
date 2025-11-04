# VerdraNET (LARP)
> **Disclaimer:** This is a fictional, non-production codebase created for demo/portfolio use. It simulates a carbon reforestation network with mock data, fake endpoints, and illustrative smart-contract stubs.

VerdraNET is a pretend, end‑to‑end stack for tree‑planting + carbon credit tracking. It includes:

- **Mock API** (`/api`) returning fake but plausible telemetry (plots, species, offsets).
- **SDKs** (`/sdk/js`, `/sdk/python`) to consume the mock API + craft mint flows.
- **Contract stubs** (`/contracts/solana`) for an on-chain "TreeNFT" & "GroveVault".
- **CLI** (`/cli`) for local ops (generate plots, mint demo NFTs, calc offsets).
- **Web app** (`/webapp`) a tiny demo dashboard (Vite + React).
- **Data** (`/data`) seeded JSON for groves, plots, satellite snapshots, and offsets.
- **Docs** (`/docs`) diagrams, pseudo-protocols, and the "VerraChain" larp spec.

## Quickstart

```bash
# 1) Start the mock API
cd api && npm i && npm run dev

# 2) Open the demo dashboard
cd ../webapp && npm i && npm run dev

# 3) Try the CLI
cd ../cli && pip install -r requirements.txt
python verra.py grove create --name "Test Grove" --target 10000
python verra.py tree mint --species "Tectona grandis" --plot-id PLOT_001
```

## Fake Concepts

- **TreeNFT**: 1 NFT ↔ 1 tree slot, with GPS + species + growth timeline hash.  
- **GroveVault**: Multisig vault that "routes" carbon revenue to treasury (sim).  
- **OffsetOracle**: Derives offsets from growth curves + satellite NDVI (mock).  
- **VerraChain**: A pretend settlement chain that writes signed receipts from Oracles into Solana notes (no real chain here—see docs/spec).

## Repo Structure

```
/api           Mock Express API with OpenAPI spec
/cli           Python CLI (click) for local ops
/contracts     Solana program stubs (Rust; non-compiling demo ok)
/data          Seed JSON for demo objects
/docs          Protocol notes & diagrams
/sdk/js        TypeScript SDK (fetch-based)
/sdk/python    Python SDK client
/webapp        Vite + React demo dashboard
```

## License
MIT © 2025 VerdraNET (LARP)

# VerdraNET Developer Docs

VerdraNET is an open protocol enabling verifiable, tokenized reforestation data.
It provides APIs, SDKs, and Solana-compatible metadata for sustainable projects.

## Endpoints
- `/groves` → List active groves
- `/offsets` → View aggregated CO₂ data
- `/explorer` → Fetch simulated Solana transactions

## SDK Example (JS)
```ts
import {{ VerdraNet }} from '@verdranet/sdk'
const v = new VerdraNet('http://localhost:8787')
console.log(await v.groves())
```

For more, visit [verdranet.com](https://verdranet.com)

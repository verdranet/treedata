# VerraNET Architecture (LARP)

```
User → WebApp → SDK → Mock API → (Data Store)
                         ↘ Contracts (stubs)
```

- **Proof-of-Plant**: Signed JSON receipts (simulated) referencing GPS, species, timestamp.
- **NDVI Rollups**: Mock calculated greenness index → derives CO₂ sequestration (fake formula).
- **Treasury Split**: GroveVault routes % to `Treasury`, % to `Maintenance`, % to `Community`.

See `docs/protocol.md` for pseudo flows.

# VerraNET Protocol (Pseudo)

## 1. Mint TreeNFT
- Input: plotId, species, planterId
- Output: `TreeNFT` id, metadata URI
- Side effects: writes a "verranet://receipt/<id>" reference into the event log (mock).

## 2. Accrue Offsets
- Oracle sums `kgCO2e` by plot per epoch (30d). Data is mock-calculated.

## 3. Grove Payout
- GroveVault "distributes" credits to treasury (simulation only).

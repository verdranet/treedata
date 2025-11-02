# MintZero
<p align="center">
  <img src="./media/logo-2.jpg" alt="MintZero alternate logo" width="220" />
</p>

> Sustainability at Solana speed — automatically routing creator fees to carbon-remediation partners.

MintZero is a Solana-native donation rail that shuffles through verified environmental NGOs and donates creator fees every few minutes. The dashboard keeps merchants honest: it displays treasury health, upcoming donation countdown, the live shuffle animation, and a transparent ledger of past payouts.

This repository tracks the Next.js 16 prototype that powers the donation console and payout worker. It is a local-first build that uses SQLite for bookkeeping, server actions for orchestrating transfers, and the Helius mainnet RPC for Solana transactions.

## Features

- **Automated donation shuffle** – rotates through the active NGO list and executes a Solana transfer (or mock) at a configurable cadence.
- **Transparent ledger** – records organization, amount, lamports→SOL conversion, random seed, and signature for each donation.
- **Live treasury posture** – aggregates creator fee inflows vs. donations to show available funds and derived CO₂ offsets (0.0042 kg per tx).
- **Configurable NGO directory** – add/update partners with wallet, weight, and metadata, persisted in SQLite.
- **Solana + Helius integration** – signs payouts with the creator authority keypair and broadcasts via the Helius mainnet endpoint.

## Architecture

| Layer | Tech | Purpose |
| --- | --- | --- |
| UI | Next.js 16 App Router, React 19 RC, framer-motion, lucide-react | Three-column layout (stats, shuffle animation, donation ledger) + header/footer |
| Server | Next.js server actions, TypeScript | Triggers donation rotation, reads SQLite state, serves initial dashboard data |
| Persistence | SQLite (better-sqlite3) | Tables for `organizations`, `donations`, `fee_events` |
| Solana | `@solana/web3.js`, Helius RPC | Signs transfers using creator authority and optionally executes them (mockable) |
| Utilities | `bs58`, `classnames`, custom env loader | Keypair parsing, styling helpers, strict environment validation |

_Repository layout_

```text
app/
  actions/            # Server actions (e.g. donation trigger)
  page.tsx            # Dashboard shell (SSR)
  layout.tsx          # HTML scaffold
  globals.css         # Global styles
components/
  header.tsx          # Header with branding + social links
  ...                 # (Upcoming) dashboard widgets
lib/
  db.ts               # SQLite access layer + schema bootstrap
  env.ts              # Environment variable validation
  solana.ts           # Helius connection + transfer helper
  constants.ts        # Domain constants (lamports, offsets)
scripts/
  seed.ts             # (Planned) CLI seeding utility for NGOs
```

## Prerequisites

- Node.js 20+
- npm (default). You can swap in pnpm or yarn, but update scripts accordingly.
- A Helius mainnet API key and Solana keypair with sufficient SOL for donations.

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Bootstrap the database (optional)**
   _Seed script is pending_; for now insert records via the SQLite CLI or custom script.

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   The dashboard will be available at <http://localhost:3000>.

4. **Lint (optional)**
   ```bash
   npm run lint
   ```

## Environment configuration

Copy `.env.example` to `.env.local` and provide real values.

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_PATH` | Location for the SQLite database file | `./data/mintzero.db` |
| `DONATION_INTERVAL_SECONDS` | Donation cadence (UI countdown + worker) | `120` |
| `DONATION_CHUNK_LAMPORTS` | Lamports transferred per donation | `5000000` |
| `SOLANA_RPC_URL` | Helius RPC endpoint (include API key query param) | `https://mainnet.helius-rpc.com/?api-key=...` |
| `HELIUS_API_KEY` | Helius API key (redundant but useful for secondary calls) | `abc123` |
| `SOLANA_CREATOR_AUTHORITY_KEYPAIR` | Absolute path or base58 secret for the treasury authority | `/Users/me/.config/solana/id.json` |
| `SOLANA_TREASURY_PUBLIC_KEY` | Public key that holds creator fees | `Fp...xyz` |
| `SOLANA_DONATION_PROGRAM_ID` | (Optional) Program that should receive CPI calls | `3xp...` |
| `SOLANA_COMMITMENT` | Commitment level for RPC calls | `confirmed` |
| `PROJECT_NAME` | Display name in the UI header | `MintZero` |
| `PROJECT_CA_ADDRESS` | Human-readable creator authority string for the header | `Fp...xyz` |
| `PROJECT_TWITTER_URL` | Social link used in the header | `https://twitter.com/mintzero` |
| `PROJECT_PUMPFUN_URL` | Social link used in the header | `https://pump.fun/mintzero` |
| `PROJECT_LOGO_URL` | (Optional) URL for the header logo | `https://mintzero.org/logo.svg` |
| `DONATION_MOCK_MODE` | Toggle real Solana transfers (`false` disables mocking) | `true` |

> **Security** – never commit populated `.env` files or raw keypairs. The creator authority should be provisioned via secure secrets management in production.

## Database schema

```sql
-- organizations
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
description TEXT NOT NULL,
wallet_address TEXT NOT NULL,
website_url TEXT,
logo_url TEXT,
status TEXT NOT NULL DEFAULT 'active',
weight REAL NOT NULL DEFAULT 1,
created_at TEXT DEFAULT CURRENT_TIMESTAMP,
updated_at TEXT DEFAULT CURRENT_TIMESTAMP

-- donations
id INTEGER PRIMARY KEY AUTOINCREMENT,
org_id INTEGER NOT NULL REFERENCES organizations(id),
amount_lamports INTEGER NOT NULL,
tx_signature TEXT,
random_seed TEXT NOT NULL,
created_at TEXT DEFAULT CURRENT_TIMESTAMP

-- fee_events
id INTEGER PRIMARY KEY AUTOINCREMENT,
amount_lamports INTEGER NOT NULL,
source TEXT NOT NULL,
created_at TEXT DEFAULT CURRENT_TIMESTAMP
```

## Donation flow

1. Fee events accumulate in the treasury (seeded manually for now).
2. Every interval the donation action:
   - Selects a random active NGO (weighted support coming soon).
   - Sends lamports via `@solana/web3.js` + Helius (or returns a mock signature).
   - Inserts a donation row + updates the UI ledger.
3. The dashboard displays:
   - **Left column** – countdown timer, treasury balance (SOL + total offset), active org count.
   - **Center** – card shuffle animation revealing the chosen NGO once the transfer executes.
   - **Right** – donation ledger with signature links and timestamp.

## Roadmap

- [ ] Implement the shuffle animation component and real-time state updates.
- [ ] Build the countdown + interval scheduler (cron worker or edge timer).
- [ ] Add NGO management UI and seed script at `scripts/seed.ts`.
- [ ] Expand Solana integration with signature links (e.g., Solscan) and error telemetry.
- [ ] Harden unit/integration testing around donation selection and treasury math.

## Contributing

1. Fork + branch from `main`.
2. Keep changes focused; run `npm run lint` before submitting.
3. Document environment requirements for any new feature (env vars or migrations).

## References

- [MintZero Site](https://mintzero.org/)
- [NetZERO Documentation](https://mintzero.gitbook.io/mintzero-docs/)

---

_MintZero is an experimental sustainability protocol. All current transactions run in simulation mode while integrations, audits, and NGO partnerships solidify._

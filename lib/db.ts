import Database from "better-sqlite3";
import path from "node:path";
import process from "node:process";
import { env } from "./env";

export const LAMPORTS_PER_SOL = 1_000_000_000;

type OrganizationRow = {
  id: number;
  name: string;
  description: string;
  wallet_address: string;
  website_url: string | null;
  logo_url: string | null;
  status: "active" | "inactive";
  weight: number;
  created_at: string;
  updated_at: string;
};

type DonationRow = {
  id: number;
  org_id: number;
  amount_lamports: number;
  tx_signature: string | null;
  random_seed: string;
  created_at: string;
};

type FeeEventRow = {
  id: number;
  amount_lamports: number;
  source: string;
  created_at: string;
};

export type Organization = {
  id: number;
  name: string;
  description: string;
  walletAddress: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  weight: number;
  status: "active" | "inactive";
};

export type Donation = {
  id: number;
  organization: Organization;
  amountLamports: number;
  amountSol: number;
  txSignature: string | null;
  randomSeed: string;
  createdAt: string;
};

let database: Database | null = null;

function resolveDatabasePath(): string {
  if (path.isAbsolute(env.DATABASE_PATH)) {
    return env.DATABASE_PATH;
  }
  return path.resolve(process.cwd(), env.DATABASE_PATH);
}

function prepareDatabase(): Database {
  if (database) {
    return database;
  }

  const dbPath = resolveDatabasePath();
  database = new Database(dbPath);
  database.pragma("journal_mode = WAL");

  database.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      wallet_address TEXT NOT NULL,
      website_url TEXT,
      logo_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      weight REAL NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER NOT NULL REFERENCES organizations(id),
      amount_lamports INTEGER NOT NULL,
      tx_signature TEXT,
      random_seed TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fee_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount_lamports INTEGER NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return database;
}

function mapOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    walletAddress: row.wallet_address,
    websiteUrl: row.website_url,
    logoUrl: row.logo_url,
    weight: row.weight,
    status: row.status
  };
}

export function allOrganizations(): Organization[] {
  const db = prepareDatabase();
  const rows = db
    .prepare<[], OrganizationRow>(
      `SELECT * FROM organizations WHERE status = 'active' ORDER BY name ASC`
    )
    .all();

  return rows.map(mapOrganization);
}

export type DonationJoinedRow = DonationRow & {
  org_id: number;
  org_name: string;
  org_description: string;
  org_wallet_address: string;
  org_website_url: string | null;
  org_logo_url: string | null;
  org_weight: number;
  org_status: "active" | "inactive";
};

export function donationLedger(limit = 10): Donation[] {
  const db = prepareDatabase();
  const rows = db
    .prepare<[number], DonationJoinedRow>(
      `SELECT
        d.id,
        d.org_id,
        d.amount_lamports,
        d.tx_signature,
        d.random_seed,
        d.created_at,
        o.name AS org_name,
        o.description AS org_description,
        o.wallet_address AS org_wallet_address,
        o.website_url AS org_website_url,
        o.logo_url AS org_logo_url,
        o.weight AS org_weight,
        o.status AS org_status
      FROM donations d
      JOIN organizations o ON o.id = d.org_id
      ORDER BY d.created_at DESC
      LIMIT ?`
    )
    .all(limit) as DonationJoinedRow[];

  return rows.map((row: DonationJoinedRow) => ({
    id: row.id,
    organization: {
      id: row.org_id,
      name: row.org_name,
      description: row.org_description,
      walletAddress: row.org_wallet_address,
      websiteUrl: row.org_website_url,
      logoUrl: row.org_logo_url,
      weight: row.org_weight,
      status: row.org_status
    },
    amountLamports: row.amount_lamports,
    amountSol: row.amount_lamports / LAMPORTS_PER_SOL,
    txSignature: row.tx_signature,
    randomSeed: row.random_seed,
    createdAt: row.created_at
  }));
}

export function lastDonation(): Donation | null {
  const ledger = donationLedger(1);
  return ledger.length > 0 ? ledger[0] : null;
}

export function treasuryBalanceLamports(): number {
  const db = prepareDatabase();
  const feeTotal = db
    .prepare<[], FeeEventRow>(
      `SELECT COALESCE(SUM(amount_lamports), 0) as total FROM fee_events`
    )
    .get() as unknown as { total: number };

  const donationTotal = db
    .prepare<[], DonationRow>(
      `SELECT COALESCE(SUM(amount_lamports), 0) as total FROM donations`
    )
    .get() as unknown as { total: number };

  const balance = (feeTotal?.total ?? 0) - (donationTotal?.total ?? 0);
  return balance > 0 ? balance : 0;
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function insertOrganization(data: {
  name: string;
  description: string;
  walletAddress: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  weight?: number;
  status?: "active" | "inactive";
}): Organization {
  const db = prepareDatabase();
  const stmt = db.prepare(
    `INSERT INTO organizations (name, description, wallet_address, website_url, logo_url, weight, status)
     VALUES (@name, @description, @wallet_address, @website_url, @logo_url, @weight, @status)`
  );

  const info = stmt.run({
    name: data.name,
    description: data.description,
    wallet_address: data.walletAddress,
    website_url: data.websiteUrl ?? null,
    logo_url: data.logoUrl ?? null,
    weight: data.weight ?? 1,
    status: data.status ?? "active"
  });

  const inserted = db
    .prepare<[{ id: number }], OrganizationRow | undefined>(
      `SELECT * FROM organizations WHERE id = @id`
    )
    .get({ id: Number(info.lastInsertRowid) });

  if (!inserted) {
    throw new Error("Failed to retrieve inserted organization");
  }

  return mapOrganization(inserted);
}

export function insertFeeEvent(data: {
  amountLamports: number;
  source: string;
}): void {
  const db = prepareDatabase();
  db.prepare(
    `INSERT INTO fee_events (amount_lamports, source) VALUES (@amountLamports, @source)`
  ).run({
    amountLamports: data.amountLamports,
    source: data.source
  });
}

export function insertDonation(data: {
  orgId: number;
  amountLamports: number;
  txSignature?: string | null;
  randomSeed: string;
}): void {
  const db = prepareDatabase();
  db.prepare(
    `INSERT INTO donations (org_id, amount_lamports, tx_signature, random_seed)
     VALUES (@org_id, @amount_lamports, @tx_signature, @random_seed)`
  ).run({
    org_id: data.orgId,
    amount_lamports: data.amountLamports,
    tx_signature: data.txSignature ?? null,
    random_seed: data.randomSeed
  });
}

export function databaseInstance() {
  return prepareDatabase();
}

const requiredEnvVars = [
  "DATABASE_PATH",
  "DONATION_INTERVAL_SECONDS",
  "DONATION_CHUNK_LAMPORTS",
  "SOLANA_RPC_URL",
  "HELIUS_API_KEY",
  "SOLANA_CREATOR_AUTHORITY_KEYPAIR",
  "SOLANA_TREASURY_PUBLIC_KEY",
  "SOLANA_COMMITMENT",
  "PROJECT_NAME",
  "PROJECT_TWITTER_URL",
  "PROJECT_PUMPFUN_URL",
  "PROJECT_CA_ADDRESS"
] as const;

type RequiredEnvKey = (typeof requiredEnvVars)[number];

function readOptionalEnv(name: string): string | null {
  return process.env[name] ?? null;
}

function parseOptionalBoolean(value: string | null, fallback: boolean): boolean {
  if (value == null) {
    return fallback;
  }
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function readEnv(name: RequiredEnvKey): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const donationIntervalRaw = readEnv("DONATION_INTERVAL_SECONDS");
const donationChunkRaw = readEnv("DONATION_CHUNK_LAMPORTS");

const donationInterval = Number(donationIntervalRaw);
if (Number.isNaN(donationInterval) || donationInterval <= 0) {
  throw new Error("DONATION_INTERVAL_SECONDS must be a positive number");
}

let donationChunk: bigint;
try {
  donationChunk = BigInt(donationChunkRaw);
} catch {
  throw new Error("DONATION_CHUNK_LAMPORTS must be a valid bigint string");
}

const env = {
  DATABASE_PATH: readEnv("DATABASE_PATH"),
  DONATION_INTERVAL_SECONDS: donationInterval,
  DONATION_CHUNK_LAMPORTS: donationChunk,
  SOLANA_RPC_URL: readEnv("SOLANA_RPC_URL"),
  HELIUS_API_KEY: readEnv("HELIUS_API_KEY"),
  SOLANA_CREATOR_AUTHORITY_KEYPAIR: readEnv(
    "SOLANA_CREATOR_AUTHORITY_KEYPAIR"
  ),
  SOLANA_TREASURY_PUBLIC_KEY: readEnv("SOLANA_TREASURY_PUBLIC_KEY"),
  SOLANA_COMMITMENT: readEnv("SOLANA_COMMITMENT"),
  SOLANA_DONATION_PROGRAM_ID: readOptionalEnv("SOLANA_DONATION_PROGRAM_ID"),
  PROJECT_NAME: readEnv("PROJECT_NAME"),
  PROJECT_TWITTER_URL: readEnv("PROJECT_TWITTER_URL"),
  PROJECT_PUMPFUN_URL: readEnv("PROJECT_PUMPFUN_URL"),
  PROJECT_CA_ADDRESS: readEnv("PROJECT_CA_ADDRESS"),
  PROJECT_LOGO_URL: readOptionalEnv("PROJECT_LOGO_URL"),
  DONATION_MOCK_MODE: parseOptionalBoolean(readOptionalEnv("DONATION_MOCK_MODE"), false)
};

export type AppEnv = typeof env;

export { env };

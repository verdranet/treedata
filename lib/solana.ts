import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Commitment
} from "@solana/web3.js";
import bs58 from "bs58";

import { env } from "./env";

let connection: Connection | null = null;
let creatorAuthority: Keypair | null = null;

function resolveKeypairPath(value: string): string {
  if (path.isAbsolute(value)) {
    return value;
  }

  // Handle relative paths when running in ESM contexts (Next.js app dir)
  const cwd = process.cwd();
  return path.resolve(cwd, value);
}

function loadKeypairFromFile(filePath: string): Keypair {
  const resolved = resolveKeypairPath(filePath);
  const contents = fs.readFileSync(resolved, "utf8");
  const trimmed = contents.trim();

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      throw new Error("Keypair JSON must be an array of numbers");
    }
    const secretKey = Uint8Array.from(parsed);
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    throw new Error(`Failed to parse keypair file at ${resolved}: ${(error as Error).message}`);
  }
}

function loadKeypairFromBase58(encoded: string): Keypair {
  try {
    const secretKey = bs58.decode(encoded);
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    throw new Error(`Failed to parse base58 keypair: ${(error as Error).message}`);
  }
}

function createConnection(): Connection {
  if (connection) {
    return connection;
  }

  const commitment = env.SOLANA_COMMITMENT as Commitment;
  connection = new Connection(env.SOLANA_RPC_URL, {
    commitment,
    disableRetryOnRateLimit: false
  });

  return connection;
}

function loadCreatorAuthority(): Keypair {
  if (creatorAuthority) {
    return creatorAuthority;
  }

  const keySource = env.SOLANA_CREATOR_AUTHORITY_KEYPAIR;

  if (fs.existsSync(resolveKeypairPath(keySource))) {
    creatorAuthority = loadKeypairFromFile(keySource);
    return creatorAuthority;
  }

  creatorAuthority = loadKeypairFromBase58(keySource);
  return creatorAuthority;
}

export async function sendDonationLamports(
  destination: string,
  amountLamports: number
): Promise<string> {
  if (env.DONATION_MOCK_MODE) {
    return `mock-${Date.now().toString(36)}`;
  }

  const connection = createConnection();
  const authority = loadCreatorAuthority();
  const destinationPubkey = new PublicKey(destination);
  const treasuryPubkey = new PublicKey(env.SOLANA_TREASURY_PUBLIC_KEY);

  if (!authority.publicKey.equals(treasuryPubkey)) {
    throw new Error(
      "Creator authority keypair does not match SOLANA_TREASURY_PUBLIC_KEY"
    );
  }

  const latestBlockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: authority.publicKey,
    recentBlockhash: latestBlockhash.blockhash
  }).add(
    SystemProgram.transfer({
      fromPubkey: authority.publicKey,
      toPubkey: destinationPubkey,
      lamports: amountLamports
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [authority], {
    skipPreflight: false,
    commitment: env.SOLANA_COMMITMENT as Commitment
  });

  return signature;
}

export function getSolanaConnection(): Connection {
  return createConnection();
}

export function getCreatorAuthority(): Keypair {
  return loadCreatorAuthority();
}

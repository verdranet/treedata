"use server";

import { randomBytes, randomInt } from "node:crypto";
import { env } from "@/lib/env";
import {
  allOrganizations,
  donationLedger,
  insertDonation,
  lamportsToSol,
  Organization,
  treasuryBalanceLamports
} from "@/lib/db";
import { sendDonationLamports } from "@/lib/solana";

export type DonationActionResult = {
  selectedOrganization: Organization;
  donationAmountLamports: number;
  donationSeed: string;
  ledger: ReturnType<typeof donationLedger>;
  treasuryLamports: number;
  treasurySol: number;
  organizations: Organization[];
  mockMode: boolean;
  signature: string | null;
};

export async function performDonation(): Promise<DonationActionResult> {
  const organizations = allOrganizations();
  if (organizations.length === 0) {
    throw new Error("No organizations available for donations. Add one to begin the rotation.");
  }

  const donationAmount = Number(env.DONATION_CHUNK_LAMPORTS);
  if (Number.isNaN(donationAmount) || donationAmount <= 0) {
    throw new Error("DONATION_CHUNK_LAMPORTS must resolve to a positive numeric value.");
  }

  const treasuryBalance = treasuryBalanceLamports();
  if (treasuryBalance < donationAmount) {
    throw new Error("Insufficient treasury balance to execute donation interval.");
  }

  const selectedIndex = randomInt(0, organizations.length);
  const selectedOrganization = organizations[selectedIndex];
  const donationSeed = randomBytes(12).toString("hex");

  let signature: string | null = null;
  try {
    signature = await sendDonationLamports(
      selectedOrganization.walletAddress,
      donationAmount
    );
  } catch (error) {
    throw new Error(
      `Donation transfer failed: ${(error as Error).message}`
    );
  }

  insertDonation({
    orgId: selectedOrganization.id,
    amountLamports: donationAmount,
    randomSeed: donationSeed,
    txSignature: signature
  });

  const ledger = donationLedger(8);
  const updatedTreasury = treasuryBalanceLamports();

  return {
    selectedOrganization,
    donationAmountLamports: donationAmount,
    donationSeed,
    ledger,
    treasuryLamports: updatedTreasury,
    treasurySol: lamportsToSol(updatedTreasury),
    organizations: allOrganizations(),
    mockMode: env.DONATION_MOCK_MODE,
    signature
  };
}

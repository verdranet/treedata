import { Suspense } from "react";
import { env } from "@/lib/env";
import {
  allOrganizations,
  donationLedger,
  lamportsToSol,
  lastDonation,
  treasuryBalanceLamports
} from "@/lib/db";
import { Dashboard } from "@/components/dashboard";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

function buildInitialState() {
  const organizations = allOrganizations();
  const ledger = donationLedger(8);
  const treasuryLamports = treasuryBalanceLamports();
  const previousDonation = lastDonation();

  return {
    organizations,
    ledger,
    treasuryLamports,
    treasurySol: lamportsToSol(treasuryLamports),
    previousDonation,
    donationIntervalSeconds: env.DONATION_INTERVAL_SECONDS
  };
}

export default function Page() {
  const initialState = buildInitialState();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <Header />
      <Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
        <Dashboard initialState={initialState} />
      </Suspense>
      <Footer />
    </main>
  );
}

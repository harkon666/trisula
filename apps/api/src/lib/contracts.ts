import { join, resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";

/**
 * Helper untuk mengambil alamat kontrak hasil deployment Ignition secara otomatis.
 * Ini memastikan Orchestrator selalu menggunakan "Source of Truth" terbaru.
 */
export const getContractAddresses = () => {
    // Default fallback to localhost if not set
    const chainId = process.env.CHAIN_ID || "31337";
    const chainDir = `chain-${chainId}`;

    // Resolve path relative to this file location provided by Bun
    // File ini ada di apps/api/src/lib/contracts.ts
    // Kita mau ke packages/contracts/ignition/deployments
    // Naik: lib -> src -> api -> apps -> root -> packages -> contracts ...
    const DEPLOYMENT_PATH = resolve(
        import.meta.dir,
        "../../../../packages/contracts/ignition/deployments",
        chainDir,
        "deployed_addresses.json"
    );

    if (!existsSync(DEPLOYMENT_PATH)) {
        console.warn(`⚠️ File deployment tidak ditemukan di ${DEPLOYMENT_PATH}. Pastikan sudah menjalankan 'ignition deploy' untuk chain ${chainId}.`);
        return null;
    }

    try {
        const rawData = readFileSync(DEPLOYMENT_PATH, "utf-8");
        const data = JSON.parse(rawData);

        return {
            registry: data["TrisulaModule#TrisulaReferralRegistry"],
            ledger: data["TrisulaModule#TrisulaPointsLedger"],
            redeem: data["TrisulaModule#TrisulaRedeemLog"],
        };
    } catch (error) {
        console.error("❌ Gagal membaca deployed_addresses.json:", error);
        return null;
    }
};
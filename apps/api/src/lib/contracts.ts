import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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
    // Resolve path compatible for both Bun and Node.js
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Naik: lib -> src -> api -> apps -> root -> packages -> contracts ...
    const DEPLOYMENT_PATH = resolve(
        __dirname,
        "../../../../packages/contracts/ignition/deployments",
        chainDir,
        "deployed_addresses.json"
    );

    console.log(`[Contracts] Attempting to load from: ${DEPLOYMENT_PATH}`);

    if (!existsSync(DEPLOYMENT_PATH)) {
        console.warn(`⚠️ File deployment tidak ditemukan di ${DEPLOYMENT_PATH}. Pastikan sudah menjalankan 'ignition deploy' untuk chain ${chainId}.`);
        // Fallback or Return Null without crashing
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
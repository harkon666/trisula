import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";

/**
 * Helper untuk mengambil alamat kontrak hasil deployment Ignition secara otomatis.
 * Ini memastikan Orchestrator selalu menggunakan "Source of Truth" terbaru.
 */
export const getContractAddresses = () => {
    // Lokasi folder deployment Ignition (asumsi network localhost/31337)
    // Sesuaikan ID chain jika mendeploy ke network lain (misal: chain-11155111 untuk Sepolia)
    const DEPLOYMENT_PATH = join(
        process.cwd(),
        "../../packages/contracts/ignition/deployments/chain-31337/deployed_addresses.json"
    );

    if (!existsSync(DEPLOYMENT_PATH)) {
        console.warn("⚠️ File deployment tidak ditemukan. Pastikan sudah menjalankan 'ignition deploy'.");
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
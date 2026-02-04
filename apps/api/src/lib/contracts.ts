/**
 * Helper untuk mengambil alamat kontrak dari Environment Variables.
 * Untuk Vercel Serverless, kita TIDAK bisa baca file dari filesystem.
 * Alamat kontrak harus dimasukkan sebagai Environment Variable di Vercel Dashboard.
 * 
 * Untuk development lokal, baca dari .env file.
 */
export const getContractAddresses = () => {
    const registry = process.env.CONTRACT_REGISTRY;
    const ledger = process.env.CONTRACT_LEDGER;
    const redeem = process.env.CONTRACT_REDEEM;

    if (!registry || !ledger || !redeem) {
        console.warn(`⚠️ Contract addresses not fully configured in environment variables.`);
        console.warn(`   CONTRACT_REGISTRY: ${registry || 'NOT SET'}`);
        console.warn(`   CONTRACT_LEDGER: ${ledger || 'NOT SET'}`);
        console.warn(`   CONTRACT_REDEEM: ${redeem || 'NOT SET'}`);
        return null;
    }

    console.log(`📦 Contract Addresses Loaded from Environment:`);
    console.log(`   Registry: ${registry}`);
    console.log(`   Ledger: ${ledger}`);
    console.log(`   Redeem: ${redeem}`);

    return {
        registry,
        ledger,
        redeem,
    };
};
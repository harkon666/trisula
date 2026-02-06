import { ethers } from "ethers";
import { getContractAddresses } from "../lib/contracts.js";

console.log(`📦 Initializing BlockchainService...`);
console.log(`   RPC: ${process.env.RPC_URL || "Hardhat local"}`);
const addresses = getContractAddresses();
if (addresses) {
    console.log(`   Contracts: Registry=${addresses.registry}, Ledger=${addresses.ledger}, Redeem=${addresses.redeem}`);
} else {
    console.error(`   ❌ Failed to load contract addresses!`);
}

// Provider & Wallet menggunakan Private Key dari .env (OPERATOR_ROLE)
// Provider & Wallet menggunakan Private Key dari .env (OPERATOR_ROLE)
const rawPk = process.env.PRIVATE_KEY_OPERATOR || "";

if (rawPk) {
    console.log(`   DEBUG: PK Profile - Length: ${rawPk.length}, Starts with: ${rawPk.substring(0, 6)}...`);
} else {
    console.error(`   ❌ FATAL: PRIVATE_KEY_OPERATOR is missing in .env!`);
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");

let operatorWallet: ethers.Wallet | null = null;
try {
    if (rawPk) {
        operatorWallet = new ethers.Wallet(rawPk, provider);
        console.log(`   Operator Wallet Address: ${operatorWallet.address}`);
    }
} catch (error: any) {
    console.error(`   ❌ Invalid Private Key: ${error.message}`);
}

/**
 * Service untuk melakukan sinkronisasi data ke Blockchain.
 * Mengikuti prinsip: Event-based & Cheap Gas.
 */
export const BlockchainService = {
    // Bind User ke Agent secara Immutable di Blockchain
    async bindReferral(userAddress: string, agentAddress: string) {
        // FAIL SAFE for Vercel: If on Vercel and RPC is localhost/missing, SKIP.
        if (process.env.VERCEL && (!process.env.RPC_URL || process.env.RPC_URL.includes("localhost") || process.env.RPC_URL.includes("127.0.0.1"))) {
            console.warn("[BC-SERVICE] SCIPPING bindReferral: RPC_URL not configured on Vercel.");
            return null;
        }

        if (!addresses?.registry) throw new Error("Contract address not found");
        if (!operatorWallet) throw new Error("Operator wallet not initialized");

        const contract = new ethers.Contract(
            addresses.registry,
            ["function bindReferral(address _user, address _agent) external"],
            operatorWallet
        );

        const tx = await (contract as any).bindReferral(userAddress, agentAddress);
        return await tx.wait();
    },

    // Catat penambahan poin sebagai audit trail (Event-only)
    async logPointsAdded(userAddress: string, amount: bigint, reason: string) {
        if (!addresses?.ledger) throw new Error("Contract address not found");
        if (!operatorWallet) throw new Error("Operator wallet not initialized");

        const contract = new ethers.Contract(
            addresses.ledger,
            ["function addPoints(address _user, uint256 _amount, string calldata _reason) external"],
            operatorWallet
        );

        // Force fetch nonce from pending block to avoid race conditions
        const nonce = await operatorWallet.getNonce("pending");

        // Manual override options
        const tx = await (contract as any).addPoints(userAddress, amount, reason, { nonce });
        // Return tx immediately for faster processing (Fire & Forget)
        return tx;
    },

    // Catat redeem request ke Blockchain (Audit Trail)
    async logRedemption(userAddress: string, catalogId: number, pointsUsed: number) {
        // FAIL SAFE for Vercel: If on Vercel and RPC is localhost/missing, SKIP.
        if (process.env.VERCEL && (!process.env.RPC_URL || process.env.RPC_URL.includes("localhost") || process.env.RPC_URL.includes("127.0.0.1"))) {
            console.warn("[BC-SERVICE] SCIPPING logRedemption: RPC_URL not configured on Vercel.");
            return null;
        }

        if (!addresses?.redeem) throw new Error("Contract address not found for RedeemLog");
        if (!operatorWallet) throw new Error("Operator wallet not initialized");

        const contract = new ethers.Contract(
            addresses.redeem,
            ["function logRedeem(address _user, uint256 _serviceId, uint256 _pointsUsed) external"],
            operatorWallet
        );

        // Send transaction with timeout (15 seconds for submission, don't wait for confirmation)
        const timeoutMs = 15000;

        try {
            const txPromise = (contract as any).logRedeem(userAddress, catalogId, pointsUsed);
            const tx = await Promise.race([
                txPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Transaction submission timeout")), timeoutMs)
                )
            ]) as ethers.ContractTransactionResponse;

            // Return immediately with tx hash (Fire & Forget - don't wait for confirmation)
            // Confirmation can be slow on testnet, but tx is already submitted
            console.log(`   ⏱️ Tx submitted: ${tx.hash} (not waiting for confirmation)`);
            return tx;
        } catch (error: any) {
            console.error(`   ❌ Blockchain submission failed: ${error.message}`);
            throw error;
        }
    }
};
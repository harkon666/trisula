import { ethers } from "ethers";
import { getContractAddresses } from "../lib/contracts.js";

let _addresses: any = null;
const getAddresses = () => {
    if (!_addresses) {
        _addresses = getContractAddresses();
        if (!_addresses) console.error("   ❌ Failed to load contract addresses!");
    }
    return _addresses;
};

let _provider: ethers.JsonRpcProvider | null = null;
const getProvider = () => {
    if (!_provider) {
        _provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
    }
    return _provider;
};

let operatorWallet: ethers.Wallet | null = null;
const getOperatorWallet = () => {
    if (operatorWallet) return operatorWallet;
    const pk = process.env.PRIVATE_KEY_OPERATOR;
    if (!pk) return null;
    try {
        operatorWallet = new ethers.Wallet(pk, getProvider());
        return operatorWallet;
    } catch (e) {
        console.error("   ❌ Failed to initialize operator wallet:", e);
        return null;
    }
};

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

        const addresses = getAddresses();
        const wallet = getOperatorWallet();
        if (!addresses?.registry) throw new Error("Contract address not found");
        if (!wallet) throw new Error("Operator wallet not initialized");

        const contract = new ethers.Contract(
            addresses.registry,
            ["function bindReferral(address _user, address _agent) external"],
            wallet
        );

        const tx = await (contract as any).bindReferral(userAddress, agentAddress);
        return await tx.wait();
    },

    // Catat penambahan poin sebagai audit trail (Event-only)
    async logPointsAdded(userAddress: string, amount: bigint, reason: string) {
        const addresses = getAddresses();
        const wallet = getOperatorWallet();
        if (!addresses?.ledger) throw new Error("Contract address not found");
        if (!wallet) throw new Error("Operator wallet not initialized");

        const contract = new ethers.Contract(
            addresses.ledger,
            ["function addPoints(address _user, uint256 _amount, string calldata _reason) external"],
            wallet
        );

        // Force fetch nonce from pending block to avoid race conditions
        const nonce = await wallet.getNonce("pending");

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

        const addresses = getAddresses();
        const wallet = getOperatorWallet();
        if (!addresses?.redeem) throw new Error("Contract address not found for RedeemLog");
        if (!wallet) throw new Error("Operator wallet not initialized");

        const contract = new ethers.Contract(
            addresses.redeem,
            ["function logRedeem(address _user, uint256 _serviceId, uint256 _pointsUsed) external"],
            wallet
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
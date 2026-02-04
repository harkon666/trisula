import { ethers } from "ethers";
import { getContractAddresses } from "../lib/contracts";

console.log(`📦 Initializing BlockchainService...`);
console.log(`   RPC: ${process.env.RPC_URL || "Hardhat local"}`);
const addresses = getContractAddresses();
if (addresses) {
    console.log(`   Contracts: Registry=${addresses.registry}, Ledger=${addresses.ledger}, Redeem=${addresses.redeem}`);
} else {
    console.error(`   ❌ Failed to load contract addresses!`);
}

// Provider & Wallet menggunakan Private Key dari .env (OPERATOR_ROLE)
const rawPk = process.env.PRIVATE_KEY_OPERATOR!;
console.log(`   DEBUG: PK Profile - Length: ${rawPk.length}, Starts with: ${rawPk.substring(0, 6)}...`);
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
const operatorWallet = new ethers.Wallet(rawPk, provider);
console.log(`   Operator Wallet Address: ${operatorWallet.address}`);

/**
 * Service untuk melakukan sinkronisasi data ke Blockchain.
 * Mengikuti prinsip: Event-based & Cheap Gas.
 */
export const BlockchainService = {
    // Bind User ke Agent secara Immutable di Blockchain
    async bindReferral(userAddress: string, agentAddress: string) {
        if (!addresses?.registry) throw new Error("Contract address not found");

        const contract = new ethers.Contract(
            addresses.registry,
            ["function bindReferral(address _user, address _agent) external"],
            operatorWallet
        );

        const tx = await contract.bindReferral(userAddress, agentAddress);
        return await tx.wait();
    },

    // Catat penambahan poin sebagai audit trail (Event-only)
    async logPointsAdded(userAddress: string, amount: bigint, reason: string) {
        if (!addresses?.ledger) throw new Error("Contract address not found");

        const contract = new ethers.Contract(
            addresses.ledger,
            ["function addPoints(address _user, uint256 _amount, string calldata _reason) external"],
            operatorWallet
        );

        const tx = await contract.addPoints(userAddress, amount, reason);
        return await tx.wait();
    },

    // Catat redeem request ke Blockchain (Audit Trail)
    async logRedemption(userAddress: string, catalogId: number, pointsUsed: number) {
        if (!addresses?.redeem) throw new Error("Contract address not found for RedeemLog");

        const contract = new ethers.Contract(
            addresses.redeem,
            ["function logRedeem(address _user, uint256 _serviceId, uint256 _pointsUsed) external"],
            operatorWallet
        );

        const tx = await contract.logRedeem(userAddress, catalogId, pointsUsed);
        return await tx.wait();
    }
};
import { ethers } from "ethers";
import { getContractAddresses } from "../lib/contracts";

const addresses = getContractAddresses();

// Provider & Wallet menggunakan Private Key dari .env (OPERATOR_ROLE)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
const operatorWallet = new ethers.Wallet(process.env.PRIVATE_KEY_OPERATOR!, provider);

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
    }
};
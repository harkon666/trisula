import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * TrisulaModule
 * Menangani deployment 3 kontrak utama: ReferralRegistry, PointsLedger, dan RedeemLog.
 * Menggunakan prinsip Admin-triggered dan Event-based.
 */
export default buildModule("TrisulaModule", (m) => {
  // Ambil parameter dari konfigurasi ignition atau berikan default (misal: account[0] & account[1])
  // Ini memudahkan kita untuk memisahkan Cold Wallet (Admin) dan API Backend (Operator)
  const adminAddress = m.getParameter("adminAddress");
  const operatorAddress = m.getParameter("operatorAddress");

  // 1. Deploy ReferralRegistry (Core Trust)
  // Menjamin hubungan user -> agent bersifat immutable
  const referralRegistry = m.contract("TrisulaReferralRegistry", [
    adminAddress,
    operatorAddress,
  ]);

  // 2. Deploy PointsLedger (Audit Trail)
  // Event-only, tidak menyimpan balance on-chain untuk efisiensi gas
  const pointsLedger = m.contract("TrisulaPointsLedger", [
    adminAddress,
    operatorAddress,
  ]);

  // 3. Deploy RedeemLog (Request Log)
  // Mencatat setiap permintaan redeem nasabah prioritas
  const redeemLog = m.contract("TrisulaRedeemLog", [
    adminAddress,
    operatorAddress,
  ]);

  return { referralRegistry, pointsLedger, redeemLog };
});
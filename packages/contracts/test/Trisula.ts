import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toHex } from "viem";

describe("TRISULA Infrastructure Tests", async function () {
  const { viem } = await network.connect();
  const [admin, operator, user, agent, other] = await viem.getWalletClients();

  // Role constant sesuai dengan Smart Contract kita
  const OPERATOR_ROLE = keccak256(toHex("OPERATOR_ROLE"));

  // --- 1. ReferralRegistry Tests ---
  describe("TrisulaReferralRegistry", async function () {
    it("Harus memancarkan event ReferralBound saat Operator melakukan binding", async function () {
      const registry = await viem.deployContract("TrisulaReferralRegistry", [
        admin.account.address,
        operator.account.address,
      ]);

      const hash = await registry.write.bindReferral([user.account.address, agent.account.address], {
        account: operator.account,
      });

      const publicClient = await viem.getPublicClient();
      await publicClient.waitForTransactionReceipt({ hash });

      // Verifikasi manual karena ada dynamic timestamp
      const events = await registry.getEvents.ReferralBound();
      assert.equal(events.length, 1);
      const event = events[0];

      assert.equal(event.args.user!.toLowerCase(), user.account.address.toLowerCase());
      assert.equal(event.args.agent!.toLowerCase(), agent.account.address.toLowerCase());
      assert.ok(event.args.timestamp! > 0n, "Timestamp harus valid");

      const savedAgent = await registry.read.userAgent([user.account.address]);
      assert.equal(savedAgent.toLowerCase(), agent.account.address.toLowerCase());
    });

    it("Harus gagal (revert) jika user mencoba binding dua kali", async function () {
      const registry = await viem.deployContract("TrisulaReferralRegistry", [
        admin.account.address,
        operator.account.address,
      ]);

      // Binding pertama
      await registry.write.bindReferral([user.account.address, agent.account.address], {
        account: operator.account,
      });

      // Binding kedua harus gagal sesuai prinsip Immutable
      await assert.rejects(
        registry.write.bindReferral([user.account.address, other.account.address], {
          account: operator.account,
        }),
        /REFERRAL_ALREADY_SET/
      );
    });
  });

  // --- 2. PointsLedger Tests ---
  describe("TrisulaPointsLedger", async function () {
    it("Harus mencatat penambahan poin sebagai event", async function () {
      const ledger = await viem.deployContract("TrisulaPointsLedger", [
        admin.account.address,
        operator.account.address,
      ]);

      const hash = await ledger.write.addPoints([user.account.address, 1000n, "Welcome Bonus"], {
        account: operator.account,
      });

      const publicClient = await viem.getPublicClient();
      await publicClient.waitForTransactionReceipt({ hash });

      const events = await ledger.getEvents.PointsAdded();
      assert.equal(events.length, 1);
      const event = events[0];

      assert.equal(event.args.user!.toLowerCase(), user.account.address.toLowerCase());
      assert.equal(event.args.amount, 1000n);
      assert.equal(event.args.reason, "Welcome Bonus");
      assert.ok(event.args.timestamp! > 0n);
    });
  });

  // --- 3. RedeemLog Tests ---
  describe("TrisulaRedeemLog", async function () {
    it("Harus mencatat redeem request di blockchain sebagai audit trail", async function () {
      const log = await viem.deployContract("TrisulaRedeemLog", [
        admin.account.address,
        operator.account.address,
      ]);

      const serviceId = 5n; // Contoh: Airport Lounge
      const points = 500n;

      const hash = await log.write.logRedeem([user.account.address, serviceId, points], {
        account: operator.account,
      });

      const publicClient = await viem.getPublicClient();
      await publicClient.waitForTransactionReceipt({ hash });

      const events = await log.getEvents.RedeemRequested();
      assert.equal(events.length, 1);
      const event = events[0];

      assert.equal(event.args.user!.toLowerCase(), user.account.address.toLowerCase());
      assert.equal(event.args.serviceId, serviceId);
      assert.equal(event.args.pointsUsed, points);
      assert.ok(event.args.timestamp! > 0n);
    });
  });

  // --- 4. Access Control Tests ---
  describe("Access Control", async function () {
    it("User biasa tidak boleh bisa memanggil fungsi bindReferral", async function () {
      const registry = await viem.deployContract("TrisulaReferralRegistry", [
        admin.account.address,
        operator.account.address,
      ]);

      // Menggunakan account 'user' yang tidak punya OPERATOR_ROLE
      await assert.rejects(
        registry.write.bindReferral([other.account.address, agent.account.address], {
          account: user.account,
        })
      );
    });
  });
});
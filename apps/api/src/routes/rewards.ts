import { Hono } from "hono";
import { RewardService } from "../services/RewardService";

const rewardsRoutes = new Hono();

// GET /rewards/estimate - Get estimated yield for current user
rewardsRoutes.get("/estimate", async (c) => {
    const walletAddress = c.req.query("walletAddress");
    // const userId = c.req.header("x-user-id"); // Alternative

    // We need to resolve wallet -> userId if using wallet param
    // But WealthAggregator handles this inside. RewardService currently takes userId.
    // Let's stick to consistent pattern.

    // For MVP transparency: Just calculate based on Wealth endpoint in frontend.
    // But provides a dedicated endpoint is nice.

    return c.json({ message: "Use Wealth Aggregator to estimate locally for now" });
});

export default rewardsRoutes;

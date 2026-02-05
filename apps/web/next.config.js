import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {},
    transpilePackages: ["@repo/ui", "@repo/shared", "@repo/database"],
};

export default withPWA(nextConfig);

import { createThirdwebClient } from "thirdweb";

// Client ID aman untuk dipublikasikan (Client-side)
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
    console.warn("⚠️ NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set in environment variables");
}

export const client = createThirdwebClient({
    clientId: clientId || "",
});

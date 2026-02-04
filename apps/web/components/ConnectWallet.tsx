"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "../lib/thirdweb";
import { inAppWallet } from "thirdweb/wallets";

export default function ConnectWallet() {
    return (
        <div className="flex items-center justify-center p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-xl">
            <ConnectButton
                client={client}
                wallets={[inAppWallet()]}
                connectButton={{
                    label: "Login Sultan",
                    className: "!bg-amber-500 !text-black !font-bold hover:!bg-amber-400 !transition-all",
                }}
                connectModal={{
                    size: "compact",
                    title: "Trisula Login",
                    showThirdwebBranding: false,
                }}
            />
        </div>
    );
}

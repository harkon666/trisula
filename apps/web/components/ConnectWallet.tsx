"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "../lib/thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { defineChain } from "thirdweb";

export default function ConnectWallet({ transparent = false }: { transparent?: boolean }) {
    return (
        <div className={transparent ? "" : "flex items-center justify-center p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-xl"}>
            <ConnectButton
                client={client}
                accountAbstraction={{
                    chain: defineChain(84532), // Base Sepolia
                    sponsorGas: true, // Enable Gasless Transactions
                }}
                wallets={[
                    inAppWallet({
                        auth: {
                            options: ["google", "email", "apple", "facebook"],
                        },
                    }),
                ]}
                connectButton={{
                    label: "Member Login",
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

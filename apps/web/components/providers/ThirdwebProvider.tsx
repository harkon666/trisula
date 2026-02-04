"use client";

import { ThirdwebProvider as ThirdwebProviderCore } from "thirdweb/react";

export default function ThirdwebProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThirdwebProviderCore>
            {children}
        </ThirdwebProviderCore>
    );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import QueryProvider from "@/src/components/providers/QueryProvider";
import { GlobalScroll } from "@/src/components/organisms";
import { Toaster } from "sonner";
import { AuthProvider } from "@/src/hooks/useAuth";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport = {
  themeColor: "#f59e0b",
};

export const metadata: Metadata = {
  title: "Trisula - Premium Experience",
  description: "Exclusive Referral & Loyalty Platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trisula",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-midnight-950 text-white selection:bg-trisula-500/30`}>
        <QueryProvider>
          <AuthProvider>
            <GlobalScroll>
              {children}
              <Toaster richColors position="top-right" theme="dark" />
            </GlobalScroll>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import QueryProvider from "../components/providers/QueryProvider";
import SmoothScroll from "../components/providers/SmoothScroll";
import { Toaster } from "sonner";
import { AuthProvider } from "@/src/hooks/useAuth";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>
          <AuthProvider>
            <SmoothScroll>
              {children}
              <Toaster richColors position="top-right" />
            </SmoothScroll>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

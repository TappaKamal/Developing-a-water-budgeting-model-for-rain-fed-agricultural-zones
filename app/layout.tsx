import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AquaSync — Water Budgeting for Rain-Fed Agriculture",
  description:
    "Scientific water budgeting model for rain-fed agriculture zones. Calculate ET₀, ETc, soil moisture balance, irrigation requirements, and manage multi-farm water resources.",
  keywords: ["water budget", "rain-fed agriculture", "ET0", "irrigation", "soil moisture", "agronomy"],
  authors: [{ name: "AquaSync" }],
  openGraph: {
    title: "AquaSync — Water Budgeting for Rain-Fed Agriculture",
    description: "Precision water management for farmers, agronomists, and researchers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </head>
        <body className={inter.variable}>
          <ConvexClientProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                style: {
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                },
              }}
            />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import EngagementWrapper from "@/components/EngagementWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lamma+ | Gather in Faith",
  description: "Faith-based content creator discovery platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`} suppressHydrationWarning>
        <AuthProvider>
          <EngagementWrapper>
            {children}
          </EngagementWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}


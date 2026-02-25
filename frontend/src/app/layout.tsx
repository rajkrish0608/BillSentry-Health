import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BillSentry Health — Understand Your Hospital Bill Before You Pay",
  description:
    "India's first structured hospital bill analysis engine. Upload your bill, benchmark against CGHS/PMJAY/NPPA rates, and generate professional dispute documentation.",
  keywords: [
    "hospital bill checker India",
    "medical bill analysis",
    "CGHS rates",
    "PMJAY benchmark",
    "healthcare billing intelligence",
    "BillSentry Health",
  ],
  authors: [{ name: "BillSentry Health" }],
  openGraph: {
    title: "BillSentry Health — Healthcare Billing Intelligence",
    description:
      "Upload your hospital bill and get instant benchmark analysis against public pricing databases.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0B1120" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/vite.svg" />
        <link rel="apple-touch-icon" href="/vite.svg" />
        {/* Fontshare: Clash Display & Satoshi */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,600,500,400&f[]=clash-display@700,600,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }} />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

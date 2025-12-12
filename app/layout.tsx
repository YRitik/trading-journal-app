import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "../components/Sidebar";
import { TradeProvider } from "../context/TradeContext"; // Import the Brain
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "Premium Prop Firm Manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex bg-background text-text-main`}>
        
        {/* Wrap everything inside the TradeProvider */}
        <TradeProvider>
          
          <Sidebar />

          <main className="flex-1 h-screen overflow-y-auto">
            {children}
          </main>

        </TradeProvider>
        
      </body>
    </html>
  );
}
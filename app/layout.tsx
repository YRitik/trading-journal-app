"use client";

import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import Sidebar from "../components/Sidebar";
import { TradeProvider } from "../context/TradeContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. If we are already on the login page, don't check (prevent infinite loop)
      if (pathname === "/login") {
        setIsLoading(false);
        return;
      }

      // 2. Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // 3. No user? Kick them to login
        router.push("/login");
      } else {
        // 4. User exists? Let them in
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]); // Re-run this check whenever the URL changes

  // If loading and NOT on login page, show spinner
  if (isLoading && pathname !== "/login") {
    return (
      <html lang="en">
        <body className={`${inter.variable} ${mono.variable} bg-background text-text-main flex items-center justify-center h-screen`}>
           <div className="flex flex-col items-center gap-4">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
             <p className="text-text-muted text-sm">Securing Vault...</p>
           </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} bg-background text-text-main font-sans`}>
        <TradeProvider>
          <div className="flex min-h-screen">
            {/* Hide Sidebar if we are on the Login Page */}
            {pathname !== "/login" && <Sidebar />}
            
            <main className={`flex-1 overflow-auto ${pathname === "/login" ? "w-full" : ""}`}>
              {children}
            </main>
          </div>
        </TradeProvider>
      </body>
    </html>
  );
}
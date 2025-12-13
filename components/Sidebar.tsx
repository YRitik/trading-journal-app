"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js"; 
import { 
  LayoutDashboard, 
  BookOpen, 
  Wallet, 
  BarChart3, 
  Briefcase,
  Calculator,
  LogOut 
} from "lucide-react";
import { useTrades } from "../context/TradeContext";
import RiskCalculator from "./RiskCalculator"; 

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); 
  const { activeAccount } = useTrades(); // Now getting the full account object
  
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); 
  };

  // Helper: Is the account in profit?
  const isProfit = activeAccount ? (activeAccount.currentBalance || 0) >= activeAccount.initialBalance : true;

  return (
    <>
      <RiskCalculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

      <div className="flex h-screen w-64 flex-col border-r border-white/5 bg-surface text-text-main">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-white/5">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
            TJ
          </div>
          <span className="font-bold text-lg tracking-tight">TradeJournal</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-card transition-all duration-200
                  ${isActive 
                    ? "bg-primary/10 text-primary shadow-glow-blue" 
                    : "text-text-muted hover:bg-white/5 hover:text-text-main"
                  }
                `}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-primary" : "text-text-muted group-hover:text-text-main"}`} />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/5">
            <p className="px-3 text-xs font-bold text-text-muted uppercase mb-2">Tools</p>
            <button
              onClick={() => setIsCalcOpen(true)}
              className="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-card text-text-muted hover:bg-white/5 hover:text-primary transition-all duration-200"
            >
              <Calculator className="mr-3 h-5 w-5 text-text-muted group-hover:text-primary" />
              Position Calculator
            </button>
          </div>
        </nav>

        {/* User Account + Logout */}
        <div className="border-t border-white/5 p-4 space-y-3">
          
          {/* Account Badge */}
          {activeAccount ? (
            <div className="bg-black/20 p-3 rounded-card border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate text-text-main">
                    {activeAccount.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-success shadow-glow-green"></span>
                    <p className="text-xs text-text-muted truncate">
                      {activeAccount.type}
                    </p>
                  </div>
                </div>
              </div>

              {/* LIVE BALANCE BAR */}
              <div className="pt-3 border-t border-white/5">
                 <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Equity</span>
                    <span className={`font-mono text-sm font-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                        ${activeAccount.currentBalance?.toLocaleString()}
                    </span>
                 </div>
                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    {/* Progress Bar Visual (Optional - remove if too fancy) */}
                    <div 
                      className={`h-full ${isProfit ? 'bg-success' : 'bg-danger'}`} 
                      style={{ width: `${Math.min(((activeAccount.currentBalance || 0) / activeAccount.initialBalance) * 100, 100)}%` }}
                    ></div>
                 </div>
                 <div className="text-right mt-1">
                    <span className="text-[10px] text-text-muted">Target: ${activeAccount.initialBalance.toLocaleString()}</span>
                 </div>
              </div>
            </div>
          ) : (
             <div className="p-3 text-center text-xs text-text-muted animate-pulse">Loading Account...</div>
          )}

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>

        </div>
      </div>
    </>
  );
}
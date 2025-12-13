"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Wallet, 
  BarChart3, 
  Briefcase,
  Calculator 
} from "lucide-react";
import { useTrades } from "../context/TradeContext";
import RiskCalculator from "./RiskCalculator"; // Changed Import

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { accounts, activeAccountId } = useTrades();
  const activeAccount = accounts.find(a => a.id === activeAccountId);
  
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  return (
    <>
      {/* Updated Component */}
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

          {/* Tools Section */}
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

        {/* User Account */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 bg-black/20 p-3 rounded-card border border-white/5">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">
                {activeAccount ? activeAccount.name : "Loading..."}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success shadow-glow-green"></span>
                <p className="text-xs text-text-muted truncate">
                  {activeAccount ? activeAccount.type : "Account"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
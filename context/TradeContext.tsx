"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// --- TYPES ---
export interface Trade {
  id: number;
  accountId: string;
  pair: string;
  type: "Buy" | "Sell";
  entry: number;
  exit: number;
  pnl: number;
  status: "Win" | "Loss";
  date: string;
  tags: string[]; // <--- NEW FIELD: The AI Tags
  notes: string;  // <--- NEW FIELD: The user's story
}

export interface Account {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
}

interface TradeContextType {
  trades: Trade[];
  accounts: Account[];
  activeAccountId: string;
  switchAccount: (id: string) => void;
  addAccount: (name: string, balance: number, type: string) => void;
  addTrade: (trade: Omit<Trade, "id" | "accountId">) => void;
  deleteTrade: (id: number) => void;
  totalBalance: number;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([{ 
    id: "default", name: "Main Account", type: "Personal", initialBalance: 100000 
  }]);
  
  const [activeAccountId, setActiveAccountId] = useState("default");
  const [allTrades, setAllTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const savedAccounts = localStorage.getItem("myAccounts");
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    const savedTrades = localStorage.getItem("myTrades");
    if (savedTrades) setAllTrades(JSON.parse(savedTrades));
  }, []);

  useEffect(() => {
    localStorage.setItem("myAccounts", JSON.stringify(accounts));
    localStorage.setItem("myTrades", JSON.stringify(allTrades));
  }, [accounts, allTrades]);

  const activeTrades = allTrades.filter((t) => t.accountId === activeAccountId);
  
  const activeAccount = accounts.find((a) => a.id === activeAccountId);
  const startBalance = activeAccount ? activeAccount.initialBalance : 0;
  const pnlSum = activeTrades.reduce((acc, t) => acc + t.pnl, 0);
  const totalBalance = startBalance + pnlSum;

  const switchAccount = (id: string) => setActiveAccountId(id);

  const addAccount = (name: string, balance: number, type: string) => {
    const newAccount: Account = { id: Date.now().toString(), name, initialBalance: balance, type };
    setAccounts([...accounts, newAccount]);
    setActiveAccountId(newAccount.id);
  };

  const addTrade = (newTradeData: Omit<Trade, "id" | "accountId">) => {
    const newTrade: Trade = {
      ...newTradeData,
      id: Date.now(),
      accountId: activeAccountId,
    };
    setAllTrades([newTrade, ...allTrades]);
  };

  const deleteTrade = (id: number) => {
    setAllTrades((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TradeContext.Provider value={{ trades: activeTrades, accounts, activeAccountId, switchAccount, addAccount, addTrade, deleteTrade, totalBalance }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradeContext);
  if (context === undefined) throw new Error("useTrades must be used within a TradeProvider");
  return context;
}
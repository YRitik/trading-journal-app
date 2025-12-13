"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// --- TYPES ---

export interface Trade {
  id: number;
  accountId: string;  // Links trade to a specific account (e.g., FTMO Challenge)
  pair: string;       // e.g., XAUUSD
  type: "Buy" | "Sell";
  entry: number;
  exit: number;
  stopLoss: number;   // New Field
  lotSize: number;    // New Field
  pnl: number;
  status: "Win" | "Loss" | "BE"; // Status logic
  date: string;       // Format: "YYYY-MM-DD" (Crucial for Calendar)
  tags: string[];     // AI Psychology Tags
  notes: string;      // User's journal notes
}

export interface Account {
  id: string;
  name: string;      // e.g., "FTMO 100k"
  type: string;      // e.g., "Challenge" or "Funded"
  initialBalance: number;
}

interface TradeContextType {
  trades: Trade[]; // Only returns trades for the ACTIVE account
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
  // 1. Initialize Accounts (Default to one Personal account)
  const [accounts, setAccounts] = useState<Account[]>([{ 
    id: "default", 
    name: "Main Account", 
    type: "Personal", 
    initialBalance: 100000 
  }]);
  
  const [activeAccountId, setActiveAccountId] = useState("default");
  const [allTrades, setAllTrades] = useState<Trade[]>([]); // Stores trades for ALL accounts

  // --- PERSISTENCE (Load from LocalStorage) ---
  useEffect(() => {
    // Load Accounts
    const savedAccounts = localStorage.getItem("myAccounts");
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }

    // Load Trades
    const savedTrades = localStorage.getItem("myTrades");
    if (savedTrades) {
      setAllTrades(JSON.parse(savedTrades));
    }
  }, []);

  // --- SAVE TO DISK (Run whenever data changes) ---
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem("myAccounts", JSON.stringify(accounts));
    }
  }, [accounts]);

  useEffect(() => {
    // We save even if empty, to ensure deletions work
    localStorage.setItem("myTrades", JSON.stringify(allTrades));
  }, [allTrades]);


  // --- HELPERS ---
  
  // Filter trades to only show the ones for the ACTIVE account
  const activeTrades = allTrades.filter((t) => t.accountId === activeAccountId);

  // Calculate Balance for the ACTIVE account
  const activeAccount = accounts.find((a) => a.id === activeAccountId);
  const startBalance = activeAccount ? activeAccount.initialBalance : 0;
  const pnlSum = activeTrades.reduce((acc, t) => acc + t.pnl, 0);
  const totalBalance = startBalance + pnlSum;

  // --- ACTIONS ---

  const switchAccount = (id: string) => {
    setActiveAccountId(id);
  };

  const addAccount = (name: string, balance: number, type: string) => {
    const newAccount: Account = {
      id: Date.now().toString(),
      name,
      initialBalance: balance,
      type
    };
    setAccounts([...accounts, newAccount]);
    setActiveAccountId(newAccount.id); // Auto-switch to new account
  };

  const addTrade = (newTradeData: Omit<Trade, "id" | "accountId">) => {
    const newTrade: Trade = {
      ...newTradeData,
      id: Date.now(),
      accountId: activeAccountId, // Tag it with current account ID
    };
    
    // Add to top of list (Newest first)
    setAllTrades([newTrade, ...allTrades]);
  };

  const deleteTrade = (id: number) => {
    setAllTrades((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TradeContext.Provider value={{ 
      trades: activeTrades, // The app only sees these!
      accounts,
      activeAccountId,
      switchAccount,
      addAccount,
      addTrade, 
      deleteTrade, 
      totalBalance 
    }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error("useTrades must be used within a TradeProvider");
  }
  return context;
}
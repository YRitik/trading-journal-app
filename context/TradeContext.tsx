"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Trade {
  id: number;
  user_id?: string;
  account_id: string;
  pair: string;
  type: "Buy" | "Sell";
  entry: number;
  exit: number;
  stop_loss: number;
  lot_size: number;
  pnl: number;
  status: "Win" | "Loss" | "BE";
  date: string;
  tags: string[];
  notes: string;
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
  addTrade: (trade: any) => void;
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

  // --- 1. FETCH TRADES FROM CLOUD ---
  useEffect(() => {
    const fetchTrades = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('id', { ascending: false }); // Newest first

      if (data) {
        // Map database fields to our app's format if needed
        const formattedTrades = data.map(t => ({
          ...t,
          stopLoss: t.stop_loss, // Fix casing difference
          lotSize: t.lot_size,   // Fix casing difference
          exit: t.exit_price     // Fix naming difference
        }));
        setAllTrades(formattedTrades);
      }
    };

    fetchTrades();
  }, []);

  // --- 2. ADD TRADE TO CLOUD ---
  const addTrade = async (newTradeData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Prepare data for DB (Snake_case)
    const dbTrade = {
      user_id: user.id,
      account_id: activeAccountId,
      pair: newTradeData.pair,
      type: newTradeData.type,
      entry: newTradeData.entry,
      exit_price: newTradeData.exit, // DB expects 'exit_price'
      stop_loss: newTradeData.stopLoss,
      lot_size: newTradeData.lotSize,
      pnl: newTradeData.pnl,
      status: newTradeData.status,
      date: newTradeData.date,
      tags: newTradeData.tags,
      notes: newTradeData.notes
    };

    // Insert into Supabase
    const { data, error } = await supabase.from('trades').insert([dbTrade]).select();

    if (data) {
      // Update local state instantly so UI updates
      const savedTrade = {
        ...data[0],
        stopLoss: data[0].stop_loss,
        lotSize: data[0].lot_size,
        exit: data[0].exit_price
      };
      setAllTrades([savedTrade, ...allTrades]);
    }
  };

  // --- 3. DELETE TRADE FROM CLOUD ---
  const deleteTrade = async (id: number) => {
    // Delete from DB
    await supabase.from('trades').delete().eq('id', id);
    
    // Update local UI
    setAllTrades((prev) => prev.filter((t) => t.id !== id));
  };

  // --- CALCULATIONS ---
  const activeTrades = allTrades.filter((t) => t.account_id === activeAccountId);
  const activeAccount = accounts.find((a) => a.id === activeAccountId);
  const startBalance = activeAccount ? activeAccount.initialBalance : 0;
  const pnlSum = activeTrades.reduce((acc, t) => acc + t.pnl, 0);
  const totalBalance = startBalance + pnlSum;

  const switchAccount = (id: string) => setActiveAccountId(id);
  const addAccount = (name: string, balance: number, type: string) => {
    const newAccount = { id: Date.now().toString(), name, initialBalance: balance, type };
    setAccounts([...accounts, newAccount]);
    setActiveAccountId(newAccount.id);
  };

  return (
    <TradeContext.Provider value={{ 
      trades: activeTrades, 
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
  if (context === undefined) throw new Error("useTrades must be used within a TradeProvider");
  return context;
}
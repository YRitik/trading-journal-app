"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- FIX: Interface uses camelCase (What the App expects) ---
export interface Trade {
  id: number;
  user_id?: string;
  accountId: string; // App uses accountId
  pair: string;
  type: "Buy" | "Sell";
  entry: number;
  exit: number;      // App uses exit
  stopLoss: number;  // App uses stopLoss
  lotSize: number;   // App uses lotSize
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

  // --- 1. FETCH TRADES (Translate DB snake_case -> App camelCase) ---
  useEffect(() => {
    const fetchTrades = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('id', { ascending: false });

      if (data) {
        // MAPPING MAGIC: Convert DB format to App format
        const formattedTrades: Trade[] = data.map((t: any) => ({
          id: t.id,
          user_id: t.user_id,
          accountId: t.account_id, // Map account_id -> accountId
          pair: t.pair,
          type: t.type,
          entry: t.entry,
          exit: t.exit_price,      // Map exit_price -> exit
          stopLoss: t.stop_loss,   // Map stop_loss -> stopLoss
          lotSize: t.lot_size,     // Map lot_size -> lotSize
          pnl: t.pnl,
          status: t.status,
          date: t.date,
          tags: t.tags || [],
          notes: t.notes
        }));
        setAllTrades(formattedTrades);
      }
    };

    fetchTrades();
  }, []);

  // --- 2. ADD TRADE (Translate App camelCase -> DB snake_case) ---
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
      // Update local state immediately with the mapped format
      const savedTrade: Trade = {
        id: data[0].id,
        user_id: data[0].user_id,
        accountId: data[0].account_id,
        pair: data[0].pair,
        type: data[0].type,
        entry: data[0].entry,
        exit: data[0].exit_price,
        stopLoss: data[0].stop_loss,
        lotSize: data[0].lot_size,
        pnl: data[0].pnl,
        status: data[0].status,
        date: data[0].date,
        tags: data[0].tags,
        notes: data[0].notes
      };
      setAllTrades([savedTrade, ...allTrades]);
    }
  };

  // --- 3. DELETE TRADE ---
  const deleteTrade = async (id: number) => {
    await supabase.from('trades').delete().eq('id', id);
    setAllTrades((prev) => prev.filter((t) => t.id !== id));
  };

  // --- CALCULATIONS ---
  const activeTrades = allTrades.filter((t) => t.accountId === activeAccountId);
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
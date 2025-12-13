"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- TYPES ---
export interface Trade {
  id: number;
  user_id?: string;
  accountId: string;
  pair: string;
  type: "Buy" | "Sell";
  entry: number;
  exit: number;
  stopLoss: number;
  lotSize: number;
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
  currentBalance?: number; // Calculated field
}

interface TradeContextType {
  trades: Trade[];
  accounts: Account[];
  activeAccountId: string;
  activeAccount: Account | undefined;
  isLoading: boolean;
  switchAccount: (id: string) => void;
  addAccount: (name: string, balance: number, type: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addTrade: (trade: any) => void;
  deleteTrade: (id: number) => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>("");
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. FETCH DATA ON LOAD ---
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      // A. Fetch Accounts
      const { data: accData } = await supabase.from('accounts').select('*').order('created_at', { ascending: true });
      
      // B. Fetch Trades
      const { data: tradeData } = await supabase.from('trades').select('*').order('id', { ascending: false });

      // C. Process Trades
      const formattedTrades: Trade[] = (tradeData || []).map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        accountId: t.account_id,
        pair: t.pair,
        type: t.type,
        entry: t.entry,
        exit: t.exit_price,
        stopLoss: t.stop_loss,
        lotSize: t.lot_size,
        pnl: t.pnl,
        status: t.status,
        date: t.date,
        tags: t.tags || [],
        notes: t.notes
      }));
      setAllTrades(formattedTrades);

      // D. Set Accounts
      if (accData && accData.length > 0) {
        setAccounts(accData);
        // If we have a saved ID in localStorage, use it, otherwise use the first account
        const savedId = localStorage.getItem('activeAccountId');
        if (savedId && accData.find(a => a.id === savedId)) {
          setActiveAccountId(savedId);
        } else {
          setActiveAccountId(accData[0].id);
        }
      } else {
        // If NO accounts exist, create a default one automatically
        await createDefaultAccount(user.id);
      }

      setIsLoading(false);
    };

    initData();
  }, []);

  // Helper: Create Default Account if none exists
  const createDefaultAccount = async (userId: string) => {
    const newAcc = { user_id: userId, name: "Main Account", type: "Personal", initial_balance: 10000 };
    const { data } = await supabase.from('accounts').insert([newAcc]).select();
    if (data) {
      const formatted = { 
        id: data[0].id, 
        name: data[0].name, 
        type: data[0].type, 
        initialBalance: data[0].initial_balance 
      };
      setAccounts([formatted]);
      setActiveAccountId(formatted.id);
    }
  };

  // --- 2. ACCOUNT ACTIONS ---
  const addAccount = async (name: string, balance: number, type: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('accounts').insert([{
      user_id: user.id, name, initial_balance: balance, type
    }]).select();

    if (data) {
      const newAcc = { 
        id: data[0].id, 
        name: data[0].name, 
        type: data[0].type, 
        initialBalance: data[0].initial_balance 
      };
      setAccounts([...accounts, newAcc]);
      // Switch to the new account automatically
      switchAccount(newAcc.id);
    }
  };

  const deleteAccount = async (id: string) => {
    // 1. Delete from DB
    await supabase.from('accounts').delete().eq('id', id);
    
    // 2. Remove from State
    const remaining = accounts.filter(a => a.id !== id);
    setAccounts(remaining);

    // 3. If we deleted the active account, switch to another one
    if (activeAccountId === id && remaining.length > 0) {
      switchAccount(remaining[0].id);
    } else if (remaining.length === 0) {
      // If we deleted the LAST account, create a default one again? 
      // Or handle empty state. For now, let's just clear ID.
      setActiveAccountId("");
    }
  };

  const switchAccount = (id: string) => {
    setActiveAccountId(id);
    localStorage.setItem('activeAccountId', id);
  };

  // --- 3. TRADE ACTIONS ---
  const addTrade = async (newTradeData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbTrade = {
      user_id: user.id,
      account_id: activeAccountId, // Use the real UUID now
      pair: newTradeData.pair,
      type: newTradeData.type,
      entry: newTradeData.entry,
      exit_price: newTradeData.exit,
      stop_loss: newTradeData.stopLoss,
      lot_size: newTradeData.lotSize,
      pnl: newTradeData.pnl,
      status: newTradeData.status,
      date: newTradeData.date,
      tags: newTradeData.tags,
      notes: newTradeData.notes
    };

    const { data } = await supabase.from('trades').insert([dbTrade]).select();

    if (data) {
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

  const deleteTrade = async (id: number) => {
    await supabase.from('trades').delete().eq('id', id);
    setAllTrades((prev) => prev.filter((t) => t.id !== id));
  };

  // --- 4. CALCULATIONS ---
  // Filter trades for the ACTIVE account only
  const activeTrades = allTrades.filter((t) => t.accountId === activeAccountId);
  
  // Calculate balances for ALL accounts (for the list view)
  const accountsWithBalance = accounts.map(acc => {
    const accTrades = allTrades.filter(t => t.accountId === acc.id);
    const pnl = accTrades.reduce((sum, t) => sum + t.pnl, 0);
    return { ...acc, currentBalance: acc.initialBalance + pnl };
  });

  const activeAccount = accountsWithBalance.find(a => a.id === activeAccountId);

  return (
    <TradeContext.Provider value={{ 
      trades: activeTrades, 
      accounts: accountsWithBalance,
      activeAccountId,
      activeAccount,
      isLoading,
      switchAccount,
      addAccount,
      deleteAccount,
      addTrade, 
      deleteTrade, 
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
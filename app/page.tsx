"use client";

import StatsCard from "../components/StatsCard";
import EquityChart from "../components/EquityChart";
import RecentTrades from "../components/RecentTrades";
import { Wallet, TrendingUp, Activity, PieChart } from "lucide-react";
import { useTrades } from "../context/TradeContext";

export default function Home() {
  const { trades, totalBalance } = useTrades();

  // --- THE MATH SECTION ---

  // 1. Calculate Net Profit (Sum of all P&L)
  const netProfit = trades.reduce((acc, trade) => acc + trade.pnl, 0);

  // 2. Calculate Win Rate
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // 3. Determine if we are profitable (Green) or losing (Red)
  const isProfitable = netProfit >= 0;

  return (
    <div className="p-8 space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-text-main mb-2">Dashboard</h1>
        <p className="text-text-muted">Welcome back, Trader One. Here is your daily overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Balance (Already Real) */}
        <StatsCard 
          title="Total Balance" 
          value={`$${totalBalance.toLocaleString()}`} 
          trend="+0%" 
          trendUp={true} 
          icon={Wallet} 
        />
        
        {/* Card 2: Net Profit (Now Real) */}
        <StatsCard 
          title="Net Profit" 
          value={`$${netProfit.toLocaleString()}`} 
          trend="All Time" 
          trendUp={isProfitable} 
          icon={TrendingUp} 
        />
        
        {/* Card 3: Win Rate (Now Real) */}
        <StatsCard 
          title="Win Rate" 
          value={`${winRate.toFixed(1)}%`} 
          trend={`${totalTrades} Trades`} // Showing trade count as the "trend" info
          trendUp={winRate > 50} 
          icon={Activity} 
        />
        
        {/* Card 4: Avg R:R (Still a placeholder for now) */}
        <StatsCard 
          title="Avg R:R" 
          value="1 : 2.5" 
          icon={PieChart} 
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EquityChart />
        </div>
        <div className="lg:col-span-1">
           <RecentTrades />
        </div>
      </div>

    </div>
  );
}
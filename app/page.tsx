"use client";

import StatsCard from "../components/StatsCard";
import EquityChart from "../components/EquityChart";
import RecentTrades from "../components/RecentTrades";
import MarketTicker from "../components/MarketTicker"; 
import { Wallet, TrendingUp, Activity, PieChart } from "lucide-react";
import { useTrades } from "../context/TradeContext";

export default function Home() {
  const { trades, totalBalance } = useTrades();

  const netProfit = trades.reduce((acc, trade) => acc + trade.pnl, 0);
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const isProfitable = netProfit >= 0;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <MarketTicker />

      <div>
        <h1 className="text-3xl font-bold text-text-main mb-2">Dashboard</h1>
        <p className="text-text-muted">Welcome back. Here is your daily overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Balance" 
          value={`$${totalBalance.toLocaleString()}`} 
          trend="+0%" 
          trendUp={true} 
          icon={Wallet} 
        />
        <StatsCard 
          title="Net Profit" 
          value={`$${netProfit.toLocaleString()}`} 
          trend="All Time" 
          trendUp={isProfitable} 
          icon={TrendingUp} 
        />
        <StatsCard 
          title="Win Rate" 
          value={`${winRate.toFixed(1)}%`} 
          trend={`${totalTrades} Trades`} 
          trendUp={winRate > 50} 
          icon={Activity} 
        />
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
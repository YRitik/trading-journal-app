"use client";

import { useTrades } from "../context/TradeContext";
import { Target, TrendingDown, TrendingUp, Scale } from "lucide-react";

export default function AnalyticsStats() {
  const { trades } = useTrades();

  // 1. Separate Wins and Losses
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);

  // 2. Calculate Averages
  const totalWinAmount = wins.reduce((acc, t) => acc + t.pnl, 0);
  const totalLossAmount = losses.reduce((acc, t) => acc + Math.abs(t.pnl), 0); // Use absolute value

  const avgWin = wins.length > 0 ? totalWinAmount / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossAmount / losses.length : 0;

  // 3. Profit Factor (Gross Wins / Gross Losses)
  const profitFactor = totalLossAmount > 0 ? (totalWinAmount / totalLossAmount).toFixed(2) : "∞";

  // 4. Expectancy (Avg Win * Win Rate) - (Avg Loss * Loss Rate)
  const winRate = trades.length > 0 ? wins.length / trades.length : 0;
  const lossRate = trades.length > 0 ? losses.length / trades.length : 0;
  const expectancy = (avgWin * winRate) - (avgLoss * lossRate);

  const StatBox = ({ label, value, icon: Icon, subColor }: any) => (
    <div className="bg-surface rounded-card p-5 border border-white/5 shadow-premium">
      <div className="flex justify-between items-start mb-2">
        <p className="text-text-muted text-sm font-medium">{label}</p>
        <div className={`p-2 rounded-lg ${subColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-text-main">{value}</h3>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatBox 
        label="Profit Factor" 
        value={profitFactor} 
        icon={Scale} 
        subColor="bg-primary/10 text-primary" 
      />
      <StatBox 
        label="Average Win" 
        value={`$${avgWin.toFixed(2)}`} 
        icon={TrendingUp} 
        subColor="bg-success/10 text-success" 
      />
      <StatBox 
        label="Average Loss" 
        value={`$${avgLoss.toFixed(2)}`} 
        icon={TrendingDown} 
        subColor="bg-danger/10 text-danger" 
      />
      <StatBox 
        label="Trade Expectancy" 
        value={`$${expectancy.toFixed(2)}`} 
        icon={Target} 
        subColor="bg-purple-500/10 text-purple-500" 
      />
    </div>
  );
}
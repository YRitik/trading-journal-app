"use client";

import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";
import { useTrades } from "../context/TradeContext"; // 1. Import the Brain

export default function RecentTrades() {
  const { trades } = useTrades(); // 2. Get the real data

  // We only want to show the top 5 most recent trades
  const recentHistory = trades.slice(0, 5);

  return (
    <div className="bg-surface rounded-card p-6 shadow-premium border border-white/5 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-text-main font-bold text-lg">Recent Activity</h3>
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <MoreHorizontal className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pr-2 space-y-4">
        {/* If no trades exist, show a helpful message */}
        {recentHistory.length === 0 ? (
          <p className="text-text-muted text-center mt-10">No trades logged yet.</p>
        ) : (
          recentHistory.map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 group">
              
              {/* Left Side: Symbol & Type */}
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${trade.pnl >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {trade.pnl >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-text-main font-bold text-sm">{trade.pair}</p>
                  <p className="text-xs text-text-muted">{trade.type} • {trade.date}</p>
                </div>
              </div>

              {/* Right Side: P&L Amount */}
              <div className="text-right">
                <p className={`font-bold text-sm ${trade.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {trade.pnl > 0 ? "+" : ""}${trade.pnl}
                </p>
                <p className="text-xs text-text-muted">
                  {trade.status}
                </p>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
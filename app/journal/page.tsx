"use client";

import { useState } from "react";
import { Filter, Download, Plus, Search, Trash2 } from "lucide-react";
import TradeModal from "../../components/TradeModal";
import { useTrades } from "../../context/TradeContext";

export default function JournalPage() {
  const { trades, addTrade, deleteTrade } = useTrades();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveTrade = (newTradeData: any) => {
    addTrade(newTradeData);
  };

  // Helper to color the AI tags
  const getTagColor = (tag: string) => {
    switch (tag) {
      case "FOMO": return "bg-orange-500/20 text-orange-400 border-orange-500/20";
      case "Revenge": return "bg-red-500/20 text-red-400 border-red-500/20";
      case "Gambler": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/20";
      case "Disciplined": return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      default: return "bg-white/10 text-text-muted";
    }
  };

  return (
    <div className="p-8 space-y-6 relative">
      <TradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTrade} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main">Trade Journal</h1>
          <p className="text-text-muted">Review your performance and psychology.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-glow-blue" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Log New Trade
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-card border border-white/5 overflow-hidden shadow-premium">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-text-muted text-sm">
              <th className="p-4 font-medium">Date/Pair</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Entry/Exit</th>
              <th className="p-4 font-medium">P&L</th>
              <th className="p-4 font-medium">Psychology (AI)</th> {/* New Column */}
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-text-main text-sm">
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                <td className="p-4">
                  <div className="font-bold">{trade.pair}</div>
                  <div className="text-xs text-text-muted">{trade.date}</div>
                </td>
                <td className={`p-4 font-medium ${trade.type === 'Buy' ? 'text-success' : 'text-danger'}`}>
                  {trade.type}
                </td>
                <td className="p-4 text-xs text-text-muted">
                  <div>In: {trade.entry}</div>
                  <div>Out: {trade.exit}</div>
                </td>
                <td className={`p-4 font-bold ${trade.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  ${trade.pnl}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {/* Render the Tags */}
                    {trade.tags && trade.tags.length > 0 ? (
                      trade.tags.map(tag => (
                        <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full border ${getTagColor(tag)}`}>
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-muted">-</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => { if(confirm('Delete?')) deleteTrade(trade.id); }}
                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
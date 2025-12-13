"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import TradeModal from "../../components/TradeModal";
import CalendarView from "../../components/CalendarView"; // <--- Import
import { useTrades } from "../../context/TradeContext";

export default function JournalPage() {
  const { trades, addTrade, deleteTrade } = useTrades();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ... (Keep existing helpers like getTagColor)
  const getTagColor = (tag: string) => {
     switch (tag) {
       case "FOMO": return "bg-orange-500/20 text-orange-400 border-orange-500/20";
       case "Revenge": return "bg-red-500/20 text-red-400 border-red-500/20";
       case "Disciplined": return "bg-blue-500/20 text-blue-400 border-blue-500/20";
       default: return "bg-white/10 text-text-muted";
     }
  };

  return (
    <div className="p-8 space-y-8">
      <TradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addTrade} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-main">Trade Journal</h1>
          <p className="text-text-muted">Visualize your consistency.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 shadow-glow-blue" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Log Trade
        </button>
      </div>

      {/* NEW CALENDAR SECTION */}
      <CalendarView />

      {/* EXISTING TABLE SECTION */}
      <div className="bg-surface rounded-card border border-white/5 overflow-hidden shadow-premium">
        <div className="p-4 border-b border-white/5 bg-white/5">
            <h3 className="font-bold text-text-main">Detailed History</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-text-muted text-sm">
              <th className="p-4 font-medium">Date/Pair</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Details</th> {/* Updated Header */}
              <th className="p-4 font-medium">P&L</th>
              <th className="p-4 font-medium">Tags</th>
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
                  {/* Updated Details Column */}
                  <div><span className="text-text-main font-bold">Entry:</span> {trade.entry}</div>
                  <div><span className="text-text-main font-bold">Exit:</span> {trade.exit}</div>
                  <div><span className="text-text-main font-bold">Lot:</span> {trade.lotSize}</div>
                </td>
                <td className={`p-4 font-bold ${trade.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  ${trade.pnl}
                </td>
                <td className="p-4">
                   <div className="flex flex-wrap gap-2">
                    {trade.tags?.map(tag => (
                      <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full border ${getTagColor(tag)}`}>{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => { if(confirm('Delete?')) deleteTrade(trade.id); }}
                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
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
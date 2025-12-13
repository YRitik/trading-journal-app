"use client";

import { X, Sparkles } from "lucide-react";
import { FormEvent } from "react";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tradeData: any) => void;
}

// Simple AI Tagging Logic
const analyzePsychology = (text: string): string[] => {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  if (lower.includes("late") || lower.includes("chase")) tags.push("FOMO");
  if (lower.includes("recover") || lower.includes("revenge")) tags.push("Revenge");
  if (lower.includes("plan") || lower.includes("rules")) tags.push("Disciplined");
  return tags;
};

export default function TradeModal({ isOpen, onClose, onSave }: TradeModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const entry = Number(formData.get("entry"));
    const exit = Number(formData.get("exit"));
    const stopLoss = Number(formData.get("stopLoss"));
    const lotSize = Number(formData.get("lotSize"));
    const type = formData.get("type") as string;
    const notes = formData.get("notes") as string;
    
    // Auto-calculate PnL based on simple difference (for now)
    // In a real app, we'd use the contract size math here
    let rawDiff = type === "Buy" ? (exit - entry) : (entry - exit);
    // Rough estimate: rawDiff * lotSize * (100 for Gold/ 100000 for Forex)
    // For simplicity, let's let the user enter PnL manually or keep it simple:
    // We will just use raw difference * lotSize * 100 (assuming Gold) for the demo
    const calculatedPnl = Number((rawDiff * lotSize * 100).toFixed(2)); 

    const newTrade = {
      pair: formData.get("pair"),
      type,
      entry,
      exit,
      stopLoss, // New Field
      lotSize,  // New Field
      pnl: calculatedPnl,
      status: calculatedPnl > 0 ? "Win" : calculatedPnl < 0 ? "Loss" : "BE",
      date: new Date().toISOString().split('T')[0], // Save as YYYY-MM-DD for Calendar
      notes,
      tags: analyzePsychology(notes),
    };

    onSave(newTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface rounded-card border border-white/10 shadow-premium p-6 relative animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-main">Log New Trade</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Row 1: Symbol & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted uppercase">Symbol</label>
              {/* Datalist gives us a dropdown + typing capability */}
              <input list="pairs" name="pair" required placeholder="XAUUSD" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main" />
              <datalist id="pairs">
                <option value="XAUUSD" />
                <option value="EURUSD" />
                <option value="GBPUSD" />
                <option value="BTCUSD" />
                <option value="US30" />
              </datalist>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted uppercase">Type</label>
              <select name="type" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main">
                <option value="Buy">Buy (Long)</option>
                <option value="Sell">Sell (Short)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Lot Size & Stop Loss */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted uppercase">Lot Size</label>
              <input name="lotSize" required type="number" step="0.01" placeholder="1.00" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted uppercase">Stop Loss</label>
              <input name="stopLoss" required type="number" step="0.01" placeholder="Price" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main" />
            </div>
          </div>

          {/* Row 3: Entry & Exit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted uppercase">Entry Price</label>
              <input name="entry" required type="number" step="0.01" placeholder="0.00" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted uppercase">Exit Price</label>
              <input name="exit" required type="number" step="0.01" placeholder="0.00" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main" />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-muted uppercase">Notes</label>
            <textarea name="notes" placeholder="Psychology..." rows={2} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main"></textarea>
          </div>

          <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-glow-blue">Save Trade</button>

        </form>
      </div>
    </div>
  );
}
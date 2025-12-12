"use client";

import { X, Sparkles } from "lucide-react";
import { FormEvent } from "react";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tradeData: any) => void;
}

// --- THE AI LOGIC ---
const analyzePsychology = (text: string): string[] => {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  // Rule 1: FOMO (Fear Of Missing Out)
  if (lower.includes("late") || lower.includes("chase") || lower.includes("missed") || lower.includes("fast")) {
    tags.push("FOMO");
  }

  // Rule 2: Revenge Trading
  if (lower.includes("recover") || lower.includes("back") || lower.includes("angry") || lower.includes("revenge")) {
    tags.push("Revenge");
  }

  // Rule 3: Gambling / Lack of Confidence
  if (lower.includes("hope") || lower.includes("guess") || lower.includes("maybe") || lower.includes("feel")) {
    tags.push("Gambler");
  }

  // Rule 4: Disciplined / Technical
  if (lower.includes("plan") || lower.includes("setup") || lower.includes("wait") || lower.includes("rules")) {
    tags.push("Disciplined");
  }

  return tags;
};

export default function TradeModal({ isOpen, onClose, onSave }: TradeModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const type = formData.get("type") as string;
    const entry = Number(formData.get("entry"));
    const exit = Number(formData.get("exit"));
    const notes = formData.get("notes") as string;

    // Run the AI Analysis on the notes
    const generatedTags = analyzePsychology(notes);

    let calculatedPnl = 0;
    if (type === "Buy") {
      calculatedPnl = exit - entry;
    } else {
      calculatedPnl = entry - exit;
    }

    const newTrade = {
      pair: formData.get("pair"),
      type: type,
      entry: entry,
      exit: exit,
      status: calculatedPnl >= 0 ? "Win" : "Loss",
      pnl: Number(calculatedPnl.toFixed(2)),
      date: new Date().toLocaleDateString(),
      notes: notes,
      tags: generatedTags, // Save the AI tags
    };

    onSave(newTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface rounded-card border border-white/10 shadow-premium p-6 relative animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-main">Log New Trade</h2>
            <span className="flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
              <Sparkles className="w-3 h-3" /> AI Active
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-text-muted hover:text-text-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted uppercase">Symbol</label>
              <input name="pair" required type="text" placeholder="e.g. XAUUSD" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted uppercase">Type</label>
              <select name="type" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main focus:border-primary focus:outline-none transition-colors">
                <option value="Buy">Buy (Long)</option>
                <option value="Sell">Sell (Short)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted uppercase">Entry Price</label>
              <input name="entry" required type="number" step="0.01" placeholder="0.00" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted uppercase">Exit Price</label>
              <input name="exit" required type="number" step="0.01" placeholder="0.00" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-text-muted uppercase">Psychology Notes</label>
            <textarea 
              name="notes" 
              placeholder="How were you feeling? (e.g., 'I chased the candle', 'Followed my plan')" 
              rows={3} 
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main focus:border-primary focus:outline-none transition-colors"
            ></textarea>
            <p className="text-[10px] text-text-muted">*AI will scan this for emotions.</p>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-white/5 text-text-main font-bold rounded-lg hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-glow-blue transition-colors">
              Save Analysis
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
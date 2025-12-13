"use client";

import { useState, useEffect } from "react";
import { Calculator, X, Bitcoin, DollarSign, Coins } from "lucide-react";
import { useTrades } from "../context/TradeContext";

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RiskCalculator({ isOpen, onClose }: CalculatorProps) {
  const { totalBalance } = useTrades();
  
  // Tabs: "gold" | "forex" | "crypto"
  const [mode, setMode] = useState<"gold" | "forex" | "crypto">("gold");

  // Inputs
  const [balance, setBalance] = useState(totalBalance);
  const [riskPercent, setRiskPercent] = useState(1.0);
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [stopLoss, setStopLoss] = useState<string>("");

  // Results
  const [riskAmount, setRiskAmount] = useState(0);
  const [lotSize, setLotSize] = useState(0);

  // Sync balance when modal opens
  useEffect(() => {
    if (isOpen) setBalance(totalBalance);
  }, [isOpen, totalBalance]);

  // --- THE MATH ENGINE ---
  const calculate = () => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    
    if (!entry || !sl || !balance) return;

    // 1. Calculate Risk Amount ($)
    const risk = balance * (riskPercent / 100);
    setRiskAmount(risk);

    // 2. Calculate Distance (Price difference)
    const distance = Math.abs(entry - sl);

    // 3. Determine Contract Size based on Mode
    let contractSize = 100; // Default Gold

    if (mode === "forex") {
      contractSize = 100000; // Standard Forex Lot
    } else if (mode === "crypto") {
      contractSize = 1; // Standard Crypto Lot (1 Lot = 1 Coin)
    }

    // 4. Calculate Lots
    // Formula: Risk / (Distance * ContractSize)
    const calculatedLots = risk / (distance * contractSize);

    setLotSize(calculatedLots);
  };

  // Auto-calculate whenever inputs change
  useEffect(() => {
    calculate();
  }, [balance, riskPercent, entryPrice, stopLoss, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-card border border-white/10 shadow-premium p-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-text-main">Risk Calculator</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-text-muted hover:text-text-main">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE SELECTOR (TABS) */}
        <div className="flex bg-black/20 p-1 rounded-lg mb-6 border border-white/5">
          <button 
            onClick={() => setMode("gold")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${mode === "gold" ? "bg-yellow-500 text-black shadow-glow-gold" : "text-text-muted hover:text-white"}`}
          >
            <Coins className="w-4 h-4" /> Gold
          </button>
          <button 
            onClick={() => setMode("forex")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${mode === "forex" ? "bg-blue-500 text-white shadow-glow-blue" : "text-text-muted hover:text-white"}`}
          >
            <DollarSign className="w-4 h-4" /> Forex
          </button>
          <button 
            onClick={() => setMode("crypto")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${mode === "crypto" ? "bg-orange-500 text-white shadow-glow-orange" : "text-text-muted hover:text-white"}`}
          >
            <Bitcoin className="w-4 h-4" /> BTC
          </button>
        </div>

        <div className="space-y-4">
          
          {/* Row 1: Balance & Risk */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Balance ($)</label>
              <input 
                type="number" 
                value={balance} 
                onChange={(e) => setBalance(parseFloat(e.target.value))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Risk (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={riskPercent} 
                onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main font-mono"
              />
            </div>
          </div>

          {/* Row 2: Entry & SL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Entry Price</label>
              <input 
                type="number" 
                placeholder={mode === "forex" ? "1.1050" : "2000.00"}
                value={entryPrice} 
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main font-mono focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Stop Loss</label>
              <input 
                type="number" 
                placeholder={mode === "forex" ? "1.1040" : "1995.00"}
                value={stopLoss} 
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main font-mono focus:border-red-500/50 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="h-px bg-white/10 my-4"></div>

          {/* Results Area */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
              <p className="text-xs text-red-400 font-bold uppercase mb-1">Risk Amount</p>
              <p className="text-xl font-bold text-white font-mono">
                ${riskAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            
            <div className={`
              p-4 rounded-xl text-center relative overflow-hidden border
              ${mode === 'gold' ? 'bg-yellow-500/10 border-yellow-500/20' : ''}
              ${mode === 'forex' ? 'bg-blue-500/10 border-blue-500/20' : ''}
              ${mode === 'crypto' ? 'bg-orange-500/10 border-orange-500/20' : ''}
            `}>
              <p className={`text-xs font-bold uppercase mb-1 
                ${mode === 'gold' ? 'text-yellow-400' : ''}
                ${mode === 'forex' ? 'text-blue-400' : ''}
                ${mode === 'crypto' ? 'text-orange-400' : ''}
              `}>Lot Size</p>
              <p className="text-3xl font-bold text-white font-mono">
                {isFinite(lotSize) ? lotSize.toFixed(2) : "0.00"}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
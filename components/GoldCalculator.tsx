"use client";

import { useState, useEffect } from "react";
import { Calculator, X, RefreshCw } from "lucide-react";
import { useTrades } from "../context/TradeContext";

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoldCalculator({ isOpen, onClose }: CalculatorProps) {
  const { totalBalance } = useTrades(); // Auto-fill current balance
  
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

  // The Magic Math 🧮
  const calculate = () => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    
    if (!entry || !sl || !balance) return;

    // 1. Calculate Risk Amount ($)
    const risk = balance * (riskPercent / 100);
    setRiskAmount(risk);

    // 2. Calculate Distance (Price difference)
    const distance = Math.abs(entry - sl);

    // 3. Calculate Lots (Standard Contract = 100 units)
    // Formula: Risk / (Distance * ContractSize)
    const calculatedLots = risk / (distance * 100);

    setLotSize(calculatedLots);
  };

  // Auto-calculate whenever inputs change
  useEffect(() => {
    calculate();
  }, [balance, riskPercent, entryPrice, stopLoss]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-card border border-white/10 shadow-premium p-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-gold">
            <Calculator className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-text-main">XAUUSD Calculator</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-text-muted hover:text-text-main">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          
          {/* Row 1: Balance & Risk % */}
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
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  step="0.1"
                  value={riskPercent} 
                  onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main font-mono"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Entry & SL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Entry Price</label>
              <input 
                type="number" 
                placeholder="2030.50"
                value={entryPrice} 
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main font-mono focus:border-yellow-500/50 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase">Stop Loss</label>
              <input 
                type="number" 
                placeholder="2025.00"
                value={stopLoss} 
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-main font-mono focus:border-red-500/50 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 my-4"></div>

          {/* Results Area */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
              <p className="text-xs text-red-400 font-bold uppercase mb-1">Risk Amount</p>
              <p className="text-xl font-bold text-white font-mono">
                ${riskAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-center relative overflow-hidden">
              {/* Subtle gold glow effect */}
              <div className="absolute top-0 right-0 w-10 h-10 bg-yellow-500/20 blur-xl"></div>
              
              <p className="text-xs text-yellow-400 font-bold uppercase mb-1">Lot Size</p>
              <p className="text-3xl font-bold text-white font-mono">
                {isFinite(lotSize) ? lotSize.toFixed(2) : "0.00"}
              </p>
            </div>
          </div>

          <p className="text-[10px] text-center text-text-muted">
            *Calculated for Standard Contract (100oz).
          </p>

        </div>
      </div>
    </div>
  );
}
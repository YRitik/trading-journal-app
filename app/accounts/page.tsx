"use client";

import { useState } from "react";
import { Plus, Trash2, Wallet, ShieldCheck, Trophy } from "lucide-react";
import { useTrades } from "../../context/TradeContext";

export default function AccountsPage() {
  const { accounts, activeAccountId, switchAccount, addAccount, deleteAccount } = useTrades();
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState("");
  const [newBalance, setNewBalance] = useState("100000");
  const [newType, setNewType] = useState("Challenge");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBalance) return;
    await addAccount(newName, parseFloat(newBalance), newType);
    setIsAdding(false);
    setNewName("");
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-main">Accounts</h1>
          <p className="text-text-muted">Manage your funded challenges and personal accounts.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 shadow-glow-blue transition-all"
        >
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {/* Add Account Form (Collapsible) */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-surface border border-white/10 p-6 rounded-card shadow-lg animate-in slide-in-from-top-4">
          <h3 className="font-bold text-lg mb-4">Create New Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-text-muted uppercase font-bold">Account Name</label>
              <input 
                type="text" 
                placeholder="e.g. FTMO 100k" 
                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-text-main focus:border-primary outline-none"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase font-bold">Initial Balance</label>
              <input 
                type="number" 
                placeholder="100000" 
                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-text-main focus:border-primary outline-none"
                value={newBalance}
                onChange={e => setNewBalance(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase font-bold">Type</label>
              <select 
                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-text-main focus:border-primary outline-none"
                value={newType}
                onChange={e => setNewType(e.target.value)}
              >
                <option value="Challenge">Challenge Phase</option>
                <option value="Funded">Funded Live</option>
                <option value="Personal">Personal Account</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
             <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-text-muted hover:text-text-main">Cancel</button>
             <button type="submit" className="px-4 py-2 bg-success text-black font-bold rounded-lg hover:bg-success/90">Create Account</button>
          </div>
        </form>
      )}

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => {
          const isActive = account.id === activeAccountId;
          const isProfit = (account.currentBalance || 0) >= account.initialBalance;
          
          return (
            <div 
              key={account.id} 
              onClick={() => switchAccount(account.id)}
              className={`
                relative p-6 rounded-card border cursor-pointer transition-all duration-300 group
                ${isActive 
                   ? "bg-primary/5 border-primary shadow-glow-blue" 
                   : "bg-surface border-white/5 hover:border-white/20 hover:bg-white/5"
                }
              `}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-4 right-4 text-xs font-bold text-primary bg-primary/20 px-2 py-1 rounded-full">
                  ACTIVE
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-muted'}`}>
                {account.type === 'Funded' ? <Trophy className="w-6 h-6" /> : 
                 account.type === 'Challenge' ? <ShieldCheck className="w-6 h-6" /> : 
                 <Wallet className="w-6 h-6" />}
              </div>

              {/* Details */}
              <h3 className="text-xl font-bold text-text-main">{account.name}</h3>
              <p className="text-text-muted text-sm mb-4">{account.type}</p>

              {/* Balance Comparison */}
              <div className="space-y-2 bg-black/20 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                   <span className="text-text-muted">Initial:</span>
                   <span className="text-text-main font-mono">${account.initialBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-text-muted">Current:</span>
                   <span className={`font-mono font-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                     ${account.currentBalance?.toLocaleString()}
                   </span>
                </div>
              </div>

              {/* Delete Button (Only visible on hover) */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent switching account when clicking delete
                    if (confirm(`Are you sure you want to delete ${account.name}? This will hide its trades.`)) {
                      deleteAccount(account.id);
                    }
                  }}
                  className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
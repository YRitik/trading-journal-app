"use client";

import { useState } from "react";
import { useTrades } from "../../context/TradeContext";
import { Plus, CheckCircle, ShieldCheck, Briefcase } from "lucide-react";

export default function AccountsPage() {
  const { accounts, activeAccountId, switchAccount, addAccount } = useTrades();
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newBalance, setNewBalance] = useState("100000");
  const [newType, setNewType] = useState("Challenge");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount(newName, Number(newBalance), newType);
    setIsCreating(false);
    setNewName("");
  };

  return (
    <div className="p-8 space-y-8">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-main mb-2">My Accounts</h1>
          <p className="text-text-muted">Manage your prop firm challenges and funded accounts.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-glow-blue"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Creation Form (Only visible when clicking Add Account) */}
      {isCreating && (
        <div className="bg-surface border border-white/10 p-6 rounded-card animate-in fade-in zoom-in duration-200">
          <h3 className="font-bold text-lg mb-4">Setup New Account</h3>
          <form onSubmit={handleCreate} className="flex gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Account Name</label>
              <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. FTMO Phase 1" className="bg-black/20 border border-white/10 rounded-lg p-2 text-text-main w-64" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Initial Balance</label>
              <input required type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} className="bg-black/20 border border-white/10 rounded-lg p-2 text-text-main w-40" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} className="bg-black/20 border border-white/10 rounded-lg p-2 text-text-main w-40">
                <option>Challenge</option>
                <option>Funded</option>
                <option>Personal</option>
              </select>
            </div>
            <button type="submit" className="px-6 py-2 bg-success text-white font-bold rounded-lg hover:bg-success/90">
              Create
            </button>
            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-text-muted hover:text-text-main">
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Account Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => {
          const isActive = account.id === activeAccountId;
          
          return (
            <div 
              key={account.id}
              onClick={() => switchAccount(account.id)}
              className={`
                relative p-6 rounded-card border cursor-pointer transition-all duration-200 group
                ${isActive 
                  ? "bg-surface border-primary shadow-glow-blue" 
                  : "bg-surface border-white/5 hover:border-white/20"
                }
              `}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-4 right-4 text-primary">
                  <CheckCircle className="w-6 h-6" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-text-muted"}`}>
                  {account.type === 'Funded' ? <ShieldCheck className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isActive ? "text-white" : "text-text-muted group-hover:text-text-main"}`}>
                    {account.name}
                  </h3>
                  <p className="text-xs text-text-muted">{account.type}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                 <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Starting Balance</p>
                 <p className="text-2xl font-bold text-text-main">${account.initialBalance.toLocaleString()}</p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
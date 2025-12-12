"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { useTrades } from "../context/TradeContext";

export default function AssetChart() {
  const { trades } = useTrades();

  // --- THE LOGIC: Group trades by Pair ---
  const performance = trades.reduce((acc: any, trade) => {
    // If we haven't seen this pair yet, initialize it
    if (!acc[trade.pair]) {
      acc[trade.pair] = 0;
    }
    // Add the P&L to the pair's total
    acc[trade.pair] += trade.pnl;
    return acc;
  }, {});

  // Convert the object into an array for the chart
  const data = Object.keys(performance).map((pair) => ({
    name: pair,
    pnl: performance[pair],
  })).sort((a, b) => b.pnl - a.pnl); // Sort best to worst

  return (
    <div className="bg-surface rounded-card p-6 shadow-premium border border-white/5 h-[400px]">
      <h3 className="text-text-main font-bold text-lg mb-6">Performance by Pair</h3>
      
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#848E9C" 
              width={60}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={{ fill: '#ffffff05' }}
              contentStyle={{ backgroundColor: '#151A21', border: '1px solid #ffffff10', borderRadius: '8px' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Net P&L"]}
            />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]} barSize={30}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-text-muted">
          No data available
        </div>
      )}
    </div>
  );
}
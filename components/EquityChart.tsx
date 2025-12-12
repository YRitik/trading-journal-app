"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useTrades } from "../context/TradeContext"; // 1. Import the Brain

export default function EquityChart() {
  const { trades } = useTrades(); // 2. Get the real trades

  // --- THE MATH SECTION ---
  // We need to transform the list of trades into a "Balance History"
  // Start with initial balance
  let currentBalance = 100000;

  // We want to show the chart in chronological order (oldest to newest)
  // Our 'trades' list is Newest-First, so we reverse it for the chart
  const chronologicTrades = [...trades].reverse();

  const data = chronologicTrades.map((trade, index) => {
    currentBalance += trade.pnl; // Add the profit/loss to the running total
    
    return {
      name: index + 1, // Trade #1, #2, etc.
      balance: currentBalance,
      date: trade.date,
    };
  });

  // If no trades exist yet, show a flat line at 100k
  const chartData = data.length > 0 ? data : [{ name: 0, balance: 100000 }];

  return (
    <div className="bg-surface rounded-card p-6 shadow-premium border border-white/5 h-[400px]">
      <h3 className="text-text-main font-bold text-lg mb-6">Equity Curve</h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#848E9C" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#848E9C" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#151A21', border: '1px solid #ffffff10', borderRadius: '8px' }}
              itemStyle={{ color: '#10B981' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Balance"]}
              labelFormatter={() => ""}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#10B981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorBalance)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
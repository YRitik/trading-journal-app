"use client";

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend,
  Tooltip 
} from 'recharts';
import { useTrades } from "../context/TradeContext";

export default function DirectionPie() {
  const { trades } = useTrades();

  // Logic: Count how many Buys vs. Sells
  const buyCount = trades.filter(t => t.type === "Buy").length;
  const sellCount = trades.filter(t => t.type === "Sell").length;

  const data = [
    { name: 'Longs (Buy)', value: buyCount },
    { name: 'Shorts (Sell)', value: sellCount },
  ];

  const COLORS = ['#007AFF', '#A855F7']; // Blue for Buys, Purple for Sells

  return (
    <div className="bg-surface rounded-card p-6 shadow-premium border border-white/5 h-[400px]">
      <h3 className="text-text-main font-bold text-lg mb-2">Directional Bias</h3>
      <p className="text-text-muted text-xs mb-6">Are you favoring one side?</p>
      
      {trades.length > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#151A21', border: '1px solid #ffffff10', borderRadius: '8px' }}
              itemStyle={{ color: '#EAECEF' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-text-muted">
          No data available
        </div>
      )}
    </div>
  );
}
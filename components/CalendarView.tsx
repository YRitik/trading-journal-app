"use client";

import { useTrades } from "../context/TradeContext";

export default function CalendarView() {
  const { trades } = useTrades();

  // 1. Get current Month/Year details
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)

  // 2. Group Trades by Date (YYYY-MM-DD)
  // We need two trackers: one for Money (PnL) and one for Volume (Count)
  const dailyPnL: { [key: string]: number } = {};
  const dailyCount: { [key: string]: number } = {}; // <--- NEW TRACKER
  
  trades.forEach(trade => {
    // Ensure date matches current month/year
    const tradeDate = new Date(trade.date);
    if (tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear) {
      const dateKey = trade.date; // "YYYY-MM-DD"
      
      // Init if empty
      if (!dailyPnL[dateKey]) {
        dailyPnL[dateKey] = 0;
        dailyCount[dateKey] = 0;
      }

      // Add data
      dailyPnL[dateKey] += trade.pnl;
      dailyCount[dateKey] += 1; // <--- Increment Count
    }
  });

  // 3. Build the Grid Logic
  let weeks = [];
  let currentWeek = new Array(7).fill(null);
  
  let dayCounter = 1;
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek[i] = null; 
  }

  for (let i = firstDayOfMonth; i < 7; i++) {
    currentWeek[i] = dayCounter++;
  }
  weeks.push(currentWeek);

  while (dayCounter <= daysInMonth) {
    let week = new Array(7).fill(null);
    for (let i = 0; i < 7 && dayCounter <= daysInMonth; i++) {
      week[i] = dayCounter++;
    }
    weeks.push(week);
  }

  // Helper for background colors
  const getDayColor = (pnl: number) => {
    if (pnl > 0) return "bg-success/20 text-success border-success/30";
    if (pnl < 0) return "bg-danger/20 text-danger border-danger/30";
    return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"; // BE
  };

  const totalMonthlyPnL = Object.values(dailyPnL).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-surface rounded-card p-6 shadow-premium border border-white/5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-text-main">
          {today.toLocaleString('default', { month: 'long' })} {currentYear}
        </h3>
        <div className="text-sm font-bold text-text-muted">Monthly PnL: <span className={totalMonthlyPnL >= 0 ? "text-success" : "text-danger"}>${totalMonthlyPnL.toLocaleString()}</span></div>
      </div>

      <div className="flex gap-6">
        {/* CALENDAR GRID */}
        <div className="flex-1">
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs text-text-muted font-bold uppercase">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          
          <div className="space-y-2">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="grid grid-cols-7 gap-2 h-24">
                {week.map((day, dIndex) => {
                  if (!day) return <div key={dIndex} className="bg-transparent"></div>;

                  // Format date key YYYY-MM-DD
                  const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  
                  const pnl = dailyPnL[dateString];
                  const count = dailyCount[dateString]; // Get the trade count
                  const hasTrade = pnl !== undefined;

                  return (
                    <div 
                      key={dIndex} 
                      className={`
                        relative rounded-lg p-2 border transition-all flex flex-col justify-between
                        ${hasTrade ? getDayColor(pnl) : "bg-white/5 border-white/5 text-text-muted"}
                      `}
                    >
                      {/* Top Left: Date Number */}
                      <span className="text-xs font-bold opacity-50">{day}</span>
                      
                      {hasTrade && (
                        <>
                          {/* Center: PnL Amount */}
                          <div className="flex-1 flex items-center justify-center">
                            <span className="font-bold text-sm">${pnl}</span>
                          </div>
                          
                          {/* Bottom Right: Trade Count Badge */}
                          <div className="flex justify-end">
                            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-text-main/70 font-medium">
                              {count} Trades
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* WEEKLY PNL SIDEBAR */}
        <div className="w-48 space-y-2 pt-8">
           {weeks.map((week, wIndex) => {
             let weeklySum = 0;
             week.forEach(day => {
               if (day) {
                 const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                 if (dailyPnL[dateString]) weeklySum += dailyPnL[dateString];
               }
             });

             return (
               <div key={wIndex} className="h-24 flex items-center justify-end pr-4 border-r-2 border-white/10">
                 <div className="text-right">
                   <p className="text-xs text-text-muted uppercase mb-1">Week {wIndex + 1}</p>
                   <p className={`font-bold ${weeklySum >= 0 ? "text-success" : "text-danger"}`}>
                     {weeklySum > 0 ? "+" : ""}${weeklySum.toLocaleString()}
                   </p>
                 </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}
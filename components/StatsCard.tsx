interface StatsCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean; // If true, green. If false, red.
  icon?: any; // We will pass an icon here
}

export default function StatsCard({ title, value, trend, trendUp, icon: Icon }: StatsCardProps) {
  return (
    <div className="bg-surface rounded-card p-6 shadow-premium border border-white/5 hover:border-primary/20 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-text-muted text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-text-main tracking-tight">{value}</h3>
        </div>
        
        {/* Render the icon if one is provided */}
        {Icon && (
          <div className="p-3 bg-white/5 rounded-xl">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      {/* Only show the trend line if data exists */}
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            trendUp 
              ? "text-success bg-success/10" 
              : "text-danger bg-danger/10"
          }`}>
            {trend}
          </span>
          <span className="text-text-muted text-xs ml-2">from last month</span>
        </div>
      )}
    </div>
  );
}
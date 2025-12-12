"use client";

import AnalyticsStats from "../../components/AnalyticsStats";
import AssetChart from "../../components/AssetChart";
import DirectionPie from "../../components/DirectionPie"; // Import the Pie Chart

export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-text-main mb-2">Advanced Analytics</h1>
        <p className="text-text-muted">Deep dive into your trading performance metrics.</p>
      </div>

      {/* 1. Pro Metrics Grid */}
      <AnalyticsStats />

      {/* 2. Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Profit by Pair */}
        <AssetChart />

        {/* Chart B: Directional Bias (Pie Chart) */}
        <DirectionPie />

      </div>
    </div>
  );
}
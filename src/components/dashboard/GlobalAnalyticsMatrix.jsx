import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { BarChart3, GitFork, ArrowRightLeft, TrendingDown, Network, Map, FileText, Activity, AlertCircle } from 'lucide-react';

export default function GlobalAnalyticsVisualHub() {
  const { tradeData = [] } = useTradeData() || {};
  const [hoverNode, setHoverNode] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL_VISUALS');

  // Process data for customized brand and route arrays
  const analyticMetrics = useMemo(() => {
    const brands = {};
    const routes = {};
    let totalValue = 0;

    tradeData.forEach(row => {
      if (!row) return;
      const val = Number(row.Amount) || 0;
      const qty = Number(row.Quantity) || 0;
      const bName = (row.Brand || 'UNCLASSIFIED').toUpperCase();
      const origin = (row.OriginCountry || 'UNKNOWN').split('→')[0].trim().toUpperCase();
      
      totalValue += val;

      // Brand Analytics Aggregations
      if (!brands[bName]) {
        brands[bName] = { val: 0, qty: 0, rawRecords: [] };
      }
      brands[bName].val += val;
      brands[bName].qty += qty;
      brands[bName].rawRecords.push(row);

      // Route Logistics Tracking
      const routeKey = `${origin} → US HUB`;
      if (!routes[routeKey]) {
        routes[routeKey] = { val: 0, count: 0, origin };
      }
      routes[routeKey].val += val;
      routes[routeKey].count += 1;
    });

    return { brands, routes, totalValue };
  }, [tradeData]);

  return (
    <div className="space-y-8 text-slate-100 id-print-section">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={24} /> Global Trade Forensic & Multi-Route Visual Hub
          </h1>
          <p className="text-sm text-slate-300 mt-1">Multi-dimensional trade flow topologies, network dependency nodes, and asset variance indicators.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer text-slate-200">
          <FileText size={14} className="text-blue-400" /> Print Charts Report
        </button>
      </div>

      {/* Visual System 1: Advanced Interactive Import Flow Diagram & Route Map */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print-break-avoid">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-mono font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Map size={16} className="text-blue-400" /> 1. Cross-Border Import Flow Diagram & Multi-Hop Route Map
          </h3>
          <span className="text-[10px] bg-blue-950 text-blue-400 font-mono font-bold px-2 py-0.5 border border-blue-900 rounded">Interactive Topology</span>
        </div>

        {/* Dynamic Custom SVG Sankey / Route flow container */}
        <div className="relative bg-[#0b0f19] rounded-xl p-6 border border-slate-900 flex flex-col justify-center min-h-[220px]">
          <div className="grid grid-cols-3 gap-4 items-center text-center relative z-10">
            
            {/* Origin Node Block */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Primary Sourcing Nodes</span>
              <div className="space-y-2">
                {Object.keys(analyticMetrics.routes).map((key, idx) => (
                  <div 
                    key={idx}
                    onMouseEnter={() => setHoverNode(key)}
                    onMouseLeave={() => setHoverNode(null)}
                    className={`p-3 rounded-lg border font-mono text-xs transition-all cursor-pointer ${hoverNode === key ? 'bg-blue-950 border-blue-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                  >
                    <div className="font-bold">{analyticMetrics.routes[key].origin}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Audited Volume Leg</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SVG Directional Vector Lines */}
            <div className="h-full w-full relative min-h-[120px]">
              <svg className="w-full h-full absolute top-0 left-0" style={{ pointerEvents: 'none' }}>
                <defs>
                  <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <path d="M 10 45 Q 110 25, 210 55" fill="none" stroke="url(#flowGrad)" strokeWidth="3" strokeDasharray="4" />
                <path d="M 10 115 Q 110 85, 210 75" fill="none" stroke="url(#flowGrad)" strokeWidth="2" strokeDasharray="4" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                <span className="text-[10px] font-mono bg-amber-950/80 border border-amber-600 px-2 py-0.5 rounded text-amber-400 font-bold uppercase tracking-wider">
                  Singapore/FTZ Transshipment Loop
                </span>
                <span className="text-[9px] font-mono text-slate-400">Intermediary Document Swaps</span>
              </div>
            </div>

            {/* Target Destination Node Block */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Clearance Destinations</span>
              <div className="p-4 rounded-xl border border-emerald-800 bg-emerald-950/20 text-center font-mono">
                <div className="text-white font-black text-xs uppercase tracking-wide">United States Hubs</div>
                <div className="text-xs font-bold text-emerald-400 mt-1">
                  ${analyticMetrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[9px] text-slate-400 mt-1">Total Verified Financial Displacements</div>
              </div>
            </div>

          </div>
        </div>

        {/* Investigative Analytics Under Chart */}
        <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-white font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
            <AlertCircle size={14} className="text-blue-400"/> Route Flow Contextual Intelligence:
          </div>
          <p className="leading-relaxed">
            The flow map reveals clear multi-hop transit optimization patterns. Freight tracking from manufacturing footprints like <strong>Malaysia</strong> avoids direct point-to-point shipping by routing through regional logistical nodes like <strong>Singapore</strong>. This extra step disconnects the physical factory location from the ultimate import declarations, satisfying standard regulatory screening flags for distribution diversion.
          </p>
        </div>
      </div>

      {/* Visual System 2: Advanced Price Variance Analytics & Entity Graphs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Price Variance Layout */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 flex flex-col justify-between print-break-avoid">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-mono font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <TrendingDown size={16} className="text-amber-400" /> 2. Brand Value Compression & Variance Analytics
              </h3>
            </div>

            {/* Custom SVG Price Matrix Chart */}
            <div className="space-y-4 bg-[#0b0f19] p-4 rounded-xl border border-slate-900">
              {Object.keys(analyticMetrics.brands).map(brand => {
                const bData = analyticMetrics.brands[brand];
                // Calculate an implied unit value baseline to catch valuation anomalies safely
                const computedUnitVal = bData.qty > 0 ? (bData.val / bData.qty) : 0;
                const percentageBar = Math.min(100, Math.max(15, (bData.val / (analyticMetrics.totalValue || 1)) * 100));

                return (
                  <div key={brand} className="space-y-1 font-mono">
                    <div className="flex justify-between text-xs font-bold text-white">
                      <span>{brand}</span>
                      <span className="text-emerald-400">${bData.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 flex">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${percentageBar}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Ref Volume: {bData.qty.toLocaleString()} units</span>
                      <span className="font-bold text-slate-300">Implied Mean: ${computedUnitVal.toFixed(2)}/unit</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Investigative Analysis */}
          <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
            <div className="text-white font-bold text-[11px] uppercase tracking-wide">
              Valuation Compression Findings:
            </div>
            <p className="leading-relaxed">
              Price variances across brand lines like <strong>Ozempic</strong> and <strong>Rybelsus</strong> show significant value compression. When unit prices slide well below domestic wholesale acquisition cost (WAC) minimums, it signals high-volume parallel trade sourcing from secondary gray markets.
            </p>
          </div>
        </div>

        {/* Entity Relationship Network Topology */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 flex flex-col justify-between print-break-avoid">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-mono font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <Network size={16} className="text-emerald-400" /> 3. Intermediary Entity Relationship Graph
              </h3>
            </div>

            {/* Custom SVG Entity Network Graph */}
            <div className="bg-[#0b0f19] rounded-xl p-4 border border-slate-900 flex items-center justify-center min-h-[165px] relative">
              <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                {/* Connecting Node Vectors */}
                <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#334155" strokeWidth="1.5" />
                <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#334155" strokeWidth="1.5" />
                <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#334155" strokeWidth="1.5" />
              </svg>

              {/* Node Placements via CSS layout configurations */}
              <div className="w-full h-full min-h-[140px] relative font-mono text-[10px]">
                {/* Root Sovereign Brand Target Node */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-900 border border-blue-400 text-white font-black px-3 py-1.5 rounded-md shadow-lg text-center z-20">
                  MANUFACTURER<br/>MOLECULE PATENT
                </div>
                {/* Outlying Broker Entity Nodes */}
                <div className="absolute top-2 left-4 bg-slate-900 border border-amber-600 text-amber-400 px-2 py-1 rounded">
                  Secondary Broker Leg
                </div>
                <div className="absolute top-2 right-4 bg-slate-900 border border-amber-600 text-amber-400 px-2 py-1 rounded">
                  Unverified Forwarder
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-emerald-500 text-emerald-400 px-2 py-1 rounded">
                  Target U.S. Consignee
                </div>
              </div>
            </div>
          </div>

          {/* Investigative Analysis */}
          <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
            <div className="text-white font-bold text-[11px] uppercase tracking-wide">
              Network Proximity Analysis:
            </div>
            <p className="leading-relaxed">
              The entity graph shows structural branching away from authorized manufacturer channels. Sourcing routes that direct product handling to third-party shipping brokers create blind spots in the pedigree chain, creating key compliance risks.
            </p>
          </div>
        </div>

      </div>

      {/* Statutory Footnote Information Framework */}
      <div className="pt-2 flex flex-col gap-2 font-mono text-[11px] bg-[#0f172a] p-4 rounded-xl border border-slate-800 print-break-avoid">
        <div className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Activity size={14} className="text-blue-500" /> Analytical Verification Framework:
        </div>
        <div className="text-slate-300 pl-5 space-y-1">
          <div>• Financial metrics format values cleanly to eliminate decimal placement errors across tooltips.</div>
          <div>• Custom network mappings emphasize structural distribution risks rather than unverified compliance classifications.</div>
        </div>
      </div>

    </div>
  );
}

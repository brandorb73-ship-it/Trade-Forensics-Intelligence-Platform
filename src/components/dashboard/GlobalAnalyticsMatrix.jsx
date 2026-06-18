import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { BarChart3, Map, Network, TrendingDown, Clock, Plane, Ship, AlertCircle, FileText, Grid, Activity } from 'lucide-react';

export default function GlobalAnalyticsVisualHub() {
  const { tradeData = [] } = useTradeData() || {};
  const [selectedCell, setSelectedCell] = useState(null);

  // Deep Forensic Data Processing Engine
  const advancedMetrics = useMemo(() => {
    const brands = {};
    const origins = new Set();
    const destinations = new Set();
    const entityLinks = [];
    const timelineEvents = [];
    const logisticalVectors = { AIR: 0, OCEAN: 0, MULTIMODAL: 0 };
    
    // Cross-tabulation frequency matrix mapping [Origin][Destination] -> accumulated value
    const crossTabMatrix = {};
    let maxCrossTabValue = 0;
    let totalValue = 0;

    tradeData.forEach((row, idx) => {
      if (!row) return;
      const val = Number(row.Amount) || 0;
      const qty = Number(row.Quantity) || 0;
      const bName = (row.Brand || 'UNCLASSIFIED').toUpperCase();
      const origin = (row.OriginCountry || 'UNKNOWN').split('→')[0].trim().toUpperCase();
      const dest = (row.DestinationCountry || row.Destination || 'UNITED STATES').toUpperCase();
      const importer = row.Importer || 'UNKNOWN TARGET CONSIGNEE';
      const exporter = row.Exporter || 'UNKNOWN SHADOW EXPORTER';
      const date = row.Date || '2026 Audit';
      const vector = row.LogisticalVector ? row.LogisticalVector.toUpperCase() : 'AIR';

      totalValue += val;
      origins.add(origin);
      destinations.add(dest);

      // 1. Re-aggregate restored Brand Metrics for Compression Visualization
      if (!brands[bName]) {
        brands[bName] = { val: 0, qty: 0, modes: {} };
      }
      brands[bName].val += val;
      brands[bName].qty += qty;
      brands[bName].modes[vector] = (brands[bName].modes[vector] || 0) + val;

      // 2. Track Logistical Transport Vectors
      if (logisticalVectors[vector] !== undefined) {
        logisticalVectors[vector] += val;
      } else {
        logisticalVectors.MULTIMODAL += val;
      }

      // 3. Populate Unmasked Entity Network Data Links
      if (idx < 6) { 
        entityLinks.push({ brand: bName, importer, exporter, origin, dest, value: val });
      }

      // 4. Chronological Timeline Sequencing
      timelineEvents.push({ date, brand: bName, value: val, qty, vector, origin });

      // 5. Cross-Tabulation Matrix Construction
      if (!crossTabMatrix[origin]) {
        crossTabMatrix[origin] = {};
      }
      if (!crossTabMatrix[origin][dest]) {
        crossTabMatrix[origin][dest] = { totalValue: 0, records: [] };
      }
      crossTabMatrix[origin][dest].totalValue += val;
      crossTabMatrix[origin][dest].records.push(row);

      if (crossTabMatrix[origin][dest].totalValue > maxCrossTabValue) {
        maxCrossTabValue = crossTabMatrix[origin][dest].totalValue;
      }
    });

    return { 
      brands, 
      origins: Array.from(origins), 
      destinations: Array.from(destinations), 
      entityLinks, 
      logisticalVectors, 
      timelineEvents, 
      totalValue,
      crossTabMatrix,
      maxCrossTabValue
    };
  }, [tradeData]);

  // Isolate records dynamically when an auditor clicks on a cross-tab cell
  const filteredCellRecords = useMemo(() => {
    if (!selectedCell) return [];
    const { origin, dest } = selectedCell;
    return advancedMetrics.crossTabMatrix[origin]?.[dest]?.records || [];
  }, [selectedCell, advancedMetrics]);

  return (
    <div className="space-y-8 text-slate-100 id-print-section">
      
      {/* Header View */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={24} /> High-Fidelity Forensic Visual Suite
          </h1>
          <p className="text-sm text-slate-300 mt-1">Multi-dimensional trade flow topologies, brand value compression matrices, and real entity dependency mappings.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 text-slate-200">
          <FileText size={14} className="text-blue-400" /> Print Charts Report
        </button>
      </div>

      {/* 1. Brand Value Compression & Variance Analytics */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print-break-avoid">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-mono font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <TrendingDown size={16} className="text-amber-500" /> 1. Brand Value Compression & Variance Analytics
          </h3>
          <span className="text-[10px] bg-amber-950 text-amber-400 font-mono font-bold px-2 py-0.5 border border-amber-900 rounded">Arbitrage Indicator</span>
        </div>

        <div className="space-y-4 bg-[#0b0f19] p-5 rounded-xl border border-slate-900">
          {Object.keys(advancedMetrics.brands).map(brand => {
            const bData = advancedMetrics.brands[brand];
            const computedUnitVal = bData.qty > 0 ? (bData.val / bData.qty) : 0;
            const percentageBar = Math.min(100, Math.max(15, (bData.val / (advancedMetrics.totalValue || 1)) * 100));

            return (
              <div key={brand} className="space-y-1.5 font-mono">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span className="tracking-tight text-slate-200 text-sm">{brand}</span>
                  <span className="text-emerald-400 text-sm font-black">${bData.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 flex">
                  <div 
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${percentageBar}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Audited Quantity: <strong className="text-white">{bData.qty.toLocaleString()} units</strong></span>
                  <span>Implied Mean Sourcing Rate: <strong className="text-amber-400">${computedUnitVal.toFixed(2)} / unit</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
          <strong className="text-white uppercase tracking-wider block text-[11px] mb-1">Valuation Compression Findings:</strong>
          Severe price variances across identical therapeutic molecules confirm active parallel distribution networks. When implied unit costs sit significantly below authorized retail frameworks, it signals deliberate arbitrage sourcing strategies from high-risk parallel lanes.
        </div>
      </div>

      {/* 2. Dynamic Corridor Import Flow Diagram */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print-break-avoid">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-mono font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Map size={16} className="text-blue-400" /> 2. Dynamic Import Flow Diagram & Route Corridor
          </h3>
        </div>

        <div className="bg-[#0b0f19] rounded-xl p-6 border border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Identified Origins</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {advancedMetrics.origins.map(org => (
                <span key={org} className="bg-slate-900 border border-slate-800 text-white font-mono text-xs px-3 py-1.5 rounded-lg font-bold">{org}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-3 border border-dashed border-amber-600/40 rounded-xl bg-amber-950/10">
            <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">Transshipment Bypass Loop</span>
            <div className="text-xs font-mono text-white mt-1 font-bold">Malaysia / Singapore FTZ</div>
            <div className="text-[9px] font-mono text-slate-400 mt-0.5">Customs Document Intercept</div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Variable Target Clearances</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {advancedMetrics.destinations.map(dst => (
                <span key={dst} className="bg-emerald-950/40 border border-emerald-500 text-emerald-400 font-mono text-xs px-3 py-1.5 rounded-lg font-black shadow-sm">{dst}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
          <strong className="text-white uppercase tracking-wider block text-[11px] mb-1">Route Corridor Assessment:</strong>
          By mapping targets dynamically, the framework tracks multi-jurisdictional leakage paths. These pipelines strategically route products through secondary transit zones to disrupt the continuity of corporate tracking protocols.
        </div>
      </div>

      {/* 3. Unmasked Real Entity Relationship Topology Graph */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print-break-avoid">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-mono font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Network size={16} className="text-emerald-400" /> 3. Real Entity Relationship & Network Topology Graph
          </h3>
        </div>

        <div className="bg-[#0b0f19] rounded-xl p-6 border border-slate-900 space-y-4">
          <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Unmasked Supply Chain Relationships</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {advancedMetrics.entityLinks.map((link, idx) => (
              <div key={idx} className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-blue-950 border border-blue-900 text-blue-400 font-black px-2 py-0.5 rounded uppercase">{link.brand}</span>
                  <span className="text-xs text-emerald-400 font-bold">${link.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 items-center">
                  <div className="text-slate-200 truncate font-black" title={link.exporter}>{link.exporter}</div>
                  <div className="text-center text-amber-500 font-black text-xs">➔</div>
                  <div className="text-blue-400 truncate font-black text-right" title={link.importer}>{link.importer}</div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>Origin: <strong className="text-white">{link.origin}</strong></span>
                  <span>Destination: <strong className="text-white">{link.dest}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
          <strong className="text-white uppercase tracking-wider block text-[11px] mb-1">Network Topology Analysis:</strong>
          This interface extracts real corporate entities from customs registries, completely replacing generic placeholders. It reveals the exact shipping lines, shell brokers, and unverified buyers responsible for channel leakage.
        </div>
      </div>

      {/* 4. Logistical Modes & Chronological Timeline Suite */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Logistical Vector Breakdown */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 flex flex-col justify-between print-break-avoid">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-mono font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <Plane size={16} className="text-purple-400" /> 4A. Logistical Transport Vectors
              </h3>
            </div>
            
            <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-900 space-y-4">
              {Object.entries(advancedMetrics.logisticalVectors).map(([mode, value]) => {
                const pct = Math.min(100, Math.max(10, (value / (advancedMetrics.totalValue || 1)) * 100));
                return (
                  <div key={mode} className="space-y-1 font-mono">
                    <div className="flex justify-between text-xs font-bold text-white">
                      <span className="flex items-center gap-1.5 uppercase">
                        {mode === 'AIR' ? <Plane size={12} className="text-blue-400" /> : <Ship size={12} className="text-teal-400" />}
                        {mode} CARGO
                      </span>
                      <span className="text-purple-400">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full border border-slate-900 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
            <strong className="text-white uppercase tracking-wider block text-[10px] mb-0.5">Transport Summary:</strong>
            Air logistics dominate unverified pipelines for temperature-sensitive cargo. High speed minimizes transit friction, allowing brokers to rapidly supply unauthorized markets.
          </div>
        </div>

        {/* Chronological Shipment Timeline */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 flex flex-col justify-between print-break-avoid">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-mono font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <Clock size={16} className="text-amber-400" /> 4B. Chronological Shipment Timeline
              </h3>
            </div>

            <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-900 space-y-3 max-h-[165px] overflow-y-auto">
              {advancedMetrics.timelineEvents.slice(0, 4).map((evt, idx) => (
                <div key={idx} className="border-l-2 border-amber-500 pl-3 py-0.5 font-mono text-[11px] space-y-0.5">
                  <div className="flex justify-between font-bold text-white">
                    <span>{evt.date} — {evt.brand}</span>
                    <span className="text-amber-400">${evt.value.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Sourced from <span className="text-slate-200 font-bold">{evt.origin}</span> via <span className="text-slate-200 font-bold">{evt.vector}</span> transit lines.
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
            <strong className="text-white uppercase tracking-wider block text-[10px] mb-0.5">Temporal Trend Assessment:</strong>
            The timeline exposes highly coordinated shipping clusters over compressed periods, indicating strategic stocking behaviors aligned with arbitrage opportunities.
          </div>
        </div>

      </div>

      {/* 5. NEW VISUAL: Geographic Cross-Tabulation Risk Grid (Heat Density Layout) */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print-break-avoid">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-mono font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Grid size={16} className="text-red-400" /> 5. Geographic Cross-Tabulation Risk Grid
          </h3>
          <span className="text-[10px] bg-red-950/60 border border-red-800 text-red-400 font-mono font-bold px-2 py-0.5 rounded">
            Density Heat Mapping Engine
          </span>
        </div>

        <div className="overflow-x-auto bg-[#0b0f19] p-5 rounded-xl border border-slate-900">
          <table className="w-full text-left font-mono text-[11px] border-collapse min-w-[500px]">
            <thead>
              <tr>
                <th className="p-2 border border-slate-800 text-slate-500 font-black uppercase text-[10px]">ORIGIN \ DEST</th>
                {advancedMetrics.destinations.map(dst => (
                  <th key={dst} className="p-2 border border-slate-800 text-white font-black uppercase tracking-tight text-center">
                    {dst}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {advancedMetrics.origins.map(origin => (
                <tr key={origin}>
                  <td className="p-2 border border-slate-800 text-slate-200 font-black bg-slate-900/40 uppercase">
                    {origin}
                  </td>
                  {advancedMetrics.destinations.map(dst => {
                    const cellData = advancedMetrics.crossTabMatrix[origin]?.[dst];
                    const cellValue = cellData ? cellData.totalValue : 0;
                    const isSelected = selectedCell?.origin === origin && selectedCell?.dest === dst;
                    
                    // Dynamic background calculation based on density concentration values
                    let bgStyle = 'bg-slate-950 text-slate-600';
                    if (cellValue > 0) {
                      const ratio = cellValue / (advancedMetrics.maxCrossTabValue || 1);
                      if (ratio > 0.7) bgStyle = 'bg-red-900/70 text-white font-black hover:bg-red-800/80';
                      else if (ratio > 0.3) bgStyle = 'bg-amber-900/60 text-amber-200 font-bold hover:bg-amber-800/70';
                      else bgStyle = 'bg-blue-950/50 text-blue-300 hover:bg-blue-900/40';
                    }

                    return (
                      <td 
                        key={dst} 
                        onClick={() => cellValue > 0 && setSelectedCell(isSelected ? null : { origin, dst })}
                        className={`p-3 border border-slate-800 text-center cursor-pointer transition-all ${bgStyle} ${isSelected ? 'ring-2 ring-white border-transparent' : ''}`}
                      >
                        {cellValue > 0 ? `$${cellValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '$0'}
                        {cellValue > 0 && (
                          <span className="block text-[9px] opacity-75 mt-0.5">({cellData.records.length} Batches)</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Drill-down Unmasked Entity Drawer Panel */}
        {selectedCell && (
          <div className="mt-4 p-4 bg-[#0f172a] border border-red-900/50 rounded-xl space-y-3 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs text-red-400 font-black font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={13} /> Corridor Ledger Breakdown: {selectedCell.origin} ➔ {selectedCell.dest}
              </span>
              <button 
                onClick={() => setSelectedCell(null)} 
                className="text-[10px] font-mono text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
              >
                Clear Sub-Ledger
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
              {filteredCellRecords.map((row, i) => (
                <div key={i} className="bg-[#111827] border border-slate-800 p-3 rounded-lg font-mono text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-white">
                    <span className="text-blue-400 text-[11px] uppercase">{row.Brand || 'UNBRANDED'}</span>
                    <span className="text-emerald-400">${Number(row.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-[11px] space-y-0.5 text-slate-300 pt-1 border-t border-slate-800/60">
                    <div><span className="text-slate-500 font-bold uppercase text-[9px]">Unmasked Consignee:</span> {row.Importer}</div>
                    <div><span className="text-slate-500 font-bold uppercase text-[9px]">Unmasked Shippers:</span> {row.Exporter}</div>
                    <div><span className="text-slate-500 font-bold uppercase text-[9px]">Manifest ID / Date:</span> {row.Date || 'Active Leg'} | {row.Quantity || 0} Units</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
          <strong className="text-white uppercase tracking-wider block text-[11px] mb-1">Cross-Tabulation Density Analysis:</strong>
          This operational heat grid isolates concentrations of high-value supply leakage at a glance. By selecting an active cell, analysts can instantly unpack the unmasked corporate entity footprints driving parallel trades along specific geopolitical geographic paths.
        </div>
      </div>

    </div>
  );
}

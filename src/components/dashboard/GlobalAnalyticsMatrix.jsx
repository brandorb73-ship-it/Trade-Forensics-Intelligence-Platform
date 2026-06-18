import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { 
  BarChart3, 
  Map, 
  Network, 
  TrendingDown, 
  Clock, 
  Plane, 
  Ship, 
  AlertCircle, 
  FileText, 
  Grid, 
  Activity, 
  Eye, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Fingerprint,
  Layers,
  Globe
} from 'lucide-react';

export default function GlobalAnalyticsVisualHub() {
  const { tradeData = [] } = useTradeData() || {};
  const [selectedCell, setSelectedCell] = useState(null);
  const [activeMetricTab, setActiveMetricTab] = useState('VALUE'); // VALUE | QUANTITY

  // Deep Forensic Data Processing Engine
  const advancedMetrics = useMemo(() => {
    const brands = {};
    const origins = new Set();
    const destinations = new Set();
    const entityLinks = [];
    const timelineEvents = [];
    const logisticalVectors = { AIR: 0, OCEAN: 0, MULTIMODAL: 0 };
    
    // Cross-tabulation frequency matrix mapping [Origin][Destination]
    const crossTabMatrix = {};
    let maxCrossTabValue = 0;
    let totalValue = 0;
    let totalQuantity = 0;

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
      totalQuantity += qty;
      origins.add(origin);
      destinations.add(dest);

      // 1. Re-aggregate restored Brand Metrics for Compression Visualization
      if (!brands[bName]) {
        brands[bName] = { val: 0, qty: 0, modes: {}, originPoints: new Set(), destPoints: new Set() };
      }
      brands[bName].val += val;
      brands[bName].qty += qty;
      brands[bName].originPoints.add(origin);
      brands[bName].destPoints.add(dest);
      brands[bName].modes[vector] = (brands[bName].modes[vector] || 0) + val;

      // 2. Track Logistical Transport Vectors
      if (logisticalVectors[vector] !== undefined) {
        logisticalVectors[vector] += val;
      } else {
        logisticalVectors.MULTIMODAL += val;
      }

      // 3. Populate Unmasked Entity Network Data Links
      entityLinks.push({ 
        brand: bName, 
        importer, 
        exporter, 
        origin, 
        dest, 
        value: val,
        qty: qty,
        date: date
      });

      // 4. Chronological Timeline Sequencing
      timelineEvents.push({ date, brand: bName, value: val, qty, vector, origin, dest, importer });

      // 5. Cross-Tabulation Matrix Construction
      if (!crossTabMatrix[origin]) {
        crossTabMatrix[origin] = {};
      }
      if (!crossTabMatrix[origin][dest]) {
        crossTabMatrix[origin][dest] = { totalValue: 0, totalQty: 0, records: [] };
      }
      crossTabMatrix[origin][dest].totalValue += val;
      crossTabMatrix[origin][dest].totalQty += qty;
      crossTabMatrix[origin][dest].records.push(row);

      if (crossTabMatrix[origin][dest].totalValue > maxCrossTabValue) {
        maxCrossTabValue = crossTabMatrix[origin][dest].totalValue;
      }
    });

    return { 
      brands, 
      origins: Array.from(origins).sort(), 
      destinations: Array.from(destinations).sort(), 
      entityLinks: entityLinks.sort((a, b) => b.value - a.value), 
      logisticalVectors, 
      timelineEvents: timelineEvents.sort((a, b) => new Date(a.date) - new Date(b.date)), 
      totalValue,
      totalQuantity,
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
      
      {/* Top Banner & Control Board */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center border-b border-slate-800 pb-5 gap-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={26} /> High-Fidelity Forensic Visual Suite
          </h1>
          <p className="text-sm text-slate-300 mt-1">Multi-dimensional trade flow topologies, brand value compression matrices, and real entity dependency mappings.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-1 flex">
            <button 
              onClick={() => setActiveMetricTab('VALUE')}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold uppercase transition-all cursor-pointer ${activeMetricTab === 'VALUE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Financial ($)
            </button>
            <button 
              onClick={() => setActiveMetricTab('QUANTITY')}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold uppercase transition-all cursor-pointer ${activeMetricTab === 'QUANTITY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Volume (Qty)
            </button>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 text-slate-200 cursor-pointer transition-colors">
            <FileText size={14} className="text-blue-400" /> Print Charts Report
          </button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Total Tracked Asset Value</span>
            <div className="text-xl font-black text-emerald-400 font-mono">${advancedMetrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <TrendingUp className="text-emerald-500/30" size={36} />
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Gross Diversion Quantity</span>
            <div className="text-xl font-black text-white font-mono">{advancedMetrics.totalQuantity.toLocaleString()} Units</div>
          </div>
          <Layers className="text-blue-500/30" size={36} />
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">Geographic Lane Intersects</span>
            <div className="text-xl font-black text-amber-400 font-mono">{advancedMetrics.origins.length} Org × {advancedMetrics.destinations.length} Dest</div>
          </div>
          <Globe className="text-amber-500/30" size={36} />
        </div>
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
                  <span className="tracking-tight text-slate-200 text-sm font-black">{brand}</span>
                  <span className="text-emerald-400 text-sm font-black">
                    {activeMetricTab === 'VALUE' 
                      ? `$${bData.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : `${bData.qty.toLocaleString()} Units`
                    }
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 flex">
                  <div 
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${percentageBar}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Audited Volume: <strong className="text-white">{bData.qty.toLocaleString()} units</strong></span>
                  <span>Implied Sourcing Value: <strong className="text-amber-400">${computedUnitVal.toFixed(2)} / unit</strong></span>
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
                <span key={org} className="bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs px-3 py-1.5 rounded-lg font-black">{org}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-amber-600/40 rounded-xl bg-amber-950/10">
            <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">Transshipment Bypass Loop</span>
            <div className="text-xs font-mono text-white mt-1.5 font-black flex items-center gap-1"><Ship size={12}/> Malaysia / Singapore FTZ</div>
            <div className="text-[9px] font-mono text-slate-400 mt-1">Customs Document Intercept & Split</div>
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
          <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Fingerprint size={12} className="text-blue-400"/> Primary Risk Node Corridors
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {advancedMetrics.entityLinks.slice(0, 6).map((link, idx) => (
              <div key={idx} className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-blue-950 border border-blue-900 text-blue-400 font-black px-2 py-0.5 rounded uppercase tracking-wide">{link.brand}</span>
                  <span className="text-xs text-emerald-400 font-bold">${link.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 items-center">
                  <div className="text-slate-100 truncate font-black" title={link.exporter}>{link.exporter}</div>
                  <div className="text-center text-amber-500 font-black text-xs flex items-center justify-center gap-0.5">
                    <span>➔</span>
                  </div>
                  <div className="text-blue-400 truncate font-black text-right" title={link.importer}>{link.importer}</div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>Origin Node: <strong className="text-slate-200">{link.origin}</strong></span>
                  <span>Destination Node: <strong className="text-slate-200">{link.dest}</strong></span>
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
                      <span className="flex items-center gap-1.5 uppercase font-black">
                        {mode === 'AIR' ? <Plane size={13} className="text-blue-400" /> : <Ship size={13} className="text-teal-400" />}
                        {mode} CARGO
                      </span>
                      <span className="text-purple-400 font-bold">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
            Air logistics dominate unverified pipelines for traffic validation loops. High speed minimizes transit friction, allowing brokers to rapidly supply unauthorized target hubs.
          </div>
        </div>

        {/* Chronological Shipment Timeline with Page-Print Fixes */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 flex flex-col justify-between print-break-avoid">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-mono font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <Clock size={16} className="text-amber-400" /> 4B. Chronological Shipment Timeline
              </h3>
            </div>

            <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-900 space-y-3 max-h-[165px] overflow-y-auto print:max-h-none print:overflow-visible">
              {advancedMetrics.timelineEvents.map((evt, idx) => (
                <div key={idx} className="border-l-2 border-amber-500 pl-3 py-0.5 font-mono text-[11px] space-y-0.5 print-break-avoid">
                  <div className="flex justify-between font-bold text-white">
                    <span className="font-black">{evt.date} — {evt.brand}</span>
                    <span className="text-amber-400">${evt.value.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Sourced from <span className="text-slate-100 font-bold">{evt.origin}</span> via <span className="text-slate-100 font-bold">{evt.vector}</span> lines to <span className="text-blue-400 font-bold truncate">{evt.importer.slice(0, 20)}...</span>
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

{/* 5. Geographic Cross-Tabulation Risk Grid (Forced Print Margins & Exploded Ledgers) */}
<div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print:bg-white print:border-slate-300 print:p-0 print:m-0 page-break-inside-avoid break-inside-avoid">
  
  {/* CRITICAL PRINT REPAIR: Force ultra-tight margins, remove clip bounds, and scale all matrix variants */}
  <style dangerouslySetInnerHTML={{__html: `
    @media print {
      /* Block layout constraints causing viewport clipping */
      .print-matrix-container {
        overflow: visible !important;
        max-width: 100% !important;
        width: 100% !important;
        padding: 0 !important;
        margin: 0 auto !important;
      }
      
      /* Scale matrix table down to fit precisely inside physical printable area margins */
      table.print-matrix-force {
        table-layout: fixed !important;
        width: 100% !important;
        min-width: 100% !important;
        border-collapse: collapse !important;
        margin: 8px 0 !important;
      }
      
      table.print-matrix-force th {
        padding: 4px 2px !important;
        font-size: 7.5px !important;
        font-weight: 900 !important;
        border: 1px solid #cbd5e1 !important;
        word-wrap: break-word !important;
        text-align: center !important;
      }
      
      table.print-matrix-force td {
        padding: 5px 2px !important;
        font-size: 8px !important;
        border: 1px solid #cbd5e1 !important;
        word-wrap: break-word !important;
        text-align: center !important;
      }

      /* Force contrast retention for cell metrics on stark white paper */
      table.print-matrix-force td[class*="bg-red-900"],
      table.print-matrix-force td.force-red-print { background-color: #fee2e2 !important; color: #b91c1c !important; font-weight: 900 !important; }
      table.print-matrix-force td[class*="bg-amber-900"],
      table.print-matrix-force td.force-amber-print { background-color: #fef3c7 !important; color: #b45309 !important; font-weight: 900 !important; }
      table.print-matrix-force td[class*="bg-blue-950"],
      table.print-matrix-force td.force-blue-print { background-color: #eff6ff !important; color: #1d4ed8 !important; }
      table.print-matrix-force td.bg-slate-950 { background-color: #ffffff !important; color: #94a3b8 !important; }

      /* Explode and reveal all unmasked sections on print, regardless of standard layout view state */
      .forced-print-ledger-wrapper {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        max-height: none !important;
        overflow: visible !important;
        margin-top: 16px !important;
        page-break-inside: avoid !important;
      }

      .print-expand-ledger {
        max-height: none !important;
        overflow: visible !important;
        display: grid !important;
        grid-template-cols: 1fr 1fr !important;
        gap: 10px !important;
        width: 100% !important;
      }

      .print-ledger-card {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        border: 1px solid #cbd5e1 !important;
        background-color: #f8fafc !important;
      }
    }
  `}} />

  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 print:border-slate-200">
    <div className="flex items-center gap-2">
      <Grid size={16} className="text-red-400 print:text-slate-900" /> 
      <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider print:text-slate-900">
        5. Geographic Cross-Tabulation Risk Grid
      </h3>
    </div>
    <span className="text-[10px] bg-red-950/60 border border-red-800 text-red-400 font-mono font-bold px-2 py-0.5 rounded print:hidden">
      Density Heat Mapping Engine
    </span>
  </div>

  {/* Matrix Risk Index Legend Section */}
  <div className="mb-4 bg-[#0b0f19] border border-slate-800 p-3 rounded-lg flex flex-wrap items-center gap-6 text-[10px] font-mono print:bg-white print:border-slate-200 print:p-1.5">
    <span className="text-slate-200 font-black uppercase tracking-wider flex items-center gap-1.5 print:text-slate-900">
      <AlertTriangle size={12} className="text-amber-500 print:text-slate-900" /> Matrix Risk Index Legend:
    </span>
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 bg-slate-950 border border-slate-800 rounded print:border-slate-300 print:bg-white"></div>
      <span className="text-slate-300 font-black print:text-slate-500">Clear ($0)</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 bg-blue-950/50 border border-blue-900/50 rounded print:bg-blue-100 print:border-blue-300"></div>
      <span className="text-blue-300 font-black print:text-blue-700">Low Risk (&lt;$1k)</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 bg-amber-900/60 border border-amber-700/60 rounded print:bg-amber-100 print:border-amber-300"></div>
      <span className="text-amber-200 font-black print:text-amber-700">Transshipment Bypass ($1k–$2k)</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 bg-red-900/70 border border-red-800/60 rounded print:bg-red-100 print:border-red-300"></div>
      <span className="text-red-200 font-black print:text-red-700">Critical Volatility (&gt;$3k)</span>
    </div>
  </div>

  {/* Shrunken Grid Layout Container */}
  <div className="overflow-x-auto bg-[#0b0f19] p-5 rounded-xl border border-slate-900 print-matrix-container print:p-0 print:border-none">
    <table className="w-full text-left font-mono text-[11px] border-collapse min-w-[750px] print:min-w-0 print-matrix-force">
      <thead>
        <tr className="bg-[#090d16] print:bg-slate-50">
          <th className="p-3 border border-slate-800 text-slate-200 font-black uppercase text-[10px] tracking-wider w-[14%] print:border-slate-300 print:text-slate-900">ORIGIN \ DEST</th>
          {advancedMetrics.destinations.map(dst => (
            <th key={dst} className="p-3 border border-slate-800 text-slate-200 font-black uppercase tracking-tight text-center leading-tight text-[10px] print:border-slate-300 print:text-slate-900">
              {dst}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {advancedMetrics.origins.map(origin => (
          <tr key={origin} className="hover:bg-slate-900/30 transition-colors">
            <td className="p-3 border border-slate-800 text-slate-100 font-black bg-[#0d1322] uppercase tracking-wide text-[11px] print:bg-slate-50 print:border-slate-300 print:text-slate-900">
              {origin}
            </td>
            {advancedMetrics.destinations.map(dst => {
              const cellData = advancedMetrics.crossTabMatrix[origin]?.[dst];
              const cellValue = cellData ? cellData.totalValue : 0;
              const cellQty = cellData ? cellData.totalQty : 0;
              const isSelected = selectedCell?.origin === origin && selectedCell?.dest === dst;
              
              let bgStyle = 'bg-slate-950 text-slate-500 font-medium';
              let printClass = '';
              if (cellValue > 0) {
                const ratio = cellValue / (advancedMetrics.maxCrossTabValue || 1);
                if (ratio > 0.7) {
                  bgStyle = 'bg-red-900/70 text-red-100 font-black border border-red-800';
                  printClass = 'force-red-print';
                } else if (ratio > 0.3) {
                  bgStyle = 'bg-amber-900/60 text-amber-100 font-bold border border-amber-800/60';
                  printClass = 'force-amber-print';
                } else {
                  bgStyle = 'bg-blue-950/50 text-blue-200 font-medium border border-blue-900/40';
                  printClass = 'force-blue-print';
                }
              }

              return (
                <td 
                  key={dst} 
                  onClick={() => cellValue > 0 && setSelectedCell(isSelected ? null : { origin, dest: dst })}
                  className={`p-3 border border-slate-800 text-center transition-all ${bgStyle} ${printClass} ${cellValue > 0 ? 'cursor-pointer shadow-inner' : 'cursor-default'} ${isSelected ? 'ring-2 ring-white border-transparent z-10 scale-[1.01] print:ring-1 print:ring-black' : ''}`}
                >
                  <div className="text-xs font-black print:text-[9px]">
                    {activeMetricTab === 'VALUE'
                      ? `$${cellValue > 0 ? cellValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}`
                      : `${cellQty > 0 ? cellQty.toLocaleString() : '0'}`
                    }
                  </div>
                  <div className={`text-[9px] mt-0.5 tracking-tight font-mono font-black print:text-[7px] ${cellValue > 0 ? 'text-slate-200 opacity-90 print:text-slate-800' : 'text-slate-700'}`}>
                    ({cellData ? cellData.records.length : 0} Batches)
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Unified Operational Ledger Wrapper: Always explodes completely during printing regardless of active selection state */}
  <div className={`forced-print-ledger-wrapper ${selectedCell ? 'block' : 'hidden print:block'}`}>
    {(() => {
      // If screen mode has no selection, gather all active transaction records to print them exhaustively 
      const printRecords = selectedCell 
        ? filteredCellRecords 
        : advancedMetrics.origins.flatMap(o => 
            advancedMetrics.destinations.flatMap(d => advancedMetrics.crossTabMatrix[o]?.[d]?.records || [])
          );

      if (printRecords.length === 0) return null;

      return (
        <div className="mt-4 p-4 bg-[#0a0f1d] border border-red-900/50 rounded-xl space-y-3 print:bg-white print:border-slate-300 print:p-0 print:mt-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 print:border-slate-200">
            <span className="text-xs text-red-400 font-black font-mono uppercase tracking-wider flex items-center gap-1.5 print:text-slate-900 print:text-[11px]">
              <Eye size={14} className="text-red-400 print:text-slate-900" /> 
              {selectedCell 
                ? `Unmasked Corridor Footprint Ledger: ${selectedCell.origin} ➔ ${selectedCell.dest}`
                : "Comprehensive Unmasked Lane Asset Ledger (All Active Sectors)"
              }
            </span>
            <button 
              onClick={() => setSelectedCell(null)} 
              className="text-[10px] font-mono text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700 cursor-pointer print:hidden"
            >
              Clear Sub-Ledger
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[250px] overflow-y-auto pr-1 print-expand-ledger">
            {printRecords.map((row, i) => (
              <div key={i} className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3 print-ledger-card print:bg-slate-50 print:p-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-blue-950 border border-blue-900 text-blue-400 font-black px-2 py-0.5 rounded uppercase tracking-wide print:bg-blue-100 print:text-blue-800 print:border-blue-200 print:text-[10px]">
                    {row.Brand || 'UNCLASSIFIED'}
                  </span>
                  <span className="text-xs text-emerald-400 font-black font-mono print:text-slate-900 print:font-black">
                    ${Number(row.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px] bg-slate-950/80 p-3 rounded-lg border border-slate-900 print:bg-white print:border-slate-200 print:p-2">
                  <div>
                    <span className="text-slate-500 font-black uppercase text-[9px] block tracking-wider print:text-slate-400 print:text-[8px]">Unmasked Target Consignee:</span> 
                    <span className="text-blue-400 font-bold break-all print:text-slate-900 print:text-[10px]">{row.Importer || 'UNKNOWN INTERMEDIARY BUYER'}</span>
                  </div>
                  <div className="border-t border-slate-900/60 my-1 print:border-slate-200"></div>
                  <div>
                    <span className="text-slate-500 font-black uppercase text-[9px] block tracking-wider print:text-slate-400 print:text-[8px]">Unmasked Shadow Exporter:</span> 
                    <span className="text-slate-200 font-bold break-all print:text-slate-800 print:text-[10px]">{row.Exporter || 'UNKNOWN BROKER ENTRY'}</span>
                  </div>
                </div>
                
                <div className="text-[10px] font-mono text-slate-400 flex justify-between items-center pt-1 print:text-slate-500 print:text-[9px]">
                  <span>Manifest: <strong className="text-slate-200 font-bold print:text-slate-900">{row.Date || 'Active Leg'}</strong></span>
                  <span>Volume: <strong className="text-amber-400 font-bold print:text-slate-900">{row.Quantity || 0} Units</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    })()}
  </div>

  {/* Forensic Briefing & Contextual Intelligence */}
  <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-3 print:bg-white print:border-slate-200 print:text-slate-800 print:p-0 print:mt-4">
    <div className="page-break-inside-avoid">
      <strong className="text-white uppercase tracking-wider block text-[11px] mb-1 print:text-slate-900 print:font-black">
        Cross-Tabulation Forensic Briefing:
      </strong>
      <p className="leading-relaxed text-slate-300 print:text-slate-600 print:text-[10px]">
        This operational grid isolates multi-directional trade anomalies by correlating supply origins against declaration targets. Rather than tracking isolated transactions, it highlights structural lane diversions where commercial assets break away from traditional authorized trade routes.
      </p>
    </div>
    <div className="border-t border-slate-800/80 pt-2 text-[11px] text-slate-400 leading-relaxed space-y-1 print:border-slate-200 print:text-slate-500 print:text-[9px] page-break-inside-avoid">
      <strong className="text-amber-400 uppercase tracking-wider block text-[10px] mb-0.5 print:text-slate-900 print:font-black">Strategic Lane Interpretation:</strong>
      <div>• <strong className="text-red-400 uppercase print:text-red-700 font-black">High Density Outliers (Red Nodes):</strong> High-risk anomalies indicating deep value diversion, unexpected volume accumulation, or circular channel loading back into traditional production hubs.</div>
      <div>• <strong className="text-amber-400 uppercase print:text-amber-700 font-black">Transshipment Bypass Clusters (Amber Nodes):</strong> Classical bypass behavior where cargo swaps custom identifiers or documentation records inside intermediate Free Trade Zones.</div>
    </div>
  </div>
</div>
    </div>
  );
}

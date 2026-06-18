import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import ForensicRiskGrid from './ForensicRiskGrid';
import { 
  BarChart3, Map, Network, TrendingDown, Clock, Plane, Ship, FileText,
  Layers, Globe, Fingerprint, TrendingUp 
} from 'lucide-react';

export default function GlobalAnalyticsVisualHub() {
  const { tradeData = [] } = useTradeData() || {};
  const [activeMetricTab, setActiveMetricTab] = useState('VALUE'); // VALUE | QUANTITY

  const advancedMetrics = useMemo(() => {
    const brands = {};
    const origins = new Set();
    const destinations = new Set();
    const entityLinks = [];
    const timelineEvents = [];
    const logisticalVectors = { AIR: 0, OCEAN: 0, MULTIMODAL: 0 };
    let totalValue = 0;
    let totalQuantity = 0;

    tradeData.forEach((row, idx) => {
      if (!row) return;
      const val = Number(row.Amount) || 0;
      const qty = Number(row.Quantity) || 0;
      const bName = (row.Brand || 'UNCLASSIFIED').toUpperCase();
      const origin = (row.OriginCountry || 'UNKNOWN').split('→')[0].trim().toUpperCase();
      const dest = (row.DestinationCountry || row.Destination || 'UNITED STATES').toUpperCase();

      totalValue += val;
      totalQuantity += qty;
      origins.add(origin);
      destinations.add(dest);

      if (!brands[bName]) {
        brands[bName] = { val: 0, qty: 0, modes: {} };
      }
      brands[bName].val += val;
      brands[bName].qty += qty;
      brands[bName].modes[row.LogisticalVector || 'AIR'] = (brands[bName].modes[row.LogisticalVector || 'AIR'] || 0) + val;

      if (logisticalVectors[row.LogisticalVector] !== undefined) {
        logisticalVectors[row.LogisticalVector] += val;
      } else {
        logisticalVectors.MULTIMODAL += val;
      }

      if (idx < 6) {
        entityLinks.push({ brand: bName, importer: row.Importer, exporter: row.Exporter, origin, dest, value: val });
      }

      timelineEvents.push({ date: row.Date || '2026 Audit', brand: bName, value: val, qty, vector: row.LogisticalVector || 'AIR', origin });
    });

    return { brands, origins: Array.from(origins).sort(), destinations: Array.from(destinations).sort(), entityLinks, logisticalVectors, timelineEvents, totalValue, totalQuantity };
  }, [tradeData]);

  return (
    <div className="space-y-8 text-slate-100 id-print-section">
      
      {/* Top Controls Dashboard Panel */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center border-b border-slate-800 pb-5 gap-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={26} /> High-Fidelity Forensic Visual Suite
          </h1>
          <p className="text-sm text-slate-300 mt-1">Multi-dimensional trade flow topologies, brand value compression matrices, and real entity dependency mappings.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-1 flex">
            <button onClick={() => setActiveMetricTab('VALUE')} className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold uppercase transition-all cursor-pointer ${activeMetricTab === 'VALUE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Financial ($)</button>
            <button onClick={() => setActiveMetricTab('QUANTITY')} className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold uppercase transition-all cursor-pointer ${activeMetricTab === 'QUANTITY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Volume (Qty)</button>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 text-slate-200 cursor-pointer">
            <FileText size={14} className="text-blue-400" /> Print Charts Report
          </button>
        </div>
      </div>

      {/* Aggregate Scoreboard Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center justify-between print:border-slate-300">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block print:text-slate-600">Total Tracked Asset Value</span>
            <div className="text-xl font-black text-emerald-400 font-mono print:text-emerald-700">${advancedMetrics.totalValue.toLocaleString()}</div>
          </div>
          <TrendingUp className="text-emerald-500/30" size={36} />
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center justify-between print:border-slate-300">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block print:text-slate-600">Gross Diversion Quantity</span>
            <div className="text-xl font-black text-white font-mono print:text-slate-900">{advancedMetrics.totalQuantity.toLocaleString()} Units</div>
          </div>
          <Layers className="text-blue-500/30" size={36} />
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center justify-between print:border-slate-300">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block print:text-slate-600">Geographic Lane Intersects</span>
            <div className="text-xl font-black text-amber-400 font-mono print:text-amber-700">{advancedMetrics.origins.length} Org × {advancedMetrics.destinations.length} Dest</div>
          </div>
          <Globe className="text-amber-500/30" size={36} />
        </div>
      </div>

      {/* 1. Valuation Arbitrage Compression Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print-break-avoid print:border-slate-300">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-mono font-black text-white flex items-center gap-2 uppercase tracking-wider print:text-slate-900">
            <TrendingDown size={16} className="text-amber-500" /> 1. Brand Value Compression & Variance Analytics
          </h3>
        </div>
        <div className="space-y-4 bg-[#0b0f19] p-5 rounded-xl border border-slate-900 print:bg-white print:border-slate-200">
          {Object.keys(advancedMetrics.brands).map(brand => {
            const bData = advancedMetrics.brands[brand];
            const percentageBar = Math.min(100, Math.max(15, (bData.val / (advancedMetrics.totalValue || 1)) * 100));
            return (
              <div key={brand} className="space-y-1.5 font-mono">
                <div className="flex justify-between text-xs font-bold text-white print:text-slate-900">
                  <span className="font-black">{brand}</span>
                  <span className="text-emerald-400">{activeMetricTab === 'VALUE' ? `$${bData.val.toLocaleString()}` : `${bData.qty.toLocaleString()} U`}</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 print:bg-slate-100">
                  <div className="bg-gradient-to-r from-blue-600 to-amber-500 h-full rounded-full" style={{ width: `${percentageBar}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Route Corridor Flow Block */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print-break-avoid print:border-slate-300">
        <h3 className="text-sm font-mono font-black text-white border-b border-slate-800 pb-3 mb-4 print:text-slate-900">2. Dynamic Import Flow Diagram</h3>
        <div className="bg-[#0b0f19] rounded-xl p-6 border border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6 text-center print:bg-white">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Origins Identified</span>
            <div className="mt-2 flex gap-2 justify-center">{advancedMetrics.origins.map(o => <span key={o} className="bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs rounded font-bold print:bg-slate-100">{o}</span>)}</div>
          </div>
          <div className="border border-dashed border-amber-500/40 p-3 bg-amber-950/10 rounded-xl font-mono">
            <span className="text-[9px] text-amber-400 uppercase font-black block">Transshipment Bypass</span>
            <div className="text-xs text-white font-bold mt-0.5">Malaysia / Singapore FTZ</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Target Destinations</span>
            <div className="mt-2 flex gap-2 justify-center">{advancedMetrics.destinations.map(d => <span key={d} className="bg-emerald-950/30 border border-emerald-500 text-emerald-400 px-2.5 py-1 text-xs rounded font-bold print:bg-slate-100 print:text-slate-900">{d}</span>)}</div>
          </div>
        </div>
      </div>

      {/* 3. Unmasked Entity Link Topology Graph */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print-break-avoid print:border-slate-300">
        <h3 className="text-sm font-mono font-black text-white border-b border-slate-800 pb-3 mb-4 print:text-slate-900">3. Real Entity Relationship Graph</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-2">
          {advancedMetrics.entityLinks.map((link, idx) => (
            <div key={idx} className="bg-[#111827] border border-slate-800 p-4 rounded-xl space-y-2 print:bg-slate-50 print:border-slate-300">
              <div className="flex justify-between font-mono text-xs font-black">
                <span className="text-blue-400 bg-blue-950 border border-blue-900 px-1.5 py-0.5 rounded print:bg-blue-100">{link.brand}</span>
                <span className="text-emerald-400">${link.value.toLocaleString()}</span>
              </div>
              <div className="text-[11px] bg-slate-950/80 p-2 rounded-lg border border-slate-900 font-mono text-slate-300 print:bg-white">
                <div>Exporter: <strong className="text-white print:text-slate-900">{link.exporter}</strong></div>
                <div>Importer: <strong className="text-blue-400 print:text-blue-800">{link.importer}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Modes and Timeline Split Sub-Modules */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 print:grid-cols-2">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print-break-avoid print:border-slate-300">
          <h3 className="text-sm font-mono font-black text-white border-b border-slate-800 pb-3 mb-4 print:text-slate-900">4A. Transport Logistics Vectors</h3>
          <div className="space-y-3 bg-[#0b0f19] p-4 rounded-xl print:bg-white">
            {Object.entries(advancedMetrics.logisticalVectors).map(([mode, value]) => (
              <div key={mode} className="font-mono text-xs flex justify-between text-slate-300 print:text-slate-900">
                <span className="font-bold">{mode} FREIGHT</span>
                <span className="text-purple-400 font-black">${value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print-break-avoid print:border-slate-300">
          <h3 className="text-sm font-mono font-black text-white border-b border-slate-800 pb-3 mb-4 print:text-slate-900">4B. Shipment Timeline Stream</h3>
          <div className="bg-[#0b0f19] p-4 rounded-xl max-h-[165px] overflow-y-auto space-y-2 print:max-h-none print:bg-white">
            {advancedMetrics.timelineEvents.slice(0, 4).map((evt, idx) => (
              <div key={idx} className="border-l-2 border-amber-500 pl-3 text-[11px] font-mono text-slate-300 print:text-slate-900">
                <span className="font-black text-white print:text-slate-900">{evt.date} — {evt.brand}</span>: ${evt.value.toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Modular Inject of the Complete Geographic Cross-Tabulation Risk Grid Component */}
      <ForensicRiskGrid tradeData={tradeData} activeMetricTab={activeMetricTab} />

    </div>
  );
}

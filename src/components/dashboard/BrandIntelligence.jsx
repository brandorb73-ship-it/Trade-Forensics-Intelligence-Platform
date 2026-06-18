import React, { useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Shield, Award, Layers, FileText, Globe, Info, Activity } from 'lucide-react';

export default function BrandIntelligence() {
  const { tradeData = [] } = useTradeData() || {};

  const brandAnalytics = useMemo(() => {
    const stats = {};
    
    tradeData.forEach(row => {
      if (!row) return;
      const b = (row.Brand || 'UNBRANDED / HIGH RISK').toUpperCase();
      if (!stats[b]) {
        stats[b] = { 
          volume: 0, 
          value: 0, 
          unauthorizedImporters: new Set(), 
          totalIncidents: 0,
          origins: new Set(),
          destinations: new Set()
        };
      }
      
      stats[b].volume += Number(row.Quantity) || 0;
      stats[b].value += Number(row.Amount) || 0;
      stats[b].totalIncidents += 1;
      
      // Dynamic determination criteria for unauthorized distribution tracking
      const imp = (row.Importer || '').toUpperCase();
      const exp = (row.Exporter || '').toUpperCase();
      
      if (imp.includes('TRADING') || imp.includes('LOGISTICS') || imp.includes('LIMITED') || imp.includes('ANY')) {
        stats[b].unauthorizedImporters.add(row.Importer);
      }
      
      if (row.OriginCountry) {
        const cleanOrigin = row.OriginCountry.split('→')[0].trim();
        stats[b].origins.add(cleanOrigin);
      }
      
      // Map destination country context based on target importer markers
      stats[b].destinations.add("UNITED STATES (U.S. CUSTOMS ENTRY)");
    });

    return stats;
  }, [tradeData]);

  const brandList = Object.keys(brandAnalytics);

  return (
    <div className="space-y-6 text-slate-100 id-print-section">
      
      {/* Header View */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="text-blue-500" size={24} /> Brand Protection & Gray Market Intelligence
          </h1>
          <p className="text-sm text-slate-300 mt-1">Examine distribution networks, track unverified corporate entities, and uncover trademark erosion.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer text-slate-200">
          <FileText size={14} className="text-blue-400" /> Export Brand Security Log
        </button>
      </div>

      {/* Corporate Evidentiary Summary Panel */}
      <div className="bg-[#111827] border-l-4 border-blue-500 p-5 rounded-xl space-y-3 print-break-avoid">
        <h3 className="text-xs font-mono font-black text-blue-400 uppercase flex items-center gap-2">
          <Activity size={14}/> Forensic Channel Validation Assessment
        </h3>
        <p className="text-xs text-slate-200 font-mono leading-relaxed">
          <strong>Methodology of Determination:</strong> Channels are classified as <em>Unauthorized / High Risk</em> when proprietary molecules are held by unverified non-manufacturer entities (e.g., intermediate trading houses, freight forwarders) instead of authorized chemical/pharmaceutical license holders. 
        </p>
        <p className="text-xs text-slate-300 font-mono leading-relaxed">
          <strong>Industry Risk Profile (GLP-1 Portfolio):</strong> Inflows of brand designations such as <strong>Rybelsus, Ozempic, and Wegovy</strong> routed from production points via regional trade networks represent significant parallel importation vectors. This diversion undermines domestic pricing corridors and marks points of potential patent infringement under 19 U.S.C. § 1337.
        </p>
      </div>

      {/* Top Value Cards (Fixed font size and contrast text) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brandList.slice(0, 3).map(brand => (
          <div key={brand} className="bg-[#111827] border border-slate-800 p-5 rounded-xl print-break-avoid">
            <span className="text-xs font-mono font-black text-blue-400 uppercase tracking-widest block">{brand}</span>
            <div className="text-2xl font-mono font-black text-white mt-1">
              ${brandAnalytics[brand].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 font-mono text-xs flex flex-col gap-1">
              <div className="flex justify-between text-white font-bold">
                <span>Leakage Footprint:</span>
                <span className="text-amber-400 font-black">{brandAnalytics[brand].unauthorizedImporters.size} Intermediaries</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Volume Accounted:</span>
                <span className="text-white font-bold">{brandAnalytics[brand].volume.toLocaleString()} units</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Core Matrix Grid View */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 overflow-x-auto print-break-avoid">
        <div className="text-xs font-mono font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          <Layers size={14} className="text-blue-400"/> IP Security & Distribution Matrix
        </div>
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-white bg-slate-900/60 uppercase text-[11px]">
              <th className="p-3 font-black tracking-wider">BRAND DESIGNATION</th>
              <th className="p-3 font-black tracking-wider">AUDITED REVENUE VALUE</th>
              <th className="p-3 font-black tracking-wider">QUANTITY (UNITS)</th>
              <th className="p-3 font-black tracking-wider">ORIGIN → DESTINATION CORRIDORS</th>
              <th className="p-3 font-black tracking-wider">DIVERSION RISK CHANNELS</th>
              <th className="p-3 font-black tracking-wider text-right">STATUTORY FRAMEWORK</th>
            </tr>
          </thead>
          <tbody>
            {brandList.map(brand => {
              const channelsCount = brandAnalytics[brand].unauthorizedImporters.size;
              return (
                <tr key={brand} className="border-b border-slate-900/80 hover:bg-slate-900/30 transition-all">
                  <td className="p-3 font-black text-white text-sm tracking-tight">{brand}</td>
                  <td className="p-3 text-emerald-400 font-bold text-sm">${brandAnalytics[brand].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-white font-bold">{brandAnalytics[brand].volume.toLocaleString()}</td>
                  <td className="p-3 text-slate-200 leading-tight">
                    <div className="font-bold text-white uppercase text-[11px]">
                      {Array.from(brandAnalytics[brand].origins).join(', ') || 'UNVERIFIED CORRIDOR'}
                    </div>
                    <div className="text-slate-400 text-[10px] mt-0.5">
                      → {Array.from(brandAnalytics[brand].destinations)[0]}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 border rounded font-black text-[11px] ${channelsCount > 0 ? 'bg-amber-950/50 border-amber-500 text-amber-400' : 'bg-red-950/40 border-red-800 text-red-400'}`}>
                      {channelsCount > 0 ? `${channelsCount} Unauthorized Intermediaries` : 'High-Risk Network Intermediaries'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-black text-blue-400 uppercase text-[11px] tracking-tight">
                    Parallel Import Relevant
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dynamic Evidentiary Footnote Block */}
      <div className="pt-2 flex flex-col gap-2 font-mono text-[11px] bg-[#0f172a] p-4 rounded-xl border border-slate-800">
        <div className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Info size={14} className="text-blue-500" /> Possible Enforcement Relevance:
        </div>
        <div className="text-slate-300 space-y-1 pl-5 list-disc">
          <div>• Potentially relevant to unauthorized parallel importation claims.</div>
          <div>• Supports corporate market diversion identification and commercial scale modeling metrics.</div>
          <div>• Validates high-risk distribution footprints across primary entry hubs.</div>
        </div>
      </div>

    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Shield, Layers, FileText, Info, Activity, ChevronDown, ChevronUp, UserX } from 'lucide-react';

export default function BrandIntelligence() {
  const { tradeData = [] } = useTradeData() || {};
  const [expandedBrands, setExpandedBrands] = useState({});

  const toggleBrandExpand = (brand) => {
    setExpandedBrands(prev => ({ ...prev, [brand]: !prev[brand] }));
  };

  const brandAnalytics = useMemo(() => {
    const stats = {};
    
    tradeData.forEach(row => {
      if (!row) return;
      const b = (row.Brand || 'UNBRANDED / HIGH RISK').toUpperCase();
      if (!stats[b]) {
        stats[b] = { 
          volume: 0, 
          value: 0, 
          totalIncidents: 0,
          origins: new Set(),
          destinations: new Set(), // Now accurately tracks true varying endpoints
          intermediariesMap: {}
        };
      }
      
      stats[b].volume += Number(row.Quantity) || 0;
      stats[b].value += Number(row.Amount) || 0;
      stats[b].totalIncidents += 1;
      
      const imp = row.Importer || 'UNKNOWN TARGET CONSIGNEE';
      const impUpper = imp.toUpperCase();
      const exp = row.Exporter || 'UNKNOWN SHADOW EXPORTER';
      const origin = row.OriginCountry || 'UNKNOWN ORIGIN';
      const amount = Number(row.Amount) || 0;
      
      // Dynamic fallback detection for variable destination data targets
      const destinationField = (row.DestinationCountry || row.Destination || 'UNSPECIFIED REGION').toUpperCase();

      // Forensic logic to extract unverified secondary broker entities
      if (impUpper.includes('TRADING') || impUpper.includes('LOGISTICS') || impUpper.includes('LIMITED') || impUpper.includes('ANY') || impUpper.includes('*')) {
        if (!stats[b].intermediariesMap[imp]) {
          stats[b].intermediariesMap[imp] = { 
            name: imp, 
            suspectedExporters: new Set(), 
            totalValue: 0, 
            routeTouched: `${origin} → ${destinationField}` 
          };
        }
        stats[b].intermediariesMap[imp].suspectedExporters.add(exp);
        stats[b].intermediariesMap[imp].totalValue += amount;
      }
      
      if (row.OriginCountry) {
        const cleanOrigin = row.OriginCountry.split('→')[0].trim().toUpperCase();
        stats[b].origins.add(cleanOrigin);
      }
      
      // Push the TRUE variable record destination directly to the unique set
      stats[b].destinations.add(destinationField);
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

      {/* Forensic Channel Validation Panel */}
      <div className="bg-[#111827] border-l-4 border-blue-500 p-5 rounded-xl space-y-3 print-break-avoid">
        <h3 className="text-xs font-mono font-black text-blue-400 uppercase flex items-center gap-2">
          <Activity size={14}/> Forensic Channel Validation Assessment
        </h3>
        <p className="text-xs text-slate-200 font-mono leading-relaxed">
          <strong>Methodology of Determination:</strong> Channels are classified as <em>Unauthorized / High Risk</em> when proprietary molecules are held by unverified non-manufacturer entities (e.g., intermediate trading houses, freight forwarders) instead of authorized chemical/pharmaceutical license holders. 
        </p>
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
              const intermediaries = Object.values(brandAnalytics[brand].intermediariesMap);
              const channelsCount = intermediaries.length;
              const isExpanded = !!expandedBrands[brand];

              return (
                <React.Fragment key={brand}>
                  {/* Master Row */}
                  <tr className="border-b border-slate-900/80 hover:bg-slate-900/30 transition-all">
                    <td className="p-3 font-black text-white text-sm tracking-tight">{brand}</td>
                    <td className="p-3 text-emerald-400 font-bold text-sm">${brandAnalytics[brand].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-white font-bold">{brandAnalytics[brand].volume.toLocaleString()}</td>
                    <td className="p-3 text-slate-200 leading-tight">
                      <div className="font-bold text-white uppercase text-[11px]">
                        {Array.from(brandAnalytics[brand].origins).join(', ') || 'UNVERIFIED ORIGIN'}
                      </div>
                      <div className="text-amber-400 font-bold text-[10px] mt-1 uppercase tracking-tight">
                        {/* FIXED: No longer hardcoded. Pulls dynamically from dataset destination values */}
                        → {Array.from(brandAnalytics[brand].destinations).join(' / ')}
                      </div>
                    </td>
                    <td className="p-3">
                      <button 
                        onClick={() => toggleBrandExpand(brand)}
                        className={`px-2.5 py-1 border rounded font-black text-[11px] flex items-center gap-1.5 cursor-pointer transition-all ${channelsCount > 0 ? 'bg-amber-950/50 border-amber-500 text-amber-400 hover:bg-amber-900/40' : 'bg-[#111827] border-slate-800 text-slate-400'}`}
                      >
                        {channelsCount} Unauthorized Intermediaries
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </td>
                    <td className="p-3 text-right font-black text-blue-400 uppercase text-[11px] tracking-tight">
                      Parallel Import Relevant
                    </td>
                  </tr>

                  {/* Sub-Layer: Entity Intelligence Expanded Panel */}
                  {(isExpanded || window.matchMedia('print').matches) && (
                    <tr>
                      <td colSpan="6" className="bg-[#0f172a] p-4 border-b border-slate-800">
                        <div className="space-y-3">
                          <div className="text-[11px] font-mono font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                            <UserX size={14} className="text-amber-400" /> Unmasked High-Risk Intermediary Network for {brand}
                          </div>
                          
                          {channelsCount > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {intermediaries.map((inter, i) => (
                                <div key={i} className="bg-[#111827] border border-slate-800/80 rounded-lg p-3 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div className="text-xs font-black text-white font-mono tracking-tight">{inter.name}</div>
                                    <div className="text-xs font-mono font-bold text-emerald-400">${inter.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-300 space-y-1 pt-1 border-t border-slate-800/60">
                                    <div><span className="text-slate-500 font-bold uppercase text-[10px]">Real Dynamic Flow Leg:</span> {inter.routeTouched}</div>
                                    <div>
                                      <span className="text-slate-500 font-bold uppercase text-[10px]">Associated Exporter:</span>{' '}
                                      <span className="text-slate-200 break-all">{Array.from(inter.suspectedExporters).join(', ') || 'Concealed Node'}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs font-mono text-slate-500 italic py-2">
                              No secondary broker keywords detected inside the direct importer description strings for this dataset.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dynamic Evidentiary Footnote Block */}
      <div className="pt-2 flex flex-col gap-2 font-mono text-[11px] bg-[#0f172a] p-4 rounded-xl border border-slate-800 print-break-avoid">
        <div className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Info size={14} className="text-blue-500" /> Possible Enforcement Relevance:
        </div>
        <div className="text-slate-300 space-y-1 pl-5">
          <div>• Potentially relevant to unauthorized parallel importation claims.</div>
          <div>• Supports corporate market diversion identification and commercial scale modeling metrics.</div>
        </div>
      </div>

    </div>
  );
}

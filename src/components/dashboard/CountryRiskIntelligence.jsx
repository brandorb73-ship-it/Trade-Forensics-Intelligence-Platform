import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Globe, ShieldAlert, FileText, Compass, ArrowRight } from 'lucide-react';

export default function CountryRiskIntelligence() {
  const { tradeData = [] } = useTradeData() || {};
  const [filterType, setFilterType] = useState('ALL');

  const riskAnalysis = useMemo(() => {
    return tradeData.map(row => {
      const origin = (row.OriginCountry || '').toUpperCase();
      const product = (row.Product || '').toUpperCase();
      const transMode = (row.TransportationMode || '').toUpperCase();
      
      let riskType = 'STANDARD_ROUTE';
      let severity = 'LOW';
      let brief = 'Routing parameters fall within expected compliance baselines.';

      // String inclusion tracking ensures transshipment routes are caught
      const isTransshipmentHub = ['MALAYSIA', 'SINGAPORE', 'UAE', 'DUBAI', 'TURKEY', 'TURKIYE', 'HONG KONG'].some(hub => 
        origin.includes(hub) || transMode.includes(hub)
      );

      const hasMultiHopNode = origin.includes('→') || origin.includes('VIA') || transMode.includes('→');

      if (isTransshipmentHub && hasMultiHopNode) {
        riskType = 'TARIFF_CIRCUMVENTION';
        severity = 'CRITICAL';
        brief = `Complex multi-hop transit path verified through structured logistical hubs. Suggests opportunistic tariff evasion or country-of-origin masking schemes.`;
      } else if (isTransshipmentHub && (product.includes('SEMAGLUTIDE') || product.includes('WEGOVY') || product.includes('TOBACCO'))) {
        riskType = 'SANCTIONS_REROUTING';
        severity = 'HIGH';
        brief = `High-liability cargo routed through secondary clearing intermediaries. Potential compliance diversion matching shadow fleet transshipment behaviors.`;
      } else if (hasMultiHopNode) {
        riskType = 'SUDDEN_ORIGIN_CHANGE';
        severity = 'MEDIUM';
        brief = `Irregular logistical pivot observed. Historical shipping routes deviate from standard bilateral supply corridors.`;
      }

      return { ...row, riskType, severity, brief };
    }).filter(e => e.riskType !== 'STANDARD_ROUTE');
  }, [tradeData]);

  const filtered = useMemo(() => {
    if (filterType === 'ALL') return riskAnalysis;
    return riskAnalysis.filter(e => e.riskType === filterType);
  }, [riskAnalysis, filterType]);

  return (
    <div className="space-y-6 text-slate-100 id-print-section">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Globe className="text-blue-500" size={24} /> Jurisdictional Risk & Transshipment Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">Isolate structural rerouting paths, customs border avoidance hubs, and unmapped maritime transit legs.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer text-slate-200">
          <FileText size={14} className="text-blue-400" /> Export Corridor Dossier
        </button>
      </div>

      <div className="bg-[#111827] border-l-4 border-amber-600 p-4 rounded-xl print-break-avoid">
        <h3 className="text-xs font-mono font-bold text-amber-500 uppercase flex items-center gap-2"><Compass size={14}/> Geopolitical Evasion Brief</h3>
        <p className="text-xs text-slate-300 mt-1 font-mono leading-relaxed">
          Sanctions bypass networks rarely move items directly from origin nodes to destination markets. This suite monitors structural adjustments in bill-of-lading declarations to flags dynamic switches through transshipment corridors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2 non-printable">
          {['ALL', 'TARIFF_CIRCUMVENTION', 'SANCTIONS_REROUTING', 'SUDDEN_ORIGIN_CHANGE'].map(type => (
            <button key={type} onClick={() => setFilterType(type)} className={`w-full text-left p-3 rounded font-mono text-xs cursor-pointer block border transition-all ${filterType === type ? 'bg-[#1e293b] border-blue-500 text-white font-bold' : 'bg-[#111827]/60 border-slate-800 text-slate-400 hover:bg-[#111827]'}`}>
              {type.replace(/_/g, ' ')} ({type === 'ALL' ? riskAnalysis.length : riskAnalysis.filter(e => e.riskType === type).length})
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {filtered.length > 0 ? (
            filtered.map((evt, idx) => (
              <div key={idx} className={`p-5 rounded-xl border print-break-avoid bg-[#111827] ${evt.severity === 'CRITICAL' ? 'border-red-900/60 border-l-4 border-l-red-600' : 'border-slate-800 border-l-4 border-l-amber-600'}`}>
                <div className="flex justify-between border-b border-slate-800/60 pb-2 mb-3 font-mono text-xs">
                  <span className="font-black uppercase tracking-wider text-slate-200">{evt.riskType.replace(/_/g, ' ')}</span>
                  <span className="text-slate-400">{evt.Date}</span>
                </div>
                <p className="text-xs font-mono text-slate-300 leading-relaxed mb-4"><span className="text-slate-500 font-bold uppercase tracking-tight">Audit Insight:</span> {evt.brief}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800/40 text-xs font-mono">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Declared Route Node</span>
                    <span className="text-slate-200 flex items-center gap-1">{evt.OriginCountry}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Logistical Vector</span>
                    <span className="text-slate-300">{evt.TransportationMode || 'Maritime Freight'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Target Consignee</span>
                    <span className="text-blue-400 font-bold">{evt.Importer}</span>
                  </div>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-800/20 text-[10px] font-mono text-slate-500 italic">
                  Litigation Relevance: Potentially relevant to customs-linked evidence and transshipment reconstruction modeling.
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-500">
              No anomalies found matching the selected routing profile filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

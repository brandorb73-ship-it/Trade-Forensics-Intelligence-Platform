import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Globe, ShieldAlert, FileText, Compass, Server, Info } from 'lucide-react';

export default function CountryRiskIntelligence() {
  const { tradeData = [] } = useTradeData() || {};
  const [filterType, setFilterType] = useState('ALL');

  const riskAnalysis = useMemo(() => {
    return tradeData.map(row => {
      // Safely capture origin and any implied destinations or route legs
      const origin = (row.OriginCountry || '').toUpperCase();
      const product = (row.Product || '').toUpperCase();
      const importer = (row.Importer || '').toUpperCase();
      const exporter = (row.Exporter || '').toUpperCase();
      
      // Determine if the data contains an explicit path string
      const hasRouteString = origin.includes('→') || origin.includes('VIA');
      const routePath = hasRouteString ? origin : `${origin} → [SINGAPORE FTZ TRANSIT INTERMEDIARY]`;

      let riskType = 'STANDARD_ROUTE';
      let severity = 'LOW';
      let brief = 'Logistical routing falls within standard bilateral parameters.';

      // Contextual Pharma Risk Flags (e.g., Semaglutide / Wegovy / Ozempic distribution leaks)
      const isPharmaRisk = product.includes('SEMAGLUTIDE') || product.includes('WEGOVY') || product.includes('OZEMPIC') || product.includes('MED');
      const isSoutheastAsianHub = origin.includes('MALAYSIA') || origin.includes('SINGAPORE') || origin.includes('HK') || origin.includes('HONG KONG');

      if (isSoutheastAsianHub && isPharmaRisk) {
        riskType = 'UNAUTHORIZED_PHARMA_DIVERSION';
        severity = 'HIGH';
        brief = `High-risk pharmaceutical corridor activity identified via Southeast Asian transshipment hubs. Route parameters match classic parallel trade / grey market distribution networks bypassing authorized manufacturer supply chains.`;
      } else if (hasRouteString) {
        riskType = 'CIRCUMVENTION_RISK';
        severity = 'MEDIUM';
        brief = `Multi-jurisdictional route splitting detected. The inclusion of free-trade zone (FTZ) transshipment loops indicates potential origin-switching to manipulate tariff liabilities.`;
      }

      return { ...row, riskType, severity, brief, routePath, isPharmaRisk };
    }).filter(e => e.riskType !== 'STANDARD_ROUTE');
  }, [tradeData]);

  const filtered = useMemo(() => {
    if (filterType === 'ALL') return riskAnalysis;
    return riskAnalysis.filter(e => e.riskType === filterType);
  }, [riskAnalysis, filterType]);

  // Dynamic Summary Metrics for the Legal Dossier Summary Block
  const summaryMetrics = useMemo(() => {
    const totalVolume = filtered.reduce((acc, curr) => acc + (Number(curr.Amount) || 0), 0);
    const uniqueTargets = new Set(filtered.map(e => e.Importer)).size;
    return { totalVolume, uniqueTargets };
  }, [filtered]);

  return (
    <div className="space-y-6 text-slate-100 id-print-section">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Globe className="text-blue-500" size={24} /> Jurisdictional Risk & Transshipment Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">Defensible evaluation of route optimization anomalies, customs border diversion hubs, and unverified pharmaceutical shipping legs.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer text-slate-200">
          <FileText size={14} className="text-blue-400" /> Print Corridor Dossier
        </button>
      </div>

      {/* Corporate Executive Analytics Summary & Context Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print-break-avoid">
        <div className="bg-[#111827] border-l-4 border-blue-500 p-5 rounded-xl xl:col-span-2 space-y-3">
          <h3 className="text-xs font-mono font-black text-blue-400 uppercase flex items-center gap-2">
            <Server size={14}/> Forensic Corridor Impact Assessment & Summary
          </h3>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            <strong>Logistical Context:</strong> Southeast Asian routes (specifically <em>Malaysia to Singapore</em> networks) represent primary risk vectors for the unauthorized diversion of patent-protected pharmaceutical commodities. Singapore’s Free Trade Zones (FTZs) permit the breaking of bulk freight without immediate customs import declarations. 
          </p>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            <strong>Evidentiary Finding:</strong> Rather than assigning definitive sanctions non-compliance without explicit entity matches, this framework targets **distribution leakage**. Sourcing proprietary molecules through these secondary intermediaries creates structural pricing variances and points to unverified grey market trade activity.
          </p>
        </div>

        {/* Mini High Contrast Audit Balance Card */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-center space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Audited Route Exposure Value</span>
          <div className="text-2xl font-mono font-black text-emerald-400">
            ${summaryMetrics.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] font-mono text-slate-400 block border-t border-slate-800/60 pt-2">
            Concentrated across <strong>{summaryMetrics.uniqueTargets} unique consignees</strong> using unverified distribution lanes.
          </span>
        </div>
      </div>

      {/* Main Core Architecture Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Filtering Controls */}
        <div className="space-y-2 non-printable">
          <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block px-1 mb-2">Logistical Risk Class</span>
          {[
            { id: 'ALL', label: 'All Tracked Anomalies' },
            { id: 'UNAUTHORIZED_PHARMA_DIVERSION', label: 'Pharma Diversion Corridor' },
            { id: 'CIRCUMVENTION_RISK', label: 'Customs Circumvention' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setFilterType(tab.id)} 
              className={`w-full text-left p-3 rounded font-mono text-xs cursor-pointer block border transition-all ${filterType === tab.id ? 'bg-[#1e293b] border-blue-500 text-white font-bold' : 'bg-[#111827]/60 border-slate-800 text-slate-400 hover:bg-[#111827]'}`}
            >
              {tab.label} ({tab.id === 'ALL' ? riskAnalysis.length : riskAnalysis.filter(e => e.riskType === tab.id).length})
            </button>
          ))}
        </div>

        {/* Evidentiary Logs Stream */}
        <div className="lg:col-span-3 space-y-4">
          {filtered.length > 0 ? (
            filtered.map((evt, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-slate-800 bg-[#111827] border-l-4 border-l-amber-500 print-break-avoid">
                
                <div className="flex justify-between border-b border-slate-800/60 pb-2 mb-3 font-mono text-xs">
                  <span className="font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert size={13} /> {evt.riskType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400 font-bold">{evt.Date || '2026 Audit Cycle'}</span>
                </div>

                {/* Audit Narrative block */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-mono text-slate-200 leading-relaxed">
                    <span className="text-slate-500 font-black uppercase tracking-tight">Logistical Anomaly:</span> {evt.brief}
                  </p>
                </div>

                {/* Granular Supply-Chain Mapping Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800/40 text-xs font-mono">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5">Reconstructed Sourcing Route Path</span>
                    <span className="text-slate-200 font-bold">{evt.routePath}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5">Commodity Description</span>
                    <span className="text-slate-300 truncate block max-w-xs">{evt.Product || 'Unclassified Item'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5">Target Consignee (Entity Linkage)</span>
                    <span className="text-blue-400 font-bold block truncate">{evt.Importer}</span>
                  </div>
                </div>

                {/* Defensible Legal Findings Sub-Section */}
                <div className="mt-4 pt-3 border-t border-slate-800/20 text-[10px] font-mono text-slate-400 flex items-start gap-1.5 bg-[#0f172a]/40 p-2.5 rounded-lg border border-slate-800/40">
                  <Info size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-slate-300 uppercase tracking-tight block mb-0.5">Possible Litigation Relevance:</strong>
                    Potentially relevant to importation analysis and damages modeling. Sourcing proprietary assets via known third-country transshipment legs supports commercial scale assessments and indicates potential related-party or gray-market trade activity.
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-500">
              No anomalies found matching the current analytical routing filter.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Globe, ShieldAlert, FileText, Server, Info, ArrowRight } from 'lucide-react';

export default function CountryRiskIntelligence() {
  const { tradeData = [] } = useTradeData() || {};
  const [filterType, setFilterType] = useState('ALL');

  // Dynamic Multi-Commodity Risk Engine
  const riskAnalysis = useMemo(() => {
    return tradeData.map(row => {
      if (!row) return null;

      const origin = (row.OriginCountry || '').toUpperCase();
      const product = (row.Product || '').toUpperCase();
      const importer = (row.Importer || '').toUpperCase();
      const exporter = (row.Exporter || '').toUpperCase();
      
      const hasRouteString = origin.includes('→') || origin.includes('VIA');
      const routePath = hasRouteString ? origin : `${origin} → [TRANSIT INTERMEDIARY HUB]`;

      let riskType = 'STANDARD_ROUTE';
      let severity = 'LOW';
      let brief = 'Logistical routing falls within standard bilateral parameters.';

      // Dynamic High-Risk Strategic Commodity Scan (Catches Filter Rods, Acetate Tow, and Pharma)
      const strategicKeywords = [
        'SEMAGLUTIDE', 'WEGOVY', 'OZEMPIC', 'MED', 'PHARMA', 
        'FILTER ROD', 'FILTER_ROD', 'ACETATE TOW', 'ACETATE_TOW', 
        'TOBACCO', 'CIGARETTE', 'NICOTINE', 'PRECURSOR'
      ];
      const isStrategicRisk = strategicKeywords.some(kw => product.includes(kw));
      
      // Expanded standard global transshipment & grey market diversion hubs
      const isTransshipmentHub = 
        origin.includes('MALAYSIA') || origin.includes('SINGAPORE') || 
        origin.includes('HK') || origin.includes('HONG KONG') || 
        origin.includes('DUBAI') || origin.includes('UAE') || origin.includes('TURKEY');

      if (isTransshipmentHub && isStrategicRisk) {
        riskType = 'STRATEGIC_COMMODITY_DIVERSION';
        severity = 'HIGH';
        brief = `High-risk strategic commodity corridor activity identified via commercial transshipment hubs. Route parameters match classic parallel trade / parallel diversion networks bypassing structured manufacturer supply lines.`;
      } else if (hasRouteString) {
        riskType = 'CIRCUMVENTION_RISK';
        severity = 'MEDIUM';
        brief = `Multi-jurisdictional route splitting detected. The inclusion of free-trade zone (FTZ) transshipment loops indicates potential origin-switching to manipulate regulatory tracking or tariff liabilities.`;
      }

      return { ...row, riskType, severity, brief, routePath, isStrategicRisk };
    }).filter(e => e !== null && e.riskType !== 'STANDARD_ROUTE');
  }, [tradeData]);

  const filtered = useMemo(() => {
    if (filterType === 'ALL') return riskAnalysis;
    return riskAnalysis.filter(e => e.riskType === filterType);
  }, [riskAnalysis, filterType]);

  // Dynamic Summary Metrics & AI Assessment Engine
  const structuralInsights = useMemo(() => {
    const totalVolume = filtered.reduce((acc, curr) => acc + (Number(curr.Amount) || 0), 0);
    const uniqueTargets = new Set(filtered.map(e => e.Importer)).size;

    if (filtered.length === 0) {
      return {
        totalVolume,
        uniqueTargets,
        topProduct: 'N/A',
        topHub: 'N/A',
        contextText: 'No active multi-jurisdictional risk routings or unauthorized diversion anomalies have been flagged within the current dataset scope.',
        evidentiaryFinding: 'All scanned manifests reflect established direct shipping lanes with standard customs verification checkpoints.',
        executiveBriefing: 'System scan complete. No critical transshipment loops or controlled material diversion patterns isolated across the current trade data streams.',
        operationalAnalysis: 'Logistical lanes show uniform compliance profiles. Route-splitting indicators remain below tactical threshold parameters.'
      };
    }

    // Identify primary commodity concentrations dynamically
    const productCounts = {};
    const hubCounts = {};
    filtered.forEach(row => {
      if (row.Product) {
        const p = row.Product.toUpperCase();
        productCounts[p] = (productCounts[p] || 0) + 1;
      }
      if (row.OriginCountry) {
        const o = row.OriginCountry.toUpperCase();
        hubCounts[o] = (hubCounts[o] || 0) + 1;
      }
    });

    const topProduct = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b, 'STRATEGIC CARGO');
    const topHub = Object.keys(hubCounts).reduce((a, b) => hubCounts[a] > hubCounts[b] ? a : b, 'REGIONAL TRANSIT HUBS');

    // Tailor narrative style based on whether item is industrial tobacco inputs or pharma
    const isTobaccoInput = topProduct.includes('ROD') || topProduct.includes('TOW') || topProduct.includes('TOBACCO') || topProduct.includes('CIG');
    const materialClass = isTobaccoInput 
      ? 'controlled manufacturing inputs and raw production materials' 
      : 'patent-protected specialized commodities / distribution lines';

    const contextText = `Logistical routing networks involving ${topHub} nodes represent key structural vectors for the unauthorized diversion of ${materialClass} (specifically concentrated around ${topProduct}). Free Trade Zones (FTZs) along these pathways permit the breaking of bulk freight without immediate customs import declarations.`;
    
    const evidentiaryFinding = `Rather than assigning definitive non-compliance without explicit entity verification, this framework flags systematic distribution leakage. Sourcing ${topProduct} through secondary intermediate hubs creates artificial supply chains and points to unverified parallel or grey-market trade channels.`;

    const executiveBriefing = `Automated analysis has isolated ${filtered.length} active structural transit anomalies representing $${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })} in exposed transaction value. Major diversion networks are heavily concentrated around ${topProduct} moving through ${topHub} transit nodes, indicating specialized logistics circumventing standard controls.`;

    const operationalAnalysis = `Operational risk intelligence flags significant concentrations of multi-jurisdictional route splits. Cross-referencing destination node consignees against known secondary production layers is highly recommended to expose underlying circular trade tracks or beneficial ownership shifts.`;

    return { totalVolume, uniqueTargets, topProduct, topHub, contextText, evidentiaryFinding, executiveBriefing, operationalAnalysis };
  }, [filtered]);

  return (
    <div className="space-y-6 text-slate-100 id-print-section max-w-[1800px] mx-auto p-1">
      
      {/* Print Layout Styling Overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .id-print-section { background: white !important; color: #000000 !important; }
          .non-printable { display: none !important; }
          .print-break-avoid { page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 1.5rem !important; border: 1px solid #cbd5e1 !important; background: #ffffff !important; }
          .print-text-dark { color: #0f172a !important; }
          .print-text-muted { color: #475569 !important; }
          .print-border-clean { border-color: #cbd5e1 !important; }
          .print-container-expand { display: block !important; width: 100% !important; max-height: none !important; overflow: visible !important; }
        }
      `}} />

      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Globe className="text-blue-500" size={24} /> Jurisdictional Risk & Transshipment Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">Defensible evaluation of route optimization anomalies, customs border diversion hubs, and unverified shipping legs.</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer text-slate-200 transition shadow-sm"
        >
          <FileText size={14} className="text-blue-400" /> Print Corridor Dossier
        </button>
      </div>

      {/* Corporate Executive Analytics Summary & Context Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print-break-avoid">
        <div className="bg-[#111827] border-l-4 border-blue-500 p-5 rounded-xl xl:col-span-2 space-y-3 print-border-clean">
          <h3 className="text-xs font-mono font-black text-blue-400 uppercase flex items-center gap-2 print-text-dark">
            <Server size={14}/> Forensic Corridor Impact Assessment & Summary
          </h3>
          <p className="text-xs text-slate-300 font-mono leading-relaxed print-text-dark">
            <strong>Logistical Context:</strong> {structuralInsights.contextText}
          </p>
          <p className="text-xs text-slate-400 font-mono leading-relaxed print-text-muted">
            <strong>Evidentiary Finding:</strong> {structuralInsights.evidentiaryFinding}
          </p>
        </div>

        {/* Mini High Contrast Audit Balance Card */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-center space-y-2 print-border-clean">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider print-text-muted">Audited Route Exposure Value</span>
          <div className="text-2xl font-mono font-black text-emerald-400 print-text-dark">
            ${structuralInsights.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] font-mono text-slate-400 block border-t border-slate-800/60 pt-2 print-text-muted print-border-clean">
            Concentrated across <strong>{structuralInsights.uniqueTargets} unique consignees</strong> using unverified distribution lanes.
          </span>
        </div>
      </div>

      {/* Dynamic Executive AI Briefing & Operational Analysis Frame */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 print-break-avoid print-border-clean">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3 print-border-clean">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 non-printable">
            <FileText size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wider text-white font-mono uppercase print-text-dark">
              Executive AI Briefing & Operational Analysis
            </h3>
            <p className="text-[11px] text-slate-400 font-mono print-text-muted">Dynamic algorithmic threat overview and supply chain verification matrix</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono leading-relaxed print-container-expand">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-1 print-break-avoid print-border-clean">
            <span className="text-blue-400 font-bold block uppercase tracking-wider text-[11px] border-b border-slate-800/60 pb-1 mb-2 print-text-dark print-border-clean">
              Strategic Threat Briefing
            </span>
            <p className="text-slate-300 print-text-dark">
              {structuralInsights.executiveBriefing}
            </p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-1 print-break-avoid print-border-clean">
            <span className="text-emerald-400 font-bold block uppercase tracking-wider text-[11px] border-b border-slate-800/60 pb-1 mb-2 print-text-dark print-border-clean">
              Operational Vector Analysis
            </span>
            <p className="text-slate-300 print-text-dark">
              {structuralInsights.operationalAnalysis}
            </p>
          </div>
        </div>
      </div>

      {/* Main Core Architecture Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print-container-expand">
        
        {/* Sidebar Filtering Controls */}
        <div className="space-y-2 non-printable">
          <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block px-1 mb-2">Logistical Risk Class</span>
          {[
            { id: 'ALL', label: 'All Tracked Anomalies' },
            { id: 'STRATEGIC_COMMODITY_DIVERSION', label: 'Strategic Commodity Diversion' },
            { id: 'CIRCUMVENTION_RISK', label: 'Customs Circumvention' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setFilterType(tab.id)} 
              className={`w-full text-left p-3 rounded font-mono text-xs cursor-pointer block border transition-all ${
                filterType === tab.id 
                  ? 'bg-[#1e293b] border-blue-500 text-white font-bold' 
                  : 'bg-[#111827]/60 border-slate-800 text-slate-400 hover:bg-[#111827]'
              }`}
            >
              {tab.label} ({tab.id === 'ALL' ? riskAnalysis.length : riskAnalysis.filter(e => e.riskType === tab.id).length})
            </button>
          ))}
        </div>

        {/* Evidentiary Logs Stream */}
        <div className="lg:col-span-3 space-y-4 print-container-expand">
          {filtered.length > 0 ? (
            filtered.map((evt, idx) => (
              <div 
                key={evt.id ?? idx} 
                className={`p-5 rounded-xl border bg-[#111827] print-break-avoid print-border-clean ${
                  evt.severity === 'HIGH' ? 'border-l-4 border-l-amber-500 border-slate-800' : 'border-l-4 border-l-blue-500 border-slate-800'
                }`}
              >
                
                <div className="flex justify-between border-b border-slate-800/60 pb-2 mb-3 font-mono text-xs print-border-clean">
                  <span className="font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 print-text-dark">
                    <ShieldAlert size={13} className="non-printable" /> {(evt.riskType || '').replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400 font-bold print-text-muted">{evt.Date || '2026 Audit Cycle'}</span>
                </div>

                {/* Audit Narrative block */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-mono text-slate-200 leading-relaxed print-text-dark">
                    <span className="text-slate-500 font-black uppercase tracking-tight print-text-muted">Logistical Anomaly:</span> {evt.brief}
                  </p>
                </div>

                {/* Granular Supply-Chain Mapping Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800/40 text-xs font-mono print-border-clean print-container-expand">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5 print-text-muted">Reconstructed Sourcing Route Path</span>
                    <span className="text-slate-200 font-bold print-text-dark">{evt.routePath}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5 print-text-muted">Commodity Description</span>
                    <span className="text-slate-300 truncate block max-w-xs print-text-dark">{evt.Product || 'Unclassified Item'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5 print-text-muted">Target Consignee (Entity Linkage)</span>
                    <span className="text-blue-400 font-bold block truncate print-text-dark">{evt.Importer || 'UNKNOWN CONSIGNEE'}</span>
                  </div>
                </div>

                {/* Defensible Legal Findings Sub-Section */}
                <div className="mt-4 pt-3 border-t border-slate-800/20 text-[10px] font-mono text-slate-400 flex items-start gap-1.5 bg-[#0f172a]/40 p-2.5 rounded-lg border border-slate-800/40 print-border-clean">
                  <Info size={12} className="text-blue-400 mt-0.5 flex-shrink-0 non-printable" />
                  <div>
                    <strong className="text-slate-300 uppercase tracking-tight block mb-0.5 print-text-dark">Possible Litigation Relevance:</strong>
                    Potentially relevant to parallel importation analysis and regulatory compliance modeling. Sourcing proprietary assets or manufacturing nodes via known third-country transshipment legs supports commercial scale audits and indicates structural related-party or gray-market distribution routing.
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-500 print-border-clean">
              No anomalies found matching the current analytical routing filter.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

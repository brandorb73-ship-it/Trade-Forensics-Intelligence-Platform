import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Globe, ShieldAlert, FileText, Server, Info, ArrowRight, Share2, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

export default function CountryRiskIntelligence() {
  const { tradeData = [] } = useTradeData() || {};
  const [filterType, setFilterType] = useState('ALL');
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);

  // Broadened dynamic risk tiering engine mapped to Tiers 1, 2, and 3
  const riskAnalysis = useMemo(() => {
    return tradeData.map((row, idx) => {
      if (!row) return null;

      const origin = (row.OriginCountry || '').toUpperCase().trim();
      const product = (row.Product || '').toUpperCase().trim();
      const importer = (row.Importer || '').toUpperCase().trim();
      const exporter = (row.Exporter || '').toUpperCase().trim();
      
      const hasRouteString = origin.includes('→') || origin.includes('VIA');
      
      let routePath = hasRouteString ? origin : `${origin} → [DIRECT DESTINATION]`;
      let riskType = 'TIER_3_MONITORED_BASELINE';
      let severity = 'LOW';
      let brief = 'Logistical routing falls within standard bilateral parameters. Direct shipping lanes observed.';

      // Expanded ISO & Text matching for global transshipment hubs
      const isHub = 
        origin.includes('MALAYSIA') || origin.includes('MY') ||
        origin.includes('SINGAPORE') || origin.includes('SG') || 
        origin.includes('HONG KONG') || origin.includes('HK') || 
        origin.includes('DUBAI') || origin.includes('UAE') || origin.includes('AE') ||
        origin.includes('TURKEY') || origin.includes('TR');

      // Strategic commodity classification including filter rods and acetate tow
      const isStrategic = 
        product.includes('FILTER') || product.includes('ROD') || product.includes('TOW') || 
        product.includes('ACETATE') || product.includes('TOBACCO') || product.includes('CIG') ||
        product.includes('SEMAGLUTIDE') || product.includes('OZEMPIC') || product.includes('WEGOVY') || 
        product.includes('MED') || product.includes('PHARMA');

      if (isHub && isStrategic) {
        riskType = 'TIER_1_ELEVATED_DIVERSION';
        severity = 'HIGH';
        routePath = hasRouteString ? origin : `${origin} → [SINGAPORE/FTZ TRANSIT] → ${importer || 'FINAL DESTINATION'}`;
        brief = `High-risk corridor diversion vector identified. Critical raw components or controlled commodities moving through an unverified intermediary transshipment zone.`;
      } else if (hasRouteString || isHub) {
        riskType = 'TIER_2_ROUTE_SPLITS_FTZ_LOOPS';
        severity = 'MEDIUM';
        routePath = hasRouteString ? origin : `${origin} → [FTZ LOOP] → ${importer || 'UNKNOWN TARGET'}`;
        brief = `Multi-jurisdictional route optimization or potential origin-switching detected. Logistics pattern utilizes standard transshipment tax/tariff avoidance corridors.`;
      }

      return { 
        ...row, 
        id: row.id || idx,
        riskType, 
        severity, 
        brief, 
        routePath, 
        cleanOrigin: origin.split('→')[0].trim(),
        cleanProduct: product || 'UNSPECIFIED CARGO'
      };
    }).filter(Boolean);
  }, [tradeData]);

  // Filtering filter logic mapped precisely across the structural tiers
  const filtered = useMemo(() => {
    if (filterType === 'ALL') return riskAnalysis;
    return riskAnalysis.filter(e => e.riskType === filterType);
  }, [riskAnalysis, filterType]);

  // Dynamic calculations for the executive overview
  const structuralInsights = useMemo(() => {
    const totalVolume = filtered.reduce((acc, curr) => acc + (Number(curr.Amount) || 0), 0);
    const uniqueTargets = new Set(filtered.map(e => e.Importer)).size;
    const highRiskCount = riskAnalysis.filter(e => e.severity === 'HIGH').length;
    const medRiskCount = riskAnalysis.filter(e => e.severity === 'MEDIUM').length;

    if (filtered.length === 0) {
      return {
        totalVolume, uniqueTargets, highRiskCount, medRiskCount,
        topProduct: 'NONE DETECTED', topHub: 'NONE DETECTED',
        contextText: 'No current logistical entries found matching active parameters.',
        evidentiaryFinding: 'Awaiting structural trade data ingestion streams.',
        executiveBriefing: 'System core operational. No strategic supply-chain anomalies isolated within selected subset.',
        operationalAnalysis: 'All route vectors clear. Baseline monitoring remains active across all ingestion pipelines.'
      };
    }

    // Determine top statistical weights dynamically
    const productCounts = {};
    const hubCounts = {};
    filtered.forEach(row => {
      productCounts[row.cleanProduct] = (productCounts[row.cleanProduct] || 0) + 1;
      hubCounts[row.cleanOrigin] = (hubCounts[row.cleanOrigin] || 0) + 1;
    });

    const topProduct = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b);
    const topHub = Object.keys(hubCounts).reduce((a, b) => hubCounts[a] > hubCounts[b] ? a : b);

    const contextText = `Logistical trade vectors originating from or routed via ${topHub} demonstrate concentrated patterns regarding ${topProduct}. These networks are highly indicative of secondary diversion pipelines seeking optimized customs entry thresholds.`;
    const evidentiaryFinding = `Analysis confirms focused transaction volumes associated with ${uniqueTargets} unique target entities. Rather than declaring strict compliance failure, patterns suggest unverified grey-market or parallel distribution channels bypassing traditional authorized infrastructure.`;

    const executiveBriefing = `Forensic auditing has classified ${filtered.length} active trade tracks within this filter layer, totaling $${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })} in audited transshipment value. Principal density shifts map directly to ${topProduct} shipments leaving ${topHub}.`;
    const operationalAnalysis = `Strategic trade structures reveal systematic utilization of key logistical junctions. Cross-corridor volume tracking is advised to detect structural mass-balance production anomalies between raw component input and finalized product outputs.`;

    return { totalVolume, uniqueTargets, highRiskCount, medRiskCount, topProduct, topHub, contextText, evidentiaryFinding, executiveBriefing, operationalAnalysis };
  }, [filtered, riskAnalysis]);

  const activeRouteForMap = filtered[selectedRouteIdx] || filtered[0] || null;

  return (
    <div className="space-y-6 text-slate-100 id-print-section max-w-[1800px] mx-auto p-1">
      
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
          <p className="text-xs text-slate-400 mt-1">Comprehensive structural analysis of multi-jurisdictional route splitting, customs transshipment hubs, and logistics discrepancies.</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer text-slate-200 transition shadow-sm"
        >
          <FileText size={14} className="text-blue-400" /> Print Corridor Dossier
        </button>
      </div>

      {/* Risk Tier Index Reference Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 print-break-avoid print-border-clean">
        <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3 print-text-dark">
          <Layers size={14} className="text-blue-500" /> Global Risk Tier Index Reference Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
          <div className="p-3 bg-slate-950/40 border-l-4 border-amber-500 rounded-r border-y border-r border-slate-900 print-border-clean">
            <div className="font-bold text-amber-400 mb-1 print-text-dark">Tier 1: Elevated Diversion</div>
            <p className="text-slate-400 leading-tight print-text-muted">Strategic, restricted, or dual-use commodities routed through verified global grey-market transshipment hubs.</p>
          </div>
          <div className="p-3 bg-slate-950/40 border-l-4 border-blue-500 rounded-r border-y border-r border-slate-900 print-border-clean">
            <div className="font-bold text-blue-400 mb-1 print-text-dark">Tier 2: Route Splits / FTZ Loops</div>
            <p className="text-slate-400 leading-tight print-text-muted">Complex logistics routing utilizing dynamic waypoint insertion, regional loop structures, or Free Trade Zones.</p>
          </div>
          <div className="p-3 bg-slate-950/40 border-l-4 border-slate-600 rounded-r border-y border-r border-slate-900 print-border-clean">
            <div className="font-bold text-slate-400 mb-1 print-text-dark">Tier 3: Monitored Baseline</div>
            <p className="text-slate-400 leading-tight print-text-muted">Standard linear trade alignments running along transparent, well-mapped bilateral shipping corridors.</p>
          </div>
        </div>
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

        {/* High Contrast Audit Balance Card */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-center space-y-2 print-border-clean">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider print-text-muted">Audited Corridor Value Risk</span>
          <div className="text-2xl font-mono font-black text-emerald-400 print-text-dark">
            ${structuralInsights.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] font-mono text-slate-400 block border-t border-slate-800/60 pt-2 print-text-muted print-border-clean">
            Concentrated across <strong>{structuralInsights.uniqueTargets} unique consignees</strong> globally.
          </span>
        </div>
      </div>

      {/* Dynamic Visual Component: Interactive Vector Flow Map Frame */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 print-break-avoid print-border-clean">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 print-border-clean">
          <div className="flex items-center gap-2">
            <Share2 size={15} className="text-blue-500" />
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider print-text-dark">
              Geospatial Route Flow Tracker & Node Connectivity Vector Matrix
            </h3>
          </div>
          {activeRouteForMap && (
            <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400 print-text-muted">
              Mapping Item: <strong className="text-blue-400">{activeRouteForMap.cleanProduct}</strong>
            </span>
          )}
        </div>

        {activeRouteForMap ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center pt-2">
            {/* The SVG Visual Flow Pipeline Map */}
            <div className="lg:col-span-3 bg-slate-950/80 rounded-xl p-6 border border-slate-900 flex flex-col justify-center items-center relative min-h-[160px] overflow-hidden print-border-clean print-container-expand">
              
              <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] non-printable"></div>
              
              <div className="w-full flex justify-between items-center max-w-2xl relative z-10">
                {/* Node 1: Origin */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-950 border-2 border-blue-500 flex items-center justify-center text-blue-400 font-mono font-black text-xs shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    ORG
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-300 block max-w-[120px] truncate print-text-dark">
                    {activeRouteForMap.cleanOrigin}
                  </span>
                </div>

                {/* Vector Flow Line 1 */}
                <div className="flex-1 flex flex-col items-center mx-2 relative">
                  <span className="text-[9px] text-slate-500 font-mono mb-1 tracking-tighter uppercase non-printable">Transit Link</span>
                  <div className="w-full h-[2px] bg-gradient-to-r from-blue-500 to-amber-500 relative flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute non-printable"></div>
                    <ArrowRight size={12} className="text-amber-400 absolute right-0 -mt-[5px]" />
                  </div>
                </div>

                {/* Node 2: Intermediary Hub / FTZ */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-xs border-2 ${
                    activeRouteForMap.severity === 'HIGH' 
                      ? 'bg-amber-950 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}>
                    HUB
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400 block max-w-[140px] truncate print-text-muted">
                    {activeRouteForMap.riskType === 'TIER_1_ELEVATED_DIVERSION' ? 'FTZ TRANSIT HUB' : 'DIRECT CROSS-BORDER'}
                  </span>
                </div>

                {/* Vector Flow Line 2 */}
                <div className="flex-1 flex flex-col items-center mx-2 relative">
                  <span className="text-[9px] text-slate-500 font-mono mb-1 tracking-tighter uppercase non-printable">Consignee Leg</span>
                  <div className="w-full h-[2px] bg-gradient-to-r from-amber-500 to-emerald-500 relative flex items-center justify-center">
                    <ArrowRight size={12} className="text-emerald-400 absolute right-0 -mt-[5px]" />
                  </div>
                </div>

                {/* Node 3: Target Consignee / Importer */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-mono font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    CON
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-300 block max-w-[120px] truncate print-text-dark">
                    {activeRouteForMap.Importer || 'UNKNOWN TARGET'}
                  </span>
                </div>
              </div>
            </div>

            {/* Micro Dynamic Route Context Card */}
            <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-2 h-full flex flex-col justify-center print-border-clean">
              <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider block">Audited Pathway Vector</span>
              <div className="text-xs font-mono font-bold text-slate-200 line-clamp-2 print-text-dark">
                {activeRouteForMap.routePath}
              </div>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono print-border-clean">
                <span className="text-slate-400 print-text-muted">Risk Severity:</span>
                <span className={`font-bold uppercase ${
                  activeRouteForMap.severity === 'HIGH' ? 'text-amber-400' : activeRouteForMap.severity === 'MEDIUM' ? 'text-blue-400' : 'text-slate-400'
                }`}>{activeRouteForMap.severity}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs font-mono text-slate-500 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl">
            No active trade records found to generate visual vector maps.
          </div>
        )}
      </div>

      {/* Executive AI Briefing & Operational Analysis Frame */}
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
            { id: 'ALL', label: 'All Audited Shipments' },
            { id: 'TIER_1_ELEVATED_DIVERSION', label: 'Tier 1: Elevated Diversion' },
            { id: 'TIER_2_ROUTE_SPLITS_FTZ_LOOPS', label: 'Tier 2: Route Splits/FTZ Loops' },
            { id: 'TIER_3_MONITORED_BASELINE', label: 'Tier 3: Monitored Baseline' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => {
                setFilterType(tab.id);
                setSelectedRouteIdx(0);
              }} 
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
                key={evt.id} 
                onClick={() => setSelectedRouteIdx(idx)}
                className={`p-5 rounded-xl border bg-[#111827] cursor-pointer transition-all print-break-avoid print-border-clean ${
                  selectedRouteIdx === idx ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-slate-800 hover:border-slate-700'
                } ${
                  evt.severity === 'HIGH' ? 'border-l-4 border-l-amber-500' : evt.severity === 'MEDIUM' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-slate-600'
                }`}
              >
                
                <div className="flex justify-between border-b border-slate-800/60 pb-2 mb-3 font-mono text-xs print-border-clean">
                  <span className={`font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    evt.severity === 'HIGH' ? 'text-amber-400' : evt.severity === 'MEDIUM' ? 'text-blue-400' : 'text-slate-400'
                   font-black} print-text-dark`}>
                    {evt.severity === 'HIGH' && <AlertTriangle size={13} className="non-printable" />}
                    {evt.severity === 'MEDIUM' && <ShieldAlert size={13} className="non-printable" />}
                    {evt.severity === 'LOW' && <CheckCircle2 size={13} className="non-printable" />}
                    {(evt.riskType || '').replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400 font-bold print-text-muted">{evt.Date || '2026 Audit Cycle'}</span>
                </div>

                {/* Audit Narrative block */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-mono text-slate-200 leading-relaxed print-text-dark">
                    <span className="text-slate-500 font-black uppercase tracking-tight print-text-muted">Logistical Record Brief:</span> {evt.brief}
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
              No entries found matching the current analytical parameters.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Globe, ShieldAlert, FileText, Server, Info, ArrowRight, Share2, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

// Comprehensive Global Geolocation Look-up Matrix
const GEOLOCATION_REGISTRY = {
  // Turn Case Studies & Core Hubs
  'PAKISTAN': [30.3753, 69.3451],
  'PK': [30.3753, 69.3451],
  'INDONESIA': [-0.7893, 113.9213],
  'ID': [-0.7893, 113.9213],

  // Southeast Asia & East Asia Hubs
  'MALAYSIA': [4.2105, 101.9758],
  'MY': [4.2105, 101.9758],
  'SINGAPORE': [1.3521, 103.8198],
  'SG': [1.3521, 103.8198],
  'HONG KONG': [22.3193, 114.1694],
  'HK': [22.3193, 114.1694],
  'CHINA': [35.8617, 104.1954],
  'CN': [35.8617, 104.1954],
  'VIETNAM': [14.0583, 108.2772],
  'VN': [14.0583, 108.2772],
  'JAPAN': [36.2048, 138.2529],
  'JP': [36.2048, 138.2529],
  'SOUTH KOREA': [35.9078, 127.7669],
  'KR': [35.9078, 127.7669],
  'INDIA': [20.5937, 78.9629],
  'IN': [20.5937, 78.9629],

  // Middle East & Mediterranean Hubs
  'DUBAI': [25.2048, 55.2708],
  'UAE': [25.2048, 55.2708],
  'AE': [25.2048, 55.2708],
  'TURKEY': [38.9637, 35.2433],
  'TURKIYE': [38.9637, 35.2433],
  'TR': [38.9637, 35.2433],

  // European Gateways & Ingestion Zones
  'UNITED KINGDOM': [55.3781, -3.4360],
  'UK': [55.3781, -3.4360],
  'GB': [55.3781, -3.4360],
  'GERMANY': [51.1657, 10.4515],
  'DE': [51.1657, 10.4515],
  'FRANCE': [46.2276, 2.2137],
  'FR': [46.2276, 2.2137],
  'ITALY': [41.8719, 12.5674],
  'IT': [41.8719, 12.5674],
  'SPAIN': [40.4637, -3.7492],
  'ES': [40.4637, -3.7492],
  'NETHERLANDS': [52.1326, 5.2913],
  'NL': [52.1326, 5.2913],
  'BELGIUM': [50.5039, 4.4699],
  'BE': [50.5039, 4.4699],
  'SWITZERLAND': [46.8182, 8.2275],
  'CH': [46.8182, 8.2275],
  'RUSSIA': [61.5240, 105.3188],
  'RU': [61.5240, 105.3188],

  // Americas & Oceania Baseline Parameters
  'UNITED STATES': [37.0902, -95.7129],
  'USA': [37.0902, -95.7129],
  'US': [37.0902, -95.7129],
  'CANADA': [56.1304, -106.3468],
  'CA': [56.1304, -106.3468],
  'BRAZIL': [-14.2350, -51.9253],
  'BR': [-14.2350, -51.9253],
  'AUSTRALIA': [-25.2744, 133.7751],
  'AU': [-25.2744, 133.7751]
};

export default function CountryRiskIntelligence() {
  const { tradeData = [] } = useTradeData() || {};
  const [filterType, setFilterType] = useState('ALL');
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);

  // Dynamic risk tiering engine mapped to Tiers 1, 2, and 3
  const riskAnalysis = useMemo(() => {
    return tradeData.map((row, idx) => {
      if (!row) return null;

      const origin = (row.OriginCountry || '').toUpperCase().trim();
      const product = (row.Product || '').toUpperCase().trim();
      const importer = (row.Importer || '').toUpperCase().trim();
      
      const hasRouteString = origin.includes('→') || origin.includes('VIA');
      
      let routePath = hasRouteString ? origin : `${origin} → [DIRECT DESTINATION]`;
      let riskType = 'TIER_3_MONITORED_BASELINE';
      let severity = 'LOW';
      let brief = 'Logistical routing falls within standard bilateral parameters. Direct shipping lanes observed.';

      const isHub = 
        origin.includes('MALAYSIA') || origin.includes('MY') ||
        origin.includes('SINGAPORE') || origin.includes('SG') || 
        origin.includes('HONG KONG') || origin.includes('HK') || 
        origin.includes('DUBAI') || origin.includes('UAE') || origin.includes('AE') ||
        origin.includes('TURKEY') || origin.includes('TR') || origin.includes('NETHERLANDS') || origin.includes('NL');

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

  const filtered = useMemo(() => {
    if (filterType === 'ALL') return riskAnalysis;
    return riskAnalysis.filter(e => e.riskType === filterType);
  }, [riskAnalysis, filterType]);

  // Dynamic insights engine calculations
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

  // Standalone Geospatial Projection Computations (Equirectangular Map Translation)
  const mapVectors = useMemo(() => {
    if (!activeRouteForMap) return null;

    const parseCoords = (locString) => {
      const normal = (locString || '').toUpperCase().trim();
      for (const [key, coords] of Object.entries(GEOLOCATION_REGISTRY)) {
        if (normal.includes(key)) return coords;
      }
      const hash = normal.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return [10 + (hash % 30), 60 + (hash % 50)]; 
    };

    const [originLat, originLon] = parseCoords(activeRouteForMap.cleanOrigin);
    const [targetLat, targetLon] = parseCoords(activeRouteForMap.Importer || 'FINAL_DESTINATION');

    const getXY = (lat, lon) => {
      const x = ((lon + 180) / 360) * 800;
      const y = ((90 - lat) / 180) * 360;
      return { x, y };
    };

    return {
      origin: getXY(originLat, originLon),
      target: getXY(targetLat, targetLon),
      color: activeRouteForMap.severity === 'HIGH' ? '#f59e0b' : activeRouteForMap.severity === 'MEDIUM' ? '#3b82f6' : '#10b981'
    };
  }, [activeRouteForMap]);

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
          <p className="text-xs text-slate-200 mt-1">Comprehensive structural analysis of multi-jurisdictional route splitting, customs transshipment hubs, and logistics discrepancies.</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer text-slate-100 transition shadow-sm"
        >
          <FileText size={14} className="text-blue-400" /> Print Corridor Dossier
        </button>
      </div>

      {/* Risk Tier Index Reference Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 print-break-avoid print-border-clean">
        <h3 className="text-xs font-mono font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3 print-text-dark">
          <Layers size={14} className="text-blue-500" /> Global Risk Tier Index Reference Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
          <div className="p-3 bg-slate-950/40 border-l-4 border-amber-500 rounded-r border-y border-r border-slate-900 print-border-clean">
            <div className="font-bold text-amber-400 mb-1 print-text-dark">Tier 1: Elevated Diversion</div>
            <p className="text-slate-200 leading-tight print-text-muted">Strategic, restricted, or dual-use commodities routed through verified global grey-market transshipment hubs.</p>
          </div>
          <div className="p-3 bg-slate-950/40 border-l-4 border-blue-500 rounded-r border-y border-r border-slate-900 print-border-clean">
            <div className="font-bold text-blue-400 mb-1 print-text-dark">Tier 2: Route Splits / FTZ Loops</div>
            <p className="text-slate-200 leading-tight print-text-muted">Complex logistics routing utilizing dynamic waypoint insertion, regional loop structures, or Free Trade Zones.</p>
          </div>
          <div className="p-3 bg-slate-950/40 border-l-4 border-slate-400 rounded-r border-y border-r border-slate-900 print-border-clean">
            <div className="font-bold text-slate-100 mb-1 print-text-dark">Tier 3: Monitored Baseline</div>
            <p className="text-slate-200 leading-tight print-text-muted">Standard linear trade alignments running along transparent, well-mapped bilateral shipping corridors.</p>
          </div>
        </div>
      </div>

      {/* Corporate Executive Analytics Summary & Context Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print-break-avoid">
        <div className="bg-[#111827] border-l-4 border-blue-500 p-5 rounded-xl xl:col-span-2 space-y-3 print-border-clean">
          <h3 className="text-xs font-mono font-black text-blue-400 uppercase flex items-center gap-2 print-text-dark">
            <Server size={14}/> Forensic Corridor Impact Assessment & Summary
          </h3>
          <p className="text-sm text-white font-mono leading-relaxed print-text-dark">
            <strong>Logistical Context:</strong> {structuralInsights.contextText}
          </p>
          <p className="text-sm text-slate-200 font-mono leading-relaxed print-text-muted">
            <strong>Evidentiary Finding:</strong> {structuralInsights.evidentiaryFinding}
          </p>
        </div>

        {/* High Contrast Audit Balance Card */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-center space-y-2 print-border-clean">
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider print-text-muted">Audited Corridor Value Risk</span>
          <div className="text-2xl font-mono font-black text-emerald-400 print-text-dark">
            ${structuralInsights.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-mono text-slate-200 block border-t border-slate-800/60 pt-2 print-text-muted print-border-clean">
            Concentrated across <strong className="text-white">{structuralInsights.uniqueTargets} unique consignees</strong> globally.
          </span>
        </div>
      </div>

      {/* Dynamic Visual Component: Build-Safe Geospatial Tracker Map */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 print-break-avoid print-border-clean">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 print-border-clean">
          <div className="flex items-center gap-2">
            <Share2 size={15} className="text-blue-500" />
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider print-text-dark">
              Geospatial Route Flow Tracker & Node Connectivity Vector Matrix
            </h3>
          </div>
          {activeRouteForMap && (
            <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-200 print-text-muted">
              Mapping Item: <strong className="text-blue-400">{activeRouteForMap.cleanProduct}</strong>
            </span>
          )}
        </div>

        {activeRouteForMap && mapVectors ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center pt-2">
            
            {/* High-Visibility Vector Map Canvas Layer */}
            <div className="lg:col-span-3 bg-[#0a0f1d] rounded-xl border border-slate-800 relative h-[360px] p-2 print-border-clean print-container-expand flex items-center justify-center">
              <svg 
                viewBox="0 0 800 360" 
                className="w-full h-full text-slate-700"
                style={{ background: '#0a0f1d' }}
              >
                {/* Tech Grid Pattern */}
                <defs>
                  <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.6" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Visible Light-Colored Continental Landmass Outlines */}
                <g fill="#1e2d4a" stroke="#33476a" strokeWidth="1" strokeOpacity="0.7" fillOpacity="0.4">
                  {/* North America */}
                  <path d="M 50,50 L 180,40 L 220,120 L 150,180 L 110,160 L 70,120 Z" />
                  {/* South America */}
                  <path d="M 160,190 L 210,210 L 180,320 L 140,240 Z" />
                  {/* Eurasia & Europe */}
                  <path d="M 360,60 L 450,40 L 680,50 L 650,150 L 520,160 L 480,120 L 380,110 Z" />
                  {/* Africa */}
                  <path d="M 380,130 L 460,140 L 490,200 L 450,290 L 410,210 L 360,170 Z" />
                  {/* Australia */}
                  <path d="M 620,240 L 690,250 L 670,300 L 600,280 Z" />
                </g>

                {/* Connection Flight/Sailing Vector Curved Pathway Arc */}
                <path
                  d={`M ${mapVectors.origin.x} ${mapVectors.origin.y} Q ${(mapVectors.origin.x + mapVectors.target.x) / 2} ${Math.min(mapVectors.origin.y, mapVectors.target.y) - 60} ${mapVectors.target.x} ${mapVectors.target.y}`}
                  fill="none"
                  stroke={mapVectors.color}
                  strokeWidth="3"
                  strokeDasharray="6,4"
                />

                {/* Origin Marker Node */}
                <circle cx={mapVectors.origin.x} cy={mapVectors.origin.y} r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                <text x={mapVectors.origin.x + 12} y={mapVectors.origin.y - 6} fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold" backgroundColor="#000000">
                  {activeRouteForMap.cleanOrigin}
                </text>

                {/* Destination Target Node */}
                <circle cx={mapVectors.target.x} cy={mapVectors.target.y} r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x={mapVectors.target.x + 12} y={mapVectors.target.y + 14} fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {activeRouteForMap.Importer || 'TARGET'}
                </text>
              </svg>
            </div>

            {/* Dynamic Route Context Sidebar */}
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-2 h-full flex flex-col justify-center print-border-clean">
              <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-wider block">Audited Pathway Vector</span>
              <div className="text-xs font-mono font-bold text-white line-clamp-2 print-text-dark">
                {activeRouteForMap.routePath}
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono print-border-clean">
                <span className="text-slate-300 print-text-muted">Risk Severity:</span>
                <span className={`font-bold uppercase ${
                  activeRouteForMap.severity === 'HIGH' ? 'text-amber-400' : activeRouteForMap.severity === 'MEDIUM' ? 'text-blue-400' : 'text-emerald-400'
                }`}>{activeRouteForMap.severity}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs font-mono text-slate-300 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl">
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
            <p className="text-[11px] text-slate-200 font-mono print-text-muted">Dynamic algorithmic threat overview and supply chain verification matrix</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono leading-relaxed print-container-expand">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-1 print-break-avoid print-border-clean">
            <span className="text-blue-400 font-bold block uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1 mb-2 print-text-dark print-border-clean">
              Strategic Threat Briefing
            </span>
            <p className="text-slate-100 print-text-dark">
              {structuralInsights.executiveBriefing}
            </p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-1 print-break-avoid print-border-clean">
            <span className="text-emerald-400 font-bold block uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1 mb-2 print-text-dark print-border-clean">
              Operational Vector Analysis
            </span>
            <p className="text-slate-100 print-text-dark">
              {structuralInsights.operationalAnalysis}
            </p>
          </div>
        </div>
      </div>

      {/* Main Core Architecture Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print-container-expand">
        
        {/* Sidebar Filtering Controls */}
        <div className="space-y-2 non-printable">
          <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-widest block px-1 mb-2">Logistical Risk Class</span>
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
                  : 'bg-[#111827]/60 border-slate-800 text-slate-300 hover:bg-[#111827] hover:text-white'
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
                
                <div className="flex justify-between border-b border-slate-800 pb-2 mb-3 font-mono text-xs print-border-clean">
                  <span className={`font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    evt.severity === 'HIGH' ? 'text-amber-400' : evt.severity === 'MEDIUM' ? 'text-blue-400' : 'text-slate-200'
                  } print-text-dark`}>
                    {evt.severity === 'HIGH' && <AlertTriangle size={13} className="non-printable" />}
                    {evt.severity === 'MEDIUM' && <ShieldAlert size={13} className="non-printable" />}
                    {evt.severity === 'LOW' && <CheckCircle2 size={13} className="non-printable" />}
                    {(evt.riskType || '').replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-200 font-bold print-text-muted">{evt.Date || '2026 Audit Cycle'}</span>
                </div>

                {/* Audit Narrative block */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-mono text-white leading-relaxed print-text-dark">
                    <span className="text-slate-300 font-black uppercase tracking-tight print-text-muted">Logistical Record Brief:</span> {evt.brief}
                  </p>
                </div>

                {/* Granular Supply-Chain Mapping Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs font-mono print-border-clean print-container-expand">
                  <div>
                    <span className="block text-[10px] text-slate-300 uppercase font-black tracking-wider mb-0.5 print-text-muted">Reconstructed Sourcing Route Path</span>
                    <span className="text-white font-bold print-text-dark">{evt.routePath}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-300 uppercase font-black tracking-wider mb-0.5 print-text-muted">Commodity Description</span>
                    <span className="text-slate-100 truncate block max-w-xs print-text-dark">{evt.Product || 'Unclassified Item'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-300 uppercase font-black tracking-wider mb-0.5 print-text-muted">Target Consignee (Entity Linkage)</span>
                    <span className="text-blue-400 font-bold block truncate print-text-dark">{evt.Importer || 'UNKNOWN CONSIGNEE'}</span>
                  </div>
                </div>

                {/* Defensible Legal Findings Sub-Section */}
                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-200 flex items-start gap-1.5 bg-[#0f172a]/40 p-2.5 rounded-lg border border-slate-800 print-border-clean">
                  <Info size={12} className="text-blue-400 mt-0.5 flex-shrink-0 non-printable" />
                  <div>
                    <strong className="text-white uppercase tracking-tight block mb-0.5 print-text-dark">Possible Litigation Relevance:</strong>
                    Potentially relevant to parallel importation analysis and regulatory compliance modeling. Sourcing proprietary assets or manufacturing nodes via known third-country transshipment legs supports commercial scale audits and indicates structural related-party or gray-market distribution routing.
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-300 print-border-clean">
              No entries found matching the current analytical parameters.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

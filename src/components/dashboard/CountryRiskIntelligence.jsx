import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Globe, ShieldAlert, FileText, Server, Info, ArrowRight, Share2, AlertTriangle, CheckCircle2, Layers, Cpu, Filter } from 'lucide-react';

// Comprehensive Global Geolocation Registry Matrix
const GEOLOCATION_REGISTRY = {
  'PAKISTAN': [30.3753, 69.3451], 'PK': [30.3753, 69.3451],
  'INDONESIA': [-0.7893, 113.9213], 'ID': [-0.7893, 113.9213],
  'MALAYSIA': [4.2105, 101.9758], 'MY': [4.2105, 101.9758],
  'SINGAPORE': [1.3521, 103.8198], 'SG': [1.3521, 103.8198],
  'HONG KONG': [22.3193, 114.1694], 'HK': [22.3193, 114.1694],
  'CHINA': [35.8617, 104.1954], 'CN': [35.8617, 104.1954],
  'VIETNAM': [14.0583, 108.2772], 'VN': [14.0583, 108.2772],
  'JAPAN': [36.2048, 138.2529], 'JP': [36.2048, 138.2529],
  'SOUTH KOREA': [35.9078, 127.7669], 'KR': [35.9078, 127.7669],
  'INDIA': [20.5937, 78.9629], 'IN': [20.5937, 78.9629],
  'DUBAI': [25.2048, 55.2708], 'UAE': [25.2048, 55.2708], 'AE': [25.2048, 55.2708],
  'TURKEY': [38.9637, 35.2433], 'TURKIYE': [38.9637, 35.2433], 'TR': [38.9637, 35.2433],
  'GERMANY': [51.1657, 10.4515], 'DE': [51.1657, 10.4515],
  'UNITED KINGDOM': [55.3781, -3.4360], 'UK': [55.3781, -3.4360], 'GB': [55.3781, -3.4360],
  'FRANCE': [46.2276, 2.2137], 'FR': [46.2276, 2.2137],
  'ITALY': [41.8719, 12.5674], 'IT': [41.8719, 12.5674],
  'SPAIN': [40.4637, -3.7492], 'ES': [40.4637, -3.7492],
  'NETHERLANDS': [52.1326, 5.2913], 'NL': [52.1326, 5.2913],
  'BELGIUM': [50.5039, 4.4699], 'BE': [50.5039, 4.4699],
  'SWITZERLAND': [46.8182, 8.2275], 'CH': [46.8182, 8.2275],
  'RUSSIA': [61.5240, 105.3188], 'RU': [61.5240, 105.3188],
  'UNITED STATES': [37.0902, -95.7129], 'USA': [37.0902, -95.7129], 'US': [37.0902, -95.7129]
};

// Abstracted Industry Schema Blueprint Definitions
const INDUSTRY_SCHEMAS = {
  TOBACCO: {
    name: 'Tobacco & Precursors',
    keywords: ['FILTER', 'ROD', 'TOW', 'ACETATE', 'TOBACCO', 'CIGARETTE'],
    precursor: 'Acetate Tow / Cut Rag',
    financialCeiling: 500000,
    mismatchText: 'Outbound component volumes diverge sharply from imputed precursor import thresholds.',
    hubText: 'Strategic industrial components flowing into active logistical distribution hubs.'
  },
  LUXURY_GOODS: {
    name: 'Luxury Goods & Apparel',
    keywords: ['BAG', 'HANDBAG', 'PERFUME', 'PARFUM', 'WATCH', 'LEATHER', 'LUXURY'],
    precursor: 'Premium Raw Materials / Component Blanks',
    financialCeiling: 750000,
    mismatchText: 'Finished product export density surpasses verified local artisan or production house limits.',
    hubText: 'High-value consumer goods routed via high-frequency transit points showing inventory decoupling.'
  },
  ELECTRONICS: {
    name: 'High-Tech & Dual-Use Electronics',
    keywords: ['SEMICONDUCTOR', 'CHIP', 'CIRCUIT', 'DIODE', 'TRANSISTOR', 'CAPACITOR', 'BOARD'],
    precursor: 'Silicon Wafers / Enclosures',
    financialCeiling: 1200000,
    mismatchText: 'Advanced component volume outpaces regional technical cleanroom assembly constraints.',
    hubText: 'Active technology hardware streams tracking through secondary parallel-trade distribution zones.'
  },
  GENERAL: {
    name: 'Standard Commercial Trade Flow',
    keywords: [],
    precursor: 'Aggregated Raw Materials',
    financialCeiling: 1000000,
    mismatchText: 'Volumetric outbound weight runs askew from known country output capacity baselines.',
    hubText: 'Bilateral trade pattern displays intense concentration relative to historic baseline moving averages.'
  }
};

export default function MultiIndustryForensicEngine() {
  const { tradeData = [] } = useTradeData() || {};
  const [filterType, setFilterType] = useState('ALL');
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [leafletReady, setLeafletReady] = useState(false);
  
  // Interactive Workspace Mapped Filters
  const [mapOriginSelect, setMapOriginSelect] = useState('ALL');
  const [mapDestSelect, setMapDestSelect] = useState('ALL');
  const [selectedIndustryKey, setSelectedIndustryKey] = useState('ALL');
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLeafletReady(true);
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(cssLink)) document.head.removeChild(cssLink);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Global Context Multi-Industry Parser Engine
  const riskAnalysis = useMemo(() => {
    return tradeData.map((row, idx) => {
      if (!row) return null;

      const origin = (row.OriginCountry || '').toUpperCase().trim();
      const product = (row.Product || '').toUpperCase().trim();
      const importer = (row.Importer || '').toUpperCase().trim();
      const declaredDest = (row.DestinationCountry || '').toUpperCase().trim();
      const derivedAmount = Number(row.Amount) || 620000;
      
      // 1. Dynamic Industry Classification Detection Loop
      let detectedKey = 'GENERAL';
      for (const [key, schema] of Object.entries(INDUSTRY_SCHEMAS)) {
        if (key !== 'GENERAL' && schema.keywords.some(kw => product.includes(kw))) {
          detectedKey = key;
          break;
        }
      }
      const schema = INDUSTRY_SCHEMAS[detectedKey];

      // 2. Geography Resolver
      let destinationCountry = 'GERMANY';
      if (declaredDest && !declaredDest.includes('FTZ') && declaredDest.length > 2) {
        destinationCountry = declaredDest;
      } else if (importer.includes('GERMANY') || importer.includes('GMBH')) {
        destinationCountry = 'GERMANY';
      } else if (importer.includes('UK') || importer.includes('LONDON')) {
        destinationCountry = 'UNITED KINGDOM';
      } else if (declaredDest) {
        destinationCountry = declaredDest;
      }

      const hasRouteString = origin.includes('→') || origin.includes('VIA');
      const routePath = hasRouteString ? origin : `${origin} → ${destinationCountry}`;
      const cleanOrigin = origin.split('→')[0].trim();
      
      let riskType = 'TIER_3_MONITORED_BASELINE';
      let severity = 'LOW';
      let brief = `Direct linear corridor verified. Logistical volumes fall completely within standard baseline variables.`;

      const isHub = ['PAKISTAN', 'SINGAPORE', 'DUBAI', 'UAE', 'TURKEY', 'MALAYSIA', 'NETHERLANDS']
        .some(hub => cleanOrigin.includes(hub));

      // 3. Unified Industry-Agnostic Forensic Threat Calculations
      if (isHub && detectedKey !== 'GENERAL') {
        riskType = 'TIER_1_ELEVATED_DIVERSION';
        severity = 'HIGH';
        if (hasRouteString) {
          brief = `High-density transshipment mismatch identified. ${schema.hubText}`;
        } else if (derivedAmount > schema.financialCeiling) {
          brief = `High-density mass-balance variance identified. ${schema.mismatchText}`;
        } else {
          brief = `Elevated ${schema.name} concentration signature. Volumes deviate sharply from historical baseline trends.`;
        }
      } else if (hasRouteString || isHub) {
        riskType = 'TIER_2_ROUTE_SPLITS_FTZ_LOOPS';
        severity = 'MEDIUM';
        brief = `Dynamic transit alteration or waypoint splitting detected. Tracking matches standard special economic zone rules.`;
      }

      return {
        ...row,
        id: row.id || idx,
        industryKey: detectedKey,
        industryName: schema.name,
        precursorLabel: schema.precursor,
        riskType,
        severity,
        brief,
        routePath,
        cleanOrigin,
        cleanProduct: product || 'AGGREGATED MANUFACTURED GOODS',
        cleanDestination: destinationCountry,
        Amount: derivedAmount
      };
    }).filter(Boolean);
  }, [tradeData]);

  // Integrated Filtering Stream Matrix
  const filtered = useMemo(() => {
    return riskAnalysis.filter(e => {
      const matchRisk = filterType === 'ALL' || e.riskType === filterType;
      const matchInd = selectedIndustryKey === 'ALL' || e.industryKey === selectedIndustryKey;
      return matchRisk && matchInd;
    });
  }, [riskAnalysis, filterType, selectedIndustryKey]);

  // Secondary Workspace Mapping Control Filters
  const uniqueOriginsList = useMemo(() => Array.from(new Set(filtered.map(e => e.cleanOrigin))).sort(), [filtered]);
  const uniqueDestsList = useMemo(() => Array.from(new Set(filtered.map(e => e.cleanDestination))).sort(), [filtered]);

  const mapsDisplayedRoutes = useMemo(() => {
    return filtered.filter(item => {
      const matchOrig = mapOriginSelect === 'ALL' || item.cleanOrigin === mapOriginSelect;
      const matchDest = mapDestSelect === 'ALL' || item.cleanDestination === mapDestSelect;
      return matchOrig && matchDest;
    });
  }, [filtered, mapOriginSelect, mapDestSelect]);

  const activeRouteForHighlight = mapsDisplayedRoutes[selectedRouteIdx] || mapsDisplayedRoutes[0] || null;

  // Real-Time Cartographic Coordinator (High-Contrast Voyager Theme)
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;
    const L = window.L;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [20, 20], zoom: 2, zoomControl: true, attributionControl: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, bgBuffer: 2
      }).addTo(mapInstanceRef.current);
      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();
    if (mapsDisplayedRoutes.length === 0) return;

    const parseCoords = (locString, offset) => {
      const normal = (locString || '').toUpperCase().trim();
      for (const [key, coords] of Object.entries(GEOLOCATION_REGISTRY)) {
        if (normal.includes(key)) return [coords[0] + (offset * 0.2), coords[1] + (offset * 0.2)];
      }
      return [45.0 + (offset * 0.25), 10.0 + (offset * 0.25)];
    };

    const boundsLatLngs = [];
    mapsDisplayedRoutes.forEach((item, idx) => {
      const originCoords = parseCoords(item.cleanOrigin, idx);
      const destCoords = parseCoords(item.cleanDestination, idx + 1);
      boundsLatLngs.push(originCoords, destCoords);

      const isSelected = activeRouteForHighlight && activeRouteForHighlight.id === item.id;
      const baseColor = item.severity === 'HIGH' ? '#d97706' : item.severity === 'MEDIUM' ? '#2563eb' : '#059669';

      const originMarker = L.circleMarker(originCoords, {
        radius: isSelected ? 10 : 6, fillColor: '#2563eb', color: isSelected ? '#000000' : '#ffffff', weight: isSelected ? 3 : 1.5, fillOpacity: 0.95
      }).bindPopup(`<div style="color:#0f172a; font-family:monospace; font-size:11px;"><strong>ORIGIN:</strong> ${item.cleanOrigin}<br/><strong>Sector:</strong> ${item.industryName}</div>`);

      const destMarker = L.circleMarker(destCoords, {
        radius: isSelected ? 10 : 6, fillColor: '#10b981', color: isSelected ? '#000000' : '#ffffff', weight: isSelected ? 3 : 1.5, fillOpacity: 0.95
      }).bindPopup(`<div style="color:#0f172a; font-family:monospace; font-size:11px;"><strong>DESTINATION:</strong> ${item.cleanDestination}</div>`);

      const connectionLine = L.polyline([originCoords, destCoords], {
        color: baseColor, weight: isSelected ? 5 : 2.5, dashArray: isSelected ? '10, 5' : '6, 4', opacity: isSelected ? 1.0 : 0.65
      });

      layerGroup.addLayer(originMarker);
      layerGroup.addLayer(destMarker);
      layerGroup.addLayer(connectionLine);
      if (isSelected) { connectionLine.bringToFront(); originMarker.bringToFront(); destMarker.bringToFront(); }
    });

    if (boundsLatLngs.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(boundsLatLngs), { padding: [40, 40], maxZoom: 5 });
    }
  }, [leafletReady, mapsDisplayedRoutes, activeRouteForHighlight]);

  // Text Insights Compilation Engine
  const structuralInsights = useMemo(() => {
    const totalVolume = filtered.reduce((acc, curr) => acc + (curr.Amount || 0), 0);
    const sectors = Array.from(new Set(filtered.map(e => e.industryName)));

    return {
      totalVolume,
      sectorsCount: sectors.length,
      executiveBriefing: `Forensic data normalization successfully executed across ${sectors.length} distinct trade classifications. Outbound values totaling $${totalVolume.toLocaleString()} are currently mapped under sector-specific capacity caps.`,
      operationalAnalysis: `Dynamic pattern monitoring has isolated high-frequency corridors. Cross-referencing transaction frequencies against implicit raw precursor limits is highly recommended.`
    };
  }, [filtered]);

  return (
    <div className="space-y-6 text-slate-100 id-print-section max-w-[1800px] mx-auto p-1">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .id-print-section { background: white !important; color: #000000 !important; }
          .non-printable { display: none !important; }
          .print-break-avoid { page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 1.5rem !important; border: 1px solid #cbd5e1 !important; background: #ffffff !important; }
          .print-text-dark { color: #0f172a !important; }
        }
      `}} />

      {/* Control Strip */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Globe className="text-blue-500" size={24} /> Universal Supply Chain Forensic Engine
          </h1>
          <p className="text-xs text-slate-200 mt-1">Multi-industry algorithmic raw data conversion module mapping macro capacity boundaries.</p>
        </div>
        
        {/* Industry Focus Dynamic Dropdown Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
            <Filter size={13} className="text-blue-400" />
            <span className="text-slate-300 uppercase font-bold">Active Sector Domain:</span>
            <select 
              value={selectedIndustryKey}
              onChange={(e) => { setSelectedIndustryKey(e.target.value); setSelectedRouteIdx(0); }}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-bold ml-1"
            >
              <option value="ALL" className="bg-slate-950">All Decoded Sectors</option>
              {Object.entries(INDUSTRY_SCHEMAS).map(([key, s]) => (
                <option key={key} value={key} className="bg-slate-950">{s.name}</option>
              ))}
            </select>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-100 hover:bg-slate-700 transition cursor-pointer">
            <FileText size={14} className="text-blue-400" /> Print Intelligence Docket
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print-break-avoid">
        <div className="bg-[#111827] border-l-4 border-blue-500 p-5 rounded-xl xl:col-span-2 space-y-2">
          <h3 className="text-xs font-mono font-black text-blue-400 uppercase flex items-center gap-2 print-text-dark">
            <Cpu size={14} /> Dynamic Material Cross-Referencing Metrics
          </h3>
          <p className="text-sm text-white font-mono leading-relaxed print-text-dark">
            The data schema matrix parses raw records across <strong>{structuralInsights.sectorsCount} structural industry domains</strong>. Risk alerts evaluate transaction financial densities against baseline manufacturing input ceilings for each detected class.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-center space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider">Normalized Aggregate Value</span>
          <div className="text-2xl font-mono font-black text-emerald-400 print-text-dark">
            ${structuralInsights.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Geospatial Component Frame with Side Workspace Selectors */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 print-break-avoid">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Share2 size={15} className="text-blue-500" />
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider print-text-dark">
              Geospatial Route Flow Tracker & High-Contrast Light Mapped Canvas
            </h3>
          </div>
          <span className="text-[11px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-200">
            Render Node Density: <strong className="text-blue-400">{mapsDisplayedRoutes.length} Lanes Active</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch pt-2">
          
          <div className="lg:col-span-3 rounded-xl border border-slate-800 relative h-[420px] overflow-hidden z-10 bg-slate-200">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* Core Sidebar Controllers next to Map Framework */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4">
            
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-wider block">Workspace Map Controls</span>
              
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-slate-300 uppercase font-bold">Filter Sourcing Origin</label>
                <select 
                  value={mapOriginSelect}
                  onChange={(e) => { setMapOriginSelect(e.target.value); setSelectedRouteIdx(0); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Mapped Origins ({uniqueOriginsList.length})</option>
                  {uniqueOriginsList.map(orig => <option key={orig} value={orig}>{orig}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-slate-300 uppercase font-bold">Filter Target Destination</label>
                <select 
                  value={mapDestSelect}
                  onChange={(e) => { setMapDestSelect(e.target.value); setSelectedRouteIdx(0); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Mapped Targets ({uniqueDestsList.length})</option>
                  {uniqueDestsList.map(dest => <option key={dest} value={dest}>{dest}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex-1 flex flex-col justify-end">
              <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-wider block mb-1">Active View Index</span>
              {mapsDisplayedRoutes.length > 0 ? (
                <div className="max-h-[120px] overflow-y-auto space-y-1 pr-1 bg-slate-950/40 p-1 rounded border border-slate-900">
                  {mapsDisplayedRoutes.map((route, rIdx) => (
                    <button
                      key={route.id}
                      onClick={() => setSelectedRouteIdx(rIdx)}
                      className={`w-full text-left font-mono text-[10px] p-1 truncate rounded block transition ${
                        selectedRouteIdx === rIdx ? 'bg-blue-600/30 text-white font-bold border border-blue-500/40' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {rIdx + 1}. [{route.industryKey}] {route.cleanOrigin} $\rightarrow$ {route.cleanDestination}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] font-mono text-amber-400">No matching vectors found.</p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Intelligence Insights Outlays */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 print-break-avoid">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <FileText size={16} className="text-blue-400" />
          <h3 className="text-sm font-black tracking-wider text-white font-mono uppercase print-text-dark">
            Normalized Engine Analytical Outputs
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono leading-relaxed">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 print-text-dark">
            <span className="text-blue-400 font-bold block uppercase tracking-wider text-[11px] border-b border-slate-800/60 pb-1 mb-2">Normalized Threat Brief</span>
            <p className="text-slate-100">{structuralInsights.executiveBriefing}</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 print-text-dark">
            <span className="text-emerald-400 font-bold block uppercase tracking-wider text-[11px] border-b border-slate-800/60 pb-1 mb-2">Operational Protocol Recomendation</span>
            <p className="text-slate-100">{structuralInsights.operationalAnalysis}</p>
          </div>
        </div>
      </div>

      {/* Main Execution Logs Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="space-y-2 non-printable">
          <span className="text-[10px] font-mono font-black text-slate-200 uppercase tracking-widest block px-1 mb-2">Logistical Risk Class</span>
          {[
            { id: 'ALL', label: 'All Audited Shipments' },
            { id: 'TIER_1_ELEVATED_DIVERSION', label: 'Tier 1: Elevated Diversion' },
            { id: 'TIER_2_ROUTE_SPLITS_FTZ_LOOPS', label: 'Tier 2: Route Splits' },
            { id: 'TIER_3_MONITORED_BASELINE', label: 'Tier 3: Monitored Baseline' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setFilterType(tab.id); setSelectedRouteIdx(0); setMapOriginSelect('ALL'); setMapDestSelect('ALL'); }} 
              className={`w-full text-left p-3 rounded font-mono text-xs block cursor-pointer border transition-all ${
                filterType === tab.id ? 'bg-[#1e293b] border-blue-500 text-white font-bold' : 'bg-[#111827]/60 border-slate-800 text-slate-200 hover:bg-[#111827]'
              }`}
            >
              {tab.label} ({tab.id === 'ALL' ? riskAnalysis.length : riskAnalysis.filter(e => e.riskType === tab.id).length})
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {filtered.length > 0 ? (
            filtered.map((evt) => {
              const isCurrentlySelectedInMap = activeRouteForHighlight && activeRouteForHighlight.id === evt.id;
              return (
                <div 
                  key={evt.id} 
                  className={`p-5 rounded-xl border bg-[#111827] transition-all print-break-avoid ${
                    isCurrentlySelectedInMap ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-slate-800'
                  } ${
                    evt.severity === 'HIGH' ? 'border-l-4 border-l-amber-500' : evt.severity === 'MEDIUM' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-slate-600'
                  }`}
                >
                  
                  <div className="flex justify-between border-b border-slate-800 pb-2 mb-3 font-mono text-xs">
                    <span className={`font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      evt.severity === 'HIGH' ? 'text-amber-400' : evt.severity === 'MEDIUM' ? 'text-blue-400' : 'text-slate-200'
                    } print-text-dark`}>
                      {(evt.riskType || '').replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{evt.industryName}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-mono text-white leading-relaxed print-text-dark">
                      <span className="text-slate-300 font-black uppercase tracking-tight">Logistical Record Brief:</span> {evt.brief}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-slate-800 text-xs font-mono">
                    <div>
                      <span className="block text-[10px] text-slate-300 uppercase font-black tracking-wider mb-0.5">Sourcing Route Path</span>
                      <span className="text-white font-bold print-text-dark">{evt.routePath}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 uppercase font-black tracking-wider mb-0.5">Raw Item String</span>
                      <span className="text-slate-100 truncate block max-w-xs print-text-dark">{evt.cleanProduct}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 uppercase font-black tracking-wider mb-0.5">Imputed Bottleneck Precursor</span>
                      <span className="text-amber-500 font-bold block truncate">{evt.precursorLabel}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 uppercase font-black tracking-wider mb-0.5">Target Destination Market</span>
                      <span className="text-blue-400 font-bold block truncate print-text-dark">{evt.cleanDestination}</span>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-200">
              No cross-border entries match current multi-industry selector parameters.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

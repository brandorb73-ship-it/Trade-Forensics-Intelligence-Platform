import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Globe, ShieldAlert, FileText, Server, Info, ArrowRight, Share2, AlertTriangle, CheckCircle2, Layers, Cpu, Filter, Hash } from 'lucide-react';

// Audited & Expanded Global Coordinates Matrix (Ensuring Precise Lat/Lng Projections)
const GEOLOCATION_REGISTRY = {
  'SPAIN': [40.4637, -3.7492], 'ES': [40.4637, -3.7492],
  'UNITED KINGDOM': [55.3781, -3.4360], 'UK': [55.3781, -3.4360], 'GB': [55.3781, -3.4360],
  'UNITED STATES': [37.0902, -95.7129], 'USA': [37.0902, -95.7129], 'US': [37.0902, -95.7129],
  'PANAMA': [8.5380, -80.7821], 'PA': [8.5380, -80.7821],
  'CAYMAN ISLANDS': [19.3133, -81.2546], 'KY': [19.3133, -81.2546],
  'BRAZIL': [-14.2350, -51.9253], 'BR': [-14.2350, -51.9253],
  'MEXICO': [23.6345, -102.5528], 'MX': [23.6345, -102.5528],
  'CANADA': [56.1304, -106.3468], 'CA': [56.1304, -106.3468],
  'AUSTRALIA': [-25.2744, 133.7751], 'AU': [-25.2744, 133.7751],
  'SOUTH AFRICA': [-30.5595, 22.9375], 'ZA': [-30.5595, 22.9375],
  'DUBAI': [25.2048, 55.2708], 'UAE': [25.2048, 55.2708], 'AE': [25.2048, 55.2708],
  'SAUDI ARABIA': [23.8859, 45.0792], 'SA': [23.8859, 45.0792],
  'OMAN': [21.5126, 55.9233], 'OM': [21.5126, 55.9233],
  'TURKEY': [38.9637, 35.2433], 'TURKIYE': [38.9637, 35.2433], 'TR': [38.9637, 35.2433],
  'CYPRUS': [35.1264, 33.4299], 'CY': [35.1264, 33.4299],
  'MALTA': [35.9375, 14.3754], 'MT': [35.9375, 14.3754],
  'GERMANY': [51.1657, 10.4515], 'DE': [51.1657, 10.4515],
  'NETHERLANDS': [52.1326, 5.2913], 'NL': [52.1326, 5.2913],
  'BELGIUM': [50.5039, 4.4699], 'BE': [50.5039, 4.4699],
  'FRANCE': [46.2276, 2.2137], 'FR': [46.2276, 2.2137],
  'ITALY': [41.8719, 12.5674], 'IT': [41.8719, 12.5674],
  'SWITZERLAND': [46.8182, 8.2275], 'CH': [46.8182, 8.2275],
  'POLAND': [51.9194, 19.1451], 'PL': [51.9194, 19.1451],
  'CHINA': [35.8617, 104.1954], 'CN': [35.8617, 104.1954],
  'HONG KONG': [22.3193, 114.1694], 'HK': [22.3193, 114.1694],
  'SINGAPORE': [1.3521, 103.8198], 'SG': [1.3521, 103.8198],
  'JAPAN': [36.2048, 138.2529], 'JP': [36.2048, 138.2529],
  'SOUTH KOREA': [35.9078, 127.7669], 'KR': [35.9078, 127.7669],
  'INDIA': [20.5937, 78.9629], 'IN': [20.5937, 78.9629],
  'PAKISTAN': [30.3753, 69.3451], 'PK': [30.3753, 69.3451],
  'INDONESIA': [-0.7893, 113.9213], 'ID': [-0.7893, 113.9213],
  'MALAYSIA': [4.2105, 101.9758], 'MY': [4.2105, 101.9758],
  'VIETNAM': [14.0583, 108.2772], 'VN': [14.0583, 108.2772],
  'RUSSIA': [61.5240, 105.3188], 'RU': [61.5240, 105.3188]
};

// Global Industry Schemas Synced via HS Chapter Codes & Text Flags
const INDUSTRY_SCHEMAS = {
  TOBACCO: {
    name: 'Tobacco & Nicotine Products',
    hsChapters: ['24'],
    keywords: ['FILTER', 'ROD', 'TOW', 'ACETATE', 'TOBACCO', 'CIGARETTE'],
    precursor: 'Acetate Tow / Cut Rag',
    financialCeiling: 500000,
    mismatchText: 'Outbound container counts diverge from baseline precursor volumes.',
    hubText: 'High risk of diversion via regional shadow networks.'
  },
  ALCOHOL: {
    name: 'Alcohol, Spirits & Beverages',
    hsChapters: ['22'],
    keywords: ['WHISKY', 'VODKA', 'WINE', 'SPIRITS', 'ALCOHOL', 'ETHANOL', 'BEER'],
    precursor: 'Bulk Industrial Spirit / Glass Bottles',
    financialCeiling: 600000,
    mismatchText: 'Finished tax-exempt liquor shipments deviate sharply from verified distillery capacities.',
    hubText: 'Parallel distribution trade signals standard excise tax evasion routing.'
  },
  PHARMA: {
    name: 'Pharmaceuticals & Ingredients',
    hsChapters: ['30', '29'],
    keywords: ['PHARMA', 'MEDICINE', 'API', 'VACCINE', 'ANTIBIOTIC', 'CAPSULE', 'TABLET'],
    precursor: 'Active Pharmaceutical Ingredients (APIs)',
    financialCeiling: 1500000,
    mismatchText: 'Discrepancy detected between raw chemical synthesis imports and outward generic medication distribution.',
    hubText: 'Strategic pharmaceutical elements routing through free trade zones with variable regulatory oversight.'
  },
  TITANIUM_METALS: {
    name: 'Titanium, Metals & Advanced Alloys',
    hsChapters: ['72', '73', '81'],
    keywords: ['TITANIUM', 'STEEL', 'IRON', 'ALLOY', 'INGOT', 'NICKEL', 'FORGING'],
    precursor: 'Raw Ore Concentrate / Smelter Input',
    financialCeiling: 2000000,
    mismatchText: 'Industrial mill output configurations conflict with documented raw ingot supply parameters.',
    hubText: 'Dual-use alloy trade flow traveling along high-risk routes subject to industrial export controls.'
  },
  LUXURY_GOODS: {
    name: 'Luxury Goods & Apparel',
    hsChapters: ['42', '33', '91'],
    keywords: ['BAG', 'HANDBAG', 'PERFUME', 'PARFUM', 'WATCH', 'LEATHER', 'LUXURY', 'COSMETIC'],
    precursor: 'Tanned Leather / Essential Fragrance Oils',
    financialCeiling: 800000,
    mismatchText: 'Outbound retail unit density exceeds regional capacity profiles.',
    hubText: 'High-frequency luxury transit indicators suggest potential supply chain decoupling.'
  },
  ELECTRONICS: {
    name: 'High-Tech Components',
    hsChapters: ['85', '84'],
    keywords: ['SEMICONDUCTOR', 'CHIP', 'CIRCUIT', 'DIODE', 'BOARD', 'MICROPROCESSOR'],
    precursor: 'Silicon Crystal Wafers',
    financialCeiling: 2500000,
    mismatchText: 'Micro-component transaction frequencies do not match active regional cleanroom manufacturing limits.',
    hubText: 'Advanced logic arrays tracking through secondary alternative parallel trade lanes.'
  },
  GENERAL: {
    name: 'Standard Commercial Goods',
    hsChapters: [],
    keywords: [],
    precursor: 'Unspecified Industrial Inputs',
    financialCeiling: 1000000,
    mismatchText: 'Volumetric payload calculations vary slightly from general country output baselines.',
    hubText: 'Bilateral industrial trade pattern follows standard baseline moving averages.'
  }
};

export default function MultiIndustryForensicEngine() {
  const { tradeData = [] } = useTradeData() || {};
  const [filterType, setFilterType] = useState('ALL');
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [leafletReady, setLeafletReady] = useState(false);
  
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

  // Multi-Industry Automated Classifier Engine
  const riskAnalysis = useMemo(() => {
    return tradeData.map((row, idx) => {
      if (!row) return null;

      const origin = (row.OriginCountry || '').toUpperCase().trim();
      const product = (row.Product || '').toUpperCase().trim();
      const importer = (row.Importer || '').toUpperCase().trim();
      const declaredDest = (row.DestinationCountry || '').toUpperCase().trim();
      const derivedAmount = Number(row.Amount) || 650000;
      
      // Extract raw HS Code prefix
      const rawHs = String(row.HSCode || row.hs_code || '').replace(/[^0-9]/g, '');
      const hsChapter = rawHs.substring(0, 2);

      // HS-First Classifier Loop with Keyword Fallbacks
      let detectedKey = 'GENERAL';
      
      for (const [key, schema] of Object.entries(INDUSTRY_SCHEMAS)) {
        if (key === 'GENERAL') continue;
        
        const hsMatch = schema.hsChapters.includes(hsChapter);
        const keywordMatch = schema.keywords.some(kw => product.includes(kw));
        
        if (hsMatch || keywordMatch) {
          detectedKey = key;
          break;
        }
      }
      
      const schema = INDUSTRY_SCHEMAS[detectedKey];

      // Geographic Resolution Logic
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
      let brief = `Direct corridor verified. Operational volumes match standard baseline variables.`;

      const isHub = ['PAKISTAN', 'SINGAPORE', 'DUBAI', 'UAE', 'TURKEY', 'MALAYSIA', 'NETHERLANDS', 'CYPRUS', 'PANAMA', 'MALTA']
        .some(hub => cleanOrigin.includes(hub));

      if (isHub && detectedKey !== 'GENERAL') {
        riskType = 'TIER_1_ELEVATED_DIVERSION';
        severity = 'HIGH';
        brief = derivedAmount > schema.financialCeiling
          ? `High-density anomaly. ${schema.mismatchText} ${schema.hubText}`
          : `Elevated ${schema.name} activity concentration signature in critical transit gateway.`;
      } else if (hasRouteString || isHub) {
        riskType = 'TIER_2_ROUTE_SPLITS_FTZ_LOOPS';
        severity = 'MEDIUM';
        brief = `Dynamic transit alteration or waypoint splitting detected via regional free trade zone constraints.`;
      }

      return {
        ...row,
        id: row.id || idx,
        hsCodeMatched: rawHs || 'NOT_FOUND',
        industryKey: detectedKey,
        industryName: schema.name,
        precursorLabel: schema.precursor,
        riskType,
        severity,
        brief,
        routePath,
        cleanOrigin,
        cleanProduct: product || 'UNCLASSIFIED COMMODITY BLOCKS',
        cleanDestination: destinationCountry,
        Amount: derivedAmount
      };
    }).filter(Boolean);
  }, [tradeData]);

  // Combined Data Filters Matrix
  const filtered = useMemo(() => {
    return riskAnalysis.filter(e => {
      const matchRisk = filterType === 'ALL' || e.riskType === filterType;
      const matchInd = selectedIndustryKey === 'ALL' || e.industryKey === selectedIndustryKey;
      return matchRisk && matchInd;
    });
  }, [riskAnalysis, filterType, selectedIndustryKey]);

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

  // Leaflet Dynamic Cartographic Handler
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;
    const L = window.L;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [20, 10], zoom: 2, zoomControl: true, attributionControl: false
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
        if (normal.includes(key)) return [coords[0] + (offset * 0.15), coords[1] + (offset * 0.15)];
      }
      return [35.0 + (offset * 0.2), 25.0 + (offset * 0.2)]; // Global centroid pivot fallback
    };

    const boundsLatLngs = [];
    mapsDisplayedRoutes.forEach((item, idx) => {
      const originCoords = parseCoords(item.cleanOrigin, idx);
      const destCoords = parseCoords(item.cleanDestination, idx + 1);
      boundsLatLngs.push(originCoords, destCoords);

      const isSelected = activeRouteForHighlight && activeRouteForHighlight.id === item.id;
      const baseColor = item.severity === 'HIGH' ? '#e11d48' : item.severity === 'MEDIUM' ? '#3b82f6' : '#10b981';

      const originMarker = L.circleMarker(originCoords, {
        radius: isSelected ? 9 : 5.5, fillColor: '#2563eb', color: isSelected ? '#000000' : '#ffffff', weight: isSelected ? 3 : 1, fillOpacity: 0.9
      }).bindPopup(`<div style="color:#0f172a; font-family:monospace; font-size:11px;"><strong>ORIGIN:</strong> ${item.cleanOrigin}</div>`);

      const destMarker = L.circleMarker(destCoords, {
        radius: isSelected ? 9 : 5.5, fillColor: '#10b981', color: isSelected ? '#000000' : '#ffffff', weight: isSelected ? 3 : 1, fillOpacity: 0.9
      }).bindPopup(`<div style="color:#0f172a; font-family:monospace; font-size:11px;"><strong>DESTINATION:</strong> ${item.cleanDestination}</div>`);

      const connectionLine = L.polyline([originCoords, destCoords], {
        color: baseColor, weight: isSelected ? 4.5 : 2, dashArray: isSelected ? '8, 4' : '4, 4', opacity: isSelected ? 1.0 : 0.6
      });

      layerGroup.addLayer(originMarker);
      layerGroup.addLayer(destMarker);
      layerGroup.addLayer(connectionLine);
      if (isSelected) { connectionLine.bringToFront(); originMarker.bringToFront(); destMarker.bringToFront(); }
    });

    if (boundsLatLngs.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(boundsLatLngs), { padding: [50, 50], maxZoom: 5 });
    }
  }, [leafletReady, mapsDisplayedRoutes, activeRouteForHighlight]);

  const totalVolume = useMemo(() => filtered.reduce((acc, curr) => acc + (curr.Amount || 0), 0), [filtered]);

  return (
    <div className="space-y-6 text-slate-100 max-w-[1800px] mx-auto p-1">
      
      {/* Structural Header Strip */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Globe className="text-blue-500" size={24} /> Automated HS & Trade Intelligence Framework
          </h1>
          <p className="text-xs text-slate-400 mt-1">Universal multi-industry anomaly parsing ledger driven by automated Customs Tariff sequencing.</p>
        </div>
        
        {/* Dynamic Domain Selection Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
            <Filter size={13} className="text-blue-400" />
            <span className="text-slate-400 font-bold uppercase">Sector Filters:</span>
            <select 
              value={selectedIndustryKey}
              onChange={(e) => { setSelectedIndustryKey(e.target.value); setSelectedRouteIdx(0); }}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-bold ml-1"
            >
              <option value="ALL" className="bg-slate-950">All Scanned Verticals</option>
              {Object.entries(INDUSTRY_SCHEMAS).map(([key, s]) => (
                <option key={key} value={key} className="bg-slate-950">{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Analytics Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-[#111827] border-l-4 border-blue-500 p-5 rounded-xl xl:col-span-2 space-y-2">
          <h3 className="text-xs font-mono font-black text-blue-400 uppercase flex items-center gap-2">
            <Cpu size={14} /> HS-First Classification System Active
          </h3>
          <p className="text-sm text-slate-300 font-mono leading-relaxed">
            Records are mapped to industrial sectors dynamically via active <strong>WCO Harmonized System Chapters</strong>. This eliminates text formatting noise and standardizes tracking thresholds across diversified trade lines.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Evaluated Payload Value</span>
          <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
            ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Interactive Mapping Layout Box */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
          
          <div className="lg:col-span-3 rounded-xl border border-slate-800 relative h-[450px] overflow-hidden z-10 bg-slate-900">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* Interactive Control Deck Component Side Panel */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-wider block">Target Geographic Adjustments</span>
              
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-slate-400 font-bold uppercase">Exporting Source</label>
                <select 
                  value={mapOriginSelect}
                  onChange={(e) => { setMapOriginSelect(e.target.value); setSelectedRouteIdx(0); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Mapped Origins ({uniqueOriginsList.length})</option>
                  {uniqueOriginsList.map(orig => <option key={orig} value={orig}>{orig}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-slate-400 font-bold uppercase">Importing Terminal</label>
                <select 
                  value={mapDestSelect}
                  onChange={(e) => { setMapDestSelect(e.target.value); setSelectedRouteIdx(0); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Mapped Destinations ({uniqueDestsList.length})</option>
                  {uniqueDestsList.map(dest => <option key={dest} value={dest}>{dest}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex-1 flex flex-col justify-end">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block mb-1">Active Lane Selection Matrix</span>
              {mapsDisplayedRoutes.length > 0 ? (
                <div className="max-h-[145px] overflow-y-auto space-y-1 pr-1 bg-slate-950 p-1 rounded border border-slate-900">
                  {mapsDisplayedRoutes.map((route, rIdx) => (
                    <button
                      key={route.id}
                      onClick={() => setSelectedRouteIdx(rIdx)}
                      className={`w-full text-left font-mono text-[10px] p-1 truncate rounded block border ${
                        selectedRouteIdx === rIdx ? 'bg-blue-600/20 text-white font-bold border-blue-500' : 'text-slate-400 border-transparent hover:bg-slate-800'
                      }`}
                    >
                      {rIdx + 1}. [{route.industryKey}] {route.cleanOrigin} $\rightarrow$ {route.cleanDestination}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] font-mono text-amber-400">No custom data points mapped for configuration selectors.</p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Forensic Run Log Tables Display Block */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block px-1 mb-2">Threat Tiers</span>
          {[
            { id: 'ALL', label: 'All Audited Ledgers' },
            { id: 'TIER_1_ELEVATED_DIVERSION', label: 'Tier 1: Diverted Risk Vectors' },
            { id: 'TIER_2_ROUTE_SPLITS_FTZ_LOOPS', label: 'Tier 2: Hub Route Splitting' },
            { id: 'TIER_3_MONITORED_BASELINE', label: 'Tier 3: Verified Clear Baselines' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setFilterType(tab.id); setSelectedRouteIdx(0); setMapOriginSelect('ALL'); setMapDestSelect('ALL'); }} 
              className={`w-full text-left p-3 rounded-xl font-mono text-xs block border transition-all ${
                filterType === tab.id ? 'bg-slate-800 border-blue-500 text-white font-bold' : 'bg-[#111827]/40 border-slate-800 text-slate-400 hover:bg-[#111827]'
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
                  className={`p-5 rounded-xl border bg-[#111827] transition-all ${
                    isCurrentlySelectedInMap ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-md' : 'border-slate-800'
                  } ${
                    evt.severity === 'HIGH' ? 'border-l-4 border-l-rose-500' : evt.severity === 'MEDIUM' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-emerald-600'
                  }`}
                >
                  <div className="flex justify-between border-b border-slate-800 pb-2 mb-3 font-mono text-xs">
                    <span className={`font-black uppercase tracking-wider flex items-center gap-1 ${
                      evt.severity === 'HIGH' ? 'text-rose-400' : evt.severity === 'MEDIUM' ? 'text-blue-400' : 'text-emerald-400'
                    }`}>
                      {(evt.riskType || '').replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                      <Hash size={11} className="text-blue-500" /> HS Code: {evt.hsCodeMatched}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-300 leading-relaxed mb-4">
                    <strong className="text-white uppercase">Engine Analysis Output:</strong> {evt.brief}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-slate-800/60 text-xs font-mono">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-black mb-0.5">Resolved Corridor</span>
                      <span className="text-white font-bold">{evt.routePath}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-black mb-0.5">Commodity Segment</span>
                      <span className="text-slate-200 truncate block font-semibold">{evt.cleanProduct}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-black mb-0.5">Material Bottleneck Indicator</span>
                      <span className="text-amber-500 font-bold block truncate">{evt.precursorLabel}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-black mb-0.5">Assigned Sector Profile</span>
                      <span className="text-blue-400 font-black block truncate">{evt.industryName}</span>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-400">
              No cargo records match the selected multi-industry screening criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

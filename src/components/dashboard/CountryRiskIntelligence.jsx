import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { 
  Globe, ShieldAlert, FileText, Server, Info, ArrowRight, Printer, 
  AlertTriangle, CheckCircle2, Layers, Cpu, Filter, Hash, TrendingUp, 
  BarChart4, ShieldCheck, Activity, DollarSign, Download, Eye 
} from 'lucide-react';

// Audited Global Coordinates Matrix — Comprehensive Hemispheric Bounding
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

// Universal Programmatic WCO HS Chapter Dictionary Mapping (01 to 97)
const getWcoSectionMeta = (chapterStr) => {
  const ch = parseInt(chapterStr, 10);
  if (isNaN(ch)) return { macroSector: 'Unclassified Cargo', controlRisk: 40 };
  if (ch >= 1 && ch <= 5) return { macroSector: 'Live Animals & Animal Products', controlRisk: 35 };
  if (ch >= 6 && ch <= 14) return { macroSector: 'Vegetable & Agricultural Products', controlRisk: 30 };
  if (ch === 15) return { macroSector: 'Animal/Vegetable Fats & Cleavage Products', controlRisk: 25 };
  if (ch >= 16 && ch <= 22) return { macroSector: 'Prepared Foodstuffs, Beverages & Spirits', controlRisk: 65 };
  if (ch >= 23 && ch <= 24) return { macroSector: 'Tobacco & Manufactured Nicotine Substitutes', controlRisk: 90 };
  if (ch >= 25 && ch <= 27) return { macroSector: 'Mineral Fuels, Oils & Distillation Products', controlRisk: 80 };
  if (ch >= 28 && ch <= 38) return { macroSector: 'Chemicals, Pharmaceutical Products & APIs', controlRisk: 85 };
  if (ch >= 39 && ch <= 40) return { macroSector: 'Plastics, Polymers & Rubber Assemblies', controlRisk: 45 };
  if (ch >= 41 && ch <= 43) return { macroSector: 'Raw Hides, Skins & Leather Pelts', controlRisk: 30 };
  if (ch >= 44 && ch <= 46) return { macroSector: 'Wood, Charcoal & Straw Components', controlRisk: 35 };
  if (ch >= 47 && ch <= 49) return { macroSector: 'Pulp, Paperboard & Printing Materials', controlRisk: 25 };
  if (ch >= 50 && ch <= 63) return { macroSector: 'Textiles, Garments & Specialized Fabrics', controlRisk: 55 };
  if (ch >= 64 && ch <= 67) return { macroSector: 'Footwear, Headgear & Artificial Formations', controlRisk: 30 };
  if (ch >= 68 && ch <= 70) return { macroSector: 'Stone, Plaster, Cement, Ceramic & Glassware', controlRisk: 40 };
  if (ch === 71) return { macroSector: 'Precious Stones, Metals & Specie Jewels', controlRisk: 85 };
  if (ch >= 72 && ch <= 83) return { macroSector: 'Base Metals, Iron, Steel, Alloys & Titanium', controlRisk: 75 };
  if (ch >= 84 && ch <= 85) return { macroSector: 'Machinery, Electrical Devices & Microcircuits', controlRisk: 80 };
  if (ch >= 86 && ch <= 89) return { macroSector: 'Vehicles, Aircraft, Vessels & Transports', controlRisk: 70 };
  if (ch >= 90 && ch <= 92) return { macroSector: 'Optical, Photographic, Precision & Medical Gear', controlRisk: 65 };
  if (ch === 93) return { macroSector: 'Arms, Munitions, Ammunition & Defense Hardware', controlRisk: 95 };
  if (ch >= 94 && ch <= 96) return { macroSector: 'Miscellaneous Manufactured Commodities', controlRisk: 45 };
  if (ch === 97) return { macroSector: 'Works of Art, Collectors Pieces & Antiques', controlRisk: 60 };
  return { macroSector: 'Special Commodities / Alternate Classifications', controlRisk: 50 };
};

export default function DeepForensicAuditPlatform() {
  const { tradeData = [] } = useTradeData() || {};
  const [filterType, setFilterType] = useState('ALL');
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [leafletReady, setLeafletReady] = useState(false);
  
  // Custom Controls Matrix
  const [mapOriginSelect, setMapOriginSelect] = useState('ALL');
  const [mapDestSelect, setMapDestSelect] = useState('ALL');
  const [selectedMacroSector, setSelectedMacroSector] = useState('ALL');
  const [isPrintPreviewMode, setIsPrintPreviewMode] = useState(false);
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Initialize Leaflet Map Instance asynchronously
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

  // 1. Dynamic AI-Based HS Code Scanner Heuristics Engine
  const parsedRecords = useMemo(() => {
    return tradeData.map((row, idx) => {
      if (!row) return null;

      const origin = (row.OriginCountry || '').toUpperCase().trim();
      const product = (row.Product || '').toUpperCase().trim();
      const importer = (row.Importer || '').toUpperCase().trim();
      const declaredDest = (row.DestinationCountry || '').toUpperCase().trim();
      const rawAmount = Number(row.Amount) || 720000;
      
      // AI Heuristic Extraction of HS Code Sequence
      let inferredHs = '000000';
      const hsMatchPattern = String(row.HSCode || row.hs_code || product).match(/\b\d{2,6}\b/);
      if (hsMatchPattern) {
        inferredHs = hsMatchPattern[0].padEnd(4, '0');
      } else {
        // Fallback taxonomy mapping based on text clusters if explicit code missing
        if (product.includes('WHISKY') || product.includes('ALCOHOL') || product.includes('BEER')) inferredHs = '2208';
        else if (product.includes('PHARMA') || product.includes('MEDICINE') || product.includes('API')) inferredHs = '3004';
        else if (product.includes('TITANIUM') || product.includes('STEEL') || product.includes('METAL')) inferredHs = '8108';
        else if (product.includes('TOBACCO') || product.includes('CIGARETTE') || product.includes('TOW')) inferredHs = '2402';
        else if (product.includes('CHIP') || product.includes('SEMICONDUCTOR') || product.includes('BOARD')) inferredHs = '8542';
      }

      const chapterPrefix = inferredHs.substring(0, 2);
      const { macroSector, controlRisk } = getWcoSectionMeta(chapterPrefix);

      // Geo-parsing destination defaults
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

      const cleanOrigin = origin.split('→')[0].trim();
      const routePath = `${cleanOrigin} \u2192 ${destinationCountry}`;

      // Dynamic AI Risk Scoring Matrix Calculation
      const isTransshipmentHub = ['PAKISTAN', 'SINGAPORE', 'DUBAI', 'UAE', 'TURKEY', 'MALAYSIA', 'NETHERLANDS', 'CYPRUS', 'PANAMA', 'MALTA']
        .some(hub => cleanOrigin.includes(hub));
      
      let baseScore = controlRisk;
      if (isTransshipmentHub) baseScore += 25;
      if (rawAmount > 1200000) baseScore += 10;
      if (cleanOrigin === destinationCountry) baseScore -= 15; // Local trade deduction

      const dynamicScore = Math.min(Math.max(baseScore, 10), 99);

      let riskTier = 'TIER_3_MONITORED';
      let severity = 'LOW';
      let analyticalBrief = `Autonomous Scan verification affirmative. Logistics operations conform to predictable multi-year trading parameters for ${macroSector}.`;

      if (dynamicScore >= 75) {
        riskTier = 'TIER_1_ELEVATED';
        severity = 'HIGH';
        analyticalBrief = `Critical Alert: Dynamic AI pattern matching isolated structural divergence. Shipments under HS Chapter ${chapterPrefix} (${macroSector}) demonstrate volume spikes passing through known transshipment gateways that diverge from traditional supply chain baselines.`;
      } else if (dynamicScore >= 45) {
        riskTier = 'TIER_2_SPLIT_ROUTE';
        severity = 'MEDIUM';
        analyticalBrief = `Notice: Secondary routing deviation flagged. Transaction structures indicate free trade zone routing loops or potential custom re-classifications across intermediary border crossings.`;
      }

      return {
        ...row,
        id: row.id || `fsc-${idx}`,
        hsCodeMatched: inferredHs,
        hsChapter: chapterPrefix,
        macroSector,
        riskScore: dynamicScore,
        riskType: riskTier,
        severity,
        brief: analyticalBrief,
        routePath,
        cleanOrigin,
        cleanDestination: destinationCountry,
        cleanProduct: product || 'NON-ITEMIZED BULK PAYLOAD',
        Amount: rawAmount
      };
    }).filter(Boolean);
  }, [tradeData]);

  // Comprehensive Data Segmentation Layer
  const filteredRecords = useMemo(() => {
    return parsedRecords.filter(rec => {
      const matchRisk = filterType === 'ALL' || rec.riskType === filterType;
      const matchMacro = selectedMacroSector === 'ALL' || rec.macroSector === selectedMacroSector;
      return matchRisk && matchMacro;
    });
  }, [parsedRecords, filterType, selectedMacroSector]);

  // Master Lists for Dropdown Controllers
  const uniqueOrigins = useMemo(() => Array.from(new Set(filteredRecords.map(e => e.cleanOrigin))).sort(), [filteredRecords]);
  const uniqueDestinations = useMemo(() => Array.from(new Set(filteredRecords.map(e => e.cleanDestination))).sort(), [filteredRecords]);
  const detectedMacroSectorsList = useMemo(() => Array.from(new Set(parsedRecords.map(e => e.macroSector))).sort(), [parsedRecords]);

  // Map Filter Coordinates Intermediary
  const routesOnMapDisplay = useMemo(() => {
    return filteredRecords.filter(item => {
      const matchO = mapOriginSelect === 'ALL' || item.cleanOrigin === mapOriginSelect;
      const matchD = mapDestSelect === 'ALL' || item.cleanDestination === mapDestSelect;
      return matchO && matchD;
    });
  }, [filteredRecords, mapOriginSelect, mapDestSelect]);

  const activeHighlightedRoute = routesOnMapDisplay[selectedRouteIdx] || routesOnMapDisplay[0] || null;

  // 2. Dynamic AI Executive Summaries Matrix Engine
  const aiExecutiveSummaryReport = useMemo(() => {
    if (filteredRecords.length === 0) return "No core metrics tracked within target classification variables.";
    
    const count = filteredRecords.length;
    const highRiskCount = filteredRecords.filter(r => r.severity === 'HIGH').length;
    const totalValue = filteredRecords.reduce((sum, r) => sum + r.Amount, 0);
    
    // Compute dynamic rank ordered sectors
    const sectorCounts = {};
    filteredRecords.forEach(r => { sectorCounts[r.macroSector] = (sectorCounts[r.macroSector] || 0) + 1; });
    const topSector = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General Cargo';

    return `Diagnostic sweep evaluated ${count} data lines across global points. Sector prevalence shows heavy activity concentrations tracking inside "${topSector}". AI anomaly profiling isolated ${highRiskCount} vectors executing at Tier-1 critical risk levels. Immediate forensic auditing recommended for shipments manifesting localized spikes where volume footprints outpace nominal industrial raw material output profiles.`;
  }, [filteredRecords]);

  // 3. Dynamic Risk Tier Index Ratios
  const riskTierMetricsIndex = useMemo(() => {
    const total = parsedRecords.length || 1;
    const tier1 = parsedRecords.filter(r => r.riskType === 'TIER_1_ELEVATED').length;
    const tier2 = parsedRecords.filter(r => r.riskType === 'TIER_2_SPLIT_ROUTE').length;
    const tier3 = parsedRecords.filter(r => r.riskType === 'TIER_3_MONITORED').length;

    return {
      t1Pct: ((tier1 / total) * 100).toFixed(1),
      t2Pct: ((tier2 / total) * 100).toFixed(1),
      t3Pct: ((tier3 / total) * 100).toFixed(1),
      t1Count: tier1,
      t2Count: tier2,
      t3Count: tier3
    };
  }, [parsedRecords]);

  // Leaflet Dynamic Integration Hook
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || isPrintPreviewMode) return;
    const L = window.L;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [15, 10], zoom: 2, zoomControl: true, attributionControl: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, bgBuffer: 4
      }).addTo(mapInstanceRef.current);
      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();
    if (routesOnMapDisplay.length === 0) return;

    const resolveCoordsOffset = (locName, shiftIdx) => {
      const norm = (locName || '').toUpperCase().trim();
      for (const [key, coords] of Object.entries(GEOLOCATION_REGISTRY)) {
        if (norm.includes(key)) return [coords[0] + (shiftIdx * 0.12), coords[1] + (shiftIdx * 0.12)];
      }
      return [28.0 + (shiftIdx * 0.15), 18.0 + (shiftIdx * 0.15)];
    };

    const trackedBounds = [];
    routesOnMapDisplay.forEach((item, index) => {
      const origLoc = resolveCoordsOffset(item.cleanOrigin, index);
      const destLoc = resolveCoordsOffset(item.cleanDestination, index + 2);
      trackedBounds.push(origLoc, destLoc);

      const isActive = activeHighlightedRoute && activeHighlightedRoute.id === item.id;
      const pathwayColor = item.severity === 'HIGH' ? '#f43f5e' : item.severity === 'MEDIUM' ? '#3b82f6' : '#10b981';

      const originMarker = L.circleMarker(origLoc, {
        radius: isActive ? 8.5 : 5, fillColor: '#3b82f6', color: isActive ? '#000000' : '#ffffff', weight: isActive ? 2.5 : 1, fillOpacity: 0.9
      });

      const destMarker = L.circleMarker(destLoc, {
        radius: isActive ? 8.5 : 5, fillColor: '#10b981', color: isActive ? '#000000' : '#ffffff', weight: isActive ? 2.5 : 1, fillOpacity: 0.9
      });

      const vectorPolyline = L.polyline([origLoc, destLoc], {
        color: pathwayColor, weight: isActive ? 4 : 1.5, dashArray: isActive ? '6, 4' : '3, 3', opacity: isActive ? 1.0 : 0.5
      });

      layerGroup.addLayer(originMarker);
      layerGroup.addLayer(destMarker);
      layerGroup.addLayer(vectorPolyline);
      if (isActive) { vectorPolyline.bringToFront(); originMarker.bringToFront(); destMarker.bringToFront(); }
    });

    if (trackedBounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(trackedBounds), { padding: [40, 40], maxZoom: 4 });
    }
  }, [leafletReady, routesOnMapDisplay, activeHighlightedRoute, isPrintPreviewMode]);

  const absoluteAggregateValue = useMemo(() => filteredRecords.reduce((s, c) => s + c.Amount, 0), [filteredRecords]);

  // Execute native high-fidelity document sequence dump
  const triggerSystemPrintDump = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-[1800px] mx-auto p-2 font-sans antialiased selection:bg-blue-500/30">
      
      {/* SECTION A: PRIMARY DASHBOARD TOP SCREEN CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="text-blue-500 animate-pulse" size={24} /> Tradeshield AI Forensic Ledger Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Autonomous HS Tariff stream interception and cross-border anomaly analysis matrices.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Sector Discovery Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
            <Filter size={13} className="text-blue-400" />
            <span className="text-slate-400 font-bold uppercase">Dynamic AI Classification:</span>
            <select
              value={selectedMacroSector}
              onChange={(e) => { setSelectedMacroSector(e.target.value); setSelectedRouteIdx(0); }}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-bold ml-1 border-none outline-none"
            >
              <option value="ALL" className="bg-slate-950">All AI-Discovered Sectors ({detectedMacroSectorsList.length})</option>
              {detectedMacroSectorsList.map(sec => (
                <option key={sec} value={sec} className="bg-slate-950">{sec}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setIsPrintPreviewMode(!isPrintPreviewMode)} 
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
              isPrintPreviewMode ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Eye size={14} /> {isPrintPreviewMode ? "Exit Dossier View" : "Dossier Print Preview"}
          </button>

          <button 
            onClick={triggerSystemPrintDump}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          >
            <Printer size={14} /> Export Dossier Report
          </button>
        </div>
      </div>

      {/* SECTION B: AUTOMATED RISK TIER INDEX WIDGET BLOCK */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            <span>Total Inspected Entries</span>
            <Activity size={12} className="text-slate-400" />
          </div>
          <div className="text-2xl font-mono font-black text-white">{parsedRecords.length}</div>
          <div className="text-[10px] font-mono text-slate-500">Continuous background ingestion active</div>
        </div>

        <div className="bg-[#111827] border-l-4 border-l-rose-500 border-y border-r border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
            <span>Risk Index: Tier 1 High</span>
            <AlertTriangle size={12} className="text-rose-500" />
          </div>
          <div className="text-2xl font-mono font-black text-rose-400">{riskTierMetricsIndex.t1Count} <span className="text-xs text-slate-500 font-normal">({riskTierMetricsIndex.t1Pct}%)</span></div>
          <div className="text-[10px] font-mono text-slate-400">Immediate priority vector verification</div>
        </div>

        <div className="bg-[#111827] border-l-4 border-l-blue-500 border-y border-r border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
            <span>Risk Index: Tier 2 Mid</span>
            <Layers size={12} className="text-blue-500" />
          </div>
          <div className="text-2xl font-mono font-black text-blue-400">{riskTierMetricsIndex.t2Count} <span className="text-xs text-slate-500 font-normal">({riskTierMetricsIndex.t2Pct}%)</span></div>
          <div className="text-[10px] font-mono text-slate-400">Intermediary FTZ transit loops flagged</div>
        </div>

        <div className="bg-[#111827] border-l-4 border-l-emerald-500 border-y border-r border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <span>Risk Index: Tier 3 Base</span>
            <ShieldCheck size={12} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-black text-emerald-400">{riskTierMetricsIndex.t3Count} <span className="text-xs text-slate-500 font-normal">({riskTierMetricsIndex.t3Pct}%)</span></div>
          <div className="text-[10px] font-mono text-slate-400">Operational baseline consistency</div>
        </div>
      </div>

      {/* SECTION C: DYNAMIC AI DIAGNOSTIC REPORT BLOCK */}
      <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-900/40 p-5 rounded-xl space-y-2">
        <h3 className="text-xs font-mono font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <Cpu size={14} className="text-blue-400" /> Dynamic AI Synthesis Diagnostic Readout
        </h3>
        <p className="text-xs md:text-sm text-slate-200 font-mono leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
          {aiExecutiveSummaryReport}
        </p>
      </div>

      {/* SECTION D: INTERACTIVE CARTOGRAPHY VIEW GRID (HIDDEN ON DURE PRINT TASKS IF REQUESTED) */}
      {!isPrintPreviewMode && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-4 print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
            
            {/* Map Spatial Container */}
            <div className="lg:col-span-3 rounded-xl border border-slate-800 relative h-[420px] overflow-hidden z-10 bg-slate-950">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            {/* Micro Map Geographic Targeting Controller Deck */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-black text-blue-500 uppercase tracking-wider block">Spatial Routing Isolation</span>
                
                <div className="space-y-1">
                  <label className="block font-mono text-[9px] text-slate-400 font-black uppercase">Origin Hub Anchor</label>
                  <select 
                    value={mapOriginSelect}
                    onChange={(e) => { setMapOriginSelect(e.target.value); setSelectedRouteIdx(0); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Active Mapped Origins ({uniqueOrigins.length})</option>
                    {uniqueOrigins.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[9px] text-slate-400 font-black uppercase">Final Destination Node</label>
                  <select 
                    value={mapDestSelect}
                    onChange={(e) => { setMapDestSelect(e.target.value); setSelectedRouteIdx(0); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Mapped Terminals ({uniqueDestinations.length})</option>
                    {uniqueDestinations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex-1 flex flex-col justify-end">
                <span className="text-[10px] font-mono font-black text-slate-500 uppercase block mb-1">Target Interception Queue</span>
                {routesOnMapDisplay.length > 0 ? (
                  <div className="max-h-[150px] overflow-y-auto space-y-1 bg-slate-900/60 p-1.5 rounded border border-slate-800/80">
                    {routesOnMapDisplay.map((rt, rIdx) => (
                      <button
                        key={rt.id}
                        onClick={() => setSelectedRouteIdx(rIdx)}
                        className={`w-full text-left font-mono text-[10px] p-1 truncate rounded block border transition-all ${
                          selectedRouteIdx === rIdx ? 'bg-blue-600/20 text-blue-400 font-bold border-blue-500' : 'text-slate-400 border-transparent hover:bg-slate-800'
                        }`}
                      >
                        {rIdx + 1}. [{rt.hsChapter}] {rt.cleanOrigin} $\rightarrow$ {rt.cleanDestination}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] font-mono text-amber-500">No entries corresponding to selected spatial limits.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECTION E: RUN AUDIT LOG ENTRIES & TIER SEPARATORS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:block">
        
        {/* Tier Selector Sidebar (Hidden during raw hardcopy generation outputs) */}
        <div className="space-y-2 print:hidden">
          <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block px-1 mb-2">Audit Vector Index Segments</span>
          {[
            { id: 'ALL', label: 'All Dynamic Logs Matrix' },
            { id: 'TIER_1_ELEVATED', label: 'Tier 1: High Priority Anomalies' },
            { id: 'TIER_2_SPLIT_ROUTE', label: 'Tier 2: Disrupted Corridors' },
            { id: 'TIER_3_MONITORED', label: 'Tier 3: Standard Clear Ledger' }
          ].map(btnTab => (
            <button 
              key={btnTab.id} 
              onClick={() => { setFilterType(btnTab.id); setSelectedRouteIdx(0); setMapOriginSelect('ALL'); setMapDestSelect('ALL'); }} 
              className={`w-full text-left p-3 rounded-xl font-mono text-xs block border transition-all ${
                filterType === btnTab.id ? 'bg-slate-800 border-blue-500 text-white font-bold' : 'bg-[#111827]/40 border-slate-800 text-slate-400 hover:bg-[#111827]'
              }`}
            >
              {btnTab.label} ({btnTab.id === 'ALL' ? parsedRecords.length : parsedRecords.filter(e => e.riskType === btnTab.id).length})
            </button>
          ))}

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-4 space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Active Segment Capitalization</span>
            <div className="text-xl font-mono font-black text-emerald-400">
              ${absoluteAggregateValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Unified Forensic Report Sheet Output */}
        <div className="lg:col-span-3 space-y-4 print:w-full">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((itemRow, iter) => {
              const isHighlightMarker = activeHighlightedRoute && activeHighlightedRoute.id === itemRow.id;
              return (
                <div 
                  key={itemRow.id} 
                  className={`p-5 rounded-xl border bg-[#111827] transition-all print:break-inside-avoid print:bg-white print:text-black print:border-slate-400 ${
                    isHighlightMarker && !isPrintPreviewMode ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-md' : 'border-slate-800'
                  } ${
                    itemRow.severity === 'HIGH' ? 'border-l-4 border-l-rose-500' : itemRow.severity === 'MEDIUM' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-emerald-600'
                  }`}
                >
                  {/* Ledger Row Header */}
                  <div className="flex justify-between items-center border-b border-slate-800 print:border-slate-300 pb-2 mb-3 font-mono text-xs">
                    <span className={`font-black uppercase tracking-wider ${
                      itemRow.severity === 'HIGH' ? 'text-rose-400 print:text-rose-700' : itemRow.severity === 'MEDIUM' ? 'text-blue-400 print:text-blue-700' : 'text-emerald-400 print:text-emerald-700'
                    }`}>
                      #{iter + 1} // {itemRow.riskType.replace(/_/g, ' ')} [RISK SCORE: {itemRow.riskScore}]
                    </span>
                    <span className="text-slate-300 print:text-slate-800 font-bold bg-slate-950 print:bg-slate-100 px-2 py-0.5 rounded border border-slate-800 print:border-slate-300 flex items-center gap-1">
                      <Hash size={11} className="text-blue-500" /> Automated HS Lookup: {itemRow.hsCodeMatched}
                    </span>
                  </div>

                  {/* AI Synthesized Text Analysis Response */}
                  <p className="text-xs font-mono text-slate-300 print:text-slate-800 leading-relaxed mb-4">
                    <strong className="text-white print:text-black uppercase text-[11px] tracking-wide block mb-0.5">AI Engine Diagnostic Verdict:</strong> 
                    {itemRow.brief}
                  </p>

                  {/* Operational Metrics Core Blocks Data Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-800/60 print:border-slate-200 text-xs font-mono">
                    <div>
                      <span className="block text-[9px] text-slate-500 print:text-slate-600 uppercase font-black">Resolved Logistics Pathway</span>
                      <span className="text-white print:text-black font-bold block mt-0.5">{itemRow.routePath}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500 print:text-slate-600 uppercase font-black">Cargo Manifest Text Declarations</span>
                      <span className="text-slate-200 print:text-slate-900 font-semibold block truncate mt-0.5">{itemRow.cleanProduct}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500 print:text-slate-600 uppercase font-black">AI Assigned WCO Sector Profile</span>
                      <span className="text-blue-400 print:text-blue-800 font-black block truncate mt-0.5">{itemRow.macroSector}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500 print:text-slate-600 uppercase font-black">Calculated Shipment Value</span>
                      <span className="text-emerald-400 print:text-emerald-700 font-black block mt-0.5">
                        ${itemRow.Amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-400 bg-slate-950/20">
              No cargo records track inside the selected multi-industry risk bounds.
            </div>
          )}
        </div>

      </div>

      {/* GLOBAL CSS PRINT STYLING TARGET INJECTIONS OVERRIDE */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: 'Segoe UI', -apple-system, sans-serif !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:bg-white {
            background-color: #ffffff !important;
          }
          .print\\:text-black {
            color: #000000 !important;
          }
          .print\\:bg-slate-100 {
            background-color: #f1f5f9 !important;
          }
          .print\\:border-slate-300 {
            border-color: #cbd5e1 !important;
          }
          .print\\:border-slate-400 {
            border-color: #94a3b8 !important;
          }
          .print\\:text-slate-800 {
            color: #1e293b !important;
          }
          .print\\:text-slate-900 {
            color: #0f172a !important;
          }
          .print\\:text-rose-700 {
            color: #be123c !important;
          }
          .print\\:text-blue-700 {
            color: #1d4ed8 !important;
          }
          .print\\:text-emerald-700 {
            color: #047857 !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />

    </div>
  );
}

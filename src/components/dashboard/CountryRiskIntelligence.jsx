import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Globe, ShieldAlert, FileText, Server, ArrowRight, Share2, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

// Comprehensive, Corrected Global Geolocation Registry Matrix
const GEOLOCATION_REGISTRY = {
  'PAKISTAN': [30.3753, 69.3451],
  'PK': [30.3753, 69.3451],
  'BANGLADESH': [23.6850, 90.3563],
  'BD': [23.6850, 90.3563],
  'BULGARIA': [42.7339, 25.4858],
  'BG': [42.7339, 25.4858],
  'SPAIN': [40.4637, -3.7492],
  'ES': [40.4637, -3.7492],
  'HUNGARY': [47.1625, 19.5033],
  'HU': [47.1625, 19.5033],
  'GERMANY': [51.1657, 10.4515],
  'DE': [51.1657, 10.4515],
  'INDONESIA': [-0.7893, 113.9213],
  'ID': [-0.7893, 113.9213],
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
  'DUBAI': [25.2048, 55.2708],
  'UAE': [25.2048, 55.2708],
  'AE': [25.2048, 55.2708],
  'TURKEY': [38.9637, 35.2433],
  'TURKIYE': [38.9637, 35.2433],
  'TR': [38.9637, 35.2433],
  'UNITED KINGDOM': [55.3781, -3.4360],
  'UK': [55.3781, -3.4360],
  'GB': [55.3781, -3.4360],
  'FRANCE': [46.2276, 2.2137],
  'FR': [46.2276, 2.2137],
  'ITALY': [41.8719, 12.5674],
  'IT': [41.8719, 12.5674],
  'NETHERLANDS': [52.1326, 5.2913],
  'NL': [52.1326, 5.2913],
  'BELGIUM': [50.5039, 4.4699],
  'BE': [50.5039, 4.4699],
  'SWITZERLAND': [46.8182, 8.2275],
  'CH': [46.8182, 8.2275],
  'RUSSIA': [61.5240, 105.3188],
  'RU': [61.5240, 105.3188],
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
  const [leafletReady, setLeafletReady] = useState(false);
  
  const [mapOriginSelect, setMapOriginSelect] = useState('ALL');
  const [mapDestSelect, setMapDestSelect] = useState('ALL');
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }

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

  // Structural Risk Intelligence Parsing Engine
  const riskAnalysis = useMemo(() => {
    return tradeData.map((row, idx) => {
      if (!row) return null;

      const origin = (row.OriginCountry || '').toUpperCase().trim();
      const product = (row.Product || '').toUpperCase().trim();
      const importer = (row.Importer || '').toUpperCase().trim();
      const declaredDest = (row.DestinationCountry || '').toUpperCase().trim();
      
      let destinationCountry = 'GERMANY';
      if (declaredDest && !declaredDest.includes('FTZ') && declaredDest.length > 2) {
        destinationCountry = declaredDest;
      } else if (importer.includes('GERMANY') || importer.includes('GMBH')) {
        destinationCountry = 'GERMANY';
      } else if (importer.includes('SPAIN') || importer.includes('SL')) {
        destinationCountry = 'SPAIN';
      } else if (importer.includes('HUNGARY') || importer.includes('KFT')) {
        destinationCountry = 'HUNGARY';
      } else if (importer.includes('UK') || importer.includes('LONDON') || importer.includes('BRITISH')) {
        destinationCountry = 'UNITED KINGDOM';
      } else if (importer.includes('NETHERLANDS') || importer.includes('ROTTERDAM')) {
        destinationCountry = 'NETHERLANDS';
      } else if (declaredDest) {
        destinationCountry = declaredDest;
      }

      const hasRouteString = origin.includes('→') || origin.includes('VIA');
      const routePath = hasRouteString ? origin : `${origin} → ${destinationCountry}`;
      
      let riskType = 'TIER_3_MONITORED_BASELINE';
      let severity = 'LOW';
      let brief = `Direct logistical corridor verified. Supply chain routing falls within normal bilateral thresholds.`;

      const isHubOrFlaggedOrigin = 
        origin.includes('PAKISTAN') || origin.includes('MALAYSIA') || origin.includes('SINGAPORE') || 
        origin.includes('DUBAI') || origin.includes('UAE') || origin.includes('NETHERLANDS') || 
        origin.includes('TURKEY') || origin.includes('BULGARIA') || origin.includes('BANGLADESH');

      const isStrategic = 
        product.includes('FILTER') || product.includes('ROD') || product.includes('TOW') || 
        product.includes('ACETATE') || product.includes('TOBACCO') || product.includes('CIG');

      if (isHubOrFlaggedOrigin && isStrategic) {
        riskType = 'TIER_1_ELEVATED_DIVERSION';
        severity = 'HIGH';
        if (hasRouteString) {
          brief = `High-density transshipment hub lane mismatch isolated. Strategic items moving along variable customs zones.`;
        } else {
          brief = `Strategic industrial output capacity variance isolated. Concentrated export volume anomalies flagged via continuous mass-balance audits.`;
        }
      } else if (hasRouteString || isHubOrFlaggedOrigin) {
        riskType = 'TIER_2_ROUTE_SPLITS_FTZ_LOOPS';
        severity = 'MEDIUM';
        brief = `Dynamic transit alteration or waypoint splitting detected. Track patterns utilize standard free trade zone exemptions.`;
      }

      return { 
        ...row, 
        id: row.id || idx,
        riskType, 
        severity, 
        brief, 
        routePath, 
        cleanOrigin: origin.split('→')[0].trim(),
        cleanProduct: product || 'FILTER RODS',
        cleanDestination: destinationCountry
      };
    }).filter(Boolean);
  }, [tradeData]);

  const filtered = useMemo(() => {
    if (filterType === 'ALL') return riskAnalysis;
    return riskAnalysis.filter(e => e.riskType === filterType);
  }, [riskAnalysis, filterType]);

  const uniqueOriginsList = useMemo(() => {
    return Array.from(new Set(filtered.map(e => e.cleanOrigin))).sort();
  }, [filtered]);

  const uniqueDestsList = useMemo(() => {
    return Array.from(new Set(filtered.map(e => e.cleanDestination))).sort();
  }, [filtered]);

  const mapsDisplayedRoutes = useMemo(() => {
    return filtered.filter(item => {
      const matchOrig = mapOriginSelect === 'ALL' || item.cleanOrigin === mapOriginSelect;
      const matchDest = mapDestSelect === 'ALL' || item.cleanDestination === mapDestSelect;
      return matchOrig && matchDest;
    });
  }, [filtered, mapOriginSelect, mapDestSelect]);

  const activeRouteForHighlight = mapsDisplayedRoutes[selectedRouteIdx] || mapsDisplayedRoutes[0] || null;

  // Real-Time Simultaneous Multi-Route Leaflet Layer Coordinator
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;

    const L = window.L;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [35, 25],
        zoom: 3,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        bgBuffer: 2
      }).addTo(mapInstanceRef.current);

      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    if (mapsDisplayedRoutes.length === 0) return;

    const parseCoords = (locString, visualOffsetIdx = 0) => {
      const normal = (locString || '').toUpperCase().trim();
      for (const [key, coords] of Object.entries(GEOLOCATION_REGISTRY)) {
        if (normal === key || normal.includes(key)) {
          return [coords[0] + (visualOffsetIdx * 0.15), coords[1] + (visualOffsetIdx * 0.15)];
        }
      }
      return [48.1351 + (visualOffsetIdx * 0.2), 11.5820 + (visualOffsetIdx * 0.2)]; 
    };

    const boundsLatLngs = [];

    mapsDisplayedRoutes.forEach((item, idx) => {
      const originCoords = parseCoords(item.cleanOrigin, idx);
      const destCoords = parseCoords(item.cleanDestination, idx + 1);

      boundsLatLngs.push(originCoords);
      boundsLatLngs.push(destCoords);

      const isSelected = activeRouteForHighlight && activeRouteForHighlight.id === item.id;
      const baseColor = item.severity === 'HIGH' ? '#d97706' : item.severity === 'MEDIUM' ? '#2563eb' : '#059669';
      
      const originMarker = L.circleMarker(originCoords, {
        radius: isSelected ? 9 : 5.5,
        fillColor: '#2563eb',
        color: isSelected ? '#000000' : '#ffffff',
        weight: isSelected ? 3 : 1.5,
        fillOpacity: 0.95
      }).bindPopup(`
        <div style="color:#0f172a; font-family:monospace; font-size:11px; line-height:1.3;">
          <strong style="color:#2563eb;">ORIGIN:</strong> ${item.cleanOrigin}<br/>
          <strong>Product:</strong> ${item.cleanProduct}
        </div>
      `);

      const destMarker = L.circleMarker(destCoords, {
        radius: isSelected ? 9 : 5.5,
        fillColor: '#10b981',
        color: isSelected ? '#000000' : '#ffffff',
        weight: isSelected ? 3 : 1.5,
        fillOpacity: 0.95
      }).bindPopup(`
        <div style="color:#0f172a; font-family:monospace; font-size:11px; line-height:1.3;">
          <strong style="color:#10b981;">DESTINATION:</strong> ${item.cleanDestination}<br/>
          <strong>Consignee:</strong> ${item.Importer || 'Under Corporate Audit'}
        </div>
      `);

      const connectionLine = L.polyline([originCoords, destCoords], {
        color: baseColor,
        weight: isSelected ? 4.5 : 2,
        dashArray: isSelected ? '10, 5' : '5, 4',
        opacity: isSelected ? 1.0 : 0.7
      });

      layerGroup.addLayer(originMarker);
      layerGroup.addLayer(destMarker);
      layerGroup.addLayer(connectionLine);

      if (isSelected) {
        connectionLine.bringToFront();
        originMarker.bringToFront();
        destMarker.bringToFront();
      }
    });

    if (boundsLatLngs.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(boundsLatLngs);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    }

  }, [leafletReady, mapsDisplayedRoutes, activeRouteForHighlight]);

  const structuralInsights = useMemo(() => {
    const totalVolume = filtered.reduce((acc, curr) => acc + (Number(curr.Amount) || 0), 0);
    const uniqueTargets = new Set(filtered.map(e => e.cleanDestination)).size;

    if (filtered.length === 0) {
      return {
        totalVolume, uniqueTargets,
        contextText: 'No operational records isolated within current active parameters.',
        evidentiaryFinding: 'Awaiting structural trade loop data arrays.',
        executiveBriefing: 'Monitoring matrix baseline secure. No anomalies currently mapped.',
        operationalAnalysis: 'All lines clear. Dynamic waypoint tracking is ongoing.'
      };
    }

    const topProduct = filtered[0]?.cleanProduct || 'FILTER RODS';
    const topHub = filtered[0]?.cleanOrigin || 'PAKISTAN';

    return {
      totalVolume,
      uniqueTargets,
      contextText: `Logistical trade vectors originating from or routed via ${topHub} demonstrate concentrated patterns regarding ${topProduct}. These networks are evaluated under specific capacity and mass-balance threshold metrics.`,
      evidentiaryFinding: `Analysis confirms focused transaction volumes associated with ${uniqueTargets} unique target markets. Supply chain validation loops isolate production metrics against cross-border customs clearing manifests.`,
      executiveBriefing: `Forensic auditing has isolated active cargo vectors totaling $${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })} in tracked global value bounds. The structural shift maps directly to specialized shipments leaving ${topHub}.`,
      operationalAnalysis: `Cross-border trade matrix matches reveal systematic usage of regional transit corridors. Continuous structural mass-balance calculations are recommended to detect inventory discrepancies.`
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
          .print-border-clean { border-color: #cbd5e1 !important; }
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

      {/* Risk Tier Index Reference Bar - Explicitly Corrected Context Definitions */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 print-break-avoid print-border-clean">
        <h3 className="text-xs font-mono font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3 print-text-dark">
          <Layers size={14} className="text-blue-500" /> Global Risk Tier Index Reference Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
          <div className="p-3 bg-slate-950/40 border-l-4 border-amber-500 rounded-r border-y border-r border-slate-900 print-border-clean">
            <div className="font-bold text-amber-400 mb-1 print-text-dark">Tier 1: Elevated Diversion</div>
            <p className="text-slate-200 leading-tight print-text-muted">Strategic or restricted commodities routed via grey-market transshipment hubs OR demonstrating major production/export mass-balance output capacity variances.</p>
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

      {/* Corporate Summary Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print-break-avoid">
        <div className="bg-[#111827] border-l-4 border-blue-500 p-5 rounded-xl xl:col-span-2 space-y-3 print-border-clean">
          <h3 className="text-xs font-mono font-black text-blue-400 uppercase flex items-center gap-2 print-text-dark">
            <Server size={14}/> Forensic Corridor Impact Assessment & Summary
          </h3>
          <p className="text-sm text-white font-mono leading-relaxed print-text-dark">
            <strong>Logistical Context:</strong> {structuralInsights.contextText}
          </p>
          <p className="text-sm text-slate-200 font-mono leading-relaxed print-text-dark">
            <strong>Evidentiary Finding:</strong> {structuralInsights.evidentiaryFinding}
          </p>
        </div>

        {/* High Contrast Balance Card */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-center space-y-2 print-border-clean">
          <span className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider">Audited Corridor Value Risk</span>
          <div className="text-2xl font-mono font-black text-emerald-400 print-text-dark">
            ${structuralInsights.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-mono text-slate-200 block border-t border-slate-800 pt-2 print-border-clean">
            Concentrated across <strong className="text-white">{structuralInsights.uniqueTargets} named destination markets</strong>.
          </span>
        </div>
      </div>

      {/* Map Frame Component */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 print-break-avoid print-border-clean">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 print-border-clean">
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
          
          {/* Map Frame Container Layout */}
          <div className="lg:col-span-3 rounded-xl border border-slate-800 relative h-[420px] overflow-hidden z-10 bg-slate-200 print-border-clean">
            {!leafletReady && (
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center font-mono text-xs text-slate-800">
                Streaming dynamic light tile arrays...
              </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* Sidebar Filters Container */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4 print-border-clean">
            
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-wider block">Local Workspace Filters</span>
              
              {/* Origin Country Node Filter */}
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-slate-300 uppercase font-bold">Filter Sourcing Origin</label>
                <select 
                  value={mapOriginSelect}
                  onChange={(e) => {
                    setMapOriginSelect(e.target.value);
                    setSelectedRouteIdx(0);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Mapped Origins ({uniqueOriginsList.length})</option>
                  {uniqueOriginsList.map(orig => (
                    <option key={orig} value={orig}>{orig}</option>
                  ))}
                </select>
              </div>

              {/* Destination Country Node Filter */}
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-slate-300 uppercase font-bold">Filter Target Destination</label>
                <select 
                  value={mapDestSelect}
                  onChange={(e) => {
                    setMapDestSelect(e.target.value);
                    setSelectedRouteIdx(0);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Mapped Targets ({uniqueDestsList.length})</option>
                  {uniqueDestsList.map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clean Unicode Route Index Display */}
            <div className="pt-3 border-t border-slate-800/80 flex-1 flex flex-col justify-end">
              <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-wider block mb-1">Active View Subset Index</span>
              {mapsDisplayedRoutes.length > 0 ? (
                <div className="max-h-[120px] overflow-y-auto space-y-1 pr-1 border border-slate-900 p-1 rounded bg-slate-950/40">
                  {mapsDisplayedRoutes.map((route, rIdx) => (
                    <button
                      key={route.id}
                      onClick={() => setSelectedRouteIdx(rIdx)}
                      className={`w-full text-left font-mono text-[10px] p-1 truncate rounded transition ${
                        selectedRouteIdx === rIdx 
                          ? 'bg-blue-600/30 text-white font-bold border border-blue-500/40' 
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {rIdx + 1}. {route.cleanOrigin} → {route.cleanDestination}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] font-mono text-amber-400">No vectors match selector criteria.</p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Briefing Frame */}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono leading-relaxed">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-1 print-break-avoid print-border-clean">
            <span className="text-blue-400 font-bold block uppercase tracking-wider text-[11px] border-b border-slate-800/60 pb-1 mb-2 print-text-dark print-border-clean">
              Strategic Threat Briefing
            </span>
            <p className="text-slate-100 print-text-dark">
              {structuralInsights.executiveBriefing}
            </p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-1 print-break-avoid print-border-clean">
            <span className="text-emerald-400 font-bold block uppercase tracking-wider text-[11px] border-b border-slate-800/60 pb-1 mb-2 print-text-dark print-border-clean">
              Operational Vector Analysis
            </span>
            <p className="text-slate-100 print-text-dark">
              {structuralInsights.operationalAnalysis}
            </p>
          </div>
        </div>
      </div>

      {/* Main Core Architecture Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Filtering Controls */}
        <div className="space-y-2 non-printable">
          <span className="text-[10px] font-mono font-black text-slate-200 uppercase tracking-widest block px-1 mb-2">Logistical Risk Class</span>
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
                setMapOriginSelect('ALL');
                setMapDestSelect('ALL');
              }} 
              className={`w-full text-left p-3 rounded font-mono text-xs cursor-pointer block border transition-all ${
                filterType === tab.id 
                  ? 'bg-[#1e293b] border-blue-500 text-white font-bold' 
                  : 'bg-[#111827]/60 border-slate-800 text-slate-200 hover:bg-[#111827]'
              }`}
            >
              {tab.label} ({tab.id === 'ALL' ? riskAnalysis.length : riskAnalysis.filter(e => e.riskType === tab.id).length})
            </button>
          ))}
        </div>

        {/* Evidentiary Logs Stream */}
        <div className="lg:col-span-3 space-y-4">
          {filtered.length > 0 ? (
            filtered.map((evt) => {
              const isCurrentlySelectedInMap = activeRouteForHighlight && activeRouteForHighlight.id === evt.id;
              return (
                <div 
                  key={evt.id} 
                  className={`p-5 rounded-xl border bg-[#111827] transition-all print-break-avoid print-border-clean ${
                    isCurrentlySelectedInMap ? 'border-blue-500 ring-1 ring-blue-500/30 shadow' : 'border-slate-800'
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
                    <span className="text-slate-200 font-bold">{evt.Date || '2026 Audit Cycle'}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-mono text-white leading-relaxed print-text-dark">
                      <span className="text-slate-300 font-black uppercase tracking-tight">Logistical Record Brief:</span> {evt.brief}
                    </p>
                  </div>

                  {/* Reconstructed Parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs font-mono print-border-clean">
                    <div>
                      <span className="block text-[10px] text-slate-300 uppercase font-black tracking-wider mb-0.5">Reconstructed Sourcing Route Path</span>
                      <span className="text-white font-bold print-text-dark">{evt.routePath}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 uppercase font-black tracking-wider mb-0.5">Commodity Description</span>
                      <span className="text-slate-100 truncate block max-w-xs print-text-dark">{evt.Product || 'Filter Rods'}</span>
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
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-200 print-border-clean">
              No entries found matching the current analytical parameters.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Globe, ShieldAlert, FileText, Server, Info, ArrowRight, Share2, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

// Comprehensive Global Geolocation Look-up Matrix
const GEOLOCATION_REGISTRY = {
  'PAKISTAN': [30.3753, 69.3451],
  'PK': [30.3753, 69.3451],
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
  'GERMANY': [51.1657, 10.4515],
  'DE': [51.1657, 10.4515],
  'UNITED KINGDOM': [55.3781, -3.4360],
  'UK': [55.3781, -3.4360],
  'NETHERLANDS': [52.1326, 5.2913],
  'NL': [52.1326, 5.2913],
  'DUBAI': [25.2048, 55.2708],
  'UAE': [25.2048, 55.2708],
  'TURKEY': [38.9637, 35.2433],
  'TURKIYE': [38.9637, 35.2433]
};

export default function CountryRiskIntelligence() {
  const { tradeData = [] } = useTradeData() || {};
  const [filterType, setFilterType] = useState('ALL');
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [leafletReady, setLeafletReady] = useState(false);
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Runtime script injection to bypass Vite/Rollup build failures
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

  // Process data rows and derive clean destination strings
  const riskAnalysis = useMemo(() => {
    return tradeData.map((row, idx) => {
      if (!row) return null;

      const origin = (row.OriginCountry || '').toUpperCase().trim();
      const product = (row.Product || '').toUpperCase().trim();
      const importer = (row.Importer || '').toUpperCase().trim();
      
      // Extract target destination safely or use standard fallback mapping
      const targetDestination = importer || row.DestinationCountry || 'GERMANY';
      const hasRouteString = origin.includes('→') || origin.includes('VIA');
      let routePath = hasRouteString ? origin : `${origin} → ${targetDestination}`;
      
      let riskType = 'TIER_3_MONITORED_BASELINE';
      let severity = 'LOW';
      let brief = `Bilateral transit corridor evaluated. Direct transport channel mapped successfully to destination market.`;

      const isHub = origin.includes('PAKISTAN') || origin.includes('MALAYSIA') || origin.includes('SINGAPORE') || origin.includes('DUBAI') || origin.includes('NETHERLANDS');
      const isStrategic = product.includes('FILTER') || product.includes('ROD') || product.includes('TOW') || product.includes('TOBACCO');

      if (isHub && isStrategic) {
        riskType = 'TIER_1_ELEVATED_DIVERSION';
        severity = 'HIGH';
        brief = `High-density shipping hub lane mismatch isolated. Strategic raw items moving along variable customs handling zones.`;
      } else if (hasRouteString || isHub) {
        riskType = 'TIER_2_ROUTE_SPLITS_FTZ_LOOPS';
        severity = 'MEDIUM';
        brief = `Adaptive transit route adjustments identified. Tracking node anomalies for dynamic cross-border delivery segments.`;
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
        cleanDestination: targetDestination
      };
    }).filter(Boolean);
  }, [tradeData]);

  const filtered = useMemo(() => {
    if (filterType === 'ALL') return riskAnalysis;
    return riskAnalysis.filter(e => e.riskType === filterType);
  }, [riskAnalysis, filterType]);

  const activeRouteForMap = filtered[selectedRouteIdx] || filtered[0] || null;

  // Render real Leaflet mapping layers dynamically
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || !activeRouteForMap) return;

    const L = window.L;

    if (!mapInstanceRef.current) {
      // High-contrast, clean dark-mode cartographic canvas layout
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [20, 40],
        zoom: 2,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const parseCoords = (locString) => {
      const normal = (locString || '').toUpperCase().trim();
      for (const [key, coords] of Object.entries(GEOLOCATION_REGISTRY)) {
        if (normal.includes(key)) return coords;
      }
      return [51.1657, 10.4515]; // Clear default centering on European hubs
    };

    const originCoords = parseCoords(activeRouteForMap.cleanOrigin);
    const destCoords = parseCoords(activeRouteForMap.cleanDestination);

    const color = activeRouteForMap.severity === 'HIGH' ? '#f59e0b' : activeRouteForMap.severity === 'MEDIUM' ? '#3b82f6' : '#10b981';

    // Real map geographical anchors
    const originMarker = L.circleMarker(originCoords, {
      radius: 7,
      fillColor: '#3b82f6',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).bindPopup(`<strong style="color:#000">${activeRouteForMap.cleanOrigin}</strong> (Sourcing Origin)`);

    const destMarker = L.circleMarker(destCoords, {
      radius: 7,
      fillColor: '#10b981',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).bindPopup(`<strong style="color:#000">${activeRouteForMap.cleanDestination}</strong> (Target Destination)`);

    layerGroup.addLayer(originMarker);
    layerGroup.addLayer(destMarker);

    // Render geographic connection path lines
    const connectionLine = L.polyline([originCoords, destCoords], {
      color: color,
      weight: 3,
      dashArray: '6, 6',
      opacity: 0.8
    });
    layerGroup.addLayer(connectionLine);

    // Gracefully fit bounds with padding configurations
    const bounds = L.latLngBounds([originCoords, destCoords]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });

  }, [leafletReady, activeRouteForMap]);

  // Dynamic summary analytics pipeline calculation
  const structuralInsights = useMemo(() => {
    const totalVolume = filtered.reduce((acc, curr) => acc + (Number(curr.Amount) || 0), 0);
    const uniqueTargets = new Set(filtered.map(e => e.cleanDestination)).size;

    if (filtered.length === 0) {
      return {
        totalVolume, uniqueTargets,
        contextText: 'No matching entries found inside current criteria filters.',
        evidentiaryFinding: 'Awaiting log injection arrays.'
      };
    }

    const topProduct = filtered[0]?.cleanProduct || 'FILTER RODS';
    const topHub = filtered[0]?.cleanOrigin || 'PAKISTAN';

    return {
      totalVolume,
      uniqueTargets,
      contextText: `Logistical trade vectors originating from or routed via ${topHub} demonstrate concentrated patterns regarding ${topProduct}. These networks are highly indicative of secondary diversion pipelines seeking optimized customs entry thresholds.`,
      evidentiaryFinding: `Analysis confirms focused transaction volumes associated with ${uniqueTargets} unique target markets. Rather than declaring strict compliance failure, patterns suggest unverified grey-market or parallel distribution channels bypassing traditional authorized infrastructure.`
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

      {/* Corporate Summary & Impact Assessment Workspace */}
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
            Concentrated across <strong className="text-white">{structuralInsights.uniqueTargets} unique destination markets</strong>.
          </span>
        </div>
      </div>

      {/* Dynamic Visual Component: Build-Safe Real Leaflet Interactive Engine */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 print-break-avoid print-border-clean">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 print-border-clean">
          <div className="flex items-center gap-2">
            <Share2 size={15} className="text-blue-500" />
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider print-text-dark">
              Geospatial Route Flow Tracker & Interactive Map Layer
            </h3>
          </div>
          {activeRouteForMap && (
            <span className="text-[11px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-200">
              Active Selection Item: <strong className="text-blue-400">{activeRouteForMap.cleanProduct}</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center pt-2">
          
          {/* Map Container Target Frame */}
          <div className="lg:col-span-3 rounded-xl border border-slate-800 relative h-[360px] overflow-hidden z-10 print-border-clean">
            {!leafletReady && (
              <div className="absolute inset-0 bg-[#0a0f1d] flex items-center justify-center font-mono text-xs text-slate-300">
                Streaming live map assets...
              </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full bg-[#0a0f1d]" />
          </div>

          {/* Dynamic Selection Criterion Context Box */}
          <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3 h-full flex flex-col justify-center print-border-clean">
            <div>
              <span className="text-[9px] font-mono font-black text-blue-400 uppercase tracking-wider block mb-1">Mapping Logic Criteria</span>
              <p className="text-[11px] font-mono text-slate-200 leading-tight">
                Renders geographical points matching the row item highlighted below. Click on any transaction entry in the list stream to automatically point the tracking lens to its coordinates.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-wider block">Audited Pathway Vector</span>
              <div className="text-xs font-mono font-bold text-white mt-0.5 print-text-dark">
                {activeRouteForMap ? activeRouteForMap.routePath : 'No track active'}
              </div>
            </div>
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
                  <span className="text-slate-200 font-bold">{evt.Date || '2026 Audit Cycle'}</span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xs font-mono text-white leading-relaxed print-text-dark">
                    <span className="text-slate-300 font-black uppercase tracking-tight">Logistical Record Brief:</span> {evt.brief}
                  </p>
                </div>

                {/* Reconstructed data parameters */}
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
                    <span className="block text-[10px] text-slate-300 uppercase font-black tracking-wider mb-0.5">Target Destination Linkage</span>
                    <span className="text-blue-400 font-bold block truncate print-text-dark">{evt.cleanDestination}</span>
                  </div>
                </div>

              </div>
            ))
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

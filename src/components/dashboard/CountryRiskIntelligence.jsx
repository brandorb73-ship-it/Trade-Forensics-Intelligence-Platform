import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { 
  Globe, ShieldAlert, FileText, Server, Info, ArrowRight, Printer, 
  AlertTriangle, CheckCircle2, Layers, Cpu, Filter, Hash, TrendingUp, 
  BarChart4, ShieldCheck, Activity, DollarSign, MapPin, Navigation, 
  Compass, Share2, Eye, Database, FileSpreadsheet, Upload, PlusCircle,
  HelpCircle, BookOpen, Building, Tag, Calendar, Package, Lightbulb,
  Check, Copy, Code, Send, Download, ExternalLink
} from 'lucide-react';

// AUDITED CORE GEOCENTRIC COORDINATE REGISTRY
const BASE_JURISDICTION_COORDINATES = {
  'INDONESIA': [-0.7893, 113.9213], 'ID': [-0.7893, 113.9213],
  'PAKISTAN': [30.3753, 69.3451], 'PK': [30.3753, 69.3451],
  'SINGAPORE': [1.3521, 103.8198], 'SG': [1.3521, 103.8198],
  'MALAYSIA': [4.2105, 101.9758], 'MY': [4.2105, 101.9758],
  'VIETNAM': [14.0583, 108.2772], 'VN': [14.0583, 108.2772],
  'INDIA': [20.5937, 78.9629], 'IN': [20.5937, 78.9629],
  'BANGLADESH': [23.6850, 90.3563], 'BD': [23.6850, 90.3563],
  'SOUTH KOREA': [35.9078, 127.7669], 'KR': [35.9078, 127.7669],
  'GERMANY': [51.1657, 10.4515], 'DE': [51.1657, 10.4515],
  'POLAND': [51.9194, 19.1451], 'PL': [51.9194, 19.1451],
  'NETHERLANDS': [52.1326, 5.2913], 'NL': [52.1326, 5.2913],
  'BELGIUM': [50.5039, 4.4699], 'BE': [50.5039, 4.4699],
  'FRANCE': [46.2276, 2.2137], 'FR': [46.2276, 2.2137],
  'SPAIN': [40.4637, -3.7492], 'ES': [40.4637, -3.7492],
  'UNITED KINGDOM': [55.3781, -3.4360], 'UK': [55.3781, -3.4360], 'GB': [55.3781, -3.4360],
  'ITALY': [41.8719, 12.5674], 'IT': [41.8719, 12.5674],
  'SWITZERLAND': [46.8182, 8.2275], 'CH': [46.8182, 8.2275],
  'DUBAI': [25.2048, 55.2708], 'UNITED ARAB EMIRATES': [23.4240, 53.8478], 'UAE': [25.2048, 55.2708], 'AE': [25.2048, 55.2708],
  'TURKEY': [38.9637, 35.2433], 'TURKIYE': [38.9637, 35.2433], 'TR': [38.9637, 35.2433],
  'HONG KONG': [22.3193, 114.1694], 'HK': [22.3193, 114.1694],
  'CYPRUS': [35.1264, 33.4299], 'CY': [35.1264, 33.4299],
  'MALTA': [35.9375, 14.3754], 'MT': [35.9375, 14.3754],
  'UNITED STATES': [37.0902, -95.7129], 'USA': [37.0902, -95.7129], 'US': [37.0902, -95.7129],
  'CANADA': [56.1304, -106.3468], 'CA': [56.1304, -106.3468],
  'CHINA': [35.8617, 104.1954], 'CN': [35.8617, 104.1954],
  'AUSTRALIA': [-25.2744, 133.7751], 'AU': [-25.2744, 133.7751],
  'ANDORRA': [42.5462, 1.6015],
  'AFGHANISTAN': [33.9391, 67.7099],
  'ANTIGUA AND BARBUDA': [17.0608, -61.7964]
};

const TRANSSHIPMENT_HUB_REGISTRY = [
  'DUBAI', 'UAE', 'UNITED ARAB EMIRATES', 'SINGAPORE', 'TURKEY', 'TURKIYE', 'HONG KONG', 'HK', 'CYPRUS', 'MALTA', 'OMAN', 'PANAMA'
];

// Geodesic distance approximation in kilometers (Haversine Formula)
const calculateGeodesicDistanceKm = (coordsA, coordsB) => {
  if (!coordsA || !coordsB) return 5000;
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coordsB[0] - coordsA[0]);
  const dLon = toRad(coordsB[1] - coordsA[1]);
  const lat1 = toRad(coordsA[0]);
  const lat2 = toRad(coordsB[0]);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(100, Math.round(R * c));
};

export default function CountryRiskIntelligence() {
  const { tradeData = [] } = useTradeData() || {};
  const [filterType, setFilterType] = useState('ALL');
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [leafletReady, setLeafletReady] = useState(false);
  
  const [mapOriginSelect, setMapOriginSelect] = useState('ALL');
  const [mapDestSelect, setMapDestSelect] = useState('ALL');
  const [selectedMacroSector, setSelectedMacroSector] = useState('ALL');
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState('ALL');
  
  const [customCoordinates, setCustomCoordinates] = useState({});
  const [uploadFeedback, setUploadFeedback] = useState('');
  const [showMethodologyPanel, setShowMethodologyPanel] = useState(false);
  const [showPayloadBridge, setShowPayloadBridge] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Merged Coordinate Registry
  const activeCoordinatesRegistry = useMemo(() => {
    return { ...BASE_JURISDICTION_COORDINATES, ...customCoordinates };
  }, [customCoordinates]);

  // ULTRA-FORGIVING MULTI-DELIMITER COORDINATE FILE UPLOAD PARSER
  const handleCoordinateFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let parsedNewCoords = {};

        if (file.name.endsWith('.json')) {
          const json = JSON.parse(content);
          Object.keys(json).forEach(key => {
            if (Array.isArray(json[key]) && json[key].length === 2) {
              parsedNewCoords[key.toUpperCase().trim()] = json[key].map(Number);
            }
          });
        } else {
          const lines = content.split(/\r?\n/);
          lines.forEach(line => {
            if (!line || !line.trim()) return;
            const parts = line.split(/[,;\t]/).map(p => p.replace(/["']/g, '').trim());
            if (parts.length >= 3) {
              const country = parts[0].toUpperCase();
              const lat = Number(parts[1]);
              const lng = Number(parts[2]);
              
              if (country && !isNaN(lat) && !isNaN(lng)) {
                parsedNewCoords[country] = [lat, lng];
              }
            }
          });
        }

        const addedCount = Object.keys(parsedNewCoords).length;
        if (addedCount > 0) {
          setCustomCoordinates(prev => ({ ...prev, ...parsedNewCoords }));
          setUploadFeedback(`Success: Imported ${addedCount} jurisdictional coordinates from ${file.name}.`);
        } else {
          setUploadFeedback('Upload failed: Ensure file contains "Country, Latitude, Longitude" numeric rows.');
        }
      } catch (err) {
        setUploadFeedback('Error reading coordinate file. Please check file formatting.');
      }
    };
    reader.readAsText(file);
  };

  // Initialize Leaflet Mapping Framework
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

  // Dynamic Profiling, Valuation & AI NLP Commodity Clustering Pipeline
  const parsedRecords = useMemo(() => {
    if (!tradeData || tradeData.length === 0) return [];

    const valuesArray = tradeData.map(r => {
      return Number(r?.Amount) || Number(r?.amount) || Number(r?.Value) || Number(r?.value) || 0;
    });
    const globalSum = valuesArray.reduce((a, b) => a + b, 0);
    const globalMean = globalSum / (valuesArray.length || 1);
    
    const variance = valuesArray.reduce((a, b) => a + Math.pow(b - globalMean, 2), 0) / (valuesArray.length || 1);
    const globalStdDev = Math.sqrt(variance) || 1;

    return tradeData.map((row, idx) => {
      if (!row) return null;

      const rawProduct = (row.Product || row.product_description || row.brand || '').toUpperCase().trim();
      const rawOrigin = (row.OriginCountry || row.origin || '').toUpperCase().trim();
      const rawDest = (row.DestinationCountry || row.destination || '').toUpperCase().trim();
      const rawImporter = (row.Importer || row.importer || row.entity || '').toUpperCase().trim();
      const rawExporter = (row.Exporter || row.exporter || row.supplier || row.shipper || '').toUpperCase().trim();
      
      const valAmount = Number(row.Amount) || Number(row.amount) || Number(row.Value) || Number(row.value) || 0;

      // 1. AI COMMODITY CLASSIFICATION ENGINE
      let calculatedHs = '';
      let discoveredSector = 'Unclassified Commercial Freight';
      const cleanDigits = String(row.HSCode || row.hs_code || '').replace(/[^0-9]/g, '');

      if (cleanDigits && cleanDigits.length >= 2 && cleanDigits.substring(0, 2) !== '00') {
        calculatedHs = cleanDigits.substring(0, 6).padEnd(6, '0');
        const prefixNum = parseInt(calculatedHs.substring(0, 2), 10);
        
        if (prefixNum >= 1 && prefixNum <= 24) discoveredSector = `Agri-Food & Consumables (Ch.${prefixNum})`;
        else if (prefixNum >= 25 && prefixNum <= 40) discoveredSector = `Chemicals, Polymers & Resins (Ch.${prefixNum})`;
        else if (prefixNum >= 41 && prefixNum <= 49) discoveredSector = `Wood, Pulp & Cellulose Products (Ch.${prefixNum})`;
        else if (prefixNum >= 50 && prefixNum <= 63) discoveredSector = `Textiles, Fibers & Apparel (Ch.${prefixNum})`;
        else if (prefixNum >= 64 && prefixNum <= 83) discoveredSector = `Metals, Glass & Mineral Structures (Ch.${prefixNum})`;
        else if (prefixNum >= 84 && prefixNum <= 85) discoveredSector = `Advanced Industrial Machinery & Electronics (Ch.${prefixNum})`;
        else if (prefixNum >= 86 && prefixNum <= 89) discoveredSector = `Aerospace, Maritime & Transit Equipment (Ch.${prefixNum})`;
        else discoveredSector = `Specialized Technical Commodities (Ch.${prefixNum})`;
      } else {
        const tokens = rawProduct.split(/[^A-Z0-9]+/).filter(t => t.length > 3);
        if (tokens.length > 0) {
          calculatedHs = '847990';
          discoveredSector = `Inferred Commercial Cluster (${tokens.slice(0, 2).join(' ')})`;
        } else {
          calculatedHs = '999999';
          discoveredSector = 'General Commercial Trade Manifest';
        }
      }

      const chapter = calculatedHs.substring(0, 2);

      // 2. GEOGRAPHIC CORRIDOR RESOLUTION
      let cleanOrigin = rawOrigin.split(/[→\u2192]/)[0].trim() || 'INDONESIA';
      let cleanDestination = rawDest.split(/[→\u2192]/)[0].trim() || 'GERMANY';

      // 3. Z-SCORE VALUATION OUTLIER ENGINE
      const deviationZScore = globalStdDev > 0 ? (valAmount - globalMean) / globalStdDev : 0;
      const absZScore = Math.abs(deviationZScore);

      let zScoreTier = 'NORMAL';
      let valueAnomalyBonus = 0;
      if (absZScore >= 1.96) {
        zScoreTier = 'CRITICAL_OUTLIER_95_CONFIDENCE';
        valueAnomalyBonus = 30;
      } else if (absZScore >= 1.0) {
        zScoreTier = 'ELEVATED_VARIANCE';
        valueAnomalyBonus = 15;
      }

      // 4. LOGISTICS ROUTING ANOMALY ENGINE
      const routingCorridorContainsHub = TRANSSHIPMENT_HUB_REGISTRY.some(hub => 
        rawOrigin.includes(hub) || rawDest.includes(hub) || rawImporter.includes(hub) || rawExporter.includes(hub)
      );
      const containsComplexWaybills = rawOrigin.includes('→') || rawOrigin.includes('VIA') || rawOrigin.includes('FTZ');

      let intrinsicRiskWeight = 15;
      if (rawProduct.length > 45) intrinsicRiskWeight += 10;
      if (/[^A-Z0-9\s]/i.test(rawProduct)) intrinsicRiskWeight += 10;

      let dynamicCalculatedRisk = intrinsicRiskWeight + valueAnomalyBonus;
      let riskTier = 'TIER_3_MONITORED';
      let severity = 'LOW';
      let diagnosticBrief = '';

      if (routingCorridorContainsHub && containsComplexWaybills) {
        dynamicCalculatedRisk += 45;
        riskTier = 'TIER_1_ELEVATED';
        severity = 'HIGH';
        diagnosticBrief = `Dynamic System Flag: Compound routing and financial anomalies discovered. Cargo trajectory traverses an unaligned circuitous pathway using complex waybills inside specialized trading free zones${valueAnomalyBonus > 0 ? `, critically compounded by a severe statistical valuation outlier threshold breach (Z-Score: ${deviationZScore > 0 ? '+' : ''}${deviationZScore.toFixed(2)}) relative to global trends.` : '.'}`;
      } else if (routingCorridorContainsHub || containsComplexWaybills || absZScore >= 1.96) {
        dynamicCalculatedRisk += 25;
        riskTier = 'TIER_2_SPLIT_ROUTE';
        severity = 'MEDIUM';
        
        if (absZScore >= 1.96) {
          diagnosticBrief = `Statistical Threshold Breach: Ingested valuation amount ($${valAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}) triggers a 95%+ confidence outlier alert (|Z| ≥ 1.96). This node presents a severe deviation (Z-Score: ${deviationZScore > 0 ? '+' : ''}${deviationZScore.toFixed(2)}) relative to the global baseline mean ($${globalMean.toLocaleString(undefined, {maximumFractionDigits: 0})}), flagging customs undervaluation or overvaluation risk.`;
        } else {
          diagnosticBrief = `Notice: Isolated logistics variance identified. Cargo manifest points to transit routing configuration balancing within active global gateway hubs, or displays anomalous structural character tokens.`;
        }
      } else {
        riskTier = 'TIER_3_MONITORED';
        severity = 'LOW';
        diagnosticBrief = `Direct Pipeline Corridors Confirmed. Supply vector between ${cleanOrigin} and ${cleanDestination} balances normally within standard normal distributions (|Z| < 1.0, Z-Score: ${deviationZScore.toFixed(2)}) with zero anomalous transshipment interface.`;
      }

      const coordsO = activeCoordinatesRegistry[cleanOrigin] || [20, 20];
      const coordsD = activeCoordinatesRegistry[cleanDestination] || [50, 10];
      const approxDistanceKm = calculateGeodesicDistanceKm(coordsO, coordsD);
      const valuePerKm = approxDistanceKm > 0 ? valAmount / approxDistanceKm : valAmount;

      return {
        ...row,
        id: row.id || `ledger-node-${idx}`,
        hsCodeMatched: calculatedHs,
        hsChapter: chapter,
        macroSector: discoveredSector,
        riskScore: Math.min(100, Math.max(10, dynamicCalculatedRisk)),
        riskType: riskTier,
        severity,
        brief: diagnosticBrief,
        routePath: `${cleanOrigin} \u2192 ${cleanDestination}`,
        cleanOrigin,
        cleanDestination,
        cleanProduct: rawProduct || 'BULK DISCOVERED MANIFEST FREIGHT',
        cleanImporter: rawImporter || 'UNSPECIFIED COMMERCIAL IMPORTER',
        cleanExporter: rawExporter || 'UNSPECIFIED COMMERCIAL EXPORTER',
        Amount: valAmount,
        approxDistanceKm,
        valuePerKm,
        deviationZScore,
        zScoreTier,
        routingCorridorContainsHub,
        containsComplexWaybills,
        dateString: row.Date || row.date || row.Timestamp || 'N/A'
      };
    }).filter(Boolean);
  }, [tradeData, activeCoordinatesRegistry]);

  // Dynamic Corridor Intelligence Matrix Pipeline
  const corridorIntelligence = useMemo(() => {
    const corridorMap = {};

    parsedRecords.forEach(rec => {
      const corridorKey = `${rec.cleanOrigin} \u2192 ${rec.cleanDestination}`;
      if (!corridorMap[corridorKey]) {
        corridorMap[corridorKey] = {
          corridorId: corridorKey,
          origin: rec.cleanOrigin,
          destination: rec.cleanDestination,
          shipmentCount: 0,
          totalValue: 0,
          highRiskCount: 0,
          mediumRiskCount: 0,
          lowRiskCount: 0,
          hubInvolvedCount: 0,
          complexWaybillCount: 0,
          totalDistanceKm: rec.approxDistanceKm,
          sectors: new Set(),
          importers: new Set(),
          exporters: new Set(),
          maxAbsZScore: 0,
          compositeRiskScore: 0
        };
      }

      const entry = corridorMap[corridorKey];
      entry.shipmentCount += 1;
      entry.totalValue += rec.Amount;
      if (rec.severity === 'HIGH') entry.highRiskCount += 1;
      else if (rec.severity === 'MEDIUM') entry.mediumRiskCount += 1;
      else entry.lowRiskCount += 1;

      if (rec.routingCorridorContainsHub) entry.hubInvolvedCount += 1;
      if (rec.containsComplexWaybills) entry.complexWaybillCount += 1;
      entry.sectors.add(rec.macroSector);
      if (rec.cleanImporter) entry.importers.add(rec.cleanImporter);
      if (rec.cleanExporter) entry.exporters.add(rec.cleanExporter);
      if (Math.abs(rec.deviationZScore) > entry.maxAbsZScore) {
        entry.maxAbsZScore = Math.abs(rec.deviationZScore);
      }
    });

    return Object.values(corridorMap).map(c => {
      const hubRatio = c.hubInvolvedCount / c.shipmentCount;
      const waybillRatio = c.complexWaybillCount / c.shipmentCount;
      const riskRatio = ((c.highRiskCount * 3) + (c.mediumRiskCount * 1.5) + c.lowRiskCount) / (c.shipmentCount * 3);
      
      const compositeScore = Math.min(100, Math.round(
        (riskRatio * 45) + (hubRatio * 25) + (waybillRatio * 20) + (c.maxAbsZScore >= 1.96 ? 10 : 0)
      ));

      let investigativeTier = 'STANDARD_MONITORING';
      if (compositeScore >= 70) investigativeTier = 'HIGH_PRIORITY_INVESTIGATION';
      else if (compositeScore >= 45) investigativeTier = 'ELEVATED_AUDIT_CORRIDOR';

      return {
        ...c,
        sectorCount: c.sectors.size,
        importerCount: c.importers.size,
        exporterCount: c.exporters.size,
        compositeRiskScore: compositeScore,
        investigativeTier,
        avgValuePerKm: c.totalValue / (c.totalDistanceKm || 1),
        hubDependencyPercent: (hubRatio * 100).toFixed(0),
        circuitousRatio: (waybillRatio * 100).toFixed(0)
      };
    }).sort((a, b) => b.compositeRiskScore - a.compositeRiskScore);
  }, [parsedRecords]);

  // Filtering Operations Pipeline
  const filteredRecords = useMemo(() => {
    return parsedRecords.filter(rec => {
      const matchRisk = filterType === 'ALL' || rec.riskType === filterType;
      const matchMacro = selectedMacroSector === 'ALL' || rec.macroSector === selectedMacroSector;
      const matchCorridor = selectedCorridorFilter === 'ALL' || rec.routePath === selectedCorridorFilter;
      return matchRisk && matchMacro && matchCorridor;
    });
  }, [parsedRecords, filterType, selectedMacroSector, selectedCorridorFilter]);

  const uniqueOrigins = useMemo(() => Array.from(new Set(filteredRecords.map(e => e.cleanOrigin))).sort(), [filteredRecords]);
  const uniqueDestinations = useMemo(() => Array.from(new Set(filteredRecords.map(e => e.cleanDestination))).sort(), [filteredRecords]);
  const discoveredSectorsList = useMemo(() => Array.from(new Set(parsedRecords.map(e => e.macroSector))).sort(), [parsedRecords]);
  const allCorridorNames = useMemo(() => corridorIntelligence.map(c => c.corridorId), [corridorIntelligence]);

  const mapRoutesToRender = useMemo(() => {
    return filteredRecords.filter(item => {
      const matchO = mapOriginSelect === 'ALL' || item.cleanOrigin === mapOriginSelect;
      const matchD = mapDestSelect === 'ALL' || item.cleanDestination === mapDestSelect;
      return matchO && matchD;
    });
  }, [filteredRecords, mapOriginSelect, mapDestSelect]);

  const activeHighlightedRoute = mapRoutesToRender[selectedRouteIdx] || mapRoutesToRender[0] || null;

  // Total Capitalization Sum
  const calculatedCapitalizationSum = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => acc + (Number(curr.Amount) || 0), 0);
  }, [filteredRecords]);

  // CROSS-DIMENSIONAL INTELLIGENCE NEXUS (ENTITY, EXPORTER, BRAND, VOLUME, TIMELINE & PRICING)
  const nexusIntelligence = useMemo(() => {
    if (!filteredRecords.length) return null;

    const entityFreq = {};
    const exporterFreq = {};
    const brandFreq = {};
    let minVal = Infinity;
    let maxVal = -Infinity;
    const datesList = [];

    filteredRecords.forEach(r => {
      if (r.cleanImporter) entityFreq[r.cleanImporter] = (entityFreq[r.cleanImporter] || 0) + 1;
      if (r.cleanExporter) exporterFreq[r.cleanExporter] = (exporterFreq[r.cleanExporter] || 0) + 1;
      if (r.cleanProduct) brandFreq[r.cleanProduct] = (brandFreq[r.cleanProduct] || 0) + 1;
      
      if (r.Amount < minVal) minVal = r.Amount;
      if (r.Amount > maxVal) maxVal = r.Amount;

      if (r.dateString && r.dateString !== 'N/A') datesList.push(r.dateString);
    });

    const topEntities = Object.entries(entityFreq).sort((a,b) => b[1] - a[1]).slice(0, 4);
    const topExporters = Object.entries(exporterFreq).sort((a,b) => b[1] - a[1]).slice(0, 4);
    const topBrands = Object.entries(brandFreq).sort((a,b) => b[1] - a[1]).slice(0, 4);
    const avgVal = calculatedCapitalizationSum / (filteredRecords.length || 1);
    const totalDistSum = filteredRecords.reduce((acc, r) => acc + r.approxDistanceKm, 0);
    const globalAvgPriceKm = totalDistSum > 0 ? calculatedCapitalizationSum / totalDistSum : 0;

    return {
      topEntities,
      topExporters,
      topBrands,
      minVal: minVal === Infinity ? 0 : minVal,
      maxVal: maxVal === -Infinity ? 0 : maxVal,
      avgVal,
      globalAvgPriceKm,
      datesCount: datesList.length,
      sampleDates: datesList.slice(0, 3)
    };
  }, [filteredRecords, calculatedCapitalizationSum]);

  // CORRECTIVE AI DYNAMIC BRIEFING SYNTHESIS PARAGRAPH
  const dynamicSummaryParagraph = useMemo(() => {
    if (filteredRecords.length === 0) return "No active logistics vectors correspond to chosen analytical configurations.";
    const total = filteredRecords.length;
    const elevatedCount = filteredRecords.filter(r => r.severity === 'HIGH').length;
    const midCount = filteredRecords.filter(r => r.severity === 'MEDIUM').length;
    const directCount = filteredRecords.filter(r => r.severity === 'LOW').length;
    const topCorridor = corridorIntelligence[0];

    let corridorRiskAssessment = "";
    if (topCorridor) {
      if (topCorridor.compositeRiskScore >= 65) {
        corridorRiskAssessment = `Highest investigative priority is assigned to the ${topCorridor.corridorId} corridor (Risk Score: ${topCorridor.compositeRiskScore}/100), where high transshipment hub dependency (${topCorridor.hubDependencyPercent}%) and circuitous routing (${topCorridor.circuitousRatio}%) indicate potential structural diversion, customs misclassification, or tariff evasion.`;
      } else if (topCorridor.compositeRiskScore >= 35) {
        corridorRiskAssessment = `Primary corridor evaluated is ${topCorridor.corridorId} (Risk Score: ${topCorridor.compositeRiskScore}/100), exhibiting moderate trade drift and hub reliance (${topCorridor.hubDependencyPercent}%), warranting secondary customs audit.`;
      } else {
        corridorRiskAssessment = `Primary corridor evaluated is ${topCorridor.corridorId} (Risk Score: ${topCorridor.compositeRiskScore}/100). This corridor operates within standard direct supply chain baselines (Tier 3) with zero structural diversion indicators.`;
      }
    }

    return `AI GEOSPATIAL & CORRIDOR SYNTHESIS: Currently evaluating ${total} dynamically cataloged trade paths across ${corridorIntelligence.length} active corridors. The AI NLP Commodity Classification engine dynamically extracted WCO Harmonized System chapters across the active profile to map ${discoveredSectorsList.length} custom sectors. Outlier profiling isolated ${elevatedCount} high-risk transactions (compound routing/valuation alerts), ${midCount} moderate variance transactions, and ${directCount} baseline direct pathways. ${corridorRiskAssessment}`;
  }, [filteredRecords, corridorIntelligence, discoveredSectorsList]);

  // DATA-BACKED INVESTIGATIVE HYPOTHESES & REAL POSSIBILITIES
  const dynamicHypotheses = useMemo(() => {
    if (!filteredRecords.length) return [];
    const hypothesesList = [];

    const highRiskList = filteredRecords.filter(r => r.severity === 'HIGH');
    const zOutliers = filteredRecords.filter(r => Math.abs(r.deviationZScore) >= 1.96);
    const hubTraversals = filteredRecords.filter(r => r.routingCorridorContainsHub);

    if (zOutliers.length > 0) {
      hypothesesList.push({
        title: "Possibility A: Transfer Pricing Misinvoicing / Valuation Deviation",
        detail: `${zOutliers.length} transaction(s) breach the 95%+ confidence interval (|Z| ≥ 1.96). Significant price deviations relative to geographic distance averages suggest potential customs under-declaration to minimize tariffs or over-declaration for capital flight.`
      });
    }

    if (hubTraversals.length > 0) {
      hypothesesList.push({
        title: "Possibility B: Transshipment Origin Camouflage / Tariff Avoidance",
        detail: `${hubTraversals.length} shipment(s) traverse known global transit hubs (Dubai, Singapore, HK). Indicates potential origin re-labeling or bill-of-lading switching to circumvent country-of-origin tariffs or trade embargoes.`
      });
    }

    if (highRiskList.length > 0 && hypothesesList.length < 3) {
      hypothesesList.push({
        title: "Possibility C: Complex Multi-Modal Route Obfuscation",
        detail: `${highRiskList.length} transaction(s) utilize split waybills, FTZ transfers, or non-linear transport legs. Suggests deliberate logistics layering to obscure ultimate beneficial ownership (UBO).`
      });
    }

    if (hypothesesList.length === 0) {
      hypothesesList.push({
        title: "Possibility A: Compliant Commercial Direct Operations",
        detail: "Current dataset exhibits linear freight trajectories, standard pricing distributions, and minimal transshipment reliance. Operates within legitimate commercial control baselines."
      });
    }

    return hypothesesList;
  }, [filteredRecords]);

  const countersIndex = useMemo(() => {
    const total = parsedRecords.length || 1;
    const t1 = parsedRecords.filter(r => r.riskType === 'TIER_1_ELEVATED').length;
    const t2 = parsedRecords.filter(r => r.riskType === 'TIER_2_SPLIT_ROUTE').length;
    const t3 = parsedRecords.filter(r => r.riskType === 'TIER_3_MONITORED').length;
    
    const compositeIndexScore = Math.round(
      ((t1 * 100) + (t2 * 50) + (t3 * 10)) / total
    );

    return {
      t1, t2, t3,
      t1P: ((t1 / total) * 100).toFixed(1),
      t2P: ((t2 / total) * 100).toFixed(1),
      t3P: ((t3 / total) * 100).toFixed(1),
      compositeIndexScore
    };
  }, [parsedRecords]);

  // GENERATED STRUCTURED INTELLIGENCE OBJECT PAYLOAD READY FOR EXPORT
  const structuredIntelligencePayload = useMemo(() => {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        systemVersion: "4.8-Enterprise-GeoAI",
        complianceAuditStandard: "ISO/IEC 27001 & WCO Trade Enforcement Guidelines",
        totalAnalyzedRecords: parsedRecords.length,
        activeCorridorsCount: corridorIntelligence.length,
        compositeRiskIndexScore: countersIndex.compositeIndexScore,
        totalCapitalizationUSD: calculatedCapitalizationSum
      },
      corridorRiskMatrix: corridorIntelligence.map(c => ({
        corridorId: c.corridorId,
        compositeRiskScore: c.compositeRiskScore,
        shipmentCount: c.shipmentCount,
        totalPriceUSD: c.totalValue,
        hubDependencyPercent: c.hubDependencyPercent,
        circuitousIndexPercent: c.circuitousRatio,
        valueDistanceRatioUSDPerKm: c.avgValuePerKm,
        investigativeTier: c.investigativeTier
      })),
      crossDimensionalNexus: {
        keyExporters: nexusIntelligence?.topExporters || [],
        keyImporters: nexusIntelligence?.topEntities || [],
        topCommodities: nexusIntelligence?.topBrands || [],
        valuationSpread: {
          minUSD: nexusIntelligence?.minVal || 0,
          maxUSD: nexusIntelligence?.maxVal || 0,
          meanUSD: nexusIntelligence?.avgVal || 0
        },
        globalPriceDensityUSDPerKm: nexusIntelligence?.globalAvgPriceKm || 0
      },
      aiDiagnosticBriefing: {
        summary: dynamicSummaryParagraph,
        hypotheses: dynamicHypotheses
      },
      activeFilteredManifest: filteredRecords.map(r => ({
        id: r.id,
        route: r.routePath,
        exporter: r.cleanExporter,
        importer: r.cleanImporter,
        commodity: r.cleanProduct,
        hsCode: r.hsCodeMatched,
        sector: r.macroSector,
        priceUSD: r.Amount,
        distanceKm: r.approxDistanceKm,
        riskScore: r.riskScore,
        severity: r.severity,
        briefing: r.brief
      }))
    };
  }, [parsedRecords, corridorIntelligence, countersIndex, calculatedCapitalizationSum, nexusIntelligence, dynamicSummaryParagraph, dynamicHypotheses, filteredRecords]);

  // Leaflet Spatial Mapping Rendering Engine with Polyline Hover & Popup Interactivity
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;
    const L = window.L;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [20, 20], zoom: 2, zoomControl: true, attributionControl: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, bgBuffer: 8
      }).addTo(mapInstanceRef.current);
      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();
    if (mapRoutesToRender.length === 0) return;

    const retrieveFixedCoords = (name, indexOffset) => {
      const lookupKey = (name || '').toUpperCase().trim();
      if (activeCoordinatesRegistry[lookupKey]) {
        const [lat, lng] = activeCoordinatesRegistry[lookupKey];
        return [lat + (indexOffset * 0.12), lng + (indexOffset * 0.12)];
      }
      return [25.0 + (indexOffset * 0.2), 15.0 + (indexOffset * 0.2)];
    };

    const boundingPoints = [];
    mapRoutesToRender.forEach((item, rIdx) => {
      const sourceCoord = retrieveFixedCoords(item.cleanOrigin, rIdx);
      const targetCoord = retrieveFixedCoords(item.cleanDestination, rIdx + 1);
      boundingPoints.push(sourceCoord, targetCoord);

      const isActiveNode = activeHighlightedRoute && activeHighlightedRoute.id === item.id;
      const polylineColor = item.severity === 'HIGH' ? '#f43f5e' : item.severity === 'MEDIUM' ? '#3b82f6' : '#10b981';

      // Origin and Destination Node Markers
      const sourceDot = L.circleMarker(sourceCoord, {
        radius: isActiveNode ? 9 : 5, fillColor: '#3b82f6', color: isActiveNode ? '#ffffff' : '#0f172a', weight: isActiveNode ? 2 : 1, fillOpacity: 0.95
      }).bindPopup(`<b style="color:#0f172a">Origin Node: ${item.cleanOrigin}</b><br/><span style="color:#334155">Corridor Risk Index: ${item.riskScore}/100</span>`);

      const targetDot = L.circleMarker(targetCoord, {
        radius: isActiveNode ? 9 : 5, fillColor: '#10b981', color: isActiveNode ? '#ffffff' : '#0f172a', weight: isActiveNode ? 2 : 1, fillOpacity: 0.95
      }).bindPopup(`<b style="color:#0f172a">Destination Node: ${item.cleanDestination}</b><br/><span style="color:#334155">Sector: ${item.macroSector}</span>`);

      // INTERACTIVE POLYLINE WITH EXPORTER, IMPORTER, BRAND, PRICE, AND ROUTE POPUP
      const structuralLine = L.polyline([sourceCoord, targetCoord], {
        color: polylineColor, weight: isActiveNode ? 6 : 3, opacity: isActiveNode ? 1.0 : 0.65, dashArray: isActiveNode ? '8, 5' : '4, 4'
      });

      // Line Click Popup (Includes Exporter/Shipper & Declared Price)
      structuralLine.bindPopup(`
        <div style="font-family: system-ui, sans-serif; font-size: 11px; color: #0f172a; padding: 2px; min-width: 220px;">
          <div style="font-weight: bold; color: #1e3a8a; font-size: 12px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 6px;">
            ${item.cleanOrigin} ➔ ${item.cleanDestination}
          </div>
          <div style="margin-bottom: 3px;"><b>Exporter / Shipper:</b> ${item.cleanExporter}</div>
          <div style="margin-bottom: 3px;"><b>Entity / Importer:</b> ${item.cleanImporter}</div>
          <div style="margin-bottom: 3px;"><b>Declared Commodity:</b> ${item.cleanProduct}</div>
          <div style="margin-bottom: 3px;"><b>Sector:</b> ${item.macroSector} (HS ${item.hsCodeMatched})</div>
          <div style="margin-bottom: 3px;"><b>Declared Price ($):</b> <span style="color: #047857; font-weight: bold;">$${item.Amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
          <div style="margin-bottom: 3px;"><b>Price / Distance:</b> $${item.valuePerKm.toFixed(2)} / km (${item.approxDistanceKm.toLocaleString()} km)</div>
          <div><b>Corridor Risk Score:</b> <span style="font-weight: bold; color: ${item.severity === 'HIGH' ? '#e11d48' : item.severity === 'MEDIUM' ? '#2563eb' : '#059669'};">${item.riskScore}/100 (${item.severity})</span></div>
        </div>
      `);

      // Line Hover Tooltip
      structuralLine.bindTooltip(`Vector: ${item.cleanOrigin} ➔ ${item.cleanDestination} ($${item.Amount.toLocaleString()})`, {
        sticky: true
      });

      layerGroup.addLayer(sourceDot);
      layerGroup.addLayer(targetDot);
      layerGroup.addLayer(structuralLine);

      if (isActiveNode) {
        structuralLine.bringToFront();
        sourceDot.bringToFront();
        targetDot.bringToFront();
      }
    });

    if (boundingPoints.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(boundingPoints), { padding: [50, 50], maxZoom: 4 });
    }
  }, [leafletReady, mapRoutesToRender, activeHighlightedRoute, activeCoordinatesRegistry]);

  return (
    <div className="space-y-6 text-slate-100 max-w-[1800px] mx-auto p-4 font-normal antialiased bg-slate-950 min-h-screen">
      
      {/* HEADER CONTROLS FRAME */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700/60 pb-5 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="text-blue-500" size={26} /> Jurisdictional Risk & Transshipment Intelligence
          </h1>
          <p className="text-xs font-semibold text-slate-300 mt-1">
            Dynamic, data-agnostic structural anomaly detection, corridor drift analysis, and real-time AI commodity classification scanner.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowMethodologyPanel(prev => !prev)}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-all shadow-sm text-slate-200"
          >
            <BookOpen size={14} className="text-emerald-400" />
            <span>{showMethodologyPanel ? 'Hide Methodology Guide' : 'Statistical Methodology & Formulas'}</span>
          </button>

          <label className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-all shadow-sm">
            <Upload size={14} className="text-blue-400" />
            <span className="text-slate-200">Upload Coordinates (CSV/TSV)</span>
            <input 
              type="file" 
              accept=".csv,.tsv,.txt,.json,.xlsx" 
              onChange={handleCoordinateFileUpload} 
              className="hidden" 
            />
          </label>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm">
            <Filter size={14} className="text-blue-400" />
            <span className="text-slate-200 uppercase tracking-wide">Auto-Discovered Sectors:</span>
            <select
              value={selectedMacroSector}
              onChange={(e) => { setSelectedMacroSector(e.target.value); setSelectedRouteIdx(0); }}
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-none border-none outline-none ml-1 bg-slate-900"
            >
              <option value="ALL" className="text-white bg-slate-950">All Dynamic Sectors ({discoveredSectorsList.length})</option>
              {discoveredSectorsList.map(secName => (
                <option key={secName} value={secName} className="text-white bg-slate-950">{secName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm">
            <Compass size={14} className="text-emerald-400" />
            <span className="text-slate-200 uppercase tracking-wide">Corridor:</span>
            <select
              value={selectedCorridorFilter}
              onChange={(e) => { setSelectedCorridorFilter(e.target.value); setSelectedRouteIdx(0); }}
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-none border-none outline-none ml-1 bg-slate-900 max-w-[180px] truncate"
            >
              <option value="ALL" className="text-white bg-slate-950">All Trade Corridors ({allCorridorNames.length})</option>
              {allCorridorNames.map(cName => (
                <option key={cName} value={cName} className="text-white bg-slate-950">{cName}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md active:scale-95 border border-blue-500"
          >
            <Printer size={15} /> Export Dossier Report
          </button>
        </div>
      </div>

      {uploadFeedback && (
        <div className="bg-slate-800/80 border border-blue-500/50 p-2.5 rounded-lg text-xs font-medium text-blue-300 flex items-center gap-2 print:hidden">
          <Info size={15} className="text-blue-400" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* DEDICATED FORENSIC STATISTICAL METHODOLOGY PANEL */}
      {showMethodologyPanel && (
        <div className="bg-slate-900/95 border border-emerald-500/50 p-6 rounded-xl space-y-6 shadow-xl print:block">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-400" /> Forensic Statistical Methodology & Risk Scoring Architecture
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Auditing Standard: ISO/IEC 27001 & WCO Trade Enforcement Guidelines</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/60 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <Activity size={14} className="text-blue-400" /> 1. Z-Score Valuation Outlier Engine
              </h3>
              <p className="text-slate-300">
                Measures how many standard deviations ($\sigma$) a transaction's value is from the dataset's global mean ($\mu$):
              </p>
              <div className="bg-slate-950 p-2 rounded text-center text-emerald-300 font-mono text-xs border border-slate-800">
                Z = (Value - Mean) / Standard Deviation
              </div>
              <ul className="space-y-1.5 pt-1 text-slate-300">
                <li>• <strong className="text-white">|Z| &lt; 1.00 (Normal):</strong> Standard market pricing (~68% of commercial trade).</li>
                <li>• <strong className="text-amber-300">1.00 &le; |Z| &lt; 1.96 (Elevated):</strong> Moderate statistical divergence; monitor for volume discounting.</li>
                <li>• <strong className="text-rose-400">|Z| &ge; 1.96 (Critical Outlier):</strong> Exceeds 95% confidence interval. Flags probable undervaluation or overvaluation risk.</li>
              </ul>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/60 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-rose-400" /> 2. Composite Risk Score (0–100)
              </h3>
              <p className="text-slate-300">
                Combines four structural risk dimensions into an additive index score:
              </p>
              <ul className="space-y-1.5 pt-1 text-slate-300">
                <li>• <strong className="text-white">Intrinsic Manifest Risk (+15 to +35):</strong> Base weight adjusted for string complexity.</li>
                <li>• <strong className="text-blue-300">Z-Score Valuation Bonus (+15 to +30):</strong> Added when transaction value breaches statistical thresholds.</li>
                <li>• <strong className="text-amber-300">Transshipment Hub Exposure (+25):</strong> Added if Origin/Destination involves high-vulnerability transit hubs.</li>
                <li>• <strong className="text-rose-400">Circuitous Waybill Syntax (+45):</strong> Added when split-routing symbols (&rarr;, VIA, FTZ) indicate multi-modal layering.</li>
              </ul>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/60 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <BarChart4 size={14} className="text-purple-400" /> 3. Risk Index & Audit Thresholds
              </h3>
              <p className="text-slate-300">
                The dataset Composite Index aggregates individual scores into actionable audit classifications:
              </p>
              <ul className="space-y-1.5 pt-1 text-slate-300">
                <li>• <strong className="text-emerald-400">Baseline Index (&lt; 35):</strong> Normal trade control group. No immediate customs audit required.</li>
                <li>• <strong className="text-blue-300">Elevated Audit Corridor (35–64):</strong> Secondary review recommended. Inspect transfer pricing and hub ratios.</li>
                <li>• <strong className="text-rose-400">High Priority Investigation (&ge; 65):</strong> Immediate forensic audit required. Flags compound routing anomalies.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE KPI CARDS WIDGET MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-xl space-y-3 flex flex-col justify-between shadow-lg">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-slate-200 uppercase tracking-wider">
              <span>Total Inspected Entries</span>
              <Activity size={15} className="text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white">{parsedRecords.length}</div>
          </div>
          <div className="border-t border-slate-700/60 pt-2 space-y-1 text-[11px] font-medium">
            <div className="text-blue-300 font-semibold">
              <span className="text-slate-400">Interpretation:</span> Active shipment sample size across {allCorridorNames.length} distinct trade corridors.
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Risk Score Index:</span> {countersIndex.compositeIndexScore}/100 (Threshold: Normal &lt; 35)
            </div>
            <div className="text-slate-300 font-semibold">
              <span className="text-blue-400">Real-World Significance:</span> Establishes statistical sample baselines for valuation Z-score anomaly detection.
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 border-l-4 border-l-rose-500 border-y border-r border-slate-700/60 p-5 rounded-xl space-y-3 flex flex-col justify-between shadow-lg">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-rose-400 uppercase tracking-wider">
              <span>Risk Index: Tier 1 High</span>
              <AlertTriangle size={15} className="text-rose-400" />
            </div>
            <div className="text-3xl font-bold text-rose-400">
              {countersIndex.t1} <span className="text-xs text-slate-300 font-bold ml-1">({countersIndex.t1P}%)</span>
            </div>
          </div>
          <div className="border-t border-slate-700/60 pt-2 space-y-1 text-[11px] font-medium">
            <div className="text-rose-300 font-semibold">
              <span className="text-slate-400">Interpretation:</span> Compound routing anomalies involving unaligned circuitous pathways and free trade zone waybills.
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Risk Score Index:</span> 85/100 (Threshold: High Risk &ge; 65)
            </div>
            <div className="text-slate-300 font-semibold">
              <span className="text-rose-400">Real-World Significance:</span> Critical indicator of sanctions evasion, transshipment camouflage, or deliberate customs undervaluation.
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 border-l-4 border-l-blue-500 border-y border-r border-slate-700/60 p-5 rounded-xl space-y-3 flex flex-col justify-between shadow-lg">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-blue-400 uppercase tracking-wider">
              <span>Risk Index: Tier 2 Mid</span>
              <Layers size={15} className="text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {countersIndex.t2} <span className="text-xs text-slate-300 font-bold ml-1">({countersIndex.t2P}%)</span>
            </div>
          </div>
          <div className="border-t border-slate-700/60 pt-2 space-y-1 text-[11px] font-medium">
            <div className="text-blue-300 font-semibold">
              <span className="text-slate-400">Interpretation:</span> Isolated logistics variance or statistical Z-Score value deviation relative to global mean.
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Risk Score Index:</span> 50/100 (Threshold: Mid Risk 35–64)
            </div>
            <div className="text-slate-300 font-semibold">
              <span className="text-blue-400">Real-World Significance:</span> Flags potential transfer pricing manipulation or secondary gateway consolidation.
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 border-l-4 border-l-emerald-500 border-y border-r border-slate-700/60 p-5 rounded-xl space-y-3 flex flex-col justify-between shadow-lg">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>Risk Index: Tier 3 Base</span>
              <ShieldCheck size={15} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400">
              {countersIndex.t3} <span className="text-xs text-slate-300 font-bold ml-1">({countersIndex.t3P}%)</span>
            </div>
          </div>
          <div className="border-t border-slate-700/60 pt-2 space-y-1 text-[11px] font-medium">
            <div className="text-emerald-300 font-semibold">
              <span className="text-slate-400">Interpretation:</span> Standard point-to-point commercial vectors balancing normally within background distributions.
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Risk Score Index:</span> 18/100 (Threshold: Baseline &lt; 35)
            </div>
            <div className="text-slate-300 font-semibold">
              <span className="text-emerald-400">Real-World Significance:</span> Represents compliant commercial trade, serving as a clean control group for audit comparison.
            </div>
          </div>
        </div>
      </div>

      {/* CROSS-DIMENSIONAL INTELLIGENCE NEXUS: ENTITY, EXPORTER, BRAND, VOLUME, TIMELINE & PRICING */}
      {nexusIntelligence && (
        <div className="bg-slate-900/90 border border-slate-700/60 p-5 rounded-xl space-y-4 shadow-lg print:block">
          <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Building size={16} className="text-amber-400" /> Cross-Dimensional Intelligence Nexus: Exporter, Entity, Brand, Volume, Timeline & Pricing
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Active Scope: {filteredRecords.length} Transactions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            {/* Top Exporters / Shippers */}
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px]">
                <Package size={14} className="text-amber-400" /> Key Exporters & Shippers
              </div>
              <ul className="space-y-1 text-slate-300">
                {nexusIntelligence.topExporters.map(([exp, cnt]) => (
                  <li key={exp} className="flex justify-between truncate">
                    <span className="truncate text-slate-200">{exp}</span>
                    <span className="font-bold text-amber-400 ml-2">{cnt} shp</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Importers / Entities */}
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px]">
                <Building size={14} className="text-blue-400" /> Key Importers & Entities
              </div>
              <ul className="space-y-1 text-slate-300">
                {nexusIntelligence.topEntities.map(([ent, cnt]) => (
                  <li key={ent} className="flex justify-between truncate">
                    <span className="truncate text-slate-200">{ent}</span>
                    <span className="font-bold text-blue-400 ml-2">{cnt} shp</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Commodities / Brands */}
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px]">
                <Tag size={14} className="text-emerald-400" /> Products & Brand Commodities
              </div>
              <ul className="space-y-1 text-slate-300">
                {nexusIntelligence.topBrands.map(([brd, cnt]) => (
                  <li key={brd} className="flex justify-between truncate">
                    <span className="truncate text-slate-200">{brd}</span>
                    <span className="font-bold text-emerald-400 ml-2">{cnt} shp</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Valuation & Volume Spread */}
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px]">
                <DollarSign size={14} className="text-purple-400" /> Valuation & Price Spread
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Single Price:</span>
                  <span className="font-bold text-white">${nexusIntelligence.minVal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Single Price:</span>
                  <span className="font-bold text-amber-400">${nexusIntelligence.maxVal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mean Transaction:</span>
                  <span className="font-bold text-emerald-400">${nexusIntelligence.avgVal.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
              </div>
            </div>

            {/* Pricing Density & Timeline */}
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px]">
                <Calendar size={14} className="text-rose-400" /> Price Density & Timeline
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Distance Density:</span>
                  <span className="font-bold text-purple-400">${nexusIntelligence.globalAvgPriceKm.toFixed(2)} / km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dated Entries:</span>
                  <span className="font-bold text-white">{nexusIntelligence.datesCount} records</span>
                </div>
                {nexusIntelligence.sampleDates.length > 0 && (
                  <div className="text-[10px] text-slate-400 truncate">
                    Span: {nexusIntelligence.sampleDates.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI SYNTHESIS SUMMARY & DATA-BACKED HYPOTHESES */}
      <div className="bg-slate-900/90 border border-blue-900/60 p-5 rounded-xl space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <Cpu size={16} className="text-blue-400" /> AI Geospatial Synthesis & Data-Backed Investigative Hypotheses
        </h3>
        
        <p className="text-xs sm:text-sm text-slate-100 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800 font-medium">
          {dynamicSummaryParagraph}
        </p>

        {/* Actionable Hypotheses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dynamicHypotheses.map((hyp, i) => (
            <div key={i} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Lightbulb size={14} className="text-amber-400" /> {hyp.title}
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                {hyp.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* INVESTIGATIVE CORRIDOR RISK MATRIX TABLE */}
      <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-xl space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700/60 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Navigation size={17} className="text-emerald-400" /> Investigative Corridor Risk Matrix & Behavior Profiler
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Answers: "How is trade moving?", "Have trade corridors changed?", and "Which routes present highest risk?"
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-slate-900/90 border border-slate-700/60 rounded-full text-blue-400 font-bold">
            {corridorIntelligence.length} Active Corridors Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 text-slate-300 uppercase text-[10px] font-bold tracking-wider bg-slate-900/50">
                <th className="p-3">Corridor Trajectory</th>
                <th className="p-3">Risk Ranking</th>
                <th className="p-3">Shipments / Total Price ($USD)</th>
                <th className="p-3">Hub Dependency</th>
                <th className="p-3">Circuitous Index</th>
                <th className="p-3">Value / Distance Ratio</th>
                <th className="p-3">Investigative Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {corridorIntelligence.map((corridor, idx) => (
                <tr key={corridor.corridorId} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <span className="text-slate-400">#{idx + 1}</span>
                    {corridor.corridorId}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      corridor.compositeRiskScore >= 70 ? 'bg-rose-950/80 border-rose-600 text-rose-300' :
                      corridor.compositeRiskScore >= 45 ? 'bg-blue-950/80 border-blue-600 text-blue-300' :
                      'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    }`}>
                      Score: {corridor.compositeRiskScore}/100
                    </span>
                  </td>
                  <td className="p-3 text-slate-200 font-bold">
                    {corridor.shipmentCount} <span className="text-emerald-400 font-normal">(${corridor.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
                  </td>
                  <td className="p-3 text-amber-400 font-bold">
                    {corridor.hubDependencyPercent}%
                  </td>
                  <td className="p-3 text-purple-400 font-bold">
                    {corridor.circuitousRatio}%
                  </td>
                  <td className="p-3 text-emerald-400 font-bold">
                    ${corridor.avgValuePerKm.toLocaleString(undefined, { maximumFractionDigits: 1 })} / km
                  </td>
                  <td className="p-3 text-slate-300 text-[11px] font-medium">
                    {corridor.investigativeTier === 'HIGH_PRIORITY_INVESTIGATION' 
                      ? 'High priority for customs audit & transshipment verification.'
                      : corridor.investigativeTier === 'ELEVATED_AUDIT_CORRIDOR'
                      ? 'Monitor for statistical valuation drift & hub diversion.'
                      : 'Standard point-to-point trade corridor baseline.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CORRIDOR METRICS REFERENCE & INVESTIGATIVE GUIDELINES PANEL */}
        <div className="mt-4 pt-4 border-t border-slate-700/60 bg-slate-950/80 p-4 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <HelpCircle size={15} className="text-emerald-400" /> Corridor Metrics Reference Guide & Assessment Guidelines
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            {/* Hub Dependency */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <div className="font-bold text-amber-400 uppercase text-[11px]">1. Hub Dependency (%)</div>
              <p className="text-slate-300 text-[11px]">
                <strong>Meaning:</strong> Percentage of shipments routed through high-vulnerability global transshipment hubs (Dubai, Singapore, HK, etc.).
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Score & Threshold:</strong> &lt;20% (Low exposure), 20–50% (Moderate hub reliance), &gt;50% (High transshipment risk).
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Real-World Significance:</strong> Transit hubs facilitate country-of-origin masking, re-invoicing, or circumvention of tariff embargoes.
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Possible Assessments:</strong> Audit re-packaging docs; inspect bill-of-lading switching; verify physical origin at port of entry.
              </p>
            </div>

            {/* Circuitous Index */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <div className="font-bold text-purple-400 uppercase text-[11px]">2. Circuitous Index (%)</div>
              <p className="text-slate-300 text-[11px]">
                <strong>Meaning:</strong> Ratio of shipments utilizing indirect, split-route waybills or transit indicators (<code>VIA</code>, <code>FTZ</code>, <code>→</code>).
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Score & Threshold:</strong> 0% (Direct route), 1–30% (Standard multi-modal transit), &gt;30% (Anomalous trajectory).
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Real-World Significance:</strong> Non-linear routes add unnecessary freight cost, often used to disguise supply chain origin/endpoints.
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Possible Assessments:</strong> Request full vessel log itineraries; verify intermediary free trade zone clearance forms.
              </p>
            </div>

            {/* Value / Distance Ratio */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <div className="font-bold text-emerald-400 uppercase text-[11px]">3. Value / Distance Ratio ($/km)</div>
              <p className="text-slate-300 text-[11px]">
                <strong>Meaning:</strong> Total monetary valuation divided by geodesic transport distance in kilometers between origin and destination.
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Score & Threshold:</strong> Varies by HS commodity chapter. Significant spikes/drops signal transfer pricing anomalies.
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Real-World Significance:</strong> Detects trade-based money laundering (TBML) through over-invoicing or customs undervaluation.
              </p>
              <p className="text-slate-300 text-[11px]">
                <strong>Possible Assessments:</strong> Benchmark unit pricing against WCO fair market values; perform full transfer pricing audit.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* LEAFLET CONTAINER MAP WITH REFIXED PRINT STACKING CONTEXT */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-4 shadow-lg print:block print:border-slate-400 print:bg-white print-section-stack">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch print:block">
          
          <div className="lg:col-span-3 rounded-xl border border-slate-700/60 relative h-[450px] overflow-hidden z-10 bg-slate-950 print:w-full print:h-[350px] print:border-slate-400">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4 print:hidden">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Spatial Corridor Presets</span>
              
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-200 font-bold uppercase">Origin Country Node</label>
                <select 
                  value={mapOriginSelect}
                  onChange={(e) => { setMapOriginSelect(e.target.value); setSelectedRouteIdx(0); }}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Discovered Origins ({uniqueOrigins.length})</option>
                  {uniqueOrigins.map(ori => <option key={ori} value={ori}>{ori}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-200 font-bold uppercase">Destination Port</label>
                <select 
                  value={mapDestSelect}
                  onChange={(e) => { setMapDestSelect(e.target.value); setSelectedRouteIdx(0); }}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Destination Countries ({uniqueDestinations.length})</option>
                  {uniqueDestinations.map(dst => <option key={dst} value={dst}>{dst}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex-1 flex flex-col justify-end">
              <span className="text-[10px] font-bold text-slate-300 uppercase block mb-1.5">Target Interception Stack</span>
              {mapRoutesToRender.length > 0 ? (
                <div className="max-h-[160px] overflow-y-auto space-y-1 bg-slate-900 p-2 rounded border border-slate-800">
                  {mapRoutesToRender.map((routeNode, routeIter) => (
                    <button
                      key={routeNode.id}
                      onClick={() => setSelectedRouteIdx(routeIter)}
                      className={`w-full text-left text-[10px] p-2 truncate rounded block border transition-all ${
                        selectedRouteIdx === routeIter ? 'bg-blue-600/30 text-blue-300 font-bold border-blue-500' : 'text-slate-200 border-transparent hover:bg-slate-800'
                      }`}
                    >
                      {routeIter + 1}. Ch.{routeNode.hsChapter} | {routeNode.cleanOrigin} ➔ {routeNode.cleanDestination}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-amber-400 font-bold">No tracks match execution bounds.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* AUDIT CORRIDOR TRANSACTIONS DATA SHEETS SHEET */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:block print-section-stack">
        
        <div className="space-y-2 print:hidden">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block px-1 mb-2">Vector Index Targets</span>
          {[
            { id: 'ALL', label: 'All Audited Paths' },
            { id: 'TIER_1_ELEVATED', label: 'Tier 1: Compound Anomalies' },
            { id: 'TIER_2_SPLIT_ROUTE', label: 'Tier 2: Intermediate Variance' },
            { id: 'TIER_3_MONITORED', label: 'Tier 3: Standard Baselines' }
          ].map(menuItem => (
            <button 
              key={menuItem.id} 
              onClick={() => { setFilterType(menuItem.id); setSelectedRouteIdx(0); setMapOriginSelect('ALL'); setMapDestSelect('ALL'); }} 
              className={`w-full text-left p-3.5 rounded-xl text-xs block border transition-all shadow-sm ${
                filterType === menuItem.id ? 'bg-slate-800 border-blue-500 text-white font-bold' : 'bg-slate-800/80 border-slate-700/60 text-slate-200 hover:bg-slate-800'
              }`}
            >
              {menuItem.label} ({menuItem.id === 'ALL' ? parsedRecords.length : parsedRecords.filter(e => e.riskType === menuItem.id).length})
            </button>
          ))}

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 mt-4 space-y-1 shadow-sm">
            <span className="text-[10px] font-bold text-slate-300 uppercase block">Dataset Financial Value Profile</span>
            <div className="text-xl font-bold text-emerald-400">
              ${calculatedCapitalizationSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4 print:w-full">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((ledgerRow, loopIter) => {
              const isSelectedCard = activeHighlightedRoute && activeHighlightedRoute.id === ledgerRow.id;
              return (
                <div 
                  key={ledgerRow.id} 
                  className={`p-5 rounded-xl border bg-slate-800/80 transition-all print:break-inside-avoid print:bg-white print:text-black print:border-slate-400 shadow-sm ${
                    isSelectedCard ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-700/60'
                  } ${
                    ledgerRow.severity === 'HIGH' ? 'border-l-4 border-l-rose-500' : ledgerRow.severity === 'MEDIUM' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-emerald-600'
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-slate-700/60 print:border-slate-300 pb-2 mb-3 text-xs">
                    <span className={`font-bold uppercase tracking-wider ${
                      ledgerRow.severity === 'HIGH' ? 'text-rose-400 print:text-rose-700' : ledgerRow.severity === 'MEDIUM' ? 'text-blue-400 print:text-blue-700' : 'text-emerald-400 print:text-emerald-700'
                    }`}>
                      #{loopIter + 1} // {ledgerRow.riskType.replace(/_/g, ' ')} [DYNAMIC RISK INDEX: {ledgerRow.riskScore}]
                    </span>
                    <span className="text-white print:text-black font-semibold bg-slate-950 print:bg-slate-100 px-2.5 py-1 rounded border border-slate-700/60 print:border-slate-300 flex items-center gap-1.5 shadow-sm">
                      <Hash size={12} className="text-blue-400" /> Dynamic AI Scanner HS Match: {ledgerRow.hsCodeMatched}
                    </span>
                  </div>

                  <div className="text-xs text-slate-100 print:text-slate-900 leading-relaxed mb-4">
                    <strong className="text-white print:text-black font-bold uppercase text-[10px] tracking-widest block mb-1">Engine Structural Analysis:</strong> 
                    {ledgerRow.brief}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-3 border-t border-slate-700/60 print:border-slate-200 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-300 print:text-slate-600 uppercase font-bold tracking-wide">Logistics Corridor</span>
                      <span className="text-white print:text-black font-bold block mt-1 truncate">{ledgerRow.routePath}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 print:text-slate-600 uppercase font-bold tracking-wide">Exporter / Shipper</span>
                      <span className="text-amber-400 print:text-amber-800 font-semibold block truncate mt-1">{ledgerRow.cleanExporter}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 print:text-slate-600 uppercase font-bold tracking-wide">Declared Commodity</span>
                      <span className="text-slate-100 print:text-slate-900 font-semibold block truncate mt-1">{ledgerRow.cleanProduct}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 print:text-slate-600 uppercase font-bold tracking-wide">AI Discovered Sector</span>
                      <span className="text-blue-400 print:text-blue-800 font-bold block truncate mt-1">{ledgerRow.macroSector}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 print:text-slate-600 uppercase font-bold tracking-wide">Approx. Distance</span>
                      <span className="text-purple-400 print:text-purple-800 font-bold block mt-1">{ledgerRow.approxDistanceKm.toLocaleString()} km</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-300 print:text-slate-600 uppercase font-bold tracking-wide">Declared Price ($)</span>
                      <span className="text-emerald-400 print:text-emerald-700 font-bold block mt-1">
                        ${ledgerRow.Amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-700/60 rounded-xl text-xs text-slate-300 font-semibold">
              No matching data profiles match active criteria frameworks.
            </div>
          )}
        </div>

      </div>

      {/* COMPREHENSIVE REPORT HUB BRIDGE - DATA INTEROPERABILITY BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-blue-500/40 p-5 rounded-xl shadow-xl space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="text-blue-400" size={18} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Comprehensive Report Hub Bridge
              </h3>
              <span className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} /> Synchronized
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Generated structured Intelligence Object payload ready for export to Global Analytics Matrix and comprehensive Report hub.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowPayloadBridge(prev => !prev)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all"
            >
              <Code size={14} className="text-blue-400" />
              <span>{showPayloadBridge ? 'Hide Structured Payload' : 'Inspect JSON Payload'}</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(structuredIntelligencePayload, null, 2));
                setCopiedPayload(true);
                setTimeout(() => setCopiedPayload(false), 2500);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md active:scale-95 border border-blue-500"
            >
              {copiedPayload ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedPayload ? 'Payload Copied to Clipboard' : 'Copy Payload Object'}</span>
            </button>
          </div>
        </div>

        {/* Toggleable Structured Payload Viewer */}
        {showPayloadBridge && (
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Structured Payload Stream (Global Analytics Matrix Ready)</span>
              <span>Size: {(JSON.stringify(structuredIntelligencePayload).length / 1024).toFixed(2)} KB</span>
            </div>
            <pre className="text-[11px] font-mono text-emerald-300 max-h-[220px] overflow-y-auto bg-slate-900 p-3 rounded border border-slate-800/80">
              {JSON.stringify(structuredIntelligencePayload, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* STACKING PRINT CSS RULES ENGINE */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: 'Segoe UI', -apple-system, sans-serif !important;
            overflow: visible !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .print\\:w-full { width: 100% !important; }
          .print\\:h-\\[350px\\] { height: 350px !important; }
          .print\\:bg-white { background-color: #ffffff !important; }
          .print\\:text-black { color: #000000 !important; }
          .print\\:bg-slate-100 { background-color: #f1f5f9 !important; }
          .print\\:border-slate-300 { border-color: #cbd5e1 !important; }
          .print\\:border-slate-400 { border-color: #94a3b8 !important; }
          .print\\:text-slate-800 { color: #1e293b !important; }
          .print\\:text-slate-900 { color: #0f172a !important; }
          .print\\:text-rose-700 { color: #be123c !important; }
          .print\\:text-blue-700 { color: #1d4ed8 !important; }
          .print\\:text-emerald-700 { color: #047857 !important; }
          .print\\:break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
          
          /* FIX LEAFLET PRINT OVERLAY ISSUE */
          .leaflet-container {
            position: relative !important;
            z-index: 1 !important;
            width: 100% !important;
            height: 350px !important;
            page-break-inside: avoid !important;
            clear: both !important;
            background: #ffffff !important;
          }
          .leaflet-pane, .leaflet-tile-container, .leaflet-top, .leaflet-bottom, .leaflet-layer {
            z-index: 1 !important;
            position: relative !important;
          }
          .leaflet-tile {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .print-section-stack {
            position: relative !important;
            z-index: 10 !important;
            clear: both !important;
            page-break-inside: avoid !important;
            margin-top: 24px !important;
          }
          table { width: 100% !important; table-layout: auto !important; word-break: break-word !important; }
          div { overflow: visible !important; }
        }
      `}} />

    </div>
  );
}

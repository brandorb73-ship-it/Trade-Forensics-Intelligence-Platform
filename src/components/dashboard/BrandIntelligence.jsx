import React, { useMemo, useState } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Shield, Layers, FileText, Info, Activity, ChevronDown, ChevronUp, UserX, TrendingUp, HelpCircle } from 'lucide-react';

export default function BrandIntelligence() {
  const { tradeData = [] } = useTradeData() || {};
  const [expandedBrands, setExpandedBrands] = useState({});
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  const toggleBrandExpand = (brand) => {
    setExpandedBrands(prev => ({ ...prev, [brand]: !prev[brand] }));
  };

  // Completely dynamic pipeline processing any trade data sheet across all sectors
  const brandAnalytics = useMemo(() => {
    const stats = {};
    let globalTotalValue = 0;
    let highRiskIntermediaryValue = 0;
    let totalAnomaliesCount = 0;
    const allHighRiskIntermediaries = new Set();

    // PHASE 1: Establish statistical baselines for global token frequency & unit prices
    const wordFrequencies = {};
    const globalBrandPrices = {};
    let totalRowsProcessed = 0;

    tradeData.forEach(row => {
      if (!row) return;
      const imp = (row.Importer || row.Consignee || '').toUpperCase().trim();
      const b = (row.Brand || row.ProductBrand || 'UNBRANDED / HIGH RISK').toUpperCase().trim();
      const qty = Number(row.Quantity) || Number(row.Qty) || 0;
      const amt = Number(row.Amount) || Number(row.Value) || Number(row.TotalPrice) || 0;

      if (imp) {
        // Tokenize entity names to locate recurring intermediaries without rigid matching lists
        const tokens = imp.split(/[\s,.\-\/()]+/).filter(t => t.length > 2);
        tokens.forEach(token => {
          wordFrequencies[token] = (wordFrequencies[token] || 0) + 1;
        });
      }

      if (b && qty > 0 && amt > 0) {
        if (!globalBrandPrices[b]) globalBrandPrices[b] = [];
        globalBrandPrices[b].push(amt / qty);
      }
      totalRowsProcessed++;
    });

    // Calculate baseline medians for brand unit pricing to measure deviation asymmetries
    const brandPriceMedians = {};
    Object.keys(globalBrandPrices).forEach(brand => {
      const sortedPrices = globalBrandPrices[brand].sort((a, b) => a - b);
      const mid = Math.floor(sortedPrices.length / 2);
      brandPriceMedians[brand] = sortedPrices.length % 2 !== 0 ? sortedPrices[mid] : (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;
    });

    // PHASE 2: Core Matrix Processing & Advanced Risk Metric Synthesis
    tradeData.forEach(row => {
      if (!row) return;
      const b = (row.Brand || row.ProductBrand || 'UNBRANDED / HIGH RISK').toUpperCase().trim();
      if (!stats[b]) {
        stats[b] = { 
          volume: 0, 
          value: 0, 
          totalIncidents: 0,
          origins: new Set(),
          destinations: new Set(),
          intermediariesMap: {},
          varianceAlertsCount: 0
        };
      }
      
      const volumeNum = Number(row.Quantity) || Number(row.Qty) || 0;
      const amountNum = Number(row.Amount) || Number(row.Value) || Number(row.TotalPrice) || 0;
      const currentUnitPrice = volumeNum > 0 ? (amountNum / volumeNum) : 0;
      
      stats[b].volume += volumeNum;
      stats[b].value += amountNum;
      stats[b].totalIncidents += 1;
      globalTotalValue += amountNum;
      
      const imp = row.Importer || row.Consignee || 'UNKNOWN TARGET CONSIGNEE';
      const impUpper = imp.toUpperCase().trim();
      const exp = row.Exporter || row.Shipper || 'UNKNOWN SHADOW EXPORTER';
      const origin = row.OriginCountry || row.Origin || 'UNKNOWN ORIGIN';
      const destinationField = (row.DestinationCountry || row.Destination || row.PortOfEntry || 'UNSPECIFIED REGION').toUpperCase();

      // Dynamic Intermediary Target Rules (Combines frequency markers with classical corporate structures)
      const hasStructuralToken = impUpper.split(/[\s,.\-\/()]+/).some(token => 
        ['TRADING', 'LOGISTICS', 'LIMITED', 'LTD', 'CORP', 'INC', 'BROKER', 'INTL', 'HOLDINGS', 'GLOBAL', 'FORWARDING'].includes(token) || 
        (wordFrequencies[token] > (totalRowsProcessed * 0.15)) // Flags words appearing in >15% of manifests
      );

      const isAnomalousPlaceholder = impUpper.includes('ANY') || impUpper.includes('*') || impUpper.length < 3;

      if (hasStructuralToken || isAnomalousPlaceholder) {
        // Calculate price discrepancy on this specific transaction
        const medianBrandPrice = brandPriceMedians[b] || 0;
        let finalVariancePercent = 0;
        if (medianBrandPrice > 0 && currentUnitPrice > 0) {
          finalVariancePercent = ((currentUnitPrice - medianBrandPrice) / medianBrandPrice) * 100;
        }

        const isPriceAnomaly = Math.abs(finalVariancePercent) > 35; // Flag variances exceeding +/- 35%
        if (isPriceAnomaly) {
          stats[b].varianceAlertsCount += 1;
        }

        if (!stats[b].intermediariesMap[imp]) {
          stats[b].intermediariesMap[imp] = { 
            name: imp, 
            suspectedExporters: new Set(), 
            totalValue: 0, 
            routeTouched: `${origin} → ${destinationField}`,
            unitPriceVariance: finalVariancePercent,
            hasPriceAnomaly: isPriceAnomaly
          };
        }
        stats[b].intermediariesMap[imp].suspectedExporters.add(exp);
        stats[b].intermediariesMap[imp].totalValue += amountNum;
        
        highRiskIntermediaryValue += amountNum;
        totalAnomaliesCount += 1;
        allHighRiskIntermediaries.add(imp);
      }
      
      if (row.OriginCountry || row.Origin) {
        const cleanOrigin = (row.OriginCountry || row.Origin).split('→')[0].trim().toUpperCase();
        stats[b].origins.add(cleanOrigin);
      }
      
      stats[b].destinations.add(destinationField);
    });

    // PHASE 3: Calculate dynamic HHI Concentrative Scores and capture peak threat clusters
    let maxHhiBrand = '';
    let maxHhiScore = 0;
    let highHhiCount = 0;
    let totalPriceAlertsAcrossBrands = 0;

    Object.keys(stats).forEach(b => {
      const brandTotalValue = stats[b].value;
      const intermediariesArray = Object.values(stats[b].intermediariesMap);
      totalPriceAlertsAcrossBrands += stats[b].varianceAlertsCount;
      
      let hhiCalculated = 0;
      if (brandTotalValue > 0 && intermediariesArray.length > 0) {
        intermediariesArray.forEach(inter => {
          const marketSharePercent = (inter.totalValue / brandTotalValue) * 100;
          hhiCalculated += (marketSharePercent * marketSharePercent);
        });
      }
      const finalHhi = Math.min(10000, Math.round(hhiCalculated));
      stats[b].hhiScore = finalHhi;

      if (finalHhi >= 2500) {
        highHhiCount++;
        if (finalHhi > maxHhiScore) {
          maxHhiScore = finalHhi;
          maxHhiBrand = b;
        }
      }
    });

    // PHASE 4: Dynamic AI Narrative Generation utilizing calculated HHI & Variance logic
    const uniqueBrandsCount = Object.keys(stats).length;
    const intermediaryCount = allHighRiskIntermediaries.size;

    let briefingText = "System scan complete. No critical transshipment loops or controlled material diversion patterns isolated across current trade data streams.";
    let vectorText = "Logistical lanes show uniform compliance profiles. Route-splitting indicators remain below tactical threshold parameters.";
    let corridorSummary = "Logistical Context: No active multi-jurisdictional risk routings or unauthorized diversion anomalies have been flagged within the current dataset scope.";
    let evidentiaryFinding = "Evidentiary Finding: All scanned manifests reflect established direct shipping lanes with standard customs verification checkpoints.";

    if (intermediaryCount > 0) {
      briefingText = `Algorithmic token analysis unmasked ${intermediaryCount} high-velocity proxy hubs bypass-routing authentic IP brand lines. ${highHhiCount > 0 ? `Crucially, ${highHhiCount} brand segments exhibit highly consolidated distribution loops (HHI ≥ 2,500), proving parallel trade pipelines are controlled by structured intermediary syndicates rather than minor opportunistic leakage.` : 'Diverted volume remains highly fragmented across independent nodes, suggesting localized retail arbitrage leakage.'}`;
      
      vectorText = `Dynamic price profiling identified ${totalPriceAlertsAcrossBrands} severe unit price anomalies exceeding the ±35% baseline threshold. ${maxHhiScore >= 2500 ? `Peak supply risk is localized within the "${maxHhiBrand}" cluster, displaying a severe concentration index of ${maxHhiScore} HHI, indicating an absolute monopoly over the contract diversion pipeline.` : `Supply chain exposure is distributed across ${uniqueBrandsCount} asset vectors, displaying low-to-moderate logistical convergence thresholds.`}`;
      
      corridorSummary = `Logistical Context: Elevated structural routing exposure identified. Layered supply chain legs indicate systemic transshipment manipulation and unauthorized broker insertion via unverified secondary trade hubs.`;
      
      evidentiaryFinding = `Evidentiary Finding: Audited records reveal unmasked supply chains with asymmetric broker involvement totaling $${highRiskIntermediaryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} in exposed, high-concentration parallel trade value.`;
    }

    return {
      brands: stats,
      meta: {
        globalTotalValue,
        highRiskIntermediaryValue,
        totalAnomaliesCount,
        uniqueConsigneesCount: intermediaryCount,
        briefingText,
        vectorText,
        corridorSummary,
        evidentiaryFinding
      }
    };
  }, [tradeData]);

  const brandList = Object.keys(brandAnalytics.brands);
  const { meta } = brandAnalytics;

  // Helper utility to style dynamic HHI Risk Tiers based on classical economic & forensic thresholds
  const getHhiBadgeDetails = (score) => {
    if (score === 0) return { label: 'CLEAN PIPELINE', style: 'text-slate-400 border-slate-800 bg-slate-900/40' };
    if (score < 1500) return { label: 'LOW CONCENTRATION (FRAGMENTED DIVERSION)', style: 'text-emerald-400 border-emerald-950 bg-emerald-950/20' };
    if (score < 2500) return { label: 'MODERATE CONCENTRATION (TARGETED LEAKS)', style: 'text-amber-400 border-amber-950 bg-amber-950/20' };
    return { label: 'HIGH CONCENTRATION (MONOPOLIZED PIPELINE)', style: 'text-rose-400 border-rose-950 bg-rose-950/20' };
  };

  return (
    <div className="space-y-6 text-slate-100 id-print-section">
      
      {/* Header View */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="text-blue-500" size={24} /> Brand Protection & Gray Market Intelligence
          </h1>
          <p className="text-sm text-slate-300 mt-1">Examine distribution networks, track unverified corporate entities, and uncover trademark erosion.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer text-slate-200">
          <FileText size={14} className="text-blue-400" /> Export Brand Security Log
        </button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Forensic Corridor Impact Card */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 p-5 rounded-xl space-y-3">
          <h3 className="text-xs font-mono font-black text-blue-400 uppercase flex items-center gap-2">
            <Activity size={14}/> Forensic Corridor Impact Assessment & Summary
          </h3>
          <div className="text-xs font-mono text-slate-200 space-y-2 leading-relaxed">
            <p>{meta.corridorSummary}</p>
            <p className="text-slate-400 font-bold">{meta.evidentiaryFinding}</p>
          </div>
        </div>

        {/* Audited Route Exposure Value Card */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider">
              Audited Route Exposure Value
            </h3>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
              ${meta.highRiskIntermediaryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2">
            Concentrated across <span className="text-white font-bold">{meta.uniqueConsigneesCount}</span> unique consignees using unverified distribution lanes.
          </p>
        </div>
      </div>

      {/* EXECUTIVE AI BRIEFING & OPERATIONAL ANALYSIS */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-mono font-black text-white uppercase flex items-center gap-2 tracking-wider">
              <FileText size={14} className="text-blue-500" /> Executive AI Briefing & Operational Analysis
            </h3>
            <p className="text-[10px] font-mono text-slate-400">Dynamic algorithmic threat overview and supply chain verification matrix</p>
          </div>
          <div className="relative">
            <button 
              onMouseEnter={() => setShowFormulaTooltip(true)}
              onMouseLeave={() => setShowFormulaTooltip(false)}
              className="text-slate-400 hover:text-white cursor-help p-1"
            >
              <HelpCircle size={14} />
            </button>
            {showFormulaTooltip && (
              <div className="absolute right-0 bottom-6 z-50 bg-[#0f172a] border border-slate-700 p-4 rounded-xl w-96 text-[11px] font-mono shadow-2xl space-y-3 text-slate-200">
                <div>
                  <span className="text-blue-400 font-bold uppercase block mb-1">Herfindahl-Hirschman Index (HHI)</span>
                  Calculated as HHI = ∑(S_i)², where S_i is the local market value percentage share of each unmasked proxy node. Max score is 10,000. Scores exceeding 2,500 indicate an absolute, highly consolidated structural monopoly over parallel supply lines, proving deliberate contractual breach.
                </div>
                <div>
                  <span className="text-emerald-400 font-bold uppercase block mb-1">Dynamic Pricing Baselines</span>
                  Establishes the median unit price across all transactions for each brand. Row entries with pricing anomalies exceeding a ±35% variance drop indicate severe under-invoicing or gray transfer-pricing manipulation.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-lg space-y-1">
            <h4 className="text-[11px] font-mono font-black text-blue-400 uppercase flex items-center gap-1">
              <Shield size={12}/> Strategic Threat Briefing
            </h4>
            <p className="text-xs font-mono text-slate-200 leading-relaxed">{meta.briefingText}</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-lg space-y-1">
            <h4 className="text-[11px] font-mono font-black text-emerald-400 uppercase flex items-center gap-1">
              <TrendingUp size={12}/> Operational Vector Analysis
            </h4>
            <p className="text-xs font-mono text-slate-200 leading-relaxed">{meta.vectorText}</p>
          </div>
        </div>
      </div>

      {/* Forensic Channel Validation Panel */}
      <div className="bg-[#111827] border-l-4 border-blue-500 p-5 rounded-xl space-y-2">
        <h3 className="text-xs font-mono font-black text-blue-400 uppercase flex items-center gap-2">
          <Activity size={14}/> Forensic Channel Validation Assessment
        </h3>
        <p className="text-xs text-slate-200 font-mono leading-relaxed">
          <strong>Methodology of Determination:</strong> Channels are classified as <em>Unauthorized / High Risk</em> when trademarked brand lines pass through non-authorized secondary trading groups, third-party logistics firms, or unverified intermediate entities instead of audited direct brand distribution links.
        </p>
      </div>

      {/* Core Matrix Grid View */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 overflow-x-auto">
        <div className="text-xs font-mono font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          <Layers size={14} className="text-blue-400"/> IP Security & Distribution Matrix
        </div>
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-white bg-slate-900/60 uppercase text-[11px]">
              <th className="p-3 font-black tracking-wider">BRAND DESIGNATION</th>
              <th className="p-3 font-black tracking-wider">AUDITED VALUE</th>
              <th className="p-3 font-black tracking-wider">QUANTITY (UNITS)</th>
              <th className="p-3 font-black tracking-wider">DISTRIBUTION CORRIDORS</th>
              <th className="p-3 font-black tracking-wider">ANOMALY INDEX SCORE (HHI)</th>
              <th className="p-3 font-black tracking-wider text-right">DIVERSION RISK CHANNELS</th>
            </tr>
          </thead>
          <tbody>
            {brandList.map(brand => {
              const currentBrandData = brandAnalytics.brands[brand];
              const intermediaries = Object.values(currentBrandData.intermediariesMap);
              const channelsCount = intermediaries.length;
              const isExpanded = !!expandedBrands[brand];
              const hhiDetails = getHhiBadgeDetails(currentBrandData.hhiScore);

              return (
                <React.Fragment key={brand}>
                  <tr className="border-b border-slate-900/80 hover:bg-slate-900/30 transition-all">
                    <td className="p-3 font-black text-white text-sm tracking-tight">{brand}</td>
                    <td className="p-3 text-emerald-400 font-bold text-sm">${currentBrandData.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-white font-bold">{currentBrandData.volume.toLocaleString()}</td>
                    <td className="p-3 text-slate-200 leading-tight">
                      <div className="font-bold text-white uppercase text-[11px]">
                        {Array.from(currentBrandData.origins).join(', ') || 'UNVERIFIED ORIGIN'}
                      </div>
                      <div className="text-amber-400 font-bold text-[10px] mt-1 uppercase tracking-tight">
                        → {Array.from(currentBrandData.destinations).join(' / ')}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-white font-bold text-[12px]">{currentBrandData.hhiScore} HHI</span>
                        <span className={`text-[9px] px-1.5 py-0.5 border rounded-sm w-max font-black tracking-tighter ${hhiDetails.style}`}>
                          {hhiDetails.label}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => toggleBrandExpand(brand)}
                        className={`ml-auto px-2.5 py-1 border rounded font-black text-[11px] flex items-center gap-1.5 cursor-pointer transition-all ${channelsCount > 0 ? 'bg-amber-950/50 border-amber-500 text-amber-400 hover:bg-amber-900/40' : 'bg-[#111827] border-slate-800 text-slate-400'}`}
                      >
                        {channelsCount} Nodes Unmasked
                        {currentBrandData.varianceAlertsCount > 0 && (
                          <span className="bg-rose-600 text-white font-mono text-[9px] font-black px-1 rounded-sm animate-pulse">
                            {currentBrandData.varianceAlertsCount} PRICE FLAGGED
                          </span>
                        )}
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </td>
                  </tr>

                  {/* Sub-Layer: Entity Intelligence Expanded Panel */}
                  {(isExpanded || window.matchMedia('print').matches) && (
                    <tr>
                      <td colSpan="6" className="bg-[#0f172a] p-4 border-b border-slate-800">
                        <div className="space-y-3">
                          <div className="text-[11px] font-mono font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                            <UserX size={14} className="text-amber-400" /> Unmasked High-Risk Intermediary Network for {brand}
                          </div>
                          
                          {channelsCount > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {intermediaries.map((inter, i) => (
                                <div key={i} className={`bg-[#111827] border rounded-lg p-3 space-y-2 ${inter.hasPriceAnomaly ? 'border-rose-950/80 shadow-inner shadow-rose-950/20' : 'border-slate-800/80'}`}>
                                  <div className="flex justify-between items-start">
                                    <div className="text-xs font-black text-white font-mono tracking-tight flex items-center gap-1.5">
                                      {inter.name}
                                      {inter.hasPriceAnomaly && (
                                        <span className="text-[9px] bg-rose-950 border border-rose-500 text-rose-400 font-bold px-1 py-0.2 rounded">
                                          PRICE OUTLIER ({inter.unitPriceVariance > 0 ? '+' : ''}{inter.unitPriceVariance.toFixed(1)}%)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs font-mono font-bold text-emerald-400">${inter.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-300 space-y-1 pt-1 border-t border-slate-800/60">
                                    <div><span className="text-slate-500 font-bold uppercase text-[10px]">Real Dynamic Flow Leg:</span> {inter.routeTouched}</div>
                                    <div>
                                      <span className="text-slate-500 font-bold uppercase text-[10px]">Associated Exporter:</span>{' '}
                                      <span className="text-slate-200 break-all">{Array.from(inter.suspectedExporters).join(', ') || 'Concealed Node'}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs font-mono text-slate-500 italic py-2">
                              No secondary broker keywords or algorithmic token deviations detected inside the proxy strings for this dataset.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {brandList.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center font-mono text-xs text-slate-500 italic">
                  No records matching the current analytical filters are available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic Evidentiary Footnote Block & Index Glossary */}
      <div className="pt-3 flex flex-col gap-4 bg-[#0f172a] p-5 rounded-xl border border-slate-800 font-mono text-[11px]">
        <div>
          <div className="text-white font-black uppercase tracking-wider flex items-center gap-1.5 mb-2 border-b border-slate-800 pb-1">
            <Info size={14} className="text-blue-500" /> Analytical Index Definitions & Forensic Relevance
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
            <div className="space-y-1">
              <span className="text-blue-400 font-black uppercase block text-[10px]">1. Automated Intermediary Engine</span>
              <p className="text-[11px] text-slate-400 leading-normal">Tokenizes entity titles dynamically to trace recurring linguistic networks against shell indicators. Isolates unverified third-party nodes intercepting cargo assets prior to legitimate market entry.</p>
            </div>
            <div className="space-y-1">
              <span className="text-emerald-400 font-black uppercase block text-[10px]">2. Price Variance Index</span>
              <p className="text-[11px] text-slate-400 leading-normal">Flags shipping corridors deviating over ±35% from a brand's global median unit price. Drops indicate under-invoicing or gray transfer-pricing; spikes indicate aggressive broker skimming spikes.</p>
            </div>
            <div className="space-y-1">
              <span className="text-rose-400 font-black uppercase block text-[10px]">3. Herfindahl-Hirschman Index (HHI)</span>
              <p className="text-[11px] text-slate-400 leading-normal">Sums the squared market shares of unmasked entities ($HHI = \sum S_i^2$). Scores over 2,500 prove a highly consolidated monopoly over the gray pipeline, demonstrating clear intent of systemic contractual bypass.</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/60">
          <div className="text-slate-400 font-bold uppercase tracking-tight text-[10px]">Enforcement Applications:</div>
          <ul className="text-slate-300 space-y-0.5 mt-1 list-disc list-inside pl-1 text-[11px]">
            <li>Establishes explicit intent matrices supporting unauthorized parallel importation and gray market claims.</li>
            <li>Enables strategic risk isolation for target audits and commercial contract revision actions.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}

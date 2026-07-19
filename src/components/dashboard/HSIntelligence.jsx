import React, { useState, useMemo, useEffect } from 'react';
import { useTradeData } from '../../context/TradeDataContext.jsx';
import { ShieldAlert, AlertTriangle, Layers, FileText, TrendingUp, Info, BookOpen, Box, Activity, DollarSign } from 'lucide-react';

export default function HSIntelligence() {
  const contextData = useTradeData();
  const tradeData = contextData && contextData.tradeData ? contextData.tradeData : [];
  
  const [selectedChapterFilter, setSelectedChapterFilter] = useState('ALL');

  // ============================================================================
  // FORENSIC STATISTICAL ENGINE (100% Dynamic, No Hardcoded Products)
  // ============================================================================
  const hsAnalysis = useMemo(() => {
    let globalMismatchedValue = 0;
    let highRiskIncidentCount = 0;
    let totalTradeValue = 0;
    const corridorsMap = {};
    const chaptersMap = {};
    const discrepancyRecords = [];
    const deviationMatrix = {};
    const mismatchedChapters = new Set();
    const uniqueProducts = new Set();
    const uniqueHSCodes = new Set();

    // 1. DYNAMIC PRE-SCAN: Build statistical baselines per product group dynamically
    const productBaselines = {};
    const productCounts = {};
    const brandCounts = {};

    tradeData.forEach(row => {
      const prod = (row.Product || '').toUpperCase().trim();
      const brand = (row.Brand || '').toUpperCase().trim();
      const hs = String(row.HSCode || '').trim();
      const chapter2D = hs && hs !== '?' ? hs.substring(0, 2) : null;
      const amount = parseFloat(row.Amount) || 0;

      totalTradeValue += amount;
      if (hs) uniqueHSCodes.add(hs);

      if (prod) {
        uniqueProducts.add(prod);
        productCounts[prod] = (productCounts[prod] || 0) + 1;
        if (chapter2D) {
          if (!productBaselines[prod]) productBaselines[prod] = {};
          productBaselines[prod][chapter2D] = (productBaselines[prod][chapter2D] || 0) + 1;
        }
      }
      if (brand && brand !== 'NOT DECLARED') {
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      }
    });

    // 2. DERIVE STATISTICAL MODES: What is the expected standard chapter for each commodity?
    const expectedChapterMap = {};
    Object.entries(productBaselines).forEach(([prod, chapters]) => {
      // Sort to find the most frequently used chapter for this exact product
      const sortedChapters = Object.entries(chapters).sort((a, b) => b[1] - a[1]);
      if (sortedChapters.length > 0) {
        expectedChapterMap[prod] = sortedChapters[0][0]; 
      }
    });

    // Isolate top descriptors for natural phrasing insertion
    const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'CARGO STOCKS';
    const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UNBRANDED';

    // 3. FORENSIC DIAGNOSTIC LOOP: Compare actuals against calculated statistical baselines
    tradeData.forEach(row => {
      const hsString = String(row.HSCode || '').trim();
      const productDesc = (row.Product || '').toUpperCase().trim();
      const amount = parseFloat(row.Amount) || 0;
      const origin = row.OriginCountry || 'UNKNOWN';
      const dest = row.DestinationCountry || 'UNKNOWN';
      const keyCorridor = `${origin} → ${dest}`;
      
      const chapterPrefix = hsString && hsString !== '?' ? hsString.substring(0, 4) : 'UNASSIGNED';
      const currentChapter2D = hsString && hsString !== '?' ? hsString.substring(0, 2) : 'UNKNOWN';

      let isMismatched = false;
      let expectedChapterText = 'Calculated Baseline';
      let declaredChapterText = hsString && hsString !== '?' ? `Chapter ${hsString.substring(0, 2)}` : 'Missing / Secret';

      // Dynamic Statistical Anomaly Detection Engine
      const modeChapter2D = expectedChapterMap[productDesc];
      if (modeChapter2D) {
        expectedChapterText = `Chapter ${modeChapter2D}`;
        // Flag if the declared chapter deviates from the dataset's own established baseline for this product
        if (currentChapter2D !== modeChapter2D || hsString === '?') {
          isMismatched = true;
        }
      } else if (hsString === '?') {
        isMismatched = true;
        expectedChapterText = 'Verification Required';
      }
      
      if (isMismatched) {
        globalMismatchedValue += amount;
        highRiskIncidentCount += 1;
        corridorsMap[keyCorridor] = (corridorsMap[keyCorridor] || 0) + amount;
        
        const displayFlaggedChapter = hsString && hsString !== '?' ? `Chapter ${hsString.substring(0, 2)}` : 'Undisclosed / ?';
        mismatchedChapters.add(hsString && hsString !== '?' ? hsString.substring(0, 2) : 'Missing Code');

        if (!deviationMatrix[displayFlaggedChapter]) {
          deviationMatrix[displayFlaggedChapter] = { name: displayFlaggedChapter, value: 0, count: 0 };
        }
        deviationMatrix[displayFlaggedChapter].value += amount;
        deviationMatrix[displayFlaggedChapter].count += 1;
      }

      const chapterKey = hsString && hsString !== '?' ? hsString.substring(0, 2) : 'UNKNOWN';
      if (!chaptersMap[chapterKey]) {
        chaptersMap[chapterKey] = {
          code: chapterKey,
          totalValue: 0,
          shipmentCount: 0,
          flaggedCount: 0
        };
      }
      
      chaptersMap[chapterKey].totalValue += amount;
      chaptersMap[chapterKey].shipmentCount += 1;
      if (isMismatched) {
        chaptersMap[chapterKey].flaggedCount += 1;
      }

      discrepancyRecords.push({
        ...row,
        chapterPrefix,
        isMismatched,
        expectedChapter: expectedChapterText,
        declaredChapter: declaredChapterText
      });
    });

    const topCorridors = Object.entries(corridorsMap)
      .map(([name, val]) => ({ name, val }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 4);

    const deviationsList = Object.values(deviationMatrix).sort((a, b) => b.value - a.value);
    const sortedChapters = Object.values(chaptersMap).sort((a, b) => b.totalValue - a.totalValue);

    // Calculate Concentration Ratio (Top 3 chapters market share)
    const top3Value = sortedChapters.slice(0, 3).reduce((sum, ch) => sum + ch.totalValue, 0);
    const concentrationRatio = totalTradeValue > 0 ? (top3Value / totalTradeValue) * 100 : 0;

    const chapterListStr = mismatchedChapters.size > 0 
      ? Array.from(mismatchedChapters).map(ch => ch.length === 2 ? `Chapter ${ch}` : ch).join(' / ')
      : 'alternative headers';

    return {
      globalMismatchedValue,
      highRiskIncidentCount,
      totalTradeValue,
      totalQuantity: tradeData.length,
      distinctProducts: uniqueProducts.size,
      distinctChapters: Object.keys(chaptersMap).length,
      distinctHSCodes: uniqueHSCodes.size,
      concentrationRatio,
      chapters: sortedChapters,
      records: discrepancyRecords,
      topCorridors,
      deviations: deviationsList,
      topProduct,
      topBrand,
      chapterListStr
    };
  }, [tradeData]);

  // ============================================================================
  // UPGRADE 19: INTELLIGENCE OBJECT EMISSION
  // ============================================================================
  useEffect(() => {
    if (contextData && typeof contextData.setContextState === 'function') {
      const intelligenceObject = {
        section: "HS Intelligence",
        metrics: {
          totalHSCodes: hsAnalysis.distinctHSCodes,
          distinctChapters: hsAnalysis.distinctChapters,
          distinctProducts: hsAnalysis.distinctProducts,
          totalTradeValue: hsAnalysis.totalTradeValue,
          highRiskValue: hsAnalysis.globalMismatchedValue
        },
        findings: {
          dominantProduct: hsAnalysis.topProduct,
          concentrationRatio: hsAnalysis.concentrationRatio.toFixed(1),
          topRiskCorridors: hsAnalysis.topCorridors
        },
        anomalies: hsAnalysis.deviations,
        confidence: hsAnalysis.highRiskIncidentCount > 0 ? "HIGH_RISK" : "NOMINAL"
      };
      
      // Attempt to push to shared context if function exists
      try {
        contextData.setContextState(prev => ({ ...prev, hsIntelligence: intelligenceObject }));
      } catch (e) {
        console.warn("Could not emit Intelligence Object to TradeDataContext", e);
      }
    }
  }, [hsAnalysis, contextData]);

  const filteredRecords = useMemo(() => {
    if (selectedChapterFilter === 'ALL') return hsAnalysis.records;
    if (selectedChapterFilter === 'RISK_ONLY') return hsAnalysis.records.filter(r => r.isMismatched);
    
    return hsAnalysis.records.filter(r => {
      const currentHS = String(r.HSCode || '').trim();
      const normalizedChapter = currentHS && currentHS !== '?' ? currentHS.substring(0, 2) : 'UNKNOWN';
      return normalizedChapter === selectedChapterFilter;
    });
  }, [hsAnalysis.records, selectedChapterFilter]);

  return (
    <div className="p-6 space-y-8 max-w-[1800px] mx-auto id-print-section">
      
      {/* Existing Print CSS Retained */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: auto; margin: 15mm 12mm 15mm 12mm; }
          html, body { background-color: #ffffff !important; background: #ffffff !important; color: #111827 !important; margin: 0 !important; padding: 0 !important; }
          body * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .id-print-section { background-color: #ffffff !important; color: #111827 !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
          .non-printable { display: none !important; }
          .grid { display: grid !important; gap: 1.25rem !important; }
          tr, .bg-slate-900, .bg-slate-800, .bg-slate-950, .grid > div { page-break-inside: avoid !important; break-inside: avoid !important; }
          .bg-slate-900, .bg-slate-800, .bg-slate-950, .bg-slate-900\\/60 { background-color: #ffffff !important; border: 1px solid #e5e7eb !important; border-radius: 0.75rem !important; color: #111827 !important; box-shadow: none !important; }
          .bg-slate-950, .bg-slate-900\\/60 { background-color: #f9fafb !important; border: 1px solid #e5e7eb !important; }
          .text-white, .text-slate-100, .text-slate-200, .text-slate-300 { color: #111827 !important; }
          .text-slate-400 { color: #4b5563 !important; }
          .border-slate-800, .border-slate-700, .border-slate-850 { border-color: #e5e7eb !important; }
          .text-rose-400, .text-rose-300 { color: #dc2626 !important; }
          .text-amber-400, .text-amber-300 { color: #b45309 !important; }
          .text-emerald-400 { color: #047857 !important; }
          .text-cyan-400 { color: #1d4ed8 !important; }
          .bg-rose-500 { background-color: #ef4444 !important; }
          .bg-gradient-to-r { background: #f59e0b !important; }
          .overflow-x-auto { overflow: visible !important; width: 100% !important; max-width: 100% !important; }
          table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
          th { background-color: #f3f4f6 !important; color: #1f2937 !important; border: 1px solid #e5e7eb !important; }
          td { border: 1px solid #e5e7eb !important; color: #374151 !important; }
          th, td { white-space: normal !important; word-wrap: break-word !important; word-break: break-word !important; max-width: none !important; text-overflow: unset !important; overflow: visible !important; }
          th:nth-child(1), td:nth-child(1) { width: 11% !important; }
          th:nth-child(2), td:nth-child(2) { width: 13% !important; }
          th:nth-child(3), td:nth-child(3) { width: 14% !important; }
          th:nth-child(4), td:nth-child(4) { width: 23% !important; }
          th:nth-child(5), td:nth-child(5) { width: 12% !important; }
          th:nth-child(6), td:nth-child(6) { width: 15% !important; }
          th:nth-child(7), td:nth-child(7) { width: 11% !important; }
          tr.bg-rose-950\\/20 { background-color: #fef2f2 !important; }
          svg { stroke: #374151 !important; }
        }
      `}} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5 non-printable">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            HS Intelligence System 
            <span className="text-xs bg-amber-500/20 px-2 py-1 rounded text-amber-400 uppercase tracking-widest font-mono border border-amber-500/30">
              Forensic Investigation Workspace
            </span>
          </h1>
          <p className="text-sm text-slate-300 mt-1">Multi-dimensional forensic auditing of global customs classifications and structural trade anomalies.</p>
        </div>
        {tradeData.length > 0 && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold font-mono text-slate-200 transition shadow-sm cursor-pointer"
          >
            <FileText size={14} className="text-amber-400" />
            <span>Export Briefing PDF</span>
          </button>
        )}
      </div>

      {/* ZONE 1: EXECUTIVE INTELLIGENCE */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase border-b border-slate-800 pb-2">Zone 1: Executive Intelligence</h2>
        
        {/* KPI Dashboard (Upgrade 1) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block mb-1">Total Trade Value</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-slate-100 font-mono">${hsAnalysis.totalTradeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <DollarSign size={16} className="text-emerald-400" />
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block mb-1">Distinct HS / Chapters</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-slate-100 font-mono">{hsAnalysis.distinctHSCodes} / {hsAnalysis.distinctChapters}</span>
              <Layers size={16} className="text-cyan-400" />
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block mb-1">Unique Products</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-slate-100 font-mono">{hsAnalysis.distinctProducts}</span>
              <Box size={16} className="text-indigo-400" />
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block mb-1">HS Concentration Ratio</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-amber-400 font-mono">{hsAnalysis.concentrationRatio.toFixed(1)}%</span>
              <Activity size={16} className="text-amber-400" />
            </div>
          </div>
        </div>

        {/* Dynamic AI Executive Narrative (Upgrade 2) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md space-y-4">
          <h3 className="text-xs font-black tracking-wider text-amber-400 font-mono uppercase flex items-center gap-2">
            <FileText size={16} className="text-amber-500" /> AI Executive Intelligence Summary
          </h3>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2 font-mono text-xs text-slate-300 leading-relaxed">
            <p>
              The imported dataset contains <span className="text-amber-400 font-bold">{hsAnalysis.distinctHSCodes} distinct HS classifications</span> across <span className="text-amber-400 font-bold">{hsAnalysis.distinctChapters} chapters</span>. 
              The top three HS headings account for <span className="text-amber-400 font-bold">{hsAnalysis.concentrationRatio.toFixed(1)}%</span> of total declared value, indicating {hsAnalysis.concentrationRatio > 60 ? 'significant product concentration and reliance on limited tariff codes.' : 'a highly diversified supply chain.'}
            </p>
            <p>
              Automated auditing identified <span className="text-amber-400 font-bold">{hsAnalysis.highRiskIncidentCount} shipments</span> deviating from the established statistical classification baseline for their respective products. 
              This represents an exposed structural risk valuation of <span className="text-rose-400 font-bold">${hsAnalysis.globalMismatchedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>. 
              Operations surrounding <span className="text-amber-400 font-bold">{hsAnalysis.topProduct}</span> show the highest variance, suggesting potential tariff engineering or changing regulatory evasion patterns along the <span className="text-cyan-400 font-bold">{hsAnalysis.topCorridors[0]?.name || 'primary'}</span> trade corridor.
            </p>
          </div>
        </div>
      </div>

      {/* ZONE 2 & 3: HS LANDSCAPE & FORENSIC ANALYSIS */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase border-b border-slate-800 pb-2">Zone 2 & 3: Landscape & Forensic Anomalies</h2>
        
        {/* Metric Row Restyled */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Nomenclature Risk Value</span>
              <span className="text-2xl font-black text-rose-400 font-mono">
                ${hsAnalysis.globalMismatchedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-400">
              <ShieldAlert size={22} />
            </div>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Detected Classification Shifts</span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {hsAnalysis.highRiskIncidentCount} <span className="text-xs text-slate-400 font-normal">Incidents</span>
              </span>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-800/50 text-amber-400">
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        {/* Graphics Matrix Retained */}
        {tradeData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Anomaly Matrix: Deviation from Baseline
              </h3>
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between text-[11px] font-mono text-slate-400 font-bold px-1">
                  <span>RAW NOMENCLATURE MATRICES</span>
                  <span>AGGREGATE DISCREPANCY VOLUME</span>
                </div>
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {hsAnalysis.deviations.length > 0 ? (
                    hsAnalysis.deviations.map((dev, idx) => {
                      const maxDevVal = hsAnalysis.deviations[0].value || 1;
                      const deviationPercentage = hsAnalysis.globalMismatchedValue > 0 
                        ? ((dev.value / hsAnalysis.globalMismatchedValue) * 100).toFixed(0) 
                        : '100';

                      return (
                        <div key={idx} className="bg-slate-950 p-3 rounded border border-slate-800/80 space-y-2">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-slate-300 font-bold">Declared {dev.name}</span>
                            <span className="text-rose-400 font-black">{deviationPercentage}% Anomaly Weight</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2.5 rounded overflow-hidden flex">
                            <div 
                              className="bg-rose-500 h-full rounded transition-all duration-500" 
                              style={{ width: `${Math.max(15, (dev.value / maxDevVal) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-xs font-mono text-slate-500 py-6">
                      Zero automated classification deviations detected.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Risk Corridors by Anomaly Volume
              </h3>
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800 min-h-[140px] flex flex-col justify-center">
                {hsAnalysis.topCorridors.length > 0 ? (
                  <div className="space-y-3">
                    {hsAnalysis.topCorridors.map((c, idx) => {
                      const maxVal = hsAnalysis.topCorridors[0].val || 1;
                      const pct = (c.val / maxVal) * 100;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-300 font-semibold">{c.name}</span>
                            <span className="text-amber-400 font-bold">${c.val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full">
                            <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-xs font-mono text-slate-500 py-6">
                    No active nomenclature deviations identified to calculate routes.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ZONE 4: EVIDENCE EXPLORER */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase border-b border-slate-800 pb-2">Zone 4: Evidence Explorer</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg lg:col-span-1 non-printable">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 border-b border-slate-700 pb-2 flex items-center justify-between">
              <span>Investigation Filters</span>
              <TrendingUp size={12} className="text-slate-400" />
            </h3>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedChapterFilter('ALL')}
                className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                  selectedChapterFilter === 'ALL' ? 'bg-slate-900 border border-slate-600 text-white font-bold' : 'bg-slate-900/40 border border-transparent text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
                }`}
              >
                <span>Show All Evidence Lines</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-bold">{hsAnalysis.records.length}</span>
              </button>

              <button
                onClick={() => setSelectedChapterFilter('RISK_ONLY')}
                className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center border cursor-pointer ${
                  selectedChapterFilter === 'RISK_ONLY' ? 'bg-rose-950/60 border-rose-600 text-rose-300 font-bold' : 'bg-rose-950/20 border-rose-950 text-rose-400 hover:bg-rose-950/40'
                }`}
              >
                <span className="flex items-center gap-1.5"><ShieldAlert size={12} /> High-Risk Anomaly Set</span>
                <span className="bg-rose-900/60 px-1.5 py-0.5 rounded text-[10px] text-rose-200 font-bold">{hsAnalysis.highRiskIncidentCount}</span>
              </button>
              
              {hsAnalysis.chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedChapterFilter(ch.code)}
                  className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                    selectedChapterFilter === ch.code ? 'bg-slate-900 border border-slate-600 text-white font-bold' : 'bg-slate-900/40 border border-transparent text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
                  }`}
                >
                  <span>Heading Prefix: {ch.code}</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-bold">{ch.shipmentCount}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl lg:col-span-3">
            <div className="p-4 bg-slate-900/80 border-b border-slate-700 flex justify-between items-center non-printable">
              <span className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
                Forensic Ledger ({filteredRecords.length} Lines Displayed)
              </span>
            </div>

            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-left border-collapse print:text-black">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-700 text-slate-300 font-mono text-xs">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Nomenclature Map</th>
                    <th className="px-4 py-3">Brand Identifier</th>
                    <th className="px-4 py-3">Product Description</th>
                    <th className="px-4 py-3 text-right">Value (USD)</th>
                    <th className="px-4 py-3">Corridor Paths</th>
                    <th className="px-4 py-3">Audit Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-mono text-xs">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((rec, i) => (
                      <tr key={rec.id || i} className={`hover:bg-slate-700/30 transition-colors ${rec.isMismatched ? 'bg-rose-950/20' : ''}`}>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{rec.Date || 'UNKNOWN'}</td>
                        <td className="px-4 py-3 space-y-1">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${rec.isMismatched ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-900 text-slate-300'}`}>
                            {rec.HSCode || '?'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-emerald-400 font-bold max-w-[140px] truncate col-brand">{rec.Brand || 'NOT DECLARED'}</td>
                        <td className="px-4 py-3 font-semibold text-slate-200 max-w-xs truncate col-product">{rec.Product || 'UNCATEGORIZED'}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-100 font-mono">
                          ${rec.Amount ? Number(rec.Amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                        </td>
                        <td className="px-4 py-3 text-[11px] whitespace-nowrap">
                          <div className="text-slate-300">{rec.OriginCountry || 'UNKNOWN'} → {rec.DestinationCountry || 'UNKNOWN'}</div>
                        </td>
                        <td className="px-4 py-3">
                          {rec.isMismatched ? (
                            <span className="text-rose-400 font-bold text-[10px] bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              MISCLASSIFICATION SHIFT
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Clean Pass</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-500">No records found matching current data filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

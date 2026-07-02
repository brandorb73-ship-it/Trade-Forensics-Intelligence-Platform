import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext.jsx'; // Add explicit .jsx extension to force exact chunk matching
import { ShieldAlert, AlertTriangle, Layers, FileText, TrendingUp, Info, BookOpen } from 'lucide-react';

export default function HSIntelligence() {
  const contextData = useTradeData();
  const tradeData = contextData && contextData.tradeData ? contextData.tradeData : [];
  
  const [selectedChapterFilter, setSelectedChapterFilter] = useState('ALL');

  // Forensic Breakdown Logic
  const hsAnalysis = useMemo(() => {
    let globalMismatchedValue = 0;
    let highRiskIncidentCount = 0;
    const corridorsMap = {};
    const chaptersMap = {};
    const discrepancyRecords = [];
    const deviationMatrix = {};
    const mismatchedChapters = new Set();

    // 1. Pre-scan dataset to build statistical mode baselines per product group dynamically
    const productBaselines = {};
    const productCounts = {};
    const brandCounts = {};

    tradeData.forEach(row => {
      const prod = (row.Product || '').toUpperCase().trim();
      const brand = (row.Brand || '').toUpperCase().trim();
      const hs = String(row.HSCode || '').trim();
      const chapter2D = hs && hs !== '?' ? hs.substring(0, 2) : null;

      if (prod) {
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

    // Derive the dominant, expected standard chapter prefix for each commodity name
    const expectedChapterMap = {};
    Object.entries(productBaselines).forEach(([prod, chapters]) => {
      const sortedChapters = Object.entries(chapters).sort((a, b) => b[1] - a[1]);
      if (sortedChapters.length > 0) {
        expectedChapterMap[prod] = sortedChapters[0][0]; 
      }
    });

    // Isolate top descriptors for natural phrasing insertion in dynamic intelligence summaries
    const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'CARGO STOCKS';
    const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UNBRANDED';

    // 2. Secondary Primary Diagnostic Evaluation Loop
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

      // Advanced Adaptive Pattern Profiling Rules
      if (productDesc.includes('SEMAGLUTIDE')) {
        expectedChapterText = 'Chapter 30 (Pharma)';
        if (currentChapter2D !== '30') {
          isMismatched = true;
        }
      } else if (productDesc.includes('FILTER RODS') || productDesc.includes('CIGARETTE')) {
        expectedChapterText = 'Chapter 56 (Wadding/Tow)';
        // Flag paper/cellulose deviations (48) or blank variables as nomenclature threats
        if (currentChapter2D === '48' || hsString === '?' || currentChapter2D === 'UNKNOWN') {
          isMismatched = true;
        }
      } else {
        // Universal Statistical Outlier Fallback Engine
        const modeChapter2D = expectedChapterMap[productDesc];
        if (modeChapter2D) {
          expectedChapterText = `Chapter ${modeChapter2D}`;
          if (currentChapter2D !== modeChapter2D || hsString === '?') {
            isMismatched = true;
          }
        } else if (hsString === '?') {
          isMismatched = true;
          expectedChapterText = 'Verification Required';
        }
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

    const chapterListStr = mismatchedChapters.size > 0 
      ? Array.from(mismatchedChapters).map(ch => ch.length === 2 ? `Chapter ${ch}` : ch).join(' / ')
      : 'alternative headers';

    return {
      globalMismatchedValue,
      highRiskIncidentCount,
      chapters: Object.values(chaptersMap).sort((a, b) => b.totalValue - a.totalValue),
      records: discrepancyRecords,
      topCorridors,
      deviations: deviationsList,
      topProduct,
      topBrand,
      chapterListStr
    };
  }, [tradeData]);

  // Dynamic Industry & Chapter Description Interpreter Module
  const dynamicIndustryGlossary = useMemo(() => {
    const rawProd = hsAnalysis.topProduct;
    
    let industryDomain = "General Industrial Operations & Logistics";
    let industryThesis = "The application is auditing multi-commodity distributions across unverified customs profiles.";
    
    // Dynamic rule parsing engine to identify dataset type
    if (rawProd.includes('FILTER') || rawProd.includes('CIGARETTE') || rawProd.includes('TOBACCO')) {
      industryDomain = "Tobacco Logistics & Downstream Material Inputs";
      industryThesis = "Analysis emphasizes strategic components such as acetate tow, specialized cellulose coverings, and automated processing machinery prone to misdeclaration.";
    } else if (rawProd.includes('SEMAGLUTIDE') || rawProd.includes('PHARMA') || rawProd.includes('MEDICINAL')) {
      industryDomain = "Biochemical Vectors & Finished Pharmaceutical Cargo";
      industryThesis = "Analysis covers high-demand biologicals, temperature-sensitive therapeutic assets, and raw chemical precursor distribution layers.";
    } else if (rawProd.includes('WATCH') || rawProd.includes('CLOCK') || rawProd.includes('HOROLOGY')) {
      industryDomain = "High-Value Premium Manufacturing & Luxury Assets";
      industryThesis = "Analysis monitors components, balance mechanisms, and high-tariff design items susceptible to gray-market parallel routing patterns.";
    }

  // Dynamic database mapping of chapters detected inside the specific file array
    const masterDefinitions = {
      '56': { nomenclature: "Wadding, Felt, Nonwovens & Special Yarns", context: "Typically denotes primary filters, industrial structural processing layers, or fiber tow bundles." },
      '48': { nomenclature: "Paper, Paperboard & Cellulose Packaging", context: "Corresponds to downstream packaging wraps, specialized composite boxes, or physical booklets." },
      '30': { nomenclature: "Pharmaceutical Products & Blended Medicinals", context: "Covers standard finished formulation quantities, sterile packaging layouts, or clinical reagents." },
      '91': { nomenclature: "Precision Horological Instrumentation & Components", context: "Identifies dedicated movement setups, specialized metal frames, and physical timepieces." },
      'UNKNOWN': { nomenclature: "Undisclosed Heading / Shielded Data String", context: "Indicates manifest nodes passing blank strings or non-standard characters to evade automated checks." }
    };

    return { industryDomain, industryThesis, masterDefinitions };
  }, [hsAnalysis.topProduct]);

  // Resolved Filter logic to match ch.code string mappings
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
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto id-print-section">
      
      {/* Explicit Print Target Style Injector - FORCING WHITE BOX MODE LAYOUT */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: auto;
            margin: 15mm 12mm 15mm 12mm;
          }
          html, body {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #111827 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .id-print-section {
            background-color: #ffffff !important;
            color: #111827 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .non-printable {
            display: none !important;
          }
          /* Grid container layout fix for page flow */
          .grid {
            display: grid !important;
            gap: 1.25rem !important;
          }
          /* Prevent cut-off at page boundaries */
          tr, .bg-slate-900, .bg-slate-800, .bg-slate-950, .grid > div {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Turn panels into white crisp boxes with light borders */
          .bg-slate-900, .bg-slate-800, .bg-slate-950, .bg-slate-900\\/60 {
            background-color: #ffffff !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 0.75rem !important;
            color: #111827 !important;
            box-shadow: none !important;
          }
          /* Slight light gray shading inside inner dashboard panels */
          .bg-slate-950, .bg-slate-900\\/60 {
            background-color: #f9fafb !important;
            border: 1px solid #e5e7eb !important;
          }
          /* Normalize text colors to ensure visibility on light canvas */
          .text-white, .text-slate-100, .text-slate-200, .text-slate-300 {
            color: #111827 !important;
          }
          .text-slate-400 {
            color: #4b5563 !important;
          }
          .border-slate-800, .border-slate-700, .border-slate-850 {
            border-color: #e5e7eb !important;
          }
          /* Retain diagnostic colors accurately */
          .text-rose-400, .text-rose-300 {
            color: #dc2626 !important;
          }
          .text-amber-400, .text-amber-300 {
            color: #b45309 !important;
          }
          .text-emerald-400 {
            color: #047857 !important;
          }
          .text-cyan-400 {
            color: #1d4ed8 !important;
          }
          /* Retain solid bar fills inside print execution framework */
          .bg-rose-500 {
            background-color: #ef4444 !important;
          }
          .bg-gradient-to-r {
            background: #f59e0b !important;
          }
          /* Table Formatting - Fix cut vertical columns */
          .overflow-x-auto {
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
          }
          th {
            background-color: #f3f4f6 !important;
            color: #1f2937 !important;
            border: 1px solid #e5e7eb !important;
          }
          td {
            border: 1px solid #e5e7eb !important;
            color: #374151 !important;
          }
          th, td {
            white-space: normal !important;
            word-wrap: break-word !important;
            word-break: break-word !important;
            max-width: none !important;
            text-overflow: unset !important;
            overflow: visible !important;
          }
          /* Perfect column sizing allocations to maintain dynamic alignment lines */
          th:nth-child(1), td:nth-child(1) { width: 11% !important; }
          th:nth-child(2), td:nth-child(2) { width: 13% !important; }
          th:nth-child(3), td:nth-child(3) { width: 14% !important; }
          th:nth-child(4), td:nth-child(4) { width: 23% !important; }
          th:nth-child(5), td:nth-child(5) { width: 12% !important; }
          th:nth-child(6), td:nth-child(6) { width: 15% !important; }
          th:nth-child(7), td:nth-child(7) { width: 11% !important; }
          
          /* Distinct tint highlight pattern for risk rows on print */
          tr.bg-rose-950\\/20 {
            background-color: #fef2f2 !important;
          }
          svg {
            stroke: #374151 !important;
          }
        }
      `}} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5 non-printable">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            HS Intelligence System 
            <span className="text-xs bg-amber-500/20 px-2 py-1 rounded text-amber-400 uppercase tracking-widest font-mono border border-amber-500/30">
              Forensic Nomenclature Auditing
            </span>
          </h1>
          <p className="text-sm text-slate-300 mt-1">Isolate structural anomalies where declared descriptions conflict with international tariff code frameworks.</p>
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

      {/* Dynamic Executive AI Briefing & Operational Analysis Panel */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md space-y-4">
        <h2 className="text-xs font-black tracking-wider text-amber-400 font-mono uppercase flex items-center gap-2">
          <FileText size={16} className="text-amber-500" /> Dynamic Executive AI Briefing & Operational Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs text-slate-300 leading-relaxed">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
            <span className="text-[11px] tracking-wide text-slate-400 uppercase font-bold block border-b border-slate-800 pb-1">Executive Strategic Summary</span>
            <p className="text-slate-200">
              Automated auditing across the <span className="text-amber-400 font-bold">{dynamicIndustryGlossary.industryDomain}</span> ecosystem has identified a highly concentrated structural nomenclature deviation pattern. Out of total analyzed manifests, <span className="text-amber-400 font-bold">{hsAnalysis.highRiskIncidentCount}</span> shipments exhibit classification conflicts representing an exposed risk valuation of <span className="text-rose-400 font-bold">${hsAnalysis.globalMismatchedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>. The system indicates that operations surrounding <span className="text-amber-400 font-bold">{hsAnalysis.topProduct}</span> are shifting away from traditional tariff headings to circumvent security screening matrices or variable regulatory thresholds.
            </p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
            <span className="text-[11px] tracking-wide text-rose-400 uppercase font-bold block border-b border-slate-800 pb-1">Forensic Risk Vulnerability</span>
            <p className="text-slate-200">
              The primary tactical vulnerability is centered along the <span className="text-amber-400 font-bold">[ {hsAnalysis.topCorridors[0]?.name || 'GLOBAL CORRIDOR'} ]</span> transit channel, which commands the largest volume of structural friction. By routing cargo under variable classifications like <span className="text-cyan-400 font-bold">{hsAnalysis.chapterListStr}</span>, entities dilute the visibility of supply lines. This prevents standard rule engines from triggering mass-balance audits or matching raw precursor input values against finished product output volumes.
            </p>
          </div>
        </div>
      </div>

      {/* Forensic Intelligence Briefing Notice - Fully Adaptive Assessment Panels */}
      <div className="bg-slate-900 border-l-4 border-amber-500 p-5 rounded-xl shadow-md space-y-3">
        <h2 className="text-sm font-black tracking-wider text-amber-400 font-mono uppercase flex items-center gap-2">
          <Info size={16} /> Diagnostic Risk Analysis: Strategic Misdeclaration Framework
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 font-mono leading-relaxed">
          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-white font-bold block border-b border-slate-800 pb-1 mb-1">PRODUCT SPECIES RISK</span>
            Analytical profile tracking indicates <span className="text-amber-400 font-bold">{hsAnalysis.topProduct}</span> cargo operations exhibit clear classification variance. Utilizing alternative definitions subverts targeted security screening profiles and import verification triggers.
          </div>
          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold block border-b border-slate-800 pb-1 mb-1">BRAND INTEL & GRAY MARKETS</span>
            The monitoring of structural trade pathways utilizing the <span className="text-emerald-400 font-bold">{hsAnalysis.topBrand !== 'UNBRANDED' ? `'${hsAnalysis.topBrand}'` : 'unbranded product'}</span> signature reveals sudden routing diversions, a core indicator for unverified parallel diversion lines.
          </div>
          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-cyan-400 font-bold block border-b border-slate-800 pb-1 mb-1">TARIFF EVASION DYNAMICS</span>
            Applying variable headings such as <span className="text-cyan-400 font-bold">{hsAnalysis.chapterListStr}</span> alters the tracking footprint inside global supply chain records, neutralizing standard automated risk audit triggers.
          </div>
        </div>
      </div>

      {/* Top Counters Metrics Layout Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Flagged Classification Shifts</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {hsAnalysis.highRiskIncidentCount} <span className="text-xs text-slate-400 font-normal">Incidents</span>
            </span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-800/50 text-amber-400">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Active Tariff Headings</span>
            <span className="text-2xl font-black text-slate-100 font-mono">
              {hsAnalysis.chapters.length} <span className="text-xs text-slate-400 font-normal">Headings Seen</span>
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300">
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* Dynamic Automated Industry Glossary Panel */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4 shadow-md">
        <h3 className="text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase flex items-center gap-2">
          <BookOpen size={15} /> Dynamic Intelligent Nomenclature Dictionary
        </h3>
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
          <div className="border-b border-slate-800 pb-2">
            <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Identified Trade Domain Context</span>
            <span className="text-white font-black text-sm">{dynamicIndustryGlossary.industryDomain}</span>
            <p className="text-slate-300 mt-1 font-sans text-xs">{dynamicIndustryGlossary.industryThesis}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {hsAnalysis.chapters.map((ch) => {
              const staticDef = dynamicIndustryGlossary.masterDefinitions[ch.code] || {
                nomenclature: "Alternative Dynamic Trade Category",
                context: "Custom baseline matrix entries isolated during data array scan."
              };
              return (
                <div key={ch.code} className="bg-slate-950 p-3 rounded border border-slate-850 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-400 font-bold">Chapter {ch.code} Framework</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 text-slate-400 rounded">
                      {ch.shipmentCount} Manifest Rows
                    </span>
                  </div>
                  <div className="text-slate-200 font-bold text-[11px] uppercase tracking-wide">{staticDef.nomenclature}</div>
                  <div className="text-slate-400 text-[11px] leading-relaxed font-sans">{staticDef.context}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Adaptive Graphical Matrix & Ranked Corridor Breakdowns */}
      {tradeData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Discrepancy Matrix: Declared vs. Expected Tariff Paths
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
                      <div key={idx} className="bg-slate-950 p-3 rounded border border-slate-800/80 space-y-2 DiscrepancyMatrixCard">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-slate-300 font-bold">Declared {dev.name}</span>
                          <span className="text-rose-400 font-black">{deviationPercentage}% Anomaly Weight</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded overflow-hidden flex ProgressBar">
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
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Risk Corridors Ranked by Disguised Tariff Value
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

      {/* Split Navigation and Table Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg lg:col-span-1 non-printable">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 border-b border-slate-700 pb-2 flex items-center justify-between">
            <span>Tariff Frameworks</span>
            <TrendingUp size={12} className="text-slate-400" />
          </h3>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedChapterFilter('ALL')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                selectedChapterFilter === 'ALL' ? 'bg-slate-900 border border-slate-600 text-white font-bold' : 'bg-slate-900/40 border border-transparent text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
              }`}
            >
              <span>Show All Manifest Lines</span>
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

        {/* Audit Data Table Container Frame */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl lg:col-span-3">
          <div className="p-4 bg-slate-900/80 border-b border-slate-700 flex justify-between items-center non-printable">
            <span className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
              Tariff Framework Audit Ledger ({filteredRecords.length} Lines Displayed)
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
  );
}

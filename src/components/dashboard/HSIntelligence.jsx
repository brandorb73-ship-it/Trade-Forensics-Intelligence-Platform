import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { ShieldAlert, AlertTriangle, Layers, ArrowRight, TrendingUp } from 'lucide-react';

export default function HSIntelligence() {
  const { tradeData } = useTradeData();
  const [selectedChapterFilter, setSelectedChapterFilter] = useState('ALL');

  // Forensics Engine: Analyze classification discrepancies
  const hsAnalysis = useMemo(() => {
    let globalMismatchedValue = 0;
    let highRiskIncidentCount = 0;
    const chaptersMap = {};
    const discrepancyRecords = [];

    tradeData.forEach(row => {
      const hsString = String(row.HSCode || '');
      const productDesc = (row.Product || '').toUpperCase();
      const amount = parseFloat(row.Amount) || 0;
      
      // Extract Chapter (First 2 or 4 digits for broad grouping classification)
      const chapterPrefix = hsString.substring(0, 4) || 'UNKNOWN';
      
      // Disguise Flagging Logic
      // High-Risk Pattern: Semaglutide classified under Chapter 91 (Clocks/Watches) instead of Chapter 30 (Pharmaceuticals)
      const isMismatched = productDesc.includes('SEMAGLUTIDE') && hsString.startsWith('9101');
      
      if (isMismatched) {
        globalMismatchedValue += amount;
        highRiskIncidentCount += 1;
      }

      // Initialize Chapter analytics structure
      if (!chaptersMap[chapterPrefix]) {
        chaptersMap[chapterPrefix] = {
          code: chapterPrefix,
          totalValue: 0,
          shipmentCount: 0,
          flaggedCount: 0
        };
      }
      
      chaptersMap[chapterPrefix].totalValue += amount;
      chaptersMap[chapterPrefix].shipmentCount += 1;
      if (isMismatched) {
        chaptersMap[chapterPrefix].flaggedCount += 1;
      }

      // Populate discrepancy array
      discrepancyRecords.push({
        ...row,
        chapterPrefix,
        isMismatched,
        expectedChapter: 'Chapter 30 (Medicaments/Pharma)',
        declaredChapter: `Chapter ${hsString.substring(0, 2)} (Clocks & Watches)`
      });
    });

    return {
      globalMismatchedValue,
      highRiskIncidentCount,
      chapters: Object.values(chaptersMap).sort((a, b) => b.totalValue - a.totalValue),
      records: discrepancyRecords
    };
  }, [tradeData]);

  // Filter records based on selected tariff chapters
  const filteredRecords = useMemo(() => {
    if (selectedChapterFilter === 'ALL') return hsAnalysis.records;
    if (selectedChapterFilter === 'RISK_ONLY') return hsAnalysis.records.filter(r => r.isMismatched);
    return hsAnalysis.records.filter(r => r.chapterPrefix === selectedChapterFilter);
  }, [hsAnalysis.records, selectedChapterFilter]);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Tab Context Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          HS Intelligence System <span className="text-xs bg-amber-500/20 px-2 py-1 rounded text-amber-400 uppercase tracking-widest font-mono border border-amber-500/30">Forensic Nomenclature Auditing</span>
        </h1>
        <p className="text-sm text-slate-300 mt-1">Isolate cross-border structural anomalies where declared descriptions conflict with international tariff code systems.</p>
      </div>

      {/* Forensic Intelligence Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Nomenclature Risk Value</span>
            <span className="text-2xl font-black text-rose-400 font-mono">
              ${hsAnalysis.globalMismatchedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-400">
            <ShieldAlert size={22} className="animate-pulse" />
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

      {/* Chapter Distribution Grid & Audit Table Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Hand Column: Tariff Chapter Breakdown Matrix Selector */}
        <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg lg:col-span-1">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 border-b border-slate-700 pb-2 flex items-center justify-between">
            <span>Tariff Frameworks</span>
            <TrendingUp size={12} className="text-slate-400" />
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedChapterFilter('ALL')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center ${
                selectedChapterFilter === 'ALL' ? 'bg-slate-900 border border-slate-600 text-white font-bold' : 'bg-slate-900/40 border border-transparent text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
              }`}
            >
              <span>Show All Manifest Lines</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-bold">{hsAnalysis.records.length}</span>
            </button>

            <button
              onClick={() => setSelectedChapterFilter('RISK_ONLY')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center border ${
                selectedChapterFilter === 'RISK_ONLY' ? 'bg-rose-950/60 border-rose-600 text-rose-300 font-bold' : 'bg-rose-950/20 border-rose-950 text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              <span className="flex items-center gap-1.5"><ShieldAlert size={12} /> High-Risk Anomaly Set</span>
              <span className="bg-rose-900/60 px-1.5 py-0.5 rounded text-[10px] text-rose-200 font-bold">{hsAnalysis.highRiskIncidentCount}</span>
            </button>

            {hsAnalysis.chapters.map(ch => (
              <button
                key={ch.code}
                onClick={() => setSelectedChapterFilter(ch.code)}
                className={`w-full text-left p-2.5 rounded text-xs font-mono transition border ${
                  selectedChapterFilter === ch.code ? 'bg-slate-900 border-slate-600 text-white font-bold' : 'bg-slate-900/20 border-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                }`}
              >
                <div className="flex justify-between items-center font-bold mb-1">
                  <span className={ch.flaggedCount > 0 ? 'text-amber-400' : 'text-slate-200'}>Code Prefix: {ch.code}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-normal px-1 rounded">{ch.shipmentCount} flows</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>Vol: ${ch.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  {ch.flaggedCount > 0 && <span className="text-rose-400 font-bold">{ch.flaggedCount} Mismatches</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Hand Column: Primary Discrepancy Matrix Audit Ledger */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl lg:col-span-3">
          <div className="p-4 bg-slate-900/80 border-b border-slate-700 flex justify-between items-center">
            <span className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
              Tariff Framework Audit Ledger ({filteredRecords.length} Lines Displayed)
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
              Active View Filter: <span className="text-emerald-400 font-bold uppercase">{selectedChapterFilter}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-700 text-slate-300 font-mono text-xs">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Nomenclature Map</th>
                  <th className="px-4 py-3">Product Description</th>
                  <th className="px-4 py-3 text-right">Value (USD)</th>
                  <th className="px-4 py-3">Corridor Paths</th>
                  <th className="px-4 py-3">Audit Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-mono text-xs">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className={`hover:bg-slate-700/30 transition-colors ${rec.isMismatched ? 'bg-rose-950/10' : ''}`}>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{rec.Date}</td>
                      <td className="px-4 py-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${rec.isMismatched ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-900 text-slate-300'}`}>
                            {rec.HSCode}
                          </span>
                        </div>
                        {rec.isMismatched && (
                          <div className="text-[10px] text-rose-400/90 flex items-center gap-1">
                            <span>Declared: Watch Chapter</span> <ArrowRight size={10} /> <span>Expected: Pharma</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-200 max-w-xs truncate">
                        {rec.Product}
                        <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wide mt-0.5">Ecosystem: {rec.Brand}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-100 font-mono">
                        ${rec.Amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-[11px] space-y-0.5">
                        <div className="text-slate-300 font-semibold"><span className="text-slate-500 text-[10px] uppercase">From:</span> {rec.OriginCountry}</div>
                        <div className="text-slate-300 font-semibold"><span className="text-slate-500 text-[10px] uppercase">To:</span> {rec.DestinationCountry}</div>
                      </td>
                      <td className="px-4 py-3 vertical-middle">
                        {rec.isMismatched ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded animate-pulse uppercase">
                            <ShieldAlert size={12} /> CRITICAL MISCLASSIFICATION
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium uppercase text-[10px] tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                            Verified Clean
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-400 text-sm font-mono">
                      No classification discrepancies found matching this filter set.
                    </td>
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

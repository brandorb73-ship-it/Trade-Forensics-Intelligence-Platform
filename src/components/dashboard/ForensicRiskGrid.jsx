import React, { useState, useMemo } from 'react';
import { Grid, Eye, AlertTriangle, Ship, Activity } from 'lucide-react';

export default function ForensicRiskGrid({ tradeData = [], activeMetricTab = 'VALUE' }) {
  const [selectedCell, setSelectedCell] = useState(null);

  const advancedMetrics = useMemo(() => {
    const origins = new Set();
    const destinations = new Set();
    const crossTabMatrix = {};
    let maxCrossTabValue = 0;

    tradeData.forEach(row => {
      if (!row) return;
      const val = Number(row.Amount) || 0;
      const qty = Number(row.Quantity) || 0;
      const origin = (row.OriginCountry || 'UNKNOWN').split('→')[0].trim().toUpperCase();
      const dest = (row.DestinationCountry || row.Destination || 'UNITED STATES').toUpperCase();

      origins.add(origin);
      destinations.add(dest);

      if (!crossTabMatrix[origin]) crossTabMatrix[origin] = {};
      if (!crossTabMatrix[origin][dest]) {
        crossTabMatrix[origin][dest] = { totalValue: 0, totalQty: 0, records: [] };
      }
      crossTabMatrix[origin][dest].totalValue += val;
      crossTabMatrix[origin][dest].totalQty += qty;
      crossTabMatrix[origin][dest].records.push(row);

      if (crossTabMatrix[origin][dest].totalValue > maxCrossTabValue) {
        maxCrossTabValue = crossTabMatrix[origin][dest].totalValue;
      }
    });

    return {
      origins: Array.from(origins).sort(),
      destinations: Array.from(destinations).sort(),
      crossTabMatrix,
      maxCrossTabValue
    };
  }, [tradeData]);

  const filteredCellRecords = useMemo(() => {
    if (!selectedCell) return [];
    const { origin, dest } = selectedCell;
    return advancedMetrics.crossTabMatrix[origin]?.[dest]?.records || [];
  }, [selectedCell, advancedMetrics]);

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 print-break-avoid print:border-slate-300 print:bg-white print:p-2">
      
      {/* Print Specific Inline Styling Engine to eliminate A4 table wrapping clips */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .print-clean-wrap {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          table.print-matrix-target {
            table-layout: fixed !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }
          table.print-matrix-target th, table.print-matrix-target td {
            padding: 6px 4px !important;
            font-size: 8.5px !important;
            border: 1px solid #cbd5e1 !important;
            word-wrap: break-word !important;
          }
          .print-expand-ledger {
            max-height: none !important;
            overflow: visible !important;
            display: grid !important;
            grid-template-cols: 1fr 1fr !important;
            gap: 12px !important;
          }
          .print-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 1px solid #cbd5e1 !important;
            background: #f8fafc !important;
          }
        }
      `}} />

      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 print:border-slate-300">
        <div className="flex items-center gap-2">
          <Grid size={16} className="text-red-400" /> 
          <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider print:text-slate-900">
            5. Geographic Cross-Tabulation Risk Grid
          </h3>
        </div>
        <span className="text-[10px] bg-red-950/60 border border-red-800 text-red-400 font-mono font-bold px-2 py-0.5 rounded print:bg-red-50 print:text-red-800 print:border-red-200">
          Density Heat Mapping Engine
        </span>
      </div>

      {/* Visual Risk Index Legend */}
      <div className="mb-4 bg-[#0b0f19] border border-slate-800 p-3 rounded-lg flex flex-wrap items-center gap-6 text-[10px] font-mono print:bg-white print:border-slate-200">
        <span className="text-slate-200 font-black uppercase tracking-wider flex items-center gap-1.5 print:text-slate-900">
          <AlertTriangle size={12} className="text-amber-500" /> Matrix Risk Index Legend:
        </span>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-slate-950 border border-slate-800 rounded print:border-slate-400"></div>
          <span className="text-slate-300 font-black print:text-slate-700">Baseline ($0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-950/50 border border-blue-900/50 rounded print:bg-blue-100 print:border-blue-300"></div>
          <span className="text-blue-300 font-black print:text-blue-800">Low Volume (&lt;$1k)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-amber-900/60 border border-amber-700/60 rounded print:bg-amber-100 print:border-amber-300"></div>
          <span className="text-amber-200 font-black print:text-amber-800">Bypass Activity ($1k–$2k)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-red-900/70 border border-red-800/60 rounded print:bg-red-100 print:border-red-300"></div>
          <span className="text-red-200 font-black print:text-red-800">Critical Volatility (&gt;$3k)</span>
        </div>
      </div>

      {/* High-Contrast Grid Layout */}
      <div className="overflow-x-auto bg-[#0b0f19] p-5 rounded-xl border border-slate-900 print:bg-white print:border-slate-200 print:p-0">
        <table className="w-full text-left font-mono text-[11px] border-collapse min-w-[750px] print-matrix-target">
          <thead>
            <tr className="bg-[#090d16] print:bg-slate-100">
              <th className="p-3 border border-slate-800 text-slate-200 font-black uppercase text-[10px] tracking-wider print:text-slate-900 print:border-slate-300">ORIGIN \ DEST</th>
              {advancedMetrics.destinations.map(dst => (
                <th key={dst} className="p-3 border border-slate-800 text-slate-200 font-black uppercase tracking-tight text-center max-w-[140px] leading-tight text-[10px] print:text-slate-900 print:border-slate-300">
                  {dst}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {advancedMetrics.origins.map(origin => (
              <tr key={origin} className="hover:bg-slate-900/30 transition-colors">
                <td className="p-3 border border-slate-800 text-slate-100 font-black bg-[#0d1322] uppercase tracking-wide text-[11px] print:bg-slate-50 print:text-slate-900 print:border-slate-300">
                  {origin}
                </td>
                {advancedMetrics.destinations.map(dst => {
                  const cellData = advancedMetrics.crossTabMatrix[origin]?.[dst];
                  const cellValue = cellData ? cellData.totalValue : 0;
                  const cellQty = cellData ? cellData.totalQty : 0;
                  const isSelected = selectedCell?.origin === origin && selectedCell?.dest === dst;
                  
                  let bgStyle = 'bg-slate-950 text-slate-500 font-medium print:bg-white print:text-slate-400';
                  if (cellValue > 0) {
                    const ratio = cellValue / (advancedMetrics.maxCrossTabValue || 1);
                    if (ratio > 0.7) bgStyle = 'bg-red-900/70 text-red-100 font-black hover:bg-red-800/80 border border-red-800 print:bg-red-50 print:text-red-900 print:border-red-300';
                    else if (ratio > 0.3) bgStyle = 'bg-amber-900/60 text-amber-100 font-bold hover:bg-amber-800/70 border border-amber-800/60 print:bg-amber-50 print:text-amber-900 print:border-amber-300';
                    else bgStyle = 'bg-blue-950/50 text-blue-200 font-medium hover:bg-blue-900/40 border border-blue-900/40 print:bg-blue-50 print:text-blue-900 print:border-blue-300';
                  }

                  return (
                    <td 
                      key={dst} 
                      onClick={() => cellValue > 0 && setSelectedCell(isSelected ? null : { origin, dest: dst })}
                      className={`p-3 border border-slate-800 text-center transition-all ${bgStyle} ${cellValue > 0 ? 'cursor-pointer shadow-inner' : 'cursor-default'} ${isSelected ? 'ring-2 ring-white border-transparent z-10 scale-[1.01] print:ring-1 print:ring-black' : ''}`}
                    >
                      <div className="text-xs font-black">
                        {activeMetricTab === 'VALUE'
                          ? `$${cellValue > 0 ? cellValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}`
                          : `${cellQty > 0 ? cellQty.toLocaleString() : '0'}`
                        }
                      </div>
                      <div className={`text-[9px] mt-0.5 tracking-tight font-mono font-black ${cellValue > 0 ? 'text-slate-200 opacity-90 print:text-slate-700' : 'text-slate-700 print:text-slate-300'}`}>
                        ({cellData ? cellData.records.length : 0} Batches)
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drill-down Unmasked Corporate Footprint Ledger Card Array */}
      {selectedCell && (
        <div className="mt-4 p-4 bg-[#0a0f1d] border border-red-900/50 rounded-xl space-y-3 animate-fadeIn print:bg-white print:border-slate-300 print:mt-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 print:border-slate-300">
            <span className="text-xs text-red-400 font-black font-mono uppercase tracking-wider flex items-center gap-1.5 print:text-red-700">
              <Eye size={14} className="text-red-400 print:text-red-700" /> Unmasked Corridor Footprint Ledger: {selectedCell.origin} ➔ {selectedCell.dest}
            </span>
            <button 
              onClick={() => setSelectedCell(null)} 
              className="text-[10px] font-mono text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors non-printable"
            >
              Clear Sub-Ledger
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[250px] overflow-y-auto pr-1 print-expand-ledger">
            {filteredCellRecords.map((row, i) => (
              <div key={i} className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3 print-card print:bg-slate-50 print:border-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-blue-950 border border-blue-900 text-blue-400 font-black px-2 py-0.5 rounded uppercase tracking-wide print:bg-blue-100 print:text-blue-800 print:border-blue-300">
                    {row.Brand || 'UNCLASSIFIED'}
                  </span>
                  <span className="text-xs text-emerald-400 font-black font-mono print:text-emerald-700">
                    ${Number(row.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px] bg-slate-950/80 p-3 rounded-lg border border-slate-900 print:bg-white print:border-slate-200">
                  <div>
                    <span className="text-slate-500 font-black uppercase text-[9px] block tracking-wider print:text-slate-600">Unmasked Target Consignee:</span> 
                    <span className="text-blue-400 font-bold break-all print:text-blue-800">{row.Importer || 'UNKNOWN INTERMEDIARY BUYER'}</span>
                  </div>
                  <div className="border-t border-slate-900/60 my-1 print:border-slate-200"></div>
                  <div>
                    <span className="text-slate-500 font-black uppercase text-[9px] block tracking-wider print:text-slate-600">Unmasked Shadow Exporter:</span> 
                    <span className="text-slate-200 font-bold break-all print:text-slate-900">{row.Exporter || 'UNKNOWN BROKER ENTRY'}</span>
                  </div>
                </div>
                
                <div className="text-[10px] font-mono text-slate-400 flex justify-between items-center pt-1 print:text-slate-600">
                  <span>Manifest Date: <strong className="text-slate-200 font-bold print:text-slate-900">{row.Date || 'Active Leg'}</strong></span>
                  <span>Volume: <strong className="text-amber-400 font-bold print:text-amber-700">{row.Quantity || 0} Units</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forensic Briefing & Contextual Footnotes */}
      <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-3 print:bg-white print:border-slate-300 print:text-slate-800">
        <div>
          <strong className="text-white uppercase tracking-wider block text-[11px] mb-1 print:text-slate-900">
            Cross-Tabulation Forensic Briefing:
          </strong>
          <p className="leading-relaxed text-slate-300 print:text-slate-700">
            This operational grid isolates multi-directional trade anomalies by correlating supply origins against declaration targets. Rather than tracking isolated transactions, it highlights structural lane diversions where commercial assets break away from traditional authorized trade routes.
          </p>
        </div>
        <div className="border-t border-slate-800/80 pt-2 text-[11px] text-slate-400 leading-relaxed space-y-1 print:border-slate-200 print:text-slate-600">
          <strong className="text-amber-400 uppercase tracking-wider block text-[10px] mb-0.5 print:text-amber-800">Strategic Lane Interpretation:</strong>
          <div>• <strong className="text-red-400 uppercase print:text-red-700">High Density Outliers (Red Nodes):</strong> High-risk anomalies indicating deep value diversion, unexpected volume accumulation, or circular channel loading back into traditional production hubs.</div>
          <div>• <strong className="text-amber-400 uppercase print:text-amber-700">Transshipment Bypass Clusters (Amber Nodes):</strong> Classical bypass behavior where cargo swaps custom identifiers or documentation records inside intermediate Free Trade Zones (FTZs) to disguise primary manufacturing origin points before seeking final distribution clearances.</div>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Shield, ShieldAlert, Award, Layers, FileText } from 'lucide-react';

export default function BrandIntelligence() {
  const { tradeData = [] } = useTradeData() || {};

  const brandAnalytics = useMemo(() => {
    const stats = {};
    
    tradeData.forEach(row => {
      const b = row.Brand || 'UNBRANDED / HIGH RISK';
      if (!stats[b]) {
        stats[b] = { volume: 0, value: 0, unauthorizedImporters: new Set(), totalIncidents: 0 };
      }
      stats[b].volume += Number(row.Quantity) || 0;
      stats[b].value += Number(row.Amount) || 0;
      stats[b].totalIncidents += 1;
      
      if (row.Importer && (row.Importer.includes('TRADING') || row.Importer.includes('LOGISTICS') || row.Importer.includes('LIMITED'))) {
        stats[b].unauthorizedImporters.add(row.Importer);
      }
    });

    return stats;
  }, [tradeData]);

  const brandList = Object.keys(brandAnalytics);

  return (
    <div className="space-y-6 text-slate-100 id-print-section">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="text-blue-500" size={24} /> Brand Protection & Grey Market Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">Examine distribution networks, track unverified corporate entities, and uncover trademark erosion.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer text-slate-200">
          <FileText size={14} className="text-blue-400" /> Export Brand Security Log
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brandList.slice(0, 3).map(brand => (
          <div key={brand} className="bg-[#111827] border border-slate-800 p-5 rounded-xl print-break-avoid">
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">{brand}</span>
            <div className="text-2xl font-mono font-black text-white mt-1">
              ${brandAnalytics[brand].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
              <span>Leakage Footprint: {brandAnalytics[brand].unauthorizedImporters.size} Nodes</span>
              <span>Volume: {brandAnalytics[brand].volume.toLocaleString()} units</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 overflow-x-auto print-break-avoid">
        <div className="text-xs font-mono font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Layers size={14} className="text-blue-400"/> IP Security & Distribution Matrix
        </div>
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
              <th className="pb-3 font-black">BRAND DESIGNATION</th>
              <th className="pb-3 font-black">AUDITED TRANSACTIONAL VALUE</th>
              <th className="pb-3 font-black">RECONSTRUCTED QUANTITY (UNITS)</th>
              <th className="pb-3 font-black">IDENTIFIED DIVERSION RISK CHANNELS</th>
              <th className="pb-3 font-black text-right">LITIGATION LINK</th>
            </tr>
          </thead>
          <tbody>
            {brandList.map(brand => (
              <tr key={brand} className="border-b border-slate-900/80 hover:bg-slate-900/30 transition-all">
                <td className="py-3.5 font-bold text-white tracking-tight">{brand}</td>
                <td className="py-3.5 text-slate-300 font-bold">${brandAnalytics[brand].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3.5 text-slate-400">{brandAnalytics[brand].volume.toLocaleString()}</td>
                <td className="py-3.5">
                  <span className="px-2 py-0.5 bg-amber-950/40 border border-amber-900 text-amber-400 rounded text-[10px] font-bold">
                    {brandAnalytics[brand].unauthorizedImporters.size} Unauthorized Channels Flagged
                  </span>
                </td>
                <td className="py-3.5 text-right font-bold text-slate-500 uppercase text-[10px]">Parallel Import Relevant</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

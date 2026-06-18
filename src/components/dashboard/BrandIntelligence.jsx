import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Award, ShieldAlert, Layers, TrendingUp, Users, FileText } from 'lucide-react';

export default function BrandIntelligence() {
  const { tradeData = [] } = useTradeData() || {};
  const [selectedBrand, setSelectedBrand] = useState('ALL');

  const brandAnalytics = useMemo(() => {
    const stats = {};
    
    tradeData.forEach(row => {
      const b = row.Brand || 'UNBRANDED';
      if (!stats[b]) {
        stats[b] = { volume: 0, value: 0, unauthorizedImporters: new Set(), suspectPool: 0 };
      }
      stats[b].volume += Number(row.Quantity) || 0;
      stats[b].value += Number(row.Amount) || 0;
      
      if (row.Importer && (row.Importer.includes('TRADING') || row.Importer.includes('LOGISTICS'))) {
        stats[b].unauthorizedImporters.add(row.Importer);
        stats[b].suspectPool++;
      }
    });

    return stats;
  }, [tradeData]);

  const brandList = Object.keys(brandAnalytics);

  return (
    <div className="p-6 space-y-6 text-slate-100 id-print-section">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">Brand Protection & Grey Market Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">Examine distribution networks, track unverified corporate entities, and uncover trademark erosion.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer">
          <FileText size={14} className="text-emerald-400" /> Export Brand Security Log
        </button>
      </div>

      {/* Brand Metrics Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brandList.slice(0, 3).map(brand => (
          <div key={brand} className="bg-slate-900 border border-slate-800 p-4 rounded-xl print-break-avoid">
            <span className="text-xs font-mono text-emerald-400 block font-bold tracking-widest">{brand}</span>
            <div className="text-xl font-mono font-black text-white mt-1">
              ${brandAnalytics[brand].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Leakage Points: {brandAnalytics[brand].unauthorizedImporters.size}</span>
              <span>Volume: {brandAnalytics[brand].volume.toLocaleString()} units</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-x-auto print-break-avoid">
        <div className="text-xs font-mono font-bold text-slate-400 mb-3 uppercase">IP Security & Distribution Matrix</div>
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500">
              <th className="pb-2">BRAND NAME</th>
              <th className="pb-2">TOTAL VALUE AUDITED</th>
              <th className="pb-2">PIECES MOVED</th>
              <th className="pb-2">SUSPECT RE-ROUTED LOGS</th>
            </tr>
          </thead>
          <tbody>
            {brandList.map(brand => (
              <tr key={brand} className="border-b border-slate-900/60 hover:bg-slate-900/20">
                <td className="py-3 font-bold text-white">{brand}</td>
                <td className="py-3 text-slate-300">${brandAnalytics[brand].value.toLocaleString()}</td>
                <td className="py-3 text-slate-400">{brandAnalytics[brand].volume.toLocaleString()}</td>
                <td className="py-3 text-rose-400 font-bold">{brandAnalytics[brand].suspectPool} Anomalies</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

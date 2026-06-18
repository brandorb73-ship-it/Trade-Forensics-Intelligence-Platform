import React, { useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, TrendingUp, Globe, ShieldAlert, FileText } from 'lucide-react';

export default function GlobalAnalyticsMatrix() {
  const { tradeData = [] } = useTradeData() || {};

  const metrics = useMemo(() => {
    const timelineMap = {};
    const countryMap = {};
    const riskComposition = { underInvoiced: 0, dumping: 0, parallelTrade: 0, standard: 0 };

    tradeData.forEach(row => {
      const amt = Number(row.Amount) || 0;
      const qty = Number(row.Quantity) || 1;
      const unitPrice = qty > 0 ? amt / qty : amt;
      const date = row.Date || 'Unknown';
      const country = row.OriginCountry || 'UNKNOWN';

      // Timeline aggregation
      timelineMap[date] = (timelineMap[date] || 0) + amt;

      // Geographic allocation
      countryMap[country] = (countryMap[country] || 0) + amt;

      // Forensic dynamic classification matching for visuals
      if (unitPrice < 50) riskComposition.underInvoiced += amt;
      else if (qty > 5000 && unitPrice < 100) riskComposition.dumping += amt;
      else if (row.Brand !== 'UNBRANDED / GRAY' && row.Importer?.includes('TRADING')) riskComposition.parallelTrade += amt;
      else riskComposition.standard += amt;
    });

    const timelineData = Object.keys(timelineMap).map(k => ({ date: k, TotalValue: timelineMap[k] })).sort((a,b) => new Date(a.date) - new Date(b.date));
    const countryData = Object.keys(countryMap).map(k => ({ country: k, Value: countryMap[k] })).sort((a,b) => b.Value - a.Value).slice(0, 8);
    const pieData = Object.keys(riskComposition).map(k => ({ name: k.replace(/([A-Z])/g, ' $1').toUpperCase(), value: riskComposition[k] }));

    return { timelineData, countryData, pieData };
  }, [tradeData]);

  const COLORS = ['#f43f5e', '#fbbf24', '#06b6d4', '#10b981'];

  return (
    <div className="p-6 space-y-6 text-slate-100 id-print-section">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart2 className="text-cyan-400" size={24} /> Global Analytics Visual Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">Unified graphical trends, distribution mappings, and statistical volumes spanning all operational cross-sections.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer">
          <FileText size={14} className="text-cyan-400" /> Print Charts Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl lg:col-span-2 print-break-avoid">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><TrendingUp size={14}/> Capital Flow Volatility Path</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="TotalValue" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Composition Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl print-break-avoid">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><ShieldAlert size={14}/> Risk Category Breakdown</h3>
          <div className="h-[240px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metrics.pieData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                  {metrics.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mt-2">
            {metrics.pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Country Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl lg:col-span-3 print-break-avoid">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Globe size={14}/> Top Corridor Asset Displacements</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.countryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="country" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="Value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

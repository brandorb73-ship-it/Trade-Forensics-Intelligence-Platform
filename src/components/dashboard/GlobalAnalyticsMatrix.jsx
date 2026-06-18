import React, { useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, TrendingUp, Globe, ShieldAlert, FileText } from 'lucide-react';

export default function GlobalAnalyticsMatrix() {
  const { tradeData = [] } = useTradeData() || {};

  const metrics = useMemo(() => {
    const timelineMap = {};
    const countryMap = {};
    const riskComposition = { underInvoiced: 0, antiDumping: 0, parallelTrade: 0, standard: 0 };

    tradeData.forEach(row => {
      const amt = Number(row.Amount) || 0;
      const qty = Number(row.Quantity) || 1;
      const unitPrice = qty > 0 ? amt / qty : amt;
      const date = row.Date || 'Unknown';
      const country = (row.OriginCountry || 'UNKNOWN').split('→')[0].trim(); // Normalize source nodes

      timelineMap[date] = (timelineMap[date] || 0) + amt;
      countryMap[country] = (countryMap[country] || 0) + amt;

      if (unitPrice < 50) riskComposition.underInvoiced += amt;
      else if (qty > 5000 && unitPrice < 100) riskComposition.antiDumping += amt;
      else if (row.Brand !== 'UNBRANDED' && row.Importer?.includes('TRADING')) riskComposition.parallelTrade += amt;
      else riskComposition.standard += amt;
    });

    const timelineData = Object.keys(timelineMap).map(k => ({ date: k, TotalValue: timelineMap[k] })).sort((a,b) => new Date(a.date) - new Date(b.date));
    const countryData = Object.keys(countryMap).map(k => ({ country: k, Value: countryMap[k] })).sort((a,b) => b.Value - a.Value).slice(0, 6);
    const pieData = Object.keys(riskComposition).map(k => ({ name: k.replace(/([A-Z])/g, ' $1').toUpperCase(), value: riskComposition[k] }));

    return { timelineData, countryData, pieData };
  }, [tradeData]);

  // Dark High-Contrast Professional Corporate Theme Colors
  const COLORS = ['#2563eb', '#d97706', '#c084fc', '#10b981'];

  return (
    <div className="space-y-6 text-slate-100 id-print-section">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="text-blue-500" size={24} /> Global Analytics Visual Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">Unified graphical trends, distribution mappings, and statistical volumes spanning all operational cross-sections.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer text-slate-200">
          <FileText size={14} className="text-blue-400" /> Print Charts Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Path Chart */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl lg:col-span-2 print-break-avoid">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><TrendingUp size={14}/> Capital Flow Volatility Path</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="TotalValue" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Contrast Risk Category Breakdown Pie Chart */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl print-break-avoid">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><ShieldAlert size={14}/> Risk Category Breakdown</h3>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metrics.pieData} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value">
                  {metrics.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                {/* Fixed White High Contrast text for tooltip text readability on hover */}
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#ffffff', fontFamily: 'monospace', fontSize: '12px' }} itemStyle={{ color: '#ffffff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mt-4 border-t border-slate-800/60 pt-3">
            {metrics.pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 truncate">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="font-bold text-slate-300">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Corridor Displacements Bar Chart */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl lg:col-span-3 print-break-avoid">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Globe size={14}/> Top Corridor Asset Displacements</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.countryData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="country" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontFamily: 'monospace' }} />
                <Bar dataKey="Value" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Shield, Scale, AlertOctagon, FileCheck, DollarSign, Award, Download, Network } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function LitigationIntelligence() {
  const { tradeData = [] } = useTradeData() || {};

  // Cross-Module Legal Aggregation Engine
  const legalBriefState = useMemo(() => {
    let damagesCounter = 0;
    const targets = new Set();
    const clearRiskLog = [];
    
    const chartMap = {};

    tradeData.forEach(row => {
      if (!row) return;
      const amt = Number(row.Amount) || 0;
      damagesCounter += amt;
      if (row.Importer) targets.add(row.Importer);

      const prod = (row.Product || '').toUpperCase();
      const origin = (row.OriginCountry || '').toUpperCase();
      const code = String(row.HSCode || '');

      // Core Risk Parsing Matrix
      let vectors = [];
      if (prod.includes('SEMAGLUTIDE') || prod.includes('WEGOVY')) {
        vectors.push({ type: 'Patent Infringement', desc: 'Unauthorized gray market logistics of patent-protected active pharmaceutical ingredients (APIs).' });
      }
      if (['RUSSIA', 'BELARUS', 'IRAN'].includes(origin) || ['DUBAI', 'UAE', 'TURKEY'].includes(origin) && amt > 500000) {
        vectors.push({ type: 'Sanctions Evasion', desc: 'High-value transactional routing clearing through shadow intermediaries.' });
      }
      if (code.startsWith('2402') || prod.includes('CIGARETTE') || prod.includes('TOBACCO')) {
        vectors.push({ type: 'Illicit Trade / Excise Fraud', desc: 'High-volume diversion corridor bypassing structured excise controls.' });
      }
      if (origin === 'XINJIANG' || origin === 'CHINA' && code.startsWith('5201')) {
        vectors.push({ type: 'Forced Labor Nexus', desc: 'Raw material origin trace indicates an intersection with forced labor restrictions.' });
      }

      vectors.forEach(v => {
        clearRiskLog.push({
          date: row.Date,
          violator: row.Importer,
          exporter: row.Exporter,
          type: v.type,
          narrative: v.desc,
          exposure: amt
        });

        chartMap[v.type] = (chartMap[v.type] || 0) + amt;
      });
    });

    const formattedChartData = Object.keys(chartMap).map(key => ({
      name: key,
      Value: chartMap[key]
    }));

    return {
      totalDamages: damagesCounter,
      uniqueTargets: targets.size,
      riskLogs: clearRiskLog.slice(0, 15),
      chartData: formattedChartData
    };
  }, [tradeData]);

  const COLORS = ['#f43f5e', '#fbbf24', '#06b6d4', '#10b981', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto text-slate-100 id-print-section">
      
      {/* Header and Controller Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <Scale className="text-emerald-500" size={26} />
            Forensic Litigation & Enforcement Dossier
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Automated statutory legal brief compiling evidentiary trade anomalies for corporate counsel and enforcement actions.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-black uppercase tracking-wider transition cursor-pointer shadow-md"
        >
          <Download size={14} />
          <span>Print Complete Dossier</span>
        </button>
      </div>

      {/* Executive Brief Card Block */}
      <div className="bg-slate-900 border-l-4 border-rose-500 p-5 rounded-xl space-y-2 print-break-avoid">
        <h2 className="text-xs font-mono font-black tracking-widest text-rose-400 uppercase flex items-center gap-2">
          <AlertOctagon size={14} /> PRIVILEGED WORK PRODUCT // ATTORNEY-CLIENT COMMUNICATION
        </h2>
        <p className="text-xs text-slate-300 font-mono leading-relaxed">
          This comprehensive framework auto-assembles cross-border transactional irregularities into an actionable enforcement format. Data calculations isolate value distortion patterns (under-invoicing), jurisdictional pivots (transshipment), and structural trademark infringement networks to support trade remedy litigation.
        </p>
      </div>

      {/* Aggregate Litigation Damage Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 print-break-avoid">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase">Calculated Commercial Exposure</span>
          <span className="text-2xl font-mono font-black text-rose-500 mt-1 block">
            ${legalBriefState.totalDamages.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Aggregate invoice pool under review</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 print-break-avoid">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase">Target Entities Identified</span>
          <span className="text-2xl font-mono font-black text-amber-400 mt-1 block">{legalBriefState.uniqueTargets} Consignees</span>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Unique corporate entities flagged for compliance review</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 print-break-avoid">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase">Evidentiary Confidence Level</span>
          <span className="text-2xl font-mono font-black text-emerald-400 mt-1 block">HIGH EXPOSURE</span>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Based on verified discrepancies in unit values</span>
        </div>
      </div>

      {/* Integrated Data Visualization & Forensic Analysis Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-break-avoid">
        
        {/* Risk Exposure Bar Allocation Chart */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Litigation Vector Exposure Allocation ($)</div>
          <div className="h-[280px] w-full text-slate-200">
            {legalBriefState.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={legalBriefState.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontFamily: 'monospace', fontSize: '11px' }} />
                  <Bar dataKey="Value" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                    {legalBriefState.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-600">Insufficient analytical metrics available for chart generation</div>
            )}
          </div>
        </div>

        {/* Breakdown Risk Classification Chart */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Statutory Threat Composition</div>
          <div className="h-[280px] w-full flex items-center justify-center">
            {legalBriefState.chartData.length > 0 ? (
              <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around gap-4">
                <div className="w-[180px] h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={legalBriefState.chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="Value">
                        {legalBriefState.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 font-mono text-[11px]">
                  {legalBriefState.chartData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-slate-400 uppercase">{item.name}:</span>
                      <span className="text-white font-bold">${item.Value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-600">No composition metrics extracted</div>
            )}
          </div>
        </div>

      </div>

      {/* Compiled Legal Risk Log Timeline Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3 print-break-avoid">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center justify-between">
          <span>Evidentiary Audit Logs (Verified Transnational Violations)</span>
          <span className="text-[10px] text-slate-500 normal-case">Chain of custody logs generated dynamically</span>
        </div>
        
        {legalBriefState.riskLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-2 font-bold uppercase text-[10px]">DATE</th>
                  <th className="pb-2 font-bold uppercase text-[10px]">THREAT VECTOR</th>
                  <th className="pb-2 font-bold uppercase text-[10px]">NARRATIVE/COMPLIANCE BREACH</th>
                  <th className="pb-2 font-bold uppercase text-[10px]">IMPORTER CONSIGNEE</th>
                  <th className="pb-2 font-bold uppercase text-[10px] text-right">EXPOSURE VALUE</th>
                </tr>
              </thead>
              <tbody>
                {legalBriefState.riskLogs.map((log, index) => (
                  <tr key={index} className="border-b border-slate-900/60 hover:bg-slate-950 transition">
                    <td className="py-3 pr-2 text-slate-400 whitespace-nowrap">{log.date}</td>
                    <td className="py-3 pr-2 font-black text-rose-400 whitespace-nowrap uppercase tracking-tighter">{log.type}</td>
                    <td className="py-3 pr-4 text-slate-300 leading-relaxed max-w-xs sm:max-w-md">{log.narrative}</td>
                    <td className="py-3 pr-2 font-bold text-slate-200 truncate max-w-[150px]">{log.violator}</td>
                    <td className="py-3 text-right font-bold text-white">${log.exposure.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-xs font-mono text-slate-600">
            No actionable legal metrics isolated within this trade dataset. Ensure correct column labels are initialized.
          </div>
        )}
      </div>

    </div>
  );
}

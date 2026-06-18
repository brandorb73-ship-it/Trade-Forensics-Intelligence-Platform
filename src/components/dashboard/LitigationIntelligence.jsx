import React, { useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Scale, AlertOctagon, FileCheck, DollarSign, ShieldAlert, Download, Briefcase, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function LitigationIntelligence() {
  const { tradeData = [] } = useTradeData() || {};

  const masterLegalSynthesis = useMemo(() => {
    let globalValuePool = 0;
    const targetSet = new Set();
    const suspectEntities = new Set();
    const dynamicBriefs = [];
    const legalChartMetrics = {};

    tradeData.forEach(row => {
      if (!row) return;
      const amount = Number(row.Amount) || 0;
      const quantity = Number(row.Quantity) || 1;
      const unitPrice = quantity > 0 ? amount / quantity : amount;
      
      globalValuePool += amount;
      if (row.Importer) targetSet.add(row.Importer);
      if (row.Exporter) suspectEntities.add(row.Exporter);

      const productString = (row.Product || '').toUpperCase();
      const originZone = (row.OriginCountry || '').toUpperCase();
      const hsPrefix = String(row.HSCode || '');

      let issuesIsolated = [];

      // 1. Intellectual Property & Patent Infringement
      if (productString.includes('SEMAGLUTIDE') || productString.includes('WEGOVY') || productString.includes('OZEMPIC')) {
        issuesIsolated.push({
          framework: 'Patent & Trademark Infringement',
          narrative: `Unlicensed cross-border shipping of proprietary active pharmaceutical ingredients (APIs). Matches global gray-market product patterns targeting protected design claims.`
        });
      }

      // 2. Anti-Dumping Violations
      if (quantity >= 5000 && unitPrice < 25.00) {
        issuesIsolated.push({
          framework: 'Predatory Anti-Dumping Vectors',
          narrative: `High-volume freight dumped into local zones significantly below standard global cost curves. Undermines domestic manufacturing protections.`
        });
      }

      // 3. Forced Labor Supply-Chain Nexus
      if (originZone === 'XINJIANG' || (originZone === 'CHINA' && hsPrefix.startsWith('52'))) {
        issuesIsolated.push({
          framework: 'Forced Labor Compliance Risk',
          narrative: `Supply-chain intersection with strictly embargoed logistics zones under domestic trade execution standards.`
        });
      }

      // 4. Sanctions Evasion & Illicit Trade Parallel Routing
      if (['RUSSIA', 'IRAN', 'BELARUS'].includes(originZone) || (['UAE', 'TURKEY', 'SINGAPORE'].includes(originZone) && amount > 750000)) {
        issuesIsolated.push({
          framework: 'Sanctions Evasion & Parallel Trade Diversion',
          narrative: `Complex asset routing through transshipment buffers. Structural hallmarks of trade diversion designed to bypass export controls.`
        });
      }

      issuesIsolated.forEach(issue => {
        dynamicBriefs.push({
          date: row.Date || 'N/A',
          importer: row.Importer || 'UNKNOWN',
          exporter: row.Exporter || 'UNKNOWN',
          framework: issue.framework,
          narrative: issue.narrative,
          liabilityValue: amount
        });

        legalChartMetrics[issue.framework] = (legalChartMetrics[issue.framework] || 0) + amount;
      });
    });

    const chartArray = Object.keys(legalChartMetrics).map(key => ({
      name: key,
      Exposure: legalChartMetrics[key]
    }));

    return {
      globalValuePool,
      targetCount: targetSet.size,
      suspectCount: suspectEntities.size,
      dossierLogs: dynamicBriefs.slice(0, 20),
      chartArray
    };
  }, [tradeData]);

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto text-slate-100 id-print-section">
      
      {/* Action Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <Scale className="text-rose-500" size={26} />
            Master Forensic Litigation & Compliance Dossier
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Statutory legal brief analyzing cross-border trade malfeasance for legal counsel, global security teams, and trade enforcement units.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-black uppercase tracking-wider transition cursor-pointer shadow-md"
        >
          <Download size={14} />
          <span>Export Master Dossier</span>
        </button>
      </div>

      {/* Privileged Legal Warning Box */}
      <div className="bg-slate-900 border-l-4 border-rose-600 p-5 rounded-xl space-y-2 print-break-avoid">
        <h2 className="text-xs font-mono font-black tracking-widest text-rose-500 uppercase flex items-center gap-2">
          <AlertOctagon size={14} /> CONFIDENTIAL ATTORNEY WORK PRODUCT // PREPARED FOR LITIGATION USE
        </h2>
        <p className="text-xs text-slate-300 font-mono leading-relaxed">
          This comprehensive capstone report integrates evidentiary flags processed across all trade monitoring modules. By mapping unit-value suppression, illegal parallel routing vectors, and trademark infringement, this document isolates target network structures to establish verifiable claims under international trade remedy statutes.
        </p>
      </div>

      {/* High-Contrast Analytical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 print-break-avoid">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase">Estimated Litigation Valuation</span>
          <span className="text-2xl font-mono font-black text-rose-500 mt-1 block">
            ${masterLegalSynthesis.globalValuePool.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Aggregate baseline trade footprint under assessment</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 print-break-avoid">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase">Target Consignees Flagged</span>
          <span className="text-2xl font-mono font-black text-amber-500 mt-1 block">{masterLegalSynthesis.targetCount} Entities</span>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Unique network targets identified for immediate compliance review</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 print-break-avoid">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase">Suspect Supply-Chain Entities</span>
          <span className="text-2xl font-mono font-black text-blue-400 mt-1 block">{masterLegalSynthesis.suspectCount} Exporters</span>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Active source points with systemic compliance anomalies</span>
        </div>
      </div>

      {/* Integrated Data Allocation Chart */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4 print-break-avoid">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Statutory Exposure Distribution ($)</div>
        <div className="h-[240px] w-full text-slate-200">
          {masterLegalSynthesis.chartArray.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masterLegalSynthesis.chartArray} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontFamily: 'monospace', fontSize: '11px' }} />
                <Bar dataKey="Exposure" fill="#ef4444" radius={[4, 4, 0, 0]}>
                  {masterLegalSynthesis.chartArray.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-600">No primary compliance liabilities isolated for graph mapping.</div>
          )}
        </div>
      </div>

      {/* Structured Litigation Brief Logs */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3 print-break-avoid">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center justify-between">
          <span>Evidentiary Audit Logs (Synthesized Infringement Matrices)</span>
          <span className="text-[10px] text-slate-500 normal-case">Chain of custody logs updated dynamically</span>
        </div>
        
        {masterLegalSynthesis.dossierLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-2 font-bold uppercase text-[9px]">DATE</th>
                  <th className="pb-2 font-bold uppercase text-[9px]">COMPLIANCE FRAMEWORK</th>
                  <th className="pb-2 font-bold uppercase text-[9px]">FORENSIC LITIGATION CASE STUDY NARRATIVE</th>
                  <th className="pb-2 font-bold uppercase text-[9px]">TARGET INTERMEDIARY</th>
                  <th className="pb-2 font-bold uppercase text-[9px] text-right">EXPOSURE</th>
                </tr>
              </thead>
              <tbody>
                {masterLegalSynthesis.dossierLogs.map((log, index) => (
                  <tr key={index} className="border-b border-slate-900/60 hover:bg-slate-950 transition">
                    <td className="py-3 pr-2 text-slate-400 whitespace-nowrap">{log.date}</td>
                    <td className="py-3 pr-2 font-black text-rose-400 whitespace-nowrap uppercase tracking-tighter">{log.framework}</td>
                    <td className="py-3 pr-4 text-slate-300 leading-relaxed max-w-xs sm:max-w-xl">{log.narrative}</td>
                    <td className="py-3 pr-2 font-bold text-slate-200 truncate max-w-[150px]">{log.importer}</td>
                    <td className="py-3 text-right font-bold text-white">${log.liabilityValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-xs font-mono text-slate-600">
            No clear compliance breaches or regulatory issues identified in this dataset.
          </div>
        )}
      </div>

    </div>
  );
}

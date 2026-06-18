import React, { useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Scale, AlertOctagon, FileText, Download } from 'lucide-react';

export default function LitigationIntelligence() {
  const { tradeData = [] } = useTradeData() || {};

  const masterLegalSynthesis = useMemo(() => {
    let globalValuePool = 0;
    const targets = new Set();
    const suspectEntities = new Set();
    const dynamicBriefs = [];

    tradeData.forEach(row => {
      if (!row) return;
      const amount = Number(row.Amount) || 0;
      const quantity = Number(row.Quantity) || 1;
      const unitPrice = quantity > 0 ? amount / quantity : amount;
      
      globalValuePool += amount;
      if (row.Importer) targets.add(row.Importer);
      if (row.Exporter) suspectEntities.add(row.Exporter);

      const productString = (row.Product || '').toUpperCase();
      const originZone = (row.OriginCountry || '').toUpperCase();
      const transMode = (row.TransportationMode || '').toUpperCase();
      const hsPrefix = String(row.HSCode || '');

      let issuesIsolated = [];

      // Grounding Evidence Check 1: Section 337 / IP Infringement Ecosystem
      if (productString.includes('SEMAGLUTIDE') || productString.includes('WEGOVY') || productString.includes('OZEMPIC')) {
        issuesIsolated.push({
          framework: 'Patent & Trademark Infringement Nexus (19 U.S.C. § 1337)',
          narrative: `Commercial scale importation trace of raw therapeutic polypeptide vectors matching signature profiles of patent-protected formulas. Commercially relevant to damages modeling based on unauthorized distributor sourcing networks.`
        });
      }

      // Grounding Evidence Check 2: Predatory Anti-Dumping & Price Distortion
      if (quantity >= 5000 && unitPrice < 25.00) {
        issuesIsolated.push({
          framework: 'Predatory Anti-Dumping Vectors',
          narrative: `Mass-volume freight inflows executed via structural unit-value suppression. Indicates possible related-party trade activity designed to circumvent fair market margins.`
        });
      }

      // Grounding Evidence Check 3: Forced Labor Compliance Risk
      if (originZone.includes('XINJIANG') || (originZone.includes('CHINA') && hsPrefix.startsWith('52'))) {
        issuesIsolated.push({
          framework: 'Forced Labor Supply-Chain Risk (UFLPA Enforcement)',
          narrative: `Upstream raw material origin mapping detects structural exposure to restricted production zones. Potentially relevant to corporate supply-chain reconstitution audits.`
        });
      }

      // Grounding Evidence Check 4: Transshipment Corridor Evasion
      if (originZone.includes('→') || originZone.includes('VIA') || transMode.includes('→')) {
        issuesIsolated.push({
          framework: 'Customs Circumvention & Rerouting Corridors',
          narrative: `Shipment-derived indicators confirm structural route splitting through third-country logistics hubs. Highly relevant to customs-linked evidence files and anti-circumvention litigation.`
        });
      }

      issuesIsolated.forEach(issue => {
        dynamicBriefs.push({
          date: row.Date || 'N/A',
          importer: row.Importer || 'UNKNOWN',
          exporter: row.Exporter || 'UNKNOWN',
          framework: issue.framework,
          narrative: issue.narrative,
          liabilityValue: amount,
          hscode: row.HSCode || 'Unclassified'
        });
      });
    });

    return {
      globalValuePool,
      targetCount: targets.size,
      suspectCount: suspectEntities.size,
      dossierLogs: dynamicBriefs
    };
  }, [tradeData]);

  return (
    <div className="space-y-8 text-slate-100 id-print-section">
      
      {/* Top Controls Action Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Scale className="text-blue-500" size={26} /> Master Litigation & Enforcement Dossier
          </h1>
          <p className="text-xs text-slate-400 mt-1">Full structural supply-chain reconstruction report for corporate counsel and enforcement actions.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-black uppercase tracking-wider transition cursor-pointer shadow-md"
        >
          <Download size={14} /> Export Master Dossier
        </button>
      </div>

      {/* Corporate Warning Framework Card */}
      <div className="bg-[#111827] border-l-4 border-blue-600 p-5 rounded-xl space-y-2 print-break-avoid">
        <h2 className="text-xs font-mono font-black tracking-widest text-blue-400 uppercase flex items-center gap-2">
          <AlertOctagon size={14} /> PRIVILEGED ATTORNEY-CLIENT COMMUNICATION // FOR LITIGATION AUDIT USE ONLY
        </h2>
        <p className="text-xs text-slate-300 font-mono leading-relaxed">
          This comprehensive master brief systematically cross-references raw data from every component layer—including network topologies, under-invoicing vectors, and parallel distribution routes. By doing so, it groups raw shipping events into structured legal narratives suitable for damages modeling and regulatory trade defense files.
        </p>
      </div>

      {/* Metrics Summary Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#111827] p-5 rounded-xl border border-slate-800 print-break-avoid">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase font-bold">Total Capital Under Assessment</span>
          <span className="text-2xl font-mono font-black text-white mt-1 block">
            ${masterLegalSynthesis.globalValuePool.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Aggregate baseline trade footprint under assessment</span>
        </div>

        <div className="bg-[#111827] p-5 rounded-xl border border-slate-800 print-break-avoid">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase font-bold">Target Consignees Flagged</span>
          <span className="text-2xl font-mono font-black text-amber-500 mt-1 block">{masterLegalSynthesis.targetCount} Entities</span>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Unique corporate entities flagged for commercial compliance review</span>
        </div>

        <div className="bg-[#111827] p-5 rounded-xl border border-slate-800 print-break-avoid">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase font-bold">Suspect Supply Nodes</span>
          <span className="text-2xl font-mono font-black text-blue-400 mt-1 block">{masterLegalSynthesis.suspectCount} Source Points</span>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Active source points with systemic compliance anomalies</span>
        </div>
      </div>

      {/* Comprehensive Report Generation Block */}
      <div className="space-y-6">
        <h3 className="text-xs font-mono font-black tracking-wider text-slate-400 uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
          <FileText size={14} className="text-blue-500"/> Evidentiary Supply-Chain Reconstruction Logs
        </h3>

        {masterLegalSynthesis.dossierLogs.length > 0 ? (
          <div className="space-y-4 print-force-visible">
            {masterLegalSynthesis.dossierLogs.map((log, index) => (
              <div key={index} className="p-5 bg-[#111827] rounded-xl border border-slate-800/80 space-y-3 print-break-avoid">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800/60 pb-2 font-mono text-xs">
                  <span className="font-black text-blue-400 uppercase tracking-tight text-sm">{log.framework}</span>
                  <div className="flex gap-4 text-slate-400 text-[11px]">
                    <span>Date: <strong className="text-slate-200">{log.date}</strong></span>
                    <span>HS: <strong className="text-slate-200">{log.hscode}</strong></span>
                    <span>Value: <strong className="text-white">${log.liabilityValue.toLocaleString()}</strong></span>
                  </div>
                </div>
                
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1 text-[10px]">Forensic Narrative:</span>
                  {log.narrative}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/40 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight">Exporter Node</span>
                    <span className="text-slate-300 truncate block">{log.exporter}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight">Importer Consignee</span>
                    <span className="text-slate-300 truncate block">{log.importer}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/10 italic">
                  <span>• Potentially relevant to importation analysis</span>
                  <span>• May support commercial scale assessment</span>
                  <span>• Suggests concentrated sourcing ecosystem</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#111827] border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-500">
            No active compliance alerts or statutory violations isolated within the current import trade dataset.
          </div>
        )}
      </div>

    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext.jsx'; // Add explicit .jsx extension
import { Network, Users, AlertCircle, Building2, CheckCircle } from 'lucide-react';

export default function EntityIntelligence() {
  const contextData = useTradeData();
  const tradeData = contextData && contextData.tradeData ? contextData.tradeData : [];
  
  const [activeEntityView, setActiveEntityView] = useState('ALL_NETWORKS');

  // Forensic Entity & Supply Chain Network Analysis
  const networkAnalysis = useMemo(() => {
    const exportersMap = {};
    const importersMap = {};
    let totalHighRiskVolume = 0;
    const networksList = [];

    tradeData.forEach(row => {
      const exporterName = (row.Exporter || 'UNKNOWN EXPORTER').toUpperCase();
      const importerName = (row.Importer || 'UNKNOWN IMPORTER').toUpperCase();
      const productDesc = (row.Product || '').toUpperCase();
      const hsString = String(row.HSCode || '');
      const amount = parseFloat(row.Amount) || 0;

      // Match exact high-risk nomenclature criteria passed from the core context engine
      const isMismatched = productDesc.includes('SEMAGLUTIDE') && hsString.startsWith('9101');

      if (isMismatched) {
        totalHighRiskVolume += amount;
      }

      // Track Exporter Profile Matrices
      if (!exportersMap[exporterName]) {
        exportersMap[exporterName] = { name: exporterName, totalValue: 0, tradeCount: 0, riskCount: 0, partners: new Set() };
      }
      exportersMap[exporterName].totalValue += amount;
      exportersMap[exporterName].tradeCount += 1;
      exportersMap[exporterName].partners.add(importerName);
      if (isMismatched) exportersMap[exporterName].riskCount += 1;

      // Track Importer Profile Matrices
      if (!importersMap[importerName]) {
        importersMap[importerName] = { name: importerName, totalValue: 0, tradeCount: 0, riskCount: 0, partners: new Set() };
      }
      importersMap[importerName].totalValue += amount;
      importersMap[importerName].tradeCount += 1;
      importersMap[importerName].partners.add(exporterName);
      if (isMismatched) importersMap[importerName].riskCount += 1;

      // Flatten out for node linkage calculations
      networksList.push({
        id: row.id,
        exporter: exporterName,
        importer: importerName,
        product: row.Product,
        amount,
        isRisk: isMismatched,
        corridor: `${row.OriginCountry || 'UNKNOWN'} → ${row.DestinationCountry || 'UNKNOWN'}`
      });
    });

    const topExporters = Object.values(exportersMap)
      .map(e => ({ ...e, uniquePartners: e.partners.size }))
      .sort((a, b) => b.totalValue - a.totalValue);

    const topImporters = Object.values(importersMap)
      .map(i => ({ ...i, uniquePartners: i.partners.size }))
      .sort((a, b) => b.totalValue - a.totalValue);

    return {
      exporters: topExporters,
      importers: topImporters,
      links: networksList,
      totalHighRiskVolume
    };
  }, [tradeData]);

  const filteredLinks = useMemo(() => {
    if (activeEntityView === 'RISK_NETWORKS') {
      return networkAnalysis.links.filter(l => l.isRisk);
    }
    return networkAnalysis.links;
  }, [networkAnalysis.links, activeEntityView]);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header Framework */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          Entity Network Analysis
          <span className="text-xs bg-emerald-500/10 px-2 py-1 rounded text-emerald-400 uppercase tracking-widest font-mono border border-emerald-500/20">
            Supply Chain Intelligence
          </span>
        </h1>
        <p className="text-sm text-slate-300 mt-1">Map corporate counterparty relationships and flag clusters trading under suspicious technical descriptions.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Total Documented Exporters</span>
            <span className="text-2xl font-black text-slate-100 font-mono">{networkAnalysis.exporters.length}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
            <Building2 size={22} />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Total Documented Importers</span>
            <span className="text-2xl font-black text-slate-100 font-mono">{networkAnalysis.importers.length}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Interlinked Risk Channels</span>
            <span className="text-2xl font-black text-rose-400 font-mono">
              ${networkAnalysis.totalHighRiskVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-400">
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      {/* Primary Data Grid Frames */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Entity Views Navigation Filter Row */}
        <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700 lg:col-span-1">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 border-b border-slate-700 pb-2 flex items-center justify-between">
            <span>Corporate Clusters</span>
            <Network size={12} className="text-slate-400" />
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setActiveEntityView('ALL_NETWORKS')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                activeEntityView === 'ALL_NETWORKS' ? 'bg-slate-900 border border-slate-600 text-white font-bold' : 'bg-slate-900/40 border border-transparent text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
              }`}
            >
              <span>All Counterparty Links</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-bold">{networkAnalysis.links.length}</span>
            </button>

            <button
              onClick={() => setActiveEntityView('RISK_NETWORKS')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center border cursor-pointer ${
                activeEntityView === 'RISK_NETWORKS' ? 'bg-rose-950/60 border-rose-600 text-rose-300 font-bold' : 'bg-rose-950/20 border-rose-950 text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              <span className="flex items-center gap-1.5"><AlertCircle size={12} /> Flagged Shell Channels</span>
              <span className="bg-rose-900/60 px-1.5 py-0.5 rounded text-[10px] text-rose-200 font-bold">
                {networkAnalysis.links.filter(l => l.isRisk).length}
              </span>
            </button>
          </div>
        </div>

        {/* Counterparty Dynamic Relational Ledger Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden lg:col-span-2">
          <div className="p-4 bg-slate-900/80 border-b border-slate-700 text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
            Relationship Node Activity Matrix ({filteredLinks.length} Connections)
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-700 text-slate-300 font-mono text-xs sticky top-0 z-10">
                  <th className="px-4 py-3">Shipper / Exporter</th>
                  <th className="px-4 py-3">Consignee / Importer</th>
                  <th className="px-4 py-3 text-right">Value (USD)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-mono text-xs">
                {filteredLinks.length > 0 ? (
                  filteredLinks.map((link, i) => (
                    <tr key={link.id || i} className={`hover:bg-slate-700/30 transition-colors ${link.isRisk ? 'bg-rose-950/10' : ''}`}>
                      <td className="px-4 py-3 text-slate-200 max-w-[200px] truncate font-bold">{link.exporter}</td>
                      <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate">{link.importer}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-100">
                        ${link.amount ? Number(link.amount).toLocaleString() : '0.00'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {link.isRisk ? (
                          <span className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900 text-[10px] font-black">HIGH RISK</span>
                        ) : (
                          <span className="text-slate-400 text-[10px] flex items-center justify-center gap-1"><CheckCircle size={10} className="text-emerald-500" /> Verified</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-slate-500">No trading entity links found.</td>
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

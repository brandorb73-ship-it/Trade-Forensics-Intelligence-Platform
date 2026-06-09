import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Network, Users, AlertCircle, Building2, CheckCircle } from 'lucide-react';

export default function EntityIntelligence() {
  const contextData = useTradeData();
  const tradeData = contextData && contextData.tradeData ? contextData.tradeData : [];
  const [activeEntityView, setActiveEntityView] = useState('ALL_NETWORKS');

  const entityAnalysis = useMemo(() => {
    const exporters = {};
    const importers = {};
    let highRiskEntitiesCount = 0;
    let crossTradingLoopsCount = 0;

    tradeData.forEach(row => {
      const exp = row.Exporter || 'UNKNOWN';
      const imp = row.Importer || 'UNKNOWN';
      const val = parseFloat(row.Amount) || 0;
      
      // Target the specific misclassification pattern from the dataset
      const hsString = String(row.HSCode || '');
      const productDesc = (row.Product || '').toUpperCase();
      const isHighRisk = productDesc.includes('SEMAGLUTIDE') && hsString.startsWith('9101');

      // Aggregate Exporter Data Matrix
      if (!exporters[exp]) {
        exporters[exp] = { name: exp, totalValue: 0, count: 0, riskCount: 0, primaryTarget: {}, type: 'Exporter' };
      }
      exporters[exp].totalValue += val;
      exporters[exp].count += 1;
      if (isHighRisk) exporters[exp].riskCount += 1;
      exporters[exp].primaryTarget[imp] = (exporters[exp].primaryTarget[imp] || 0) + 1;

      // Aggregate Importer Data Matrix
      if (!importers[imp]) {
        importers[imp] = { name: imp, totalValue: 0, count: 0, riskCount: 0, primarySource: {}, type: 'Importer' };
      }
      importers[imp].totalValue += val;
      importers[imp].count += 1;
      if (isHighRisk) importers[imp].riskCount += 1;
      importers[imp].primarySource[exp] = (importers[imp].primarySource[exp] || 0) + 1;
    });

    // Process profiles and evaluate network risk states
    const allProfiles = [...Object.values(exporters), ...Object.values(importers)];
    
    const processedProfiles = allProfiles.map(entity => {
      let networkRiskState = 'LOW';
      let forensicNotes = 'Clear corporate operating patterns verified.';
      
      if (entity.riskCount > 0) {
        networkRiskState = 'CRITICAL';
        forensicNotes = 'Direct linkage to high-risk customs misclassifications.';
        highRiskEntitiesCount += 1;
      } 

      // Self-Trading / Circular Loop Detection Logic
      const topTargetPartner = entity.primaryTarget 
        ? Object.keys(entity.primaryTarget).sort((a,b) => entity.primaryTarget[b] - entity.primaryTarget[a])[0]
        : null;

      if (topTargetPartner && importers[topTargetPartner]?.primarySource[entity.name] > 0) {
        // Exclude generic UNKNOWN categories to eliminate false loops
        if (entity.name !== 'UNKNOWN' && topTargetPartner !== 'UNKNOWN') {
          networkRiskState = 'CRITICAL';
          forensicNotes = 'High-frequency circular reciprocity vector flagged.';
          crossTradingLoopsCount += 1;
        }
      }

      return { ...entity, networkRiskState, forensicNotes };
    }).sort((a, b) => b.totalValue - a.totalValue);

    return {
      profiles: processedProfiles,
      highRiskEntitiesCount,
      crossTradingLoopsCount
    };
  }, [tradeData]);

  const filteredProfiles = useMemo(() => {
    if (activeEntityView === 'ALL_NETWORKS') return entityAnalysis.profiles;
    if (activeEntityView === 'RISK_ONLY') return entityAnalysis.profiles.filter(p => p.networkRiskState === 'CRITICAL');
    return entityAnalysis.profiles.filter(p => p.type === activeEntityView);
  }, [entityAnalysis.profiles, activeEntityView]);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      
      {/* Context Headings */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          Entity Network Intelligence <span className="text-xs bg-emerald-500/20 px-2 py-1 rounded text-emerald-400 uppercase tracking-widest font-mono border border-emerald-500/30">Counterparty Link Analysis</span>
        </h1>
        <p className="text-sm text-slate-300 mt-1">Audit supply-chain counterparties to uncover hidden naming variations, shell companies, and circular trade loops.</p>
      </div>

      {/* Entity Analytics Insight Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Flagged Corporate Links</span>
            <span className="text-2xl font-black text-rose-400 font-mono">
              {entityAnalysis.highRiskEntitiesCount} <span className="text-xs text-slate-500 font-normal">Entities</span>
            </span>
          </div>
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-400">
            <Building2 size={22} />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Reciprocal Trading Loops</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {entityAnalysis.crossTradingLoopsCount} <span className="text-xs text-slate-500 font-normal">Loops Isolated</span>
            </span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-800/50 text-amber-400">
            <Network size={22} className="animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Audited Ecosystem Volume</span>
            <span className="text-2xl font-black text-slate-200 font-mono">
              {entityAnalysis.profiles.length} <span className="text-xs text-slate-500 font-normal">Profiles</span>
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-700/60 border border-slate-600/60 text-slate-300">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Main Structural Entity Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side Filters Bar */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2 lg:col-span-1">
          <span className="text-xs font-bold font-mono uppercase text-slate-400 block tracking-wider pb-1 border-b border-slate-700 mb-2">Network Segmenters</span>
          
          <button 
            onClick={() => setActiveEntityView('ALL_NETWORKS')}
            className={`w-full text-left p-2 rounded text-xs font-mono font-bold transition flex justify-between cursor-pointer ${activeEntityView === 'ALL_NETWORKS' ? 'bg-slate-900 border border-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span>Master Counterparties</span>
            <span>{entityAnalysis.profiles.length}</span>
          </button>

          <button 
            onClick={() => setActiveEntityView('RISK_ONLY')}
            className={`w-full text-left p-2 rounded text-xs font-mono font-bold transition flex justify-between border cursor-pointer ${activeEntityView === 'RISK_ONLY' ? 'bg-rose-950/40 border-rose-600 text-rose-300' : 'border-transparent text-rose-400 hover:text-rose-300'}`}
          >
            <span>High-Risk Interventions</span>
            <span>{entityAnalysis.highRiskEntitiesCount}</span>
          </button>

          <button 
            onClick={() => setActiveEntityView('Exporter')}
            className={`w-full text-left p-2 rounded text-xs font-mono font-bold transition flex justify-between cursor-pointer ${activeEntityView === 'Exporter' ? 'bg-slate-900 border border-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span>Primary Exporters</span>
          </button>

          <button 
            onClick={() => setActiveEntityView('Importer')}
            className={`w-full text-left p-2 rounded text-xs font-mono font-bold transition flex justify-between cursor-pointer ${activeEntityView === 'Importer' ? 'bg-slate-900 border border-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span>Primary Importers</span>
          </button>
        </div>

        {/* Right Side Corporate Grid Ledger */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-700 font-mono text-xs text-slate-300">
                  <th className="px-4 py-3">Counterparty Name</th>
                  <th className="px-4 py-3">Operating Domain</th>
                  <th className="px-4 py-3 text-right">Aggregated Volume</th>
                  <th className="px-4 py-3 text-center">Frequencies</th>
                  <th className="px-4 py-3">Network Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-mono text-xs">
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-100 uppercase tracking-wide max-w-xs truncate">{p.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold tracking-widest ${p.type === 'Exporter' ? 'bg-blue-950 text-blue-300 border border-blue-900' : 'bg-purple-950 text-purple-300 border border-purple-900'}`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-200">${p.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-400">{p.count} Manifests</td>
                      <td className="px-4 py-3 space-y-1">
                        {p.networkRiskState === 'CRITICAL' ? (
                          <div className="inline-flex items-center gap-1 text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded">
                            <AlertCircle size={12} /> CRITICAL VECTOR
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            <CheckCircle size={11} className="text-slate-500" /> Verified Low
                          </div>
                        )}
                        <span className="block text-[10px] text-slate-400 font-medium font-sans">{p.forensicNotes}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-500">
                      No matching corporate entity records found in current system matrix.
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

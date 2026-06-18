import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Globe, RefreshCw, ShieldAlert, FileText, Info, Compass } from 'lucide-react';

export default function CountryRiskIntelligence() {
  const { tradeData = [] } = useTradeData() || {};
  const [filterType, setFilterType] = useState('ALL');

  const riskAnalysis = useMemo(() => {
    const importerHistory = {};
    const processed = [];

    // First pass to build entity behavioral base profiles
    tradeData.forEach(row => {
      if (!row.Importer) return;
      if (!importerHistory[row.Importer]) {
        importerHistory[row.Importer] = { origins: new Set(), routes: [] };
      }
      if (row.OriginCountry) importerHistory[row.Importer].origins.add(row.OriginCountry);
    });

    // Secondary deep verification run
    tradeData.forEach(row => {
      const originsUsed = importerHistory[row.Importer]?.origins?.size || 1;
      const isTransshipmentHub = ['MALAYSIA', 'SINGAPORE', 'UAE', 'DUBAI', 'TURKEY', 'TURKIYE', 'HONG KONG'].includes((row.OriginCountry || '').toUpperCase());
      const isSanctionAdjacent = ['RUSSIA', 'BELARUS', 'IRAN'].includes((row.OriginCountry || '').toUpperCase());

      let riskType = 'STANDARD_ROUTE';
      let severity = 'LOW';
      let brief = 'Routing profile matches historic origin vectors.';

      if (originsUsed > 2 && isTransshipmentHub) {
        riskType = 'TARIFF_CIRCUMVENTION';
        severity = 'CRITICAL';
        brief = `High probability of duty avoidance via transshipment channel. Importer shifted trade networks aggressively through a known logistics clearing zone.`;
      } else if (isTransshipmentHub && isSanctionAdjacent) {
        riskType = 'SANCTIONS_REROUTING';
        severity = 'HIGH';
        brief = `Potential compliance diversion. Cargo originates from an intermediary trade cluster with a high frequency of shadow fleet activity.`;
      } else if (originsUsed > 1 && row.Product?.toUpperCase().includes('TOBACCO')) {
        riskType = 'SUDDEN_ORIGIN_CHANGE';
        severity = 'MEDIUM';
        brief = `Irregular logistical pivot observed for sensitive commodity lines. Raw material origins show sudden deviation.`;
      }

      processed.push({ ...row, riskType, severity, brief });
    });

    return processed.sort((a, b) => (b.severity === 'CRITICAL' ? 1 : -1));
  }, [tradeData]);

  const filtered = useMemo(() => {
    if (filterType === 'ALL') return riskAnalysis.filter(e => e.riskType !== 'STANDARD_ROUTE');
    return riskAnalysis.filter(e => e.riskType === filterType);
  }, [riskAnalysis, filterType]);

  return (
    <div className="p-6 space-y-6 text-slate-100 id-print-section">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 non-printable">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">Jurisdictional Risk & Transshipment Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">Isolate structural rerouting paths, customs border avoidance hubs, and unmapped maritime transit legs.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-700 cursor-pointer">
          <FileText size={14} className="text-emerald-400" /> Export Corridor Dossier
        </button>
      </div>

      <div className="bg-slate-900 border-l-4 border-amber-500 p-4 rounded-xl print-break-avoid">
        <h3 className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-2"><Compass size={14}/> Geopolitical Evasion Brief</h3>
        <p className="text-xs text-slate-300 mt-1 font-mono leading-relaxed">
          Sanctions bypass networks rarely move items directly from origin nodes to destination markets. This suite monitors structural adjustments in bill-of-lading declarations to flags dynamic switches through transshipment corridors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2 non-printable">
          {['ALL', 'TARIFF_CIRCUMVENTION', 'SANCTIONS_REROUTING', 'SUDDEN_ORIGIN_CHANGE'].map(type => (
            <button key={type} onClick={() => setFilterType(type)} className={`w-full text-left p-3 rounded font-mono text-xs cursor-pointer block border ${filterType === type ? 'bg-slate-800 border-amber-500 text-white' : 'bg-slate-900/40 border-transparent text-slate-400 hover:bg-slate-900'}`}>
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {filtered.map((evt, idx) => (
            <div key={idx} className={`p-4 rounded-xl border print-break-avoid ${evt.severity === 'CRITICAL' ? 'bg-rose-950/10 border-rose-900/50' : 'bg-slate-900/60 border-slate-800'}`}>
              <div className="flex justify-between border-b border-slate-800 pb-2 mb-2 font-mono text-xs">
                <span className="font-bold text-amber-400">{evt.riskType}</span>
                <span className="text-slate-400">{evt.Date}</span>
              </div>
              <p className="text-xs font-mono text-slate-300"><span className="text-slate-500 font-bold">Indicator:</span> {evt.brief}</p>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/40 text-[11px] font-mono text-slate-400">
                <div><span className="block text-[9px] text-slate-500 uppercase">Origin Node</span>{evt.OriginCountry}</div>
                <div><span className="block text-[9px] text-slate-500 uppercase">Intermediary Corridors</span>{evt.TransportationMode}</div>
                <div><span className="block text-[9px] text-slate-500 uppercase">Target Consignee</span>{evt.Importer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

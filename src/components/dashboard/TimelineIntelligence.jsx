import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { Clock, TrendingUp, Calendar, AlertTriangle, ShieldAlert, FileText, ArrowRight, Info, ShieldCheck } from 'lucide-react';

export default function TimelineIntelligence() {
  const contextData = useTradeData();
  const tradeData = contextData?.tradeData || [];

  const [activeTimelineFilter, setActiveTimelineFilter] = useState('ALL_ANOMALIES');

  // Forensic Time-Series Engine
  const timelineAnalysis = useMemo(() => {
    const monthlyVolumeMap = {};
    const importerMonthlyMap = {};
    const entityReroutingMap = {};
    const timelineEvents = [];

    const sortedData = [...tradeData]
      .filter(row => row && row.Date && row.Date !== 'N/A')
      .sort((a, b) => {
        const timeA = new Date(a.Date).getTime();
        const timeB = new Date(b.Date).getTime();
        return isNaN(timeA) || isNaN(timeB) ? 0 : timeA - timeB;
      });

    sortedData.forEach(row => {
      const dateStr = row.Date || '';
      if (dateStr.length < 7) return; 
      
      const parsedDate = new Date(dateStr);
      const monthBucket = !isNaN(parsedDate)
        ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
        : 'UNKNOWN';

      const amount = Number(row.Amount) || 0;
      const importer = (row.Importer || 'UNKNOWN').toUpperCase();
      const exporter = (row.Exporter || 'UNKNOWN').toUpperCase();
      const corridor = `${row.OriginCountry || 'UNKNOWN'} → ${row.DestinationCountry || 'UNKNOWN'}`;
      const productDesc = (row.Product || '').toUpperCase();
      const hsString = String(row.HSCode || '');

      monthlyVolumeMap[monthBucket] = (monthlyVolumeMap[monthBucket] || 0) + amount;

      if (!importerMonthlyMap[importer]) importerMonthlyMap[importer] = {};
      importerMonthlyMap[importer][monthBucket] = (importerMonthlyMap[importer][monthBucket] || 0) + amount;

      if (!entityReroutingMap[exporter]) entityReroutingMap[exporter] = [];
      if (!entityReroutingMap[exporter].includes(corridor)) {
        entityReroutingMap[exporter].push(corridor);
      }

      const isMismatched = productDesc.includes('SEMAGLUTIDE') && hsString.startsWith('9101');

      const history = importerMonthlyMap[importer] || {};
      const currentMonthVolume = history[monthBucket] || 0;
      const monthsWithData = Object.values(history);
      const averageHistoricalVolume = monthsWithData.length > 0 
        ? monthsWithData.reduce((a, b) => a + b, 0) / monthsWithData.length 
        : 0;
      
      const isVolumeSpike = currentMonthVolume > 50000 && currentMonthVolume > (averageHistoricalVolume * 2.5);
      const totalRoutesUsedByExporter = entityReroutingMap[exporter].length;
      const isSuddenReroute = totalRoutesUsedByExporter > 1 && isMismatched;

      let anomalyType = 'NORMAL_FLOW';
      let severity = 'LOW';
      let summary = 'Standard operational baseline flow configuration.';

      if (isVolumeSpike) {
        anomalyType = 'VOLUME_SPIKE';
        severity = 'HIGH';
        summary = `Sudden operational growth. Monthly imports scaled abruptly past historical baseline limits.`;
      } else if (isSuddenReroute) {
        anomalyType = 'POST_LAWSUIT_REROUTE';
        severity = 'CRITICAL';
        summary = `Structural route switch identified for exporter counterparty shifting into alternative trade zones.`;
      } else if (isMismatched) {
        anomalyType = 'SUSPICIOUS_TIMING';
        severity = 'MEDIUM';
        summary = `Unusual chronological batching of mismatching manifest item declarations.`;
      }

      timelineEvents.push({
        ...row,
        anomalyType,
        severity,
        summary,
        monthBucket
      });
    });

    return timelineEvents.sort((a, b) => {
      const severityWeight = { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1, 'LOW': 0 };
      return (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
    });
  }, [tradeData]);

  const filteredEvents = useMemo(() => {
    if (activeTimelineFilter === 'ALL_ANOMALIES') {
      return timelineAnalysis.filter(e => e.anomalyType !== 'NORMAL_FLOW');
    }
    return timelineAnalysis.filter(e => e.anomalyType === activeTimelineFilter);
  }, [timelineAnalysis, activeTimelineFilter]);

  const counters = useMemo(() => {
    return {
      spikes: timelineAnalysis.filter(e => e.anomalyType === 'VOLUME_SPIKE').length,
      reroutes: timelineAnalysis.filter(e => e.anomalyType === 'POST_LAWSUIT_REROUTE').length,
      timing: timelineAnalysis.filter(e => e.anomalyType === 'SUSPICIOUS_TIMING').length
    };
  }, [timelineAnalysis]);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto id-print-section text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5 non-printable">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Timeline Intelligence Engine
            <span className="text-xs bg-cyan-500/10 px-2 py-1 rounded text-cyan-400 uppercase tracking-widest font-mono border border-cyan-500/20">
              Chronological Forensics
            </span>
          </h1>
          <p className="text-sm text-slate-300 mt-1">Isolate sequential anomalies, irregular spikes, sudden growth changes, and evasive corporate rerouting vectors over time.</p>
        </div>

        {tradeData.length > 0 && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold font-mono text-slate-200 transition shadow-sm cursor-pointer"
          >
            <FileText size={14} className="text-cyan-400" />
            <span>Export Timeline Briefing</span>
          </button>
        )}
      </div>

      {/* Forensic Intelligence Briefing Notice */}
      <div className="bg-slate-900 border-l-4 border-cyan-500 p-5 rounded-xl shadow-md space-y-3">
        <h2 className="text-sm font-black tracking-wider text-cyan-400 font-mono uppercase flex items-center gap-2">
          <Info size={16} /> Technical Risk Dossier: Split-Batching & Misdeclaration Indicators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 font-mono leading-relaxed">
          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-white font-bold block border-b border-slate-800 pb-1 mb-1">1. SPLIT BATCHING TIMING</span>
            High-frequency concurrent shipments of small token dollar values indicate deliberate "structuring." Moving commercial cargo via duplicate declarations on a single calendar day is a mechanism used to artificially remain under de minimis automated screening profiles.
          </div>
          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold block border-b border-slate-800 pb-1 mb-1">2. PEPTIDE MISCLASSIFICATION</span>
            Declaring regulated cold-chain biopharmaceuticals (Semaglutide) under Chapter 9101 (Precious Metal Wristwatches) completely bypasses automated drug licensing controls and health import checks, creating immediate illicit market entry points.
          </div>
          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-rose-400 font-bold block border-b border-slate-800 pb-1 mb-1">3. REGIONAL RISK VECTOR</span>
            The Malaysia → Singapore transit channel functions as a highly active cross-border logistics channel. Using generic descriptive consumer hardware tags across this pathway exploits bulk freight corridors to conceal high-demand black-market pharmaceutical goods.
          </div>
        </div>
      </div>

      {/* Metrics Summary Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Sudden Volume Spikes</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{counters.spikes} <span className="text-xs text-slate-400 font-normal">Triggers</span></span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/40 text-amber-400">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Evasive Rerouting Clusters</span>
            <span className="text-2xl font-black text-rose-400 font-mono">{counters.reroutes} <span className="text-xs text-slate-400 font-normal">Identified</span></span>
          </div>
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/40 text-rose-400">
            <ShieldAlert size={22} />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase">Suspicious Timing Patterns</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">{counters.timing} <span className="text-xs text-slate-400 font-normal">Batches</span></span>
          </div>
          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-900/40 text-cyan-400">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Workspace splits views layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Navigation Filters */}
        <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700 lg:col-span-1 non-printable">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 border-b border-slate-700 pb-2 flex items-center justify-between">
            <span>Temporal Filters</span>
            <Calendar size={12} className="text-slate-400" />
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTimelineFilter('ALL_ANOMALIES')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                activeTimelineFilter === 'ALL_ANOMALIES' ? 'bg-slate-900 border border-slate-600 text-white font-bold' : 'bg-slate-900/40 border border-transparent text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
              }`}
            >
              <span>All Highlighted Anomalies</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-bold">
                {timelineAnalysis.filter(e => e.anomalyType !== 'NORMAL_FLOW').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTimelineFilter('VOLUME_SPIKE')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                activeTimelineFilter === 'VOLUME_SPIKE' ? 'bg-amber-950/60 border border-amber-600 text-amber-300 font-bold' : 'bg-amber-950/20 border-transparent text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <span>Importer Volume Spikes</span>
              <span className="bg-amber-900/40 px-1.5 py-0.5 rounded text-[10px] text-amber-200 font-bold">{counters.spikes}</span>
            </button>

            <button
              onClick={() => setActiveTimelineFilter('POST_LAWSUIT_REROUTE')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                activeTimelineFilter === 'POST_LAWSUIT_REROUTE' ? 'bg-rose-950/60 border border-rose-600 text-rose-300 font-bold' : 'bg-rose-950/20 border-transparent text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              <span>Post-Incident Rerouting</span>
              <span className="bg-rose-900/40 px-1.5 py-0.5 rounded text-[10px] text-rose-200 font-bold">{counters.reroutes}</span>
            </button>
          </div>
        </div>

        {/* Chronological Stream Output */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs font-bold font-mono text-slate-300 flex justify-between items-center non-printable">
            <span>CHRONOLOGICAL VELOCITY OUTLIERS ({filteredEvents.length} SCANNED INCIDENTS)</span>
            <span className="text-[10px] text-slate-500 uppercase">Real-Time Delta Sorting Enabled</span>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
              {filteredEvents.map((evt, idx) => (
                <div 
                  key={evt.id ?? idx} 
                  className={`p-5 rounded-xl border transition-all ${
                    evt.severity === 'CRITICAL' 
                      ? 'bg-rose-950/20 border-rose-900/70 hover:border-rose-700' 
                      : evt.severity === 'HIGH' 
                        ? 'bg-amber-950/20 border-amber-900/70 hover:border-amber-700' 
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/60 pb-3 mb-3 font-mono text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 bg-slate-950 rounded text-slate-400 font-bold tracking-tight">
                        {evt.Date || 'N/A'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider ${
                        evt.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        evt.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {(evt.anomalyType || 'ALERT').replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-slate-100 font-bold">
                      Value: ${evt.Amount ? Number(evt.Amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="md:col-span-2 space-y-2">
                      <p className="text-slate-200 leading-relaxed font-medium">
                        <span className="text-slate-400 font-bold">Audit Insight:</span> {evt.summary || ''}
                      </p>
                      <div className="text-slate-400 text-[11px] truncate space-y-1">
                        <div><span className="font-bold text-slate-300">Cargo Manifest:</span> {evt.Product || 'UNSPECIFIED'} (HS: {evt.HSCode || 'N/A'})</div>
                        {/* BRAND VALUE ADDED HERE */}
                        <div><span className="font-bold text-slate-400">Brand Designation:</span> <span className="text-emerald-400 font-bold">{evt.Brand || 'UNBRANDED / GRAY'}</span></div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                      <div className="truncate text-slate-300">
                        <span className="text-slate-500 font-bold uppercase text-[9px] block">Exporter node</span>
                        {evt.Exporter || 'UNKNOWN'}
                      </div>
                      <div className="truncate text-slate-300">
                        <span className="text-slate-500 font-bold uppercase text-[9px] block">Importer node</span>
                        {evt.Importer || 'UNKNOWN'}
                      </div>
                      <div className="text-cyan-400 font-semibold flex items-center gap-1 mt-1">
                        <span>{evt.OriginCountry || 'UNKNOWN'}</span>
                        <ArrowRight size={10} className="text-slate-500" />
                        <span>{evt.DestinationCountry || 'UNKNOWN'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-16 text-center text-xs font-mono text-slate-500">
              No historical chronological spikes or outliers found matching criteria filters.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

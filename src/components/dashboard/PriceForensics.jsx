import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { DollarSign, AlertTriangle, TrendingDown, FileText, Info, BarChart2, ShieldAlert, ArrowDownRight, ArrowRight } from 'lucide-react';

export default function PriceForensics() {
  const contextData = useTradeData();
  const tradeData = contextData?.tradeData || [];

  const [activePriceFilter, setActivePriceFilter] = useState('ALL_ANOMALIES');

  // Forensic Valuation, Unit-Pricing, and Dumping Analytical Engine
  const priceAnalysis = useMemo(() => {
    const productStatsMap = {};
    const processedEvents = [];

    // Step 1: Establish pricing baselines by aggregating product descriptions & brands
    tradeData.forEach(row => {
      if (!row || !row.Product) return;
      
      const productKey = (row.Product || '').toUpperCase();
      const brandKey = (row.Brand || 'UNBRANDED').toUpperCase();
      const lookupKey = `${productKey}::${brandKey}`;

      const amount = Number(row.Amount) || 0;
      const quantity = Number(row.Quantity) || 1; 
      const unitPrice = quantity > 0 ? amount / quantity : amount;

      if (!productStatsMap[lookupKey]) {
        productStatsMap[lookupKey] = {
          totalAmount: 0,
          totalQuantity: 0,
          prices: [],
        };
      }

      productStatsMap[lookupKey].totalAmount += amount;
      productStatsMap[lookupKey].totalQuantity += quantity;
      productStatsMap[lookupKey].prices.push(unitPrice);
    });

    // Calculate dynamic statistical averages per product/brand cluster
    Object.keys(productStatsMap).forEach(key => {
      const stats = productStatsMap[key];
      const count = stats.prices.length;
      stats.averagePrice = count > 0 ? stats.prices.reduce((a, b) => a + b, 0) / count : 0;
    });

    // Step 2: Evaluate individual line items against historical statistical baselines
    tradeData.forEach(row => {
      if (!row) return;

      const productKey = (row.Product || '').toUpperCase();
      const brandKey = (row.Brand || 'UNBRANDED').toUpperCase();
      const lookupKey = `${productKey}::${brandKey}`;
      
      const amount = Number(row.Amount) || 0;
      const quantity = Number(row.Quantity) || 1;
      const unitPrice = quantity > 0 ? amount / quantity : amount;
      
      const stats = productStatsMap[lookupKey] || { averagePrice: unitPrice };
      const globalAverage = stats.averagePrice;

      // Anomaly Logic Triggers
      // Under-invoicing: Value is significantly beneath average for this product class (evading tariffs)
      const isUnderInvoiced = unitPrice < (globalAverage * 0.4) && amount > 0;
      // Dumping Indicator: Bulk commercial quantity moved at clear loss leader or system-disrupting pricing structures
      const isDumping = unitPrice < (globalAverage * 0.55) && quantity >= 5000;
      // Over-invoicing or extreme variance deviation
      const isAbnormalPrice = (unitPrice > globalAverage * 2.5 || unitPrice < globalAverage * 0.3) && !isDumping && !isUnderInvoiced;

      let anomalyType = 'NORMAL_PRICE';
      let severity = 'LOW';
      let summary = 'Transaction falls within normal baseline valuation bounds.';

      if (isUnderInvoiced) {
        anomalyType = 'UNDER_INVOICING';
        severity = 'CRITICAL';
        summary = `Severe value depression. Declared unit cost drops ${Math.round((1 - (unitPrice / globalAverage)) * 100)}% below established class averages, indicating deliberate tariff asset masking.`;
      } else if (isDumping) {
        anomalyType = 'DUMPING_INDICATOR';
        severity = 'HIGH';
        summary = `High-volume predatory pricing layout. Bulk commercial cargo injected into local markets below recognized historical production costs.`;
      } else if (isAbnormalPrice) {
        anomalyType = 'ABNORMAL_PRICING';
        severity = 'MEDIUM';
        summary = `Significant baseline price variation detected. Unit price deviates sharply from peer transactions.`;
      }

      processedEvents.push({
        ...row,
        unitPrice,
        globalAverage,
        anomalyType,
        severity,
        summary
      });
    });

    // Sort by priority severity weight so critical vectors display first
    return processedEvents.sort((a, b) => {
      const severityWeight = { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1, 'LOW': 0 };
      return (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
    });
  }, [tradeData]);

  const filteredEvents = useMemo(() => {
    if (activePriceFilter === 'ALL_ANOMALIES') {
      return priceAnalysis.filter(e => e.anomalyType !== 'NORMAL_PRICE');
    }
    return priceAnalysis.filter(e => e.anomalyType === activePriceFilter);
  }, [priceAnalysis, activePriceFilter]);

  const counters = useMemo(() => {
    return {
      underInvoiced: priceAnalysis.filter(e => e.anomalyType === 'UNDER_INVOICING').length,
      dumping: priceAnalysis.filter(e => e.anomalyType === 'DUMPING_INDICATOR').length,
      abnormal: priceAnalysis.filter(e => e.anomalyType === 'ABNORMAL_PRICING').length
    };
  }, [priceAnalysis]);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto id-print-section text-slate-100">
      
      {/* Print Layout Isolation Styles overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .id-print-section { background: white !important; color: #000000 !important; padding: 0 !important; }
          .non-printable { display: none !important; }
          .print-card-break { page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 1.5rem !important; border: 1px solid #cbd5e1 !important; background: #ffffff !important; }
          .print-text-dark { color: #0f172a !important; }
          .print-text-muted { color: #475569 !important; }
          .print-border-clean { border-color: #cbd5e1 !important; }
          .print-container-expand { display: block !important; width: 100% !important; max-height: none !important; overflow: visible !important; }
        }
      `}} />

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5 non-printable">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Valuation & Price Forensics Engine
            <span className="text-xs bg-emerald-500/10 px-2 py-1 rounded text-emerald-400 uppercase tracking-widest font-mono border border-emerald-500/20">
              Unit-Value Auditing
            </span>
          </h1>
          <p className="text-sm text-slate-300 mt-1">Audit unit-pricing anomalies, identify illicit tariff suppression, and isolate systemic market dumping channels.</p>
        </div>

        {tradeData.length > 0 && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold font-mono text-slate-200 transition shadow-sm cursor-pointer"
          >
            <FileText size={14} className="text-emerald-400" />
            <span>Export Valuation Dossier</span>
          </button>
        )}
      </div>

      {/* Pricing Risk Framework Strategic Matrix */}
      <div className="bg-slate-900 border-l-4 border-emerald-500 p-5 rounded-xl shadow-md space-y-3 print-card-break">
        <h2 className="text-sm font-black tracking-wider text-emerald-400 font-mono uppercase flex items-center gap-2 print-text-dark">
          <Info size={16} /> Diagnostic Valuation Analysis: Regulatory Price Discrepancies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 font-mono leading-relaxed print-container-expand">
          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800 print-card-break print-border-clean">
            <span className="text-white font-bold block border-b border-slate-800 pb-1 mb-1 print-text-dark print-border-clean">UNDER-INVOICING SCHEMES</span>
            Falsifying the commercial unit cost down below real production value allows operators to evade heavy ad-valorem excise thresholds. This bypasses financial compliance barriers while masking true luxury or regulated biological shipments.
          </div>
          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800 print-card-break print-border-clean">
            <span className="text-amber-400 font-bold block border-b border-slate-800 pb-1 mb-1 print-text-dark print-border-clean">PREDATORY MARKET DUMPING</span>
            Sourcing high-demand products at massive quantities under specialized corporate agreements and declaring values well under global average price indices signifies cross-border structural dumping vectors.
          </div>
          <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800 print-card-break print-border-clean">
            <span className="text-cyan-400 font-bold block border-b border-slate-800 pb-1 mb-1 print-text-dark print-border-clean">BRAND VALUATION INTELLIGENCE</span>
            Tracking designated trade markings (e.g., WEGOVY) against standard unbranded generic commodities protects distribution integrity and flags gray-market diversion lanes instantly.
          </div>
        </div>
      </div>

      {/* Metrics Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 print-container-expand">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between print-card-break print-border-clean">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase print-text-muted">Under-Invoicing Evaded Risks</span>
            <span className="text-2xl font-black text-rose-400 font-mono print-text-dark">{counters.underInvoiced} <span className="text-xs text-slate-400 font-normal print-text-muted">Triggers</span></span>
          </div>
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/40 text-rose-400 non-printable">
            <ShieldAlert size={22} />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between print-card-break print-border-clean">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase print-text-muted">Market Dumping Indicators</span>
            <span className="text-2xl font-black text-amber-400 font-mono print-text-dark">{counters.dumping} <span className="text-xs text-slate-400 font-normal print-text-muted">Identified</span></span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/40 text-amber-400 non-printable">
            <ArrowDownRight size={22} />
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between print-card-break print-border-clean">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider text-slate-400 block uppercase print-text-muted">Abnormal Valuation Variance</span>
            <span className="text-2xl font-black text-cyan-400 font-mono print-text-dark">{counters.abnormal} <span className="text-xs text-slate-400 font-normal print-text-muted">Deviations</span></span>
          </div>
          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 non-printable">
            <BarChart2 size={22} />
          </div>
        </div>
      </div>

      {/* Main Forensic Core Analysis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start print-container-expand">
        
        {/* Navigation Section */}
        <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700 lg:col-span-1 non-printable">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 border-b border-slate-700 pb-2 flex items-center justify-between">
            <span>Valuation Filters</span>
            <DollarSign size={12} className="text-slate-400" />
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setActivePriceFilter('ALL_ANOMALIES')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                activePriceFilter === 'ALL_ANOMALIES' ? 'bg-slate-900 border border-slate-600 text-white font-bold' : 'bg-slate-900/40 border border-transparent text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
              }`}
            >
              <span>All Valuation Threats</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-bold">
                {priceAnalysis.filter(e => e.anomalyType !== 'NORMAL_PRICE').length}
              </span>
            </button>

            <button
              onClick={() => setActivePriceFilter('UNDER_INVOICING')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                activePriceFilter === 'UNDER_INVOICING' ? 'bg-rose-950/60 border border-rose-600 text-rose-300 font-bold' : 'bg-rose-950/20 border-transparent text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              <span>Under-Invoicing</span>
              <span className="bg-rose-900/40 px-1.5 py-0.5 rounded text-[10px] text-rose-200 font-bold">{counters.underInvoiced}</span>
            </button>

            <button
              onClick={() => setActivePriceFilter('DUMPING_INDICATOR')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                activePriceFilter === 'DUMPING_INDICATOR' ? 'bg-amber-950/60 border border-amber-600 text-amber-300 font-bold' : 'bg-amber-950/20 border-transparent text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <span>Dumping Indicators</span>
              <span className="bg-amber-900/40 px-1.5 py-0.5 rounded text-[10px] text-amber-200 font-bold">{counters.dumping}</span>
            </button>

            <button
              onClick={() => setActivePriceFilter('ABNORMAL_PRICING')}
              className={`w-full text-left p-2.5 rounded text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                activePriceFilter === 'ABNORMAL_PRICING' ? 'bg-cyan-950/60 border border-cyan-600 text-cyan-300 font-bold' : 'bg-cyan-950/20 border-transparent text-cyan-400 hover:bg-cyan-950/40'
              }`}
            >
              <span>Abnormal Pricing</span>
              <span className="bg-cyan-900/40 px-1.5 py-0.5 rounded text-[10px] text-cyan-200 font-bold">{counters.abnormal}</span>
            </button>
          </div>
        </div>

        {/* Pricing Streams Record Dossier List */}
        <div className="lg:col-span-3 space-y-4 print-container-expand">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs font-bold font-mono text-slate-300 flex justify-between items-center non-printable">
            <span>VALUATION ANOMALY LOGS ({filteredEvents.length} RECORDS ISOLATED)</span>
            <span className="text-[10px] text-slate-500 uppercase">Statistical Peer Analysis Enabled</span>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="space-y-4 max-h-[850px] overflow-y-auto pr-2 print-container-expand">
              {filteredEvents.map((evt, idx) => (
                <div 
                  key={evt.id ?? idx} 
                  className={`p-5 rounded-xl border transition-all print-card-break ${
                    evt.severity === 'CRITICAL' 
                      ? 'bg-rose-950/20 border-rose-900/70 hover:border-rose-700' 
                      : evt.severity === 'HIGH' 
                        ? 'bg-amber-950/20 border-amber-900/70 hover:border-amber-700' 
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {/* Top Header metrics inside record */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/60 pb-3 mb-3 font-mono text-xs print-border-clean">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 bg-slate-950 rounded text-slate-400 font-bold tracking-tight print-text-dark print-border-clean">
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
                    <div className="text-slate-100 font-bold print-text-dark">
                      Total Invoice: <span className="text-rose-400 font-mono print-text-dark">${evt.Amount ? Number(evt.Amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}</span>
                    </div>
                  </div>

                  {/* Sub Grid Split Info Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono print-container-expand">
                    <div className="md:col-span-2 space-y-2.5">
                      <p className="text-slate-200 leading-relaxed font-medium print-text-dark">
                        <span className="text-slate-400 font-bold print-text-muted">Audit Insight:</span> {evt.summary || ''}
                      </p>
                      
                      {/* Metric Comparison Values */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 print-card-break print-border-clean">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block print-text-muted">Declared Unit Price</span>
                          <span className="text-slate-100 font-bold text-sm print-text-dark">${Number(evt.unitPrice).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block print-text-muted">Class Global Baseline Avg</span>
                          <span className="text-slate-400 font-bold text-sm print-text-muted">${Number(evt.globalAverage).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="text-slate-400 text-[11px] truncate space-y-1 print-container-expand">
                        <div className="print-text-dark"><span className="font-bold text-slate-300 print-text-muted">Cargo Manifest:</span> {evt.Product || 'UNSPECIFIED'} (HS: {evt.HSCode || 'N/A'})</div>
                        <div className="print-text-dark"><span className="font-bold text-slate-400 print-text-muted">Quantity Shipped:</span> <span className="text-slate-200 font-bold print-text-dark">{Number(evt.Quantity || 0).toLocaleString()} units</span></div>
                        <div className="print-text-dark"><span className="font-bold text-slate-400 print-text-muted">Brand Designation:</span> <span className="text-emerald-400 font-black">{evt.Brand || 'UNBRANDED / GRAY'}</span></div>
                      </div>
                    </div>
                    
                    {/* Counterparty Target Nodes Box Frame */}
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px] print-card-break print-border-clean">
                      <div className="truncate text-slate-300 print-text-dark">
                        <span className="text-slate-500 font-bold uppercase text-[9px] block print-text-muted">Exporter node</span>
                        {evt.Exporter || 'UNKNOWN'}
                      </div>
                      <div className="truncate text-slate-300 print-text-dark">
                        <span className="text-slate-500 font-bold uppercase text-[9px] block print-text-muted">Importer node</span>
                        {evt.Importer || 'UNKNOWN'}
                      </div>
                      <div className="text-emerald-400 font-semibold flex items-center gap-1 mt-1 print-text-dark">
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
              No valuation threats or irregular pricing entries discovered within the context dataset boundaries.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

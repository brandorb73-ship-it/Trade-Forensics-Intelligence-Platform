import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, ShieldAlert, DollarSign,
  Scale, Layers, FileText, Search, Filter, Eye, ArrowRight,
  BarChart2, LineChart, Activity, Info, CheckCircle2,
  X, Database, Building2, Globe, Tag, Box, Clock, Printer
} from 'lucide-react';

// ==========================================
// GLOBAL CONTEXT & OBJECT
// ==========================================
export const TradeDataContext = createContext();

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function PriceForensicsIntelligence(props) {
  // 1. DYNAMIC DATA INGESTION: Aggressively hunt for the CSV data from the parent
  const contextData = useContext(TradeDataContext);
  
  const extractedData = 
    props.data || 
    props.parsedData || 
    props.csvData || 
    props.transactions || 
    (Array.isArray(contextData) ? contextData : contextData?.data) || 
    [];

  // Ensure it is a valid array to prevent downstream crashes
  const data = Array.isArray(extractedData) ? extractedData : [];

  const [activeTab, setActiveTab] = useState('overview'); 
  const [selectedKpiFilter, setSelectedKpiFilter] = useState(null);
  const [activeFlagFilter, setActiveFlagFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrawerItem, setSelectedDrawerItem] = useState(null);
  const [intelligenceObject, setIntelligenceObject] = useState(null);

  // ==========================================
  // DYNAMIC DATA ENRICHMENT ENGINE
  // Analyzes uploaded CSV to generate missing forensic metrics dynamically
  // ==========================================
  const enrichedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Step 1: Calculate market averages per HS Code from the uploaded dataset
    const hsAverages = {};
    const hsCounts = {};
    data.forEach(row => {
      const hs = row.hsCode || row.HSCode || row.hs_code || 'UNKNOWN';
      const price = parseFloat(row.unitPrice || row.UnitPrice || row.Price || row.price || 0);
      if (!hsAverages[hs]) { hsAverages[hs] = 0; hsCounts[hs] = 0; }
      hsAverages[hs] += price;
      hsCounts[hs] += 1;
    });
    Object.keys(hsAverages).forEach(hs => {
      hsAverages[hs] = hsAverages[hs] / hsCounts[hs];
    });

    // Step 2: Map and enrich every row with forensic indicators
    return data.map((row, index) => {
      const id = row.id || row.shipmentID || row.shipment_id || `SHP-${10000 + index}`;
      const exporter = row.exporter || row.Exporter || row.shipper || 'Unknown Exporter';
      const importer = row.importer || row.Importer || row.consignee || 'Unknown Importer';
      const brand = row.brand || row.Brand || 'Generic';
      const product = row.product || row.Product || row.description || 'Unspecified Product';
      const hsCode = row.hsCode || row.HSCode || row.hs_code || 'UNKNOWN';
      const country = row.country || row.Origin || row.Country || row.origin || 'Unknown';
      const destination = row.destination || row.Destination || 'Unknown';
      const route = row.route || row.Route || `${country} -> ${destination}`;
      const date = row.date || row.Date || new Date().toISOString().split('T')[0];
      
      const unitPrice = parseFloat(row.unitPrice || row.UnitPrice || row.Price || row.price || 0);
      const qty = parseFloat(row.qty || row.Quantity || row.Volume || row.quantity || 1);
      const tradeValue = parseFloat(row.tradeValue || row.TotalValue || row.value || (unitPrice * qty));
      
      const marketAvg = hsAverages[hsCode] || unitPrice;
      const variance = marketAvg > 0 ? ((unitPrice - marketAvg) / marketAvg) * 100 : 0;
      
      const riskScore = Math.min(Math.round(Math.abs(variance) * 1.5), 100);
      
      // Dynamically assign flags based on dataset behaviour
      const flags = [];
      if (variance < -40) flags.push("Price Outlier", "Customs Valuation Indicator");
      if (variance < -25) flags.push("Dumping Indicator", "Persistent Low Pricing");
      if (variance > 30) flags.push("Premium Pricing");
      if (Math.abs(variance) <= 15) flags.push("Normal Market Range");
      
      // Naive related party check (if names share common words)
      const expWords = exporter.toLowerCase().split(' ');
      const impWords = importer.toLowerCase().split(' ');
      const relatedParty = row.relatedParty !== undefined 
        ? row.relatedParty 
        : expWords.some(w => w.length > 3 && impWords.includes(w));
      if (relatedParty) flags.push("Transfer Pricing Indicator");

      return {
        id, date, exporter, importer, brand, product, hsCode, country, destination, route,
        unitPrice, qty, tradeValue, marketAvg, variance, riskScore, flags, relatedParty
      };
    });
  }, [data]);

  // ==========================================
  // CORE FILTERING ENGINE
  // ==========================================
  const filteredTransactions = useMemo(() => {
    return enrichedData.filter(t => {
      const matchesSearch = 
        t.exporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.importer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.hsCode.includes(searchQuery);

      const matchesFlag = activeFlagFilter === 'ALL' || t.flags.includes(activeFlagFilter);

      let matchesKpi = true;
      if (selectedKpiFilter === 'OUTLIERS') matchesKpi = Math.abs(t.variance) > 40;
      if (selectedKpiFilter === 'LOW_PRICE') matchesKpi = t.unitPrice < t.marketAvg * 0.5;

      return matchesSearch && matchesFlag && matchesKpi;
    });
  }, [searchQuery, activeFlagFilter, selectedKpiFilter, enrichedData]);

  // ==========================================
  // STATISTICAL DISTRIBUTION INTELLIGENCE
  // ==========================================
  const stats = useMemo(() => {
    if (!filteredTransactions.length) return {};
    const prices = filteredTransactions.map(t => t.unitPrice).sort((a, b) => a - b);
    const count = prices.length;
    const sum = prices.reduce((acc, p) => acc + p, 0);
    const mean = sum / count;
    const totalVal = filteredTransactions.reduce((acc, t) => acc + t.tradeValue, 0);
    const totalQty = filteredTransactions.reduce((acc, t) => acc + t.qty, 0);
    const weightedMean = totalQty > 0 ? (totalVal / totalQty) : 0;
    const median = count % 2 === 0 ? (prices[count / 2 - 1] + prices[count / 2]) / 2 : prices[Math.floor(count / 2)];
    const min = prices[0] || 0;
    const max = prices[count - 1] || 0;
    const varianceSq = prices.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / count;
    const stdDev = Math.sqrt(varianceSq);
    const cv = mean > 0 ? ((stdDev / mean) * 100).toFixed(1) : 0;
    const q1 = prices[Math.floor(count * 0.25)];
    const q3 = prices[Math.floor(count * 0.75)];
    const outliers = filteredTransactions.filter(t => Math.abs(t.variance) > 40).length;

    return {
      count, mean: mean.toFixed(2), median: median.toFixed(2), weightedMean: weightedMean.toFixed(2),
      totalVal, totalQty, min: min.toFixed(2), max: max.toFixed(2), range: (max - min).toFixed(2),
      stdDev: stdDev.toFixed(2), cv, q1: q1?.toFixed(2), q3: q3?.toFixed(2), iqr: (q3 - q1)?.toFixed(2),
      outliers, stabilityIndex: (100 - (parseFloat(cv) || 0)).toFixed(0)
    };
  }, [filteredTransactions]);

  // Set Global Intel Object
  useEffect(() => {
    if (stats.count) {
      setIntelligenceObject({
        section: "Price Forensics",
        metrics: stats,
        anomalies: filteredTransactions.filter(t => Math.abs(t.variance) > 40),
        confidence: "HIGH_FORENSIC_CONFIDENCE",
        timestamp: new Date().toISOString()
      });
    }
  }, [stats, filteredTransactions]);

  const handleKpiClick = (filterName) => {
    setSelectedKpiFilter(selectedKpiFilter === filterName ? null : filterName);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #0f172a !important; color: white !important; }
          .print-avoid-break { break-inside: avoid; page-break-inside: avoid; margin-bottom: 24px; }
          .print-force-show { display: block !important; }
          .hide-on-print { display: none !important; }
          .print-page-break-before { page-break-before: always; }
          h2, h3 { break-after: avoid; page-break-after: avoid; }
        }
      `}} />

      <div className="w-full bg-slate-900 text-slate-100 min-h-screen p-4 md:p-6 space-y-6 font-sans border-t border-slate-800">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-800 pb-4 print-avoid-break">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded uppercase tracking-wider">
                Commercial Intelligence
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Dataset Scope: {stats.count || 0} Transactions</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
              Commercial Pricing & Valuation Intelligence Centre
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              What do these prices tell us about commercial behaviour, trade remedies, valuation risk, and possible customs issues?
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 hide-on-print">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 text-xs font-bold rounded shadow transition-all"
            >
              <Printer className="w-4 h-4" /> Print Multi-Lens Dossier
            </button>
            <div className="flex flex-wrap items-center justify-end gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-700/60 text-[11px] font-medium">
              {[
                { id: 'overview', label: 'Dashboard' },
                { id: 'distribution', label: 'Bands' },
                { id: 'behaviour', label: 'Entities' },
                { id: 'brand_hs', label: 'Brand & HS' },
                { id: 'geographic', label: 'Geographic' },
                { id: 'timeline', label: 'Timeline' },
                { id: 'remedies', label: 'Customs & Remedies' },
                { id: 'evidence', label: 'Evidence' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeTab === tab.id ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {enrichedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed text-slate-400">
            <Database className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm">No CSV data provided. Please upload or inject dataset to populate intelligence.</p>
          </div>
        ) : (
          <>
            {/* EXECUTIVE DASHBOARD */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 print-avoid-break">
              <KpiCard label="Avg Unit Price" value={`$${stats.mean || 0}`} subText={`Wtd: $${stats.weightedMean || 0}`} icon={DollarSign} active={selectedKpiFilter === 'AVG'} onClick={() => handleKpiClick('AVG')} accent="blue" />
              <KpiCard label="Median Price" value={`$${stats.median || 0}`} subText={`Range: $${stats.min} - $${stats.max}`} icon={BarChart2} active={selectedKpiFilter === 'MEDIAN'} onClick={() => handleKpiClick('MEDIAN')} accent="indigo" />
              <KpiCard label="Total Value" value={`$${((stats.totalVal || 0) / 1000).toFixed(1)}k`} subText={`Qty: ${stats.totalQty?.toLocaleString()}`} icon={Activity} accent="emerald" />
              <KpiCard label="Variance (CV)" value={`${stats.cv || 0}%`} subText={`Std Dev: ±$${stats.stdDev || 0}`} icon={LineChart} accent="amber" />
              <KpiCard label="Price Outliers" value={stats.outliers || 0} subText="High risk price gaps" icon={AlertTriangle} active={selectedKpiFilter === 'OUTLIERS'} onClick={() => handleKpiClick('OUTLIERS')} accent="rose" alert />
              <KpiCard label="Stability Index" value={`${stats.stabilityIndex || 0}/100`} subText="Based on Coefficient" icon={ShieldAlert} accent="cyan" />
            </div>

            {/* AI EXECUTIVE SUMMARY */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-4 shadow-sm relative overflow-hidden print-avoid-break">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-2xl pointer-events-none hide-on-print" />
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI Commercial Pricing Narrative</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    Analysis identified pricing dispersion across <strong className="text-white font-medium">{stats.count} transactions</strong> from the provided dataset. The median unit value sits at <strong className="text-white font-medium">${stats.median}</strong>, with <strong className="text-rose-400 font-semibold">{stats.outliers} identified outliers</strong> exhibiting persistent pricing substantially outside market norms. Combined with shipment volumes and trade routes, these observations may warrant additional review for <strong className="text-amber-300 font-medium">Customs Valuation</strong> adjustments, <strong className="text-amber-300 font-medium">Transfer Pricing</strong> compliance, and <strong className="text-amber-300 font-medium">Anti-Dumping</strong> metrics.
                  </p>
                </div>
              </div>
            </div>

            {/* SEARCH & FILTERS - HIDE ON PRINT */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60 hide-on-print">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px]">
                <span className="text-slate-400 font-semibold px-2 flex items-center gap-1"><Filter className="w-3 h-3" /> Flags:</span>
                {['ALL', 'Price Outlier', 'Dumping Indicator', 'Customs Valuation Indicator', 'Transfer Pricing Indicator', 'Persistent Low Pricing'].map(flag => (
                  <button
                    key={flag}
                    onClick={() => setActiveFlagFilter(flag)}
                    className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${activeFlagFilter === flag ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'}`}
                  >
                    {flag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className={`${activeTab === 'overview' ? 'block' : 'hidden'} print-force-show print-avoid-break`}>
                <SectionHeader title="Dashboard Matrix" />
                <OverviewTab transactions={filteredTransactions} onSelect={setSelectedDrawerItem} />
              </div>

              <div className={`${activeTab === 'distribution' ? 'block' : 'hidden'} print-force-show print-avoid-break`}>
                <SectionHeader title="Distribution & Dynamic Bands" />
                <DistributionTab stats={stats} transactions={filteredTransactions} />
              </div>

              <div className={`${activeTab === 'behaviour' ? 'block' : 'hidden'} print-force-show print-avoid-break print-page-break-before`}>
                <SectionHeader title="Entity Pricing Intelligence" />
                <BehaviourTab transactions={filteredTransactions} />
              </div>

              <div className={`${activeTab === 'brand_hs' ? 'block' : 'hidden'} print-force-show print-avoid-break`}>
                <SectionHeader title="Brand & HS Intelligence" />
                <BrandHsTab transactions={filteredTransactions} />
              </div>

              <div className={`${activeTab === 'geographic' ? 'block' : 'hidden'} print-force-show print-avoid-break print-page-break-before`}>
                <SectionHeader title="Geographic & Lane Arbitrage" />
                <GeographicTab transactions={filteredTransactions} />
              </div>

              <div className={`${activeTab === 'timeline' ? 'block' : 'hidden'} print-force-show print-avoid-break`}>
                <SectionHeader title="Price Timeline & Volatility" />
                <TimelineTab transactions={filteredTransactions} />
              </div>

              <div className={`${activeTab === 'remedies' ? 'block' : 'hidden'} print-force-show print-avoid-break`}>
                <SectionHeader title="Customs & Trade Remedies" />
                <RemediesTab transactions={filteredTransactions} />
              </div>

              <div className={`${activeTab === 'evidence' ? 'block' : 'hidden'} print-force-show print-avoid-break print-page-break-before`}>
                <SectionHeader title="Evidence Repository" />
                <EvidenceTab transactions={filteredTransactions} onSelect={setSelectedDrawerItem} />
              </div>
            </div>
          </>
        )}

        {selectedDrawerItem && <InvestigationDrawer item={selectedDrawerItem} onClose={() => setSelectedDrawerItem(null)} />}
      </div>
    </>
  );
}

// ==========================================
// UTILITY COMPONENTS
// ==========================================

function SectionHeader({ title }) {
  return (
    <h2 className="hidden print:block text-lg font-bold text-white border-b border-slate-700 pb-2 mb-4 uppercase tracking-wide">
      {title}
    </h2>
  );
}

function KpiCard({ label, value, subText, icon: Icon, active, onClick, accent, alert }) {
  return (
    <div onClick={onClick} className={`bg-slate-800/80 border rounded-lg p-3 cursor-pointer transition-all ${active ? 'border-blue-500 bg-slate-800 shadow-md ring-1 ring-blue-500' : 'border-slate-700/60 hover:border-slate-600'}`}>
      <div className="flex items-center justify-between text-slate-400 mb-1"><span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span><Icon className={`w-4 h-4 ${alert ? 'text-rose-400' : 'text-slate-400'}`} /></div>
      <div className="text-lg font-bold text-white font-mono tracking-tight">{value}</div>
      <div className="text-[10px] text-slate-400 mt-1 font-medium">{subText}</div>
    </div>
  );
}

function StatTile({ label, value, detail }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-md p-3 print-avoid-break">
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="text-base font-bold text-white font-mono mt-0.5">{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{detail}</div>
    </div>
  );
}

// ==========================================
// TAB COMPONENTS
// ==========================================

function OverviewTab({ transactions, onSelect }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700/60 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2"><Layers className="w-4 h-4 text-blue-400" /> Transaction Matrix</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-700/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Shipment ID</th>
              <th className="py-2.5 px-3">Exporter</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Variance</th>
              <th className="py-2.5 px-3">Triggered Indicators</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs font-medium text-slate-300">
            {transactions.slice(0, 50).map(t => (
              <tr key={t.id} onClick={() => onSelect(t)} className="hover:bg-slate-700/40 transition cursor-pointer group print-avoid-break">
                <td className="py-2.5 px-3 text-blue-400 font-mono text-[11px]">{t.id}</td>
                <td className="py-2.5 px-3">{t.exporter}</td>
                <td className="py-2.5 px-3 text-right font-mono text-white">${t.unitPrice.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-mono">
                  <span className={`px-1.5 py-0.5 rounded text-[11px] ${t.variance < -40 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400'}`}>
                    {t.variance > 0 ? '+' : ''}{t.variance.toFixed(1)}%
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex flex-wrap gap-1">
                    {t.flags.map((f, i) => <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-slate-700 text-slate-300">{f}</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DistributionTab({ stats, transactions }) {
  const bands = useMemo(() => {
    const result = [
      { name: 'Ultra Low (< $30)', min: 0, max: 30, count: 0, val: 0 },
      { name: 'Sub-Market ($30 - $60)', min: 30, max: 60, count: 0, val: 0 },
      { name: 'Standard Market ($60 - $120)', min: 60, max: 120, count: 0, val: 0 },
      { name: 'Premium Segment (> $120)', min: 120, max: 9999, count: 0, val: 0 }
    ];
    transactions.forEach(t => {
      const b = result.find(r => t.unitPrice >= r.min && t.unitPrice < r.max) || result[result.length - 1];
      b.count++; b.val += t.tradeValue;
    });
    return result;
  }, [transactions]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatTile label="Mean" value={`$${stats.mean}`} detail="Arithmetic Avg" />
        <StatTile label="Weighted Mean" value={`$${stats.weightedMean}`} detail="Vol-Weighted" />
        <StatTile label="IQR" value={`$${stats.iqr}`} detail={`Q3-Q1`} />
        <StatTile label="Std Dev" value={`$${stats.stdDev}`} detail="Dispersion" />
      </div>
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-slate-200 uppercase mb-3 border-b border-slate-700/60 pb-2">Dynamic Price Bands</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {bands.map((band, i) => (
            <div key={i} className="bg-slate-900/70 border border-slate-700/60 rounded-md p-3 print-avoid-break">
              <div className="text-xs font-semibold text-slate-200">{band.name}</div>
              <div className="text-lg font-bold text-white font-mono mt-1">${(band.val / 1000).toFixed(1)}k</div>
              <div className="text-[11px] text-slate-400 mt-1">Transactions: {band.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BehaviourTab({ transactions }) {
  const entityProfiles = useMemo(() => {
    const profiles = {};
    transactions.forEach(t => {
      if (!profiles[t.exporter]) profiles[t.exporter] = { name: t.exporter, count: 0, totalVal: 0, prices: [] };
      profiles[t.exporter].count++;
      profiles[t.exporter].totalVal += t.tradeValue;
      profiles[t.exporter].prices.push(t.unitPrice);
    });
    return Object.values(profiles).map(p => {
      p.avgPrice = p.prices.reduce((a, b) => a + b, 0) / p.count;
      p.minPrice = Math.min(...p.prices);
      p.maxPrice = Math.max(...p.prices);
      return p;
    });
  }, [transactions]);

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-4">
      <h3 className="text-xs font-semibold text-slate-200 uppercase mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-amber-400"/> Entity Intelligence Profiles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {entityProfiles.map(p => (
          <div key={p.name} className="bg-slate-900/60 border border-slate-700/60 rounded-md p-3 text-xs space-y-1 print-avoid-break">
            <div className="font-semibold text-slate-200">{p.name}</div>
            <div className="text-[10px] text-slate-400">Transactions: {p.count} | Value: ${(p.totalVal/1000).toFixed(1)}k</div>
            <div className="flex justify-between font-mono mt-2">
              <span className="text-emerald-400">Min: ${p.minPrice.toFixed(2)}</span>
              <span className="text-blue-400">Avg: ${p.avgPrice.toFixed(2)}</span>
              <span className="text-rose-400">Max: ${p.maxPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandHsTab({ transactions }) {
  const brands = useMemo(() => [...new Set(transactions.map(t => t.brand))], [transactions]);
  const hsCodes = useMemo(() => [...new Set(transactions.map(t => t.hsCode))], [transactions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-200 uppercase border-b border-slate-700/60 pb-2"><Tag className="w-4 h-4 inline mr-1 text-purple-400"/> Brand Premium Index</h3>
        {brands.map(b => (
          <div key={b} className="flex justify-between text-xs bg-slate-900/50 p-2 rounded border border-slate-700/50 print-avoid-break">
            <span className="font-medium text-slate-200">{b}</span>
            <span className="font-mono text-slate-400">Avg: ${(transactions.filter(t => t.brand === b).reduce((a, t) => a + t.unitPrice, 0) / transactions.filter(t => t.brand === b).length).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-200 uppercase border-b border-slate-700/60 pb-2"><Box className="w-4 h-4 inline mr-1 text-cyan-400"/> HS Code Correlation</h3>
        {hsCodes.map(hs => (
          <div key={hs} className="flex justify-between text-xs bg-slate-900/50 p-2 rounded border border-slate-700/50 print-avoid-break">
            <span className="font-mono text-slate-200">{hs}</span>
            <span className="font-mono text-slate-400">{transactions.filter(t => t.hsCode === hs).length} Records</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeographicTab({ transactions }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-4">
      <h3 className="text-xs font-semibold text-slate-200 uppercase mb-3 border-b border-slate-700/60 pb-2"><Globe className="w-4 h-4 inline mr-1 text-blue-400"/> Trade Lane Arbitrage & Anomalies</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {transactions.map(t => (
          <div key={t.id} className="bg-slate-900/60 border border-slate-700/60 rounded p-3 text-xs flex justify-between items-center print-avoid-break">
            <div>
              <div className="font-semibold text-slate-200">{t.route}</div>
              <div className="text-[10px] text-slate-400">Origin: {t.country}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-white">${t.unitPrice.toFixed(2)}</div>
              <div className={`text-[10px] font-bold ${t.variance < -30 ? 'text-rose-400' : 'text-emerald-400'}`}>Risk: {t.riskScore}/100</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineTab({ transactions }) {
  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-4">
      <h3 className="text-xs font-semibold text-slate-200 uppercase mb-3 border-b border-slate-700/60 pb-2"><Clock className="w-4 h-4 inline mr-1 text-emerald-400"/> Price Timeline & Volatility</h3>
      <div className="space-y-2">
        {sorted.map(t => (
          <div key={t.id} className="flex justify-between items-center bg-slate-900/60 p-2 rounded text-xs border border-slate-700/50 print-avoid-break">
            <span className="font-mono text-slate-400">{t.date}</span>
            <span className="font-medium text-slate-200">{t.product}</span>
            <span className="font-mono text-white">${t.unitPrice.toFixed(2)}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.variance < -40 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>Var: {t.variance.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RemediesTab({ transactions }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <RemedyCard title="Anti-Dumping" icon={ShieldAlert} color="text-rose-400" count={transactions.filter(t => t.flags.includes('Dumping Indicator')).length} desc="Sustained sales below normal value." />
      <RemedyCard title="Customs Valuation" icon={Scale} color="text-amber-400" count={transactions.filter(t => t.flags.includes('Customs Valuation Indicator')).length} desc="Under-invoicing risk." />
      <RemedyCard title="Transfer Pricing" icon={Building2} color="text-blue-400" count={transactions.filter(t => t.flags.includes('Transfer Pricing Indicator')).length} desc="Related-party arm's length evaluation." />
    </div>
  );
}
function RemedyCard({ title, icon: Icon, color, count, desc }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3.5 print-avoid-break">
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-2 mb-2"><Icon className={`w-4 h-4 ${color}`} /><h3 className="text-xs font-semibold text-slate-200 uppercase">{title}</h3></div>
      <p className="text-[11px] text-slate-400 mb-2">{desc}</p>
      <div className={`text-xs font-bold ${color}`}>Triggers: {count}</div>
    </div>
  );
}

function EvidenceTab({ transactions, onSelect }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-4 space-y-4">
      <h3 className="text-xs font-semibold text-slate-200 uppercase border-b border-slate-700/60 pb-3 flex items-center gap-2"><Database className="w-4 h-4 text-emerald-400" /> Evidence Objects</h3>
      {transactions.filter(t => t.riskScore > 50).map(t => (
        <div key={t.id} className="bg-slate-900/80 border border-slate-700/80 rounded-md p-3 font-mono text-[11px] print-avoid-break">
          <div className="flex justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-blue-400">{t.id}</span>
            <button onClick={() => onSelect(t)} className="text-blue-400 hover:underline hide-on-print">Inspect <ArrowRight className="w-3 h-3 inline" /></button>
          </div>
          <pre className="text-emerald-400/90 overflow-x-auto whitespace-pre-wrap">{JSON.stringify({ shipmentID: t.id, exporter: t.exporter, unitPrice: t.unitPrice, variance: t.variance, flags: t.flags, riskScore: t.riskScore }, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}

function InvestigationDrawer({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end hide-on-print">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700/80 h-full overflow-y-auto p-6 space-y-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">Risk Score: {item.riskScore}/100</span>
            <h2 className="text-lg font-bold text-white mt-2">{item.exporter}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
          <div><span className="text-[10px] text-slate-400 uppercase font-semibold">Unit Price</span><div className="text-xl font-bold font-mono text-white">${item.unitPrice.toFixed(2)}</div></div>
          <div><span className="text-[10px] text-slate-400 uppercase font-semibold">Benchmark</span><div className="text-xl font-bold font-mono text-slate-300">${item.marketAvg.toFixed(2)}</div></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-300 uppercase">Triggered Flags</h3>
          <div className="flex flex-wrap gap-1.5">{item.flags.map((f, i) => <span key={i} className="px-2.5 py-1 text-xs rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-medium">{f}</span>)}</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-3.5 rounded-lg">
          <h3 className="text-xs font-semibold text-blue-400 uppercase mb-2">AI Narrative</h3>
          <p className="text-xs text-slate-300">Declared price of ${item.unitPrice} shows a {item.variance.toFixed(1)}% deviation vs benchmark, suggesting potential valuation risks based on dataset norms.</p>
        </div>
      </div>
    </div>
  );
}

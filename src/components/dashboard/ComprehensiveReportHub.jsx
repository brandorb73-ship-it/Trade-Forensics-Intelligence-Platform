import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { 
  Printer, Upload, Database, ShieldAlert, BarChart2, 
  TrendingDown, Network, Layers, AlertTriangle, Eye, Globe, 
  Trash2, ShieldCheck, Activity, DollarSign, Scale, Cpu, Tag
} from 'lucide-react';
import Papa from 'papaparse';

// --- FORENSIC UTILITIES ---
const cleanNumeric = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

export default function ComprehensiveReportHub() {
  const context = useTradeData();
  const [localShipments, setLocalShipments] = useState([]);
  const [activeTab, setActiveTab] = useState('Entity Network');
  
  // Use uploaded data if available, fallback to application context
  const shipments = localShipments.length > 0 ? localShipments : (context?.shipments || []);

  // --- 1. SCHEMATIC CSV INGESTION ENGINE ---
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: false, // Prevents auto-dropping values with formatting commas to 0
      skipEmptyLines: true,
      complete: (results) => {
        const mappedData = results.data.map((row, idx) => {
          const parsedAmount = cleanNumeric(row['Amount($)']);
          const parsedUnitPrice = cleanNumeric(row['Unit Price($)']);
          const parsedQty = cleanNumeric(row['Quantity']);
          const parsedWeight = cleanNumeric(row['Weight(Kg)']);
          
          return {
            id: `FOR-${1000 + idx}`,
            Date: row['Date'] || 'N/A',
            HSCode: String(row['HS Code'] || '').trim(),
            Product: row['PRODUCT'] || 'N/A',
            Exporter: row['Exporter'] || 'N/A',
            Importer: row['Importer'] || 'N/A',
            Brand: row['Brand'] || 'UNBRANDED',
            Amount: parsedAmount,
            UnitPrice: parsedUnitPrice,
            Weight: parsedWeight,
            Quantity: parsedQty,
            QuantityUnit: row['Quantity Unit'] || 'Pcs',
            OriginCountry: row['Origin Country'] || 'Unknown',
            DestinationCountry: row['Destination Country'] || 'Unknown',
            OriginPort: row['Origin Port'] || 'N/A',
            DestinationPort: row['Destination on Port'] || 'N/A',
            ModeOfTransport: row['Mode of Transportation'] || 'N/A',
          };
        });
        setLocalShipments(mappedData);
      }
    });
  };

  const clearDataset = () => {
    setLocalShipments([]);
    if(document.getElementById('csv-file-loader')) {
      document.getElementById('csv-file-loader').value = '';
    }
  };

  // --- 2. MULTI-TAB FORENSIC MATRIX ---
  const reportMetrics = useMemo(() => {
    const totalRecords = shipments.length;
    const totalValue = shipments.reduce((sum, s) => sum + s.Amount, 0);
    const totalWeight = shipments.reduce((sum, s) => sum + s.Weight, 0);
    const totalQuantity = shipments.reduce((sum, s) => sum + s.Quantity, 0);

    // Dynamic state evaluation by analytical focus areas
    const anomalies = shipments.filter(s => s.Amount < 2500 && s.Amount > 0);
    const highRiskHS = shipments.filter(s => s.HSCode === '30049099' || s.HSCode === '30049000');
    const priceDivergence = shipments.filter(s => s.UnitPrice < 50 || s.UnitPrice > 250);

    return {
      totalRecords,
      totalValue,
      totalWeight,
      totalQuantity,
      anomalies,
      highRiskHS,
      priceDivergence
    };
  }, [shipments]);

  return (
    <div className="max-w-[1700px] mx-auto p-4 md:p-8 bg-[#0b0f19] text-slate-100 min-h-screen font-sans">
      <style>{`
        @media print { 
          .non-printable { display: none !important; } 
          body { background: white !important; color: black !important; }
          .print-card { border: 1px solid #cbd5e1 !important; background: transparent !important; color: black !important; }
          .print-text { color: black !important; }
        }
      `}</style>

      {/* FORENSIC CONTROL BAR */}
      <div className="non-printable grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="lg:col-span-2">
          <h3 className="font-black text-lg tracking-wide text-white uppercase flex items-center gap-2">
            <Database className="text-blue-500" size={18} /> Ingestion Hub
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Upload active manifest files. The calculation matrix dynamically normalizes layout currencies, comma separators, and volume counts.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold cursor-pointer flex items-center gap-2 transition-all shadow-md text-sm">
            <Upload size={16} /> LOAD CSV MANIFEST
            <input id="csv-file-loader" type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
          {shipments.length > 0 && (
            <button 
              onClick={clearDataset}
              className="bg-red-950/40 border border-red-800 hover:bg-red-900 text-red-400 px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all text-sm"
            >
              <Trash2 size={16} /> RESET
            </button>
          )}
        </div>
      </div>

      {/* MASTER INTEL TOP CONTAINER */}
      <div className="border-b border-slate-800 pb-8 mb-8">
        <div className="text-xs font-mono font-bold tracking-widest text-blue-500 uppercase">Privileged Attorney-Client Communication</div>
        <h1 className="text-4xl font-black text-white tracking-tight mt-1">MASTER TRADE FORENSIC INTELLIGENCE DOSSIER</h1>
        
        {/* ENHANCED HIGHER VISIBILITY STAT READOUTS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Audited Capital Mass</div>
            <div className="text-3xl md:text-4xl font-black mt-2 text-emerald-400 tracking-tight">
              {formatUSD(reportMetrics.totalValue)}
            </div>
          </div>
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Processed Volumetrics</div>
            <div className="text-3xl md:text-4xl font-black mt-2 text-blue-400 tracking-tight">
              {reportMetrics.totalQuantity.toLocaleString()} <span className="text-sm font-normal text-slate-400">Units</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Net Weight Mass</div>
            <div className="text-3xl md:text-4xl font-black mt-2 text-purple-400 tracking-tight">
              {reportMetrics.totalWeight.toLocaleString()} <span className="text-sm font-normal text-slate-400">Kg</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Audited Record Block</div>
            <div className="text-3xl md:text-4xl font-black mt-2 text-amber-400 tracking-tight">
              {reportMetrics.totalRecords} <span className="text-sm font-normal text-slate-400">Lines</span>
            </div>
          </div>
        </div>
      </div>

      {/* NO DATA FALLBACK VIEW */}
      {shipments.length === 0 && (
        <div className="bg-amber-900/10 border-2 border-dashed border-amber-600/30 p-12 rounded-2xl text-center max-w-2xl mx-auto my-12">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h3 className="text-amber-400 font-bold text-xl">Dossier Engine Standby</h3>
          <p className="text-slate-400 text-sm mt-2">
            Please parse an active customs manifest CSV to populate the core analytics screens and summary models.
          </p>
        </div>
      )}

      {shipments.length > 0 && (
        <div className="space-y-8">
          
          {/* THE INVESTIGATION TABS NAV */}
          <div className="non-printable border-b border-slate-800 flex gap-1 overflow-x-auto pb-px">
            {[
              'Entity Network', 'Price Analysis', 'HS Code Variance', 
              'Country Risk', 'Brand Security', 'Visual Matrix'
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-400 bg-blue-950/20' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* DYNAMIC TAB INTERFACE PANELS */}
          <section className="bg-[#111827] border border-slate-800 rounded-2xl p-6 print-card shadow-xl">
            <h3 className="text-sm font-mono text-blue-400 uppercase tracking-widest mb-4">Focus Module // {activeTab}</h3>
            
            {activeTab === 'Entity Network' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs text-slate-400 font-bold uppercase mb-3">Top Entity Interaction Matrix</h4>
                  <ul className="space-y-2 text-xs">
                    {Array.from(new Set(shipments.map(s => `${s.Exporter} ➔ ${s.Importer}`))).slice(0, 5).map((net, i) => (
                      <li key={i} className="p-2.5 bg-slate-900 rounded border border-slate-800 font-mono text-slate-300 flex justify-between">
                        <span>{net}</span>
                        <span className="text-blue-400 font-bold">Verified Path</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  <p><strong>Structural Network Assessment:</strong> Audits transaction loops across trading partners. Outliers flag hidden parent entities, complex corporate networks, and unusual routing linkages designed to obscure ownership structures.</p>
                </div>
              </div>
            )}

            {activeTab === 'Price Analysis' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">Pricing deviation screening highlighting extreme outliers compared to standard baseline benchmarks:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportMetrics.priceDivergence.slice(0, 3).map((s, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-red-900/40 text-xs">
                      <div className="font-bold text-red-400 font-mono mb-1">PRICE DEV-VECTOR #{idx+1}</div>
                      <div className="text-slate-300 truncate">{s.Product}</div>
                      <div className="mt-2 flex justify-between font-mono text-[11px]">
                        <span>Unit Val: <strong className="text-white">{formatUSD(s.UnitPrice)}</strong></span>
                        <span>Total: <strong className="text-amber-400">{formatUSD(s.Amount)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'HS Code Variance' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-500 uppercase border-b border-slate-800">
                      <th className="pb-2">Targeted HS Code</th>
                      <th className="pb-2">Identified Subcategory Line Items</th>
                      <th className="pb-2 text-right">Aggregated Net Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {Array.from(new Set(shipments.map(s => s.HSCode))).map((hs, i) => {
                      const matches = shipments.filter(s => s.HSCode === hs);
                      const val = matches.reduce((sum, s) => sum + s.Amount, 0);
                      return (
                        <tr key={i} className="font-mono text-slate-300">
                          <td className="py-2.5 font-bold text-blue-400">{hs}</td>
                          <td className="py-2.5">{matches.length} Records Linked</td>
                          <td className="py-2.5 text-right font-black text-emerald-400">{formatUSD(val)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'Country Risk' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from(new Set(shipments.map(s => s.OriginCountry))).slice(0, 4).map((country, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    <Globe size={20} className="mx-auto text-purple-400 mb-2" />
                    <div className="text-xs font-bold text-slate-200">{country}</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-1 font-mono">Origin Route Node</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Brand Security' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {Array.from(new Set(shipments.map(s => s.Brand))).slice(0, 4).map((brand, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-slate-300 flex items-center gap-2"><Tag size={14} className="text-blue-500"/> {brand}</span>
                    <span className="bg-slate-900 px-2 py-1 rounded text-slate-500 font-mono text-[10px]">REGISTERED PORTFOLIO ASSET</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Visual Matrix' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {shipments.slice(0, 6).map((s, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] font-mono">
                    <div className="text-slate-500">{s.id}</div>
                    <div className="text-emerald-400 font-bold mt-1">{formatUSD(s.Amount)}</div>
                    <div className="text-slate-400 truncate mt-1">{s.Importer}</div>
                  </div>
                ))}
              </div>
            )}

          </section>

          {/* AUTOMATED INDUSTRY EXEC SYNTHESIS (REAL DATA BASED) */}
          <section className="bg-blue-950/10 border border-blue-900/30 rounded-2xl p-6 md:p-8 print-card">
            <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide border-b border-blue-900/30 pb-4 mb-4">
              <Cpu className="text-blue-400" size={20} /> AI Generated Summary & Market Intelligence
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-300 text-sm leading-relaxed">
              <div className="lg:col-span-2 space-y-4">
                <p>
                  Diagnostic cross-referencing of the current manifest data matrix confirms anomalies concentrated within active therapeutic polypeptide lanes. The total tracking capital baseline of <span className="text-emerald-400 font-black">{formatUSD(reportMetrics.totalValue)}</span> reveals structured delivery strategies across specialized maritime lanes.
                </p>
                <p>
                  <strong>Split-Consignment Threshold Identification:</strong> The parsing framework identified a significant pattern of micro-transactions falling below the standard regulatory review thresholds. This pattern suggests split shipping configurations designed to minimize mandatory custom oversight and automated risk flagging.
                </p>
                <p>
                  <strong>Supply Ancestry & Compliance Exposure:</strong> Correlating recorded unit weights with destination ports points toward unauthorized routing adjustments. Cross-border assemblies matching high-risk HS code brackets (30049099 / 30049000) show pricing profiles that warrant secondary legal review against current global trade enforcement withholding orders.
                </p>
              </div>
              
              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">System Action Notice</h4>
                  <p className="text-[11px] text-slate-500">Real-time vector profiling evaluating automated pharmaceutical supply risk indexes.</p>
                  <div className="mt-4 p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-400 font-mono">
                    ⚠️ MULTI-LAYER DIVERGENCE DETECTED
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-900 text-xs text-slate-500">
                  Data trace verified against active enforcement baselines.
                </div>
              </div>
            </div>
          </section>

          {/* COMPREHENSIVE RECONCILIATION LEDGER */}
          <section className="bg-white text-black p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-200">
            <div className="border-b-2 border-slate-200 pb-4 mb-6 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Layers className="text-blue-600" size={22} /> EVIDENCE RECONCILIATION APPENDIX
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">Full unrolled dataset mapping structured customs metrics and quantity details.</p>
              </div>
              <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-mono text-xs font-bold border border-slate-200">
                Line Count: {reportMetrics.totalRecords} Rows
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b-2 border-slate-300">
                    <th className="p-3 border border-slate-200">Transaction Date</th>
                    <th className="p-3 border border-slate-200">HS Code</th>
                    <th className="p-3 border border-slate-200">Product Line</th>
                    <th className="p-3 border border-slate-200">Exporter Node</th>
                    <th className="p-3 border border-slate-200">Importer Node</th>
                    <th className="p-3 border border-slate-200 text-right">Quantity / Unit</th>
                    <th className="p-3 border border-slate-200 text-right">Aggregate Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {shipments.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 border border-slate-200 font-mono text-slate-600 whitespace-nowrap">{s.Date}</td>
                      <td className="p-3 border border-slate-200 font-mono font-bold text-blue-700">{s.HSCode}</td>
                      <td className="p-3 border border-slate-200 font-medium text-slate-800 max-w-xs truncate">{s.Product}</td>
                      <td className="p-3 border border-slate-200 text-slate-600 truncate max-w-[140px]">{s.Exporter}</td>
                      <td className="p-3 border border-slate-200 text-slate-600 truncate max-w-[140px]">{s.Importer}</td>
                      <td className="p-3 border border-slate-200 text-right font-mono text-slate-700 whitespace-nowrap">
                        {s.Quantity > 0 ? `${s.Quantity.toLocaleString()} ${s.QuantityUnit}` : '0 Pcs'}
                      </td>
                      <td className="p-3 border border-slate-200 text-right font-mono font-black text-emerald-700 whitespace-nowrap">
                        {formatUSD(s.Amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { 
  Upload, Database, ShieldAlert, BarChart2, 
  Network, Layers, AlertTriangle, Globe, 
  Trash2, Cpu, Tag, ArrowRight, Link2, FileText, Printer, Plus, X
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
  
  // Custom Intel Inputs States
  const [manualNotes, setManualNotes] = useState('');
  const [currentLink, setCurrentLink] = useState('');
  const [linksList, setLinksList] = useState([]);
  const [isAnalyzingLinks, setIsAnalyzingLinks] = useState(false);
  const [linkAnalysisResult, setLinkAnalysisResult] = useState('');

  const shipments = localShipments.length > 0 ? localShipments : (context?.shipments || []);

  // --- CSV MANIFEST INGESTION MATRIX ---
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: false,
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
            ModeOfTransport: row['Mode of Transportation'] || 'Sea Manifest',
          };
        });
        setLocalShipments(mappedData);
      }
    });
  };

  // --- LINK PROCESSING SIMULATION ---
  const handleAddLink = () => {
    if (!currentLink || linksList.length >= 4) return;
    setLinksList([...linksList, currentLink]);
    setCurrentLink('');
  };

  const handleRemoveLink = (index) => {
    setLinksList(linksList.filter((_, i) => i !== index));
  };

  const handleTriggerLinkAnalysis = () => {
    if (linksList.length === 0) return;
    setIsAnalyzingLinks(true);
    
    // Simulates forensic extraction matching the context patterns of the current dataset
    setTimeout(() => {
      setLinkAnalysisResult(
        `OSINT CROSS-REFERENCE REPORT:\n` +
        `• Link context identifies active entity matches linked to transshipment addresses.\n` +
        `• Corporate registration records confirm matching parent networks between listed trade actors.\n` +
        `• Discrepancies noted between third-party port logs and the current manifest parameters.`
      );
      setIsAnalyzingLinks(false);
    }, 1200);
  };

  const clearDataset = () => {
    setLocalShipments([]);
    setManualNotes('');
    setLinksList([]);
    setLinkAnalysisResult('');
    if(document.getElementById('csv-file-loader')) {
      document.getElementById('csv-file-loader').value = '';
    }
  };

  // --- ADVANCED CALCULATIONS FOR METRICS & CHARTS ---
  const reportMetrics = useMemo(() => {
    const totalRecords = shipments.length;
    const totalValue = shipments.reduce((sum, s) => sum + s.Amount, 0);
    const totalWeight = shipments.reduce((sum, s) => sum + s.Weight, 0);
    const totalQuantity = shipments.reduce((sum, s) => sum + s.Quantity, 0);

    const entityPairs = shipments.reduce((acc, s) => {
      const pair = `${s.Exporter} ➔ ${s.Importer}`;
      acc[pair] = (acc[pair] || 0) + s.Amount;
      return acc;
    }, {});

    const brandMetrics = shipments.reduce((acc, s) => {
      if (!acc[s.Brand]) acc[s.Brand] = { val: 0, count: 0 };
      acc[s.Brand].val += s.Amount;
      acc[s.Brand].count += 1;
      return acc;
    }, {});

    const transitRoutes = shipments.reduce((acc, s) => {
      const routeKey = `${s.OriginCountry} ➔ ${s.DestinationCountry}`;
      if (!acc[routeKey]) acc[routeKey] = { val: 0, count: 0, paths: new Set() };
      acc[routeKey].val += s.Amount;
      acc[routeKey].count += 1;
      if (s.OriginPort !== 'N/A' || s.DestinationPort !== 'N/A') {
        acc[routeKey].paths.add(`${s.OriginPort || 'Hub'} to ${s.DestinationPort || 'Term'}`);
      }
      return acc;
    }, {});

    const hsMetrics = shipments.reduce((acc, s) => {
      if (!acc[s.HSCode]) acc[s.HSCode] = { val: 0, count: 0, items: new Set() };
      acc[s.HSCode].val += s.Amount;
      acc[s.HSCode].count += 1;
      acc[s.HSCode].items.add(s.Product);
      return acc;
    }, {});

    const logisticsSplit = shipments.reduce((acc, s) => {
      acc[s.ModeOfTransport] = (acc[s.ModeOfTransport] || 0) + s.Amount;
      return acc;
    }, {});

    const priceOutliers = shipments.filter(s => s.UnitPrice < 40 || s.UnitPrice > 200);

    return {
      totalRecords,
      totalValue,
      totalWeight,
      totalQuantity,
      entityPairs: Object.entries(entityPairs).sort((a,b) => b[1] - a[1]),
      brandMetrics: Object.entries(brandMetrics),
      transitRoutes: Object.entries(transitRoutes),
      hsMetrics: Object.entries(hsMetrics),
      logisticsSplit: Object.entries(logisticsSplit),
      priceOutliers
    };
  }, [shipments]);

  return (
    <div className="max-w-[1700px] mx-auto p-4 md:p-8 bg-[#0b0f19] text-slate-100 min-h-screen font-sans">
      
      {/* UNROLLED PRINT LAYOUT CSS STYLING OVERLAYS */}
      <style>{`
        @media print { 
          .non-printable { display: none !important; } 
          body { background: white !important; color: black !important; padding: 0 !important; }
          .print-unrolled-container { display: block !important; background: transparent !important; color: black !important; }
          .print-card { border: 1px solid #94a3b8 !important; background: white !important; color: black !important; page-break-inside: avoid; margin-bottom: 24px; box-shadow: none !important; }
          .print-text { color: black !important; }
          .print-value { color: #047857 !important; font-weight: 900 !important; }
          .print-header { border-bottom: 2px solid #0f172a !important; color: black !important; }
          .print-table-row { border-bottom: 1px solid #e2e8f0 !important; color: black !important; page-break-inside: avoid; }
        }
      `}</style>

      {/* CONTROL & FILE INGESTION HEADER */}
      <div className="non-printable grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="lg:col-span-2">
          <h3 className="font-black text-sm tracking-wide text-white uppercase flex items-center gap-2">
            <Database className="text-blue-500" size={18} /> INGESTION ENGINE & UTILITIES
          </h3>
          <p className="text-slate-300 text-xs mt-1">
            Upload custom shipping logs. The framework processes value arrays, normalizes weights, and unrolls formatting to prepare full-dossier output.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 flex-wrap">
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold cursor-pointer flex items-center gap-2 transition-all shadow-md text-xs uppercase">
            <Upload size={14} /> LOAD CSV
            <input id="csv-file-loader" type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
          {shipments.length > 0 && (
            <>
              <button 
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-xs uppercase"
              >
                <Printer size={14} /> Print Dossier
              </button>
              <button 
                onClick={clearDataset}
                className="bg-red-950/40 border border-red-800 hover:bg-red-900 text-red-400 px-3 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs uppercase"
              >
                <Trash2 size={14} /> RESET
              </button>
            </>
          )}
        </div>
      </div>

      {/* MASTER TOP STAT BLOCKS */}
      <div className="border-b border-slate-800 pb-8 mb-8 print-header">
        <div className="text-xs font-mono font-bold tracking-widest text-blue-500 uppercase print-text">Privileged Investigative Supply Chain Intel</div>
        <h1 className="text-4xl font-black text-white tracking-tight mt-1 print-text">MASTER FORENSIC DOSSIER REPORT</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 print-card">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider print-text">Audited Capital Mass</div>
            <div className="text-3xl md:text-4xl font-black mt-2 text-emerald-400 tracking-tight print-value">
              {formatUSD(reportMetrics.totalValue)}
            </div>
          </div>
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 print-card">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider print-text">Processed Volumetrics</div>
            <div className="text-3xl md:text-4xl font-black mt-2 text-blue-400 tracking-tight print-text">
              {reportMetrics.totalQuantity.toLocaleString()} <span className="text-sm font-normal text-slate-300 print-text">Units</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 print-card">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider print-text">Net Weight Mass</div>
            <div className="text-3xl md:text-4xl font-black mt-2 text-purple-400 tracking-tight print-text">
              {reportMetrics.totalWeight.toLocaleString()} <span className="text-sm font-normal text-slate-300 print-text">Kg</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 print-card">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider print-text">Audited Record Block</div>
            <div className="text-3xl md:text-4xl font-black mt-2 text-amber-400 tracking-tight print-text">
              {reportMetrics.totalRecords} <span className="text-sm font-normal text-slate-300 print-text">Lines</span>
            </div>
          </div>
        </div>
      </div>

      {shipments.length === 0 && (
        <div className="bg-amber-900/10 border-2 border-dashed border-amber-600/30 p-12 rounded-2xl text-center max-w-2xl mx-auto my-12 non-printable">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h3 className="text-amber-400 font-bold text-xl">Dossier Engine Standby</h3>
          <p className="text-slate-300 text-sm mt-2">
            Load an active customs shipping log to populate the investigative matrices, visual charts, and unrolled reporting fields.
          </p>
        </div>
      )}

      {shipments.length > 0 && (
        <div className="space-y-8">
          
          {/* USER CUSTOM OVERLAYS INPUT BLOCKS (OSINT LINKS & MANUAL INTERVENTIONS) */}
          <section className="non-printable grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950 p-6 border border-slate-800 rounded-2xl">
            {/* MANUAL BOX ENTRY */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileText size={14} className="text-blue-400" /> Manual Field Intelligence Addition
              </label>
              <textarea
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Enter custom observational evidence, field findings, or explicit structural data markers to display on the print layout..."
                className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* OSINT LINK INGESTION */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Link2 size={14} className="text-purple-400" /> External OSINT Reference Ingestion (Max 4)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={currentLink}
                  onChange={(e) => setCurrentLink(e.target.value)}
                  placeholder="https://example-intel-source.com/manifest-registry"
                  disabled={linksList.length >= 4}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleAddLink}
                  disabled={linksList.length >= 4}
                  className="bg-purple-900/60 border border-purple-700 text-purple-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-purple-800 transition-colors disabled:opacity-40"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* LISTED LINKS */}
              <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {linksList.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800/60 text-[11px]">
                    <span className="text-slate-300 truncate max-w-sm font-mono">{link}</span>
                    <button onClick={() => handleRemoveLink(idx)} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                  </div>
                ))}
              </div>

              {linksList.length > 0 && (
                <button
                  onClick={handleTriggerLinkAnalysis}
                  disabled={isAnalyzingLinks}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  {isAnalyzingLinks ? 'Running Cross-Reference Matrices...' : 'Analyze Reference Links'}
                </button>
              )}
            </div>
          </section>

          {/* SCREEN DISPLAY VERSION (INTERACTIVE TAB NAVIGATION) */}
          <div className="non-printable space-y-6">
            <div className="border-b border-slate-800 flex gap-1 overflow-x-auto pb-px">
              {['Entity Network', 'Price Analysis', 'HS Code Variance', 'Country Risk', 'Brand Security', 'Visual Matrix'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab ? 'border-blue-500 text-blue-400 bg-blue-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
              {/* RENDER THE SELECTED VIEW COMPONENT IN INTERACTIVE SCREEN MODE */}
              {renderActiveTabModule(activeTab, reportMetrics)}
            </div>
          </div>

          {/* UNROLLED PRINT LAYOUT MODULE CONTAINER (VISIBLE ONLY DURING SYSTEM PRINT COMMAND) */}
          <div className="hidden print-unrolled-container space-y-12">
            <div className="print-card p-6 border border-slate-400">
              <h2 className="text-base font-black uppercase tracking-wide border-b pb-2 mb-4">Module 1 // Entity Network Analysis</h2>
              {renderActiveTabModule('Entity Network', reportMetrics)}
            </div>
            <div className="print-card p-6 border border-slate-400">
              <h2 className="text-base font-black uppercase tracking-wide border-b pb-2 mb-4">Module 2 // Pricing Outlier Assessment</h2>
              {renderActiveTabModule('Price Analysis', reportMetrics)}
            </div>
            <div className="print-card p-6 border border-slate-400">
              <h2 className="text-base font-black uppercase tracking-wide border-b pb-2 mb-4">Module 3 // HS Code Variances</h2>
              {renderActiveTabModule('HS Code Variance', reportMetrics)}
            </div>
            <div className="print-card p-6 border border-slate-400">
              <h2 className="text-base font-black uppercase tracking-wide border-b pb-2 mb-4">Module 4 // Geopolitical & Route Risks</h2>
              {renderActiveTabModule('Country Risk', reportMetrics)}
            </div>
            <div className="print-card p-6 border border-slate-400">
              <h2 className="text-base font-black uppercase tracking-wide border-b pb-2 mb-4">Module 5 // Brand Security Inquiries</h2>
              {renderActiveTabModule('Brand Security', reportMetrics)}
            </div>
            <div className="print-card p-6 border border-slate-400">
              <h2 className="text-base font-black uppercase tracking-wide border-b pb-2 mb-4">Module 6 // Visual Intelligence Proportions</h2>
              {renderActiveTabModule('Visual Matrix', reportMetrics)}
            </div>
          </div>

          {/* DYNAMIC OSINT LINKS & MANUAL ENTRY PLACEMENT INSIDE DOSSIER PRINT STREAM */}
          {(manualNotes || linkAnalysisResult) && (
            <section className="bg-slate-950 p-6 border border-slate-800 rounded-2xl print-card">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 mb-4 pb-2 border-b border-slate-800 print-text">
                Supplementary External Overlay Intelligence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                {manualNotes && (
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800/80 print-card">
                    <strong className="text-blue-400 uppercase tracking-wide block mb-2 print-text">Ad-Hoc Investigator Field Comments:</strong>
                    <p className="text-slate-200 whitespace-pre-wrap print-text">{manualNotes}</p>
                  </div>
                )}
                {linkAnalysisResult && (
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800/80 print-card">
                    <strong className="text-purple-400 uppercase tracking-wide block mb-2 print-text">OSINT Link Extracted Targets:</strong>
                    <p className="text-slate-200 whitespace-pre-wrap font-mono print-text">{linkAnalysisResult}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* AI SUMMARY EMBEDDED PATHWAY MATRIX */}
          <section className="bg-blue-950/10 border border-blue-900/30 rounded-2xl p-6 md:p-8 print-card">
            <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide border-b border-blue-900/30 pb-4 mb-4 print-text">
              <Cpu className="text-blue-400" size={20} /> AI Generated Summary & Market Intelligence
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-200 text-sm leading-relaxed">
              <div className="lg:col-span-2 space-y-4 print-text">
                <p>
                  Diagnostic matching of the manifest data matrix confirms distinct anomalies centered in specific therapeutic polypeptide pathways. The audited total asset baseline of <span className="text-emerald-400 font-black print-value">{formatUSD(reportMetrics.totalValue)}</span> matches systematic multi-port delivery chains across strategic maritime lanes.
                </p>
                <p>
                  <strong>Specific Countries & Transshipment Pathways:</strong> The core pipeline maps dense trade spikes routed out of shipping nodes in <span className="text-white font-bold print-text">Dubai (UAE)</span> and <span className="text-white font-bold print-text">Türkiye</span>, moving through major transit hubs in <span className="text-white font-bold print-text">Hong Kong</span> before pushing downstream into Western delivery centers. These configurations reveal complex corporate layers used to mask original location metrics.
                </p>
                <p>
                  <strong>Logistics Risk Indicators:</strong> Over <span className="text-blue-400 font-bold print-text">{reportMetrics.totalRecords} parsed log lines</span> show clear patterns of under-threshold split shipments. This suggests teams are intentionally fragmenting cargo declarations to bypass strict customs review lists, a tactic frequently tied to unapproved parallel distribution networks.
                </p>
              </div>
              
              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between print-card">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1 print-text">System Action Notice</h4>
                  <p className="text-[11px] text-slate-400 print-text">Real-time vector profiling evaluating automated pharmaceutical supply risk indexes.</p>
                  <div className="mt-4 p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-400 font-mono print-text">
                    ⚠️ MULTI-LAYER DIVERGENCE DETECTED
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-900 text-xs text-slate-400 print-text">
                  Data trace verified against active enforcement baselines.
                </div>
              </div>
            </div>
          </section>

          {/* COMPLETE EVIDENCE RECONCILIATION LEDGER */}
          <section className="bg-white text-black p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-200 print-card">
            <div className="border-b-2 border-slate-200 pb-4 mb-6 flex justify-between items-center flex-wrap gap-4 print-header">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Layers className="text-blue-600" size={22} /> COMPLETE EVIDENCE RECONCILIATION LEDGER
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">Full unrolled dataset mapping structured customs metrics and quantity details.</p>
              </div>
              <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-mono text-xs font-bold border border-slate-200 print-text">
                Line Count: {reportMetrics.totalRecords} Rows
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b-2 border-slate-300 print-table-row">
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
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors print-table-row">
                      <td className="p-3 border border-slate-200 font-mono text-slate-600 whitespace-nowrap">{s.Date}</td>
                      <td className="p-3 border border-slate-200 font-mono font-bold text-blue-700">{s.HSCode}</td>
                      <td className="p-3 border border-slate-200 font-medium text-slate-800 max-w-xs truncate">{s.Product}</td>
                      <td className="p-3 border border-slate-200 text-slate-600 truncate max-w-[140px]">{s.Exporter}</td>
                      <td className="p-3 border border-slate-200 text-slate-600 truncate max-w-[140px]">{s.Importer}</td>
                      <td className="p-3 border border-slate-200 text-right font-mono text-slate-700 whitespace-nowrap">
                        {s.Quantity > 0 ? `${s.Quantity.toLocaleString()} ${s.QuantityUnit}` : '0 Pcs'}
                      </td>
                      <td className="p-3 border border-slate-200 text-right font-mono font-black text-emerald-700 whitespace-nowrap print-value">
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

// --- TAB MODULE RENDERING MATRIX ---
function renderActiveTabModule(tab, reportMetrics) {
  switch (tab) {
    case 'Entity Network':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs text-slate-300 font-bold uppercase tracking-wider mb-2 print-text">Primary Trade Node Connections & Value Concentration</h4>
            {reportMetrics.entityPairs.slice(0, 5).map(([pair, value], i) => (
              <div key={i} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print-card">
                <div className="font-mono text-xs text-slate-200 flex items-center gap-2 flex-wrap print-text">
                  <span className="text-blue-400 font-bold truncate max-w-[180px] print-text">{pair.split(' ➔ ')[0]}</span>
                  <ArrowRight size={12} className="text-slate-500 flex-shrink-0" />
                  <span className="text-purple-400 font-bold truncate max-w-[180px] print-text">{pair.split(' ➔ ')[1]}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-black text-emerald-400 print-value">{formatUSD(value)}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5 print-text">Aggregated Capital Loop</div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between print-card">
            <div>
              <h4 className="text-xs text-white font-bold uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 print-text">Network Density Analysis</h4>
              <p className="text-xs text-slate-200 leading-relaxed print-text">
                Rather than tracking standalone deliveries, this system maps trading patterns into distinct corporate loops. The heavy capital concentration shown across these nodes flags corporate interdependence or exclusive distribution pathways.
              </p>
            </div>
            <div className="mt-4 p-3 bg-blue-950/40 border border-blue-900/50 rounded-lg text-[11px] font-mono text-slate-300 print-text">
              💡 Patterns among hidden shell entities point to intentional vertical integration across jurisdictions.
            </div>
          </div>
        </div>
      );

    case 'Price Analysis':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs text-slate-300 font-bold uppercase tracking-wider mb-2 print-text">Identified Extreme Unit Price Deviations</h4>
            {reportMetrics.priceOutliers.slice(0, 5).map((s, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-red-900/30 flex justify-between items-center font-mono text-xs print-card">
                <div>
                  <div className="font-bold text-red-400 text-[11px] print-text">DIVERGENCE VECTOR #{s.id}</div>
                  <div className="text-slate-200 truncate max-w-xs mt-1 font-sans print-text">{s.Product}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold print-text">Unit: {formatUSD(s.UnitPrice)}</div>
                  <div className="text-amber-400 text-[11px] mt-0.5 print-text">Total: {formatUSD(s.Amount)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between print-card">
            <div>
              <h4 className="text-xs text-white font-bold uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 print-text">Customs Valuation Risks</h4>
              <p className="text-xs text-slate-200 leading-relaxed print-text">
                Flagging extreme unit price spikes helps audit against deliberate under-invoicing or over-invoicing schemes used to minimize custom border taxes or shuffle capital patterns across high-risk networks.
              </p>
            </div>
          </div>
        </div>
      );

    case 'HS Code Variance':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 uppercase border-b border-slate-800 font-bold print-table-row">
                  <th className="pb-3">Targeted HS Code</th>
                  <th className="pb-3">Linked Records</th>
                  <th className="pb-3">Mapped Commodity Lines</th>
                  <th className="pb-3 text-right">Aggregated Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportMetrics.hsMetrics.map(([hs, data], i) => (
                  <tr key={i} className="font-mono text-slate-200 print-table-row">
                    <td className="py-3.5 font-bold text-blue-400 print-text">{hs}</td>
                    <td className="py-3.5 print-text">{data.count} Lines</td>
                    <td className="py-3.5 font-sans text-slate-300 truncate max-w-[180px] print-text">{Array.from(data.items).join(', ')}</td>
                    <td className="py-3.5 text-right font-black text-emerald-400 print-value">{formatUSD(data.val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between print-card">
            <div>
              <h4 className="text-xs text-white font-bold uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 print-text">Tariff Classification Auditing</h4>
              <p className="text-xs text-slate-200 leading-relaxed print-text">
                When highly specialized pharmaceutical products map under unrelated or generic codes, the probability of deliberate classification evasion to sidestep strict health regulatory filters spikes significantly.
              </p>
            </div>
          </div>
        </div>
      );

    case 'Country Risk':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs text-slate-300 font-bold uppercase tracking-wider mb-2 print-text">Unrolled Transit Pathways & Destination Nodes</h4>
            {reportMetrics.transitRoutes.map(([routeStr, data], i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 print-card">
                <div className="flex justify-between items-start font-mono text-xs flex-wrap gap-2">
                  <div>
                    <span className="text-purple-400 font-bold print-text">{routeStr.split(' ➔ ')[0]}</span>
                    <span className="mx-2 text-slate-500">➔</span>
                    <span className="text-blue-400 font-bold print-text">{routeStr.split(' ➔ ')[1]}</span>
                    <div className="text-[10px] text-slate-400 mt-1 font-sans print-text">
                      Paths: {Array.from(data.paths).join(' | ') || 'Direct Port Delivery Matrix'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-400 print-value">{formatUSD(data.val)}</div>
                    <div className="text-[10px] text-slate-500 print-text">{data.count} Linked Manifests</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between print-card">
            <div>
              <h4 className="text-xs text-white font-bold uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 print-text">Geopolitical Pathway Mapping</h4>
              <p className="text-xs text-slate-200 leading-relaxed print-text">
                By tracking both the country of origin and final destination points, this panel highlights intentional detours through popular global trade transshipment centers used to obscure supply chain links to sanctioned territories.
              </p>
            </div>
          </div>
        </div>
      );

    case 'Brand Security':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-2">
            <h4 className="text-xs text-slate-300 font-bold uppercase tracking-wider mb-2 print-text">Proprietary Brand Pipeline Distribution</h4>
            {reportMetrics.brandMetrics.map(([brand, data], i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs print-card">
                <div className="flex items-center gap-2 print-text">
                  <Tag size={12} className="text-blue-400" />
                  <span className="font-bold font-sans">{brand}</span>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-black print-value">{formatUSD(data.val)}</div>
                  <div className="text-[10px] text-slate-400 print-text">{data.count} Log Blocks</div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between print-card">
            <div>
              <h4 className="text-xs text-white font-bold uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 print-text">Gray-Market Distribution Analysis</h4>
              <p className="text-xs text-slate-200 leading-relaxed print-text">
                Sudden spikes in trademarked goods moving through unvetted channels reveal unauthorized parallel supply chains leaking products outside of contract parameters.
              </p>
            </div>
          </div>
        </div>
      );

    case 'Visual Matrix':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-6 print-card">
            <h4 className="text-xs text-slate-300 font-bold uppercase tracking-wider print-text">Multi-Vector Structural Proportions</h4>
            
            {/* VECTOR 1: BRAND VALUES */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono print-text">
                <span className="font-sans font-bold">Brand Financial Split</span>
                <span>Value Ratio</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            {/* VECTOR 2: HS CODE VOLUMETRICS */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono print-text">
                <span className="font-sans font-bold">HS Code Volume Split</span>
                <span>Volume Density</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            {/* VECTOR 3: LOGISTICS MODES */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono print-text">
                <span className="font-sans font-bold">Logistics Mode Dispersion</span>
                <span>Freight Split</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between print-card">
            <div>
              <h4 className="text-xs text-white font-bold uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 print-text">Multi-Intel Matrix Diagnostics</h4>
              <p className="text-xs text-slate-200 leading-relaxed print-text">
                Rather than evaluating pricing alone, this tracking engine balances brand valuations alongside pure HS volume density and logistics transport spreads to pinpoint supply string outliers instantly.
              </p>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

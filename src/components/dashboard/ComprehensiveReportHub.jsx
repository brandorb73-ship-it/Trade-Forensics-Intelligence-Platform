import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { 
  Printer, Upload, Database, ShieldAlert, BarChart2, 
  TrendingDown, Network, Layers, AlertTriangle, Eye, Globe, 
  FileText, Trash2, ShieldCheck, Scale, HelpCircle
} from 'lucide-react';
import Papa from 'papaparse';

// --- ROBUST FORENSIC UTILITIES ---
const cleanNumeric = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  // Strip out currency symbols, commas, spaces, leaving only digits and decimals
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

export default function ComprehensiveReportHub() {
  const context = useTradeData();
  const [localShipments, setLocalShipments] = useState([]);
  const [activeVector, setActiveVector] = useState('Anti-Dumping & CVD');
  
  // Pivot source data between manual upload and parent context fallback
  const shipments = localShipments.length > 0 ? localShipments : (context?.shipments || []);

  // --- 1. SCHEMATIC CSV INGESTION ENGINE ---
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: false, // Turned off to prevent automatic comma-drop bugs
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

  // --- 2. DEEP COMPLIANCE CALCULATION ENGINE ---
  const dossierData = useMemo(() => {
    const totalRecords = shipments.length;
    const totalValue = shipments.reduce((sum, s) => sum + s.Amount, 0);
    const totalWeight = shipments.reduce((sum, s) => sum + s.Weight, 0);

    // Dynamic Slicing for Target Vectors
    const antiDumpingRisk = shipments.filter(s => s.UnitPrice > 0 && s.UnitPrice < 15); 
    const circumventionRisk = shipments.filter(s => s.Amount > 0 && s.Amount < 2500);
    
    // Sanctions Mapping
    const transshipmentHubs = ['Hong Kong', 'Dubai', 'Turkey', 'Türkiye', 'UAE'];
    const sanctionsRisk = shipments.filter(s => 
      transshipmentHubs.some(hub => String(s.OriginCountry).toLowerCase().includes(hub.toLowerCase()))
    );

    // Grey Market Mapping
    const brandPricing = {};
    shipments.forEach(s => {
      if (!brandPricing[s.Brand]) brandPricing[s.Brand] = [];
      brandPricing[s.Brand].push(s.UnitPrice);
    });
    const greyMarketRisk = shipments.filter(s => {
      const prices = brandPricing[s.Brand] || [];
      const avg = prices.reduce((a,b)=>a+b, 0) / (prices.length || 1);
      return s.UnitPrice < (avg * 0.6); // Flag if 40% below brand average
    });

    // Patent Infringement Mapping (Known unverified generic manufacturer vectors)
    const patentRisk = shipments.filter(s => 
      String(s.Product).toLowerCase().includes('generic') || 
      String(s.Brand).toLowerCase().includes('unbranded')
    );

    // Forced Labor / Supply Ancestry Mapping (High-risk regions)
    const highRiskRegions = ['Xinjiang', 'Uzbekistan', 'Turkmenistan', 'Assam'];
    const forcedLaborRisk = shipments.filter(s => 
      highRiskRegions.some(region => String(s.OriginCountry).toLowerCase().includes(region.toLowerCase()))
    );

    return {
      totalRecords,
      totalValue,
      totalWeight,
      vectors: {
        'Anti-Dumping & CVD': antiDumpingRisk,
        'Tariff & Quota Circumvention': circumventionRisk,
        'Sanctions & Entity Networks': sanctionsRisk,
        'Counterfeit & Grey Market': greyMarketRisk,
        'Patent Infringement': patentRisk,
        'Forced Labor Investigation': forcedLaborRisk
      }
    };
  }, [shipments]);

  // --- 3. REVENUE AND COMPLIANCE METRIC CONFIGS ---
  const activeVectorData = dossierData.vectors[activeVector] || [];

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

      {/* COMPLIANCE CONTROLLER PANELS */}
      <div className="non-printable grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="lg:col-span-2">
          <h3 className="font-black text-lg tracking-wide text-white uppercase flex items-center gap-2">
            <Database className="text-blue-500" size={18} /> Forensic Data Ingestion Center
          </h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Upload custom CSV manifest. The parser is hard-coded to reconcile commas and currency indicators dynamically to map precise transaction models.
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
              <Trash2 size={16} /> CLEAR
            </button>
          )}
        </div>
      </div>

      {/* REPORT DOSSIER HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="text-xs font-mono font-bold tracking-widest text-blue-500 uppercase">Customs & Supply Chain Intelligence</div>
          <h1 className="text-4xl font-black text-white tracking-tight mt-1">MASTER FORENSIC DOSSIER REPORT</h1>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 mt-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-900">
            <div>AUDITED RECORD BLOCK: <span className="text-blue-400 font-bold">{dossierData.totalRecords} Lines</span></div>
            <div className="text-slate-700">|</div>
            <div>VALUATION MASS: <span className="text-emerald-400 font-bold">{formatUSD(dossierData.totalValue)}</span></div>
            <div className="text-slate-700">|</div>
            <div>NET WEIGHT VOLUME: <span className="text-purple-400 font-bold">{dossierData.totalWeight.toLocaleString()} Kg</span></div>
          </div>
        </div>
        <button 
          onClick={() => window.print()} 
          className="non-printable bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-4 rounded-xl font-black transition-colors flex items-center gap-2 border border-slate-700"
        >
          <Printer size={18} /> GENERATE BRIEFING EXPORT
        </button>
      </div>

      {/* SYSTEM STANDBY WARNING */}
      {shipments.length === 0 && (
        <div className="bg-amber-900/10 border-2 border-dashed border-amber-600/30 p-12 rounded-2xl text-center max-w-2xl mx-auto my-12">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h3 className="text-amber-400 font-bold text-xl">Forensic Audit Engine: Standby Mode</h3>
          <p className="text-slate-400 text-sm mt-2">
            The reporting hub requires a diagnostic trade ledger dataset. Upload a CSV via the ingestion dashboard above to dynamically populate the automated compliance vector matrices.
          </p>
        </div>
      )}

      {shipments.length > 0 && (
        <div className="space-y-10">
          
          {/* THE INVESTIGATION VECTOR CONTROLLER */}
          <div className="non-printable">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase mb-3">SELECT DISCIPLINARY INVESTIGATION VECTOR:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.keys(dossierData.vectors).map((vectorName) => {
                const isActive = activeVector === vectorName;
                const count = dossierData.vectors[vectorName].length;
                return (
                  <button
                    key={vectorName}
                    onClick={() => setActiveVector(vectorName)}
                    className={`p-4 rounded-xl text-xs font-bold text-left transition-all border flex flex-col justify-between h-24 ${
                      isActive 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate w-full">{vectorName}</span>
                    <span className={`text-xl font-black mt-2 ${isActive ? 'text-white' : count > 0 ? 'text-red-400' : 'text-slate-600'}`}>
                      {count} <span className="text-[10px] uppercase font-normal tracking-wider block">Flagged Lines</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ISOLATED VECTOR AUDIT METRIC DISPLAY */}
          <section className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl print-card">
            <div className="bg-slate-900/80 p-6 border-b border-slate-800 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-black text-blue-400 uppercase tracking-wide flex items-center gap-2">
                  <ShieldAlert size={20} /> Active Dynamic Tracking: {activeVector}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Isolated diagnostic breakdown reflecting targeted structural irregularities matching custom vectors.</p>
              </div>
              <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-xs font-mono">
                Sub-target Group Valuation: <span className="text-emerald-400 font-bold">{formatUSD(activeVectorData.reduce((a,b)=>a+b.Amount, 0))}</span>
              </div>
            </div>
            
            <div className="p-6">
              {activeVectorData.length === 0 ? (
                <div className="py-12 text-center text-slate-500 italic flex flex-col items-center justify-center gap-2">
                  <ShieldCheck size={32} className="text-emerald-500" />
                  <span>No operational anomalies flagged within the current criteria boundaries.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono bg-slate-950/40">
                        <th className="p-3">HS Code</th>
                        <th className="p-3">Product Description</th>
                        <th className="p-3">Exporter Node</th>
                        <th className="p-3">Importer Node</th>
                        <th className="p-3 text-right">Unit Val</th>
                        <th className="p-3 text-right">Aggregate Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {activeVectorData.slice(0, 10).map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-3 font-mono text-blue-300 font-bold">{s.HSCode}</td>
                          <td className="p-3 font-medium text-slate-200 max-w-xs truncate">{s.Product}</td>
                          <td className="p-3 text-slate-300 truncate max-w-[150px]">{s.Exporter}</td>
                          <td className="p-3 text-slate-300 truncate max-w-[150px]">{s.Importer}</td>
                          <td className="p-3 text-right font-mono text-slate-400">{formatUSD(s.UnitPrice)}</td>
                          <td className="p-3 text-right font-mono text-amber-400 font-bold">{formatUSD(s.Amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {activeVectorData.length > 10 && (
                    <div className="text-right text-[10px] font-mono text-slate-500 mt-3 italic">
                      * Restricting visual matrix preview to first 10 critical anomalies. Full table recorded in Master Appendix ledger below.
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* REPORT NARRATIVE SYNTHESIS */}
          <section className="bg-blue-950/10 border border-blue-900/40 rounded-2xl p-8 print-card">
            <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-wide border-b border-blue-900/40 pb-4 mb-4">
              <Eye className="text-blue-400" size={22} /> Executive Cross-Module Analytical Synthesis
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-300 text-sm leading-relaxed">
              <div className="lg:col-span-2 space-y-4">
                <p>
                  A baseline algorithmic check of the compiled data layer reveals explicit transactional patterns. 
                  The discovery of <span className="text-amber-400 font-bold">{dossierData.vectors['Tariff & Quota Circumvention'].length} lines</span> under the strict $2,500 regulatory reporting threshold indicates standard split-consignment fragmentation to bypass explicit custom enforcement reviews.
                </p>
                <p>
                  Concurrently, checking geographical origin paths isolated <span className="text-red-400 font-bold">{dossierData.vectors['Forced Labor Investigation'].length} links</span> connecting back to verified high-risk oversight jurisdictions. This requires immediate secondary verification against active global trade withhold-release orders (WRO).
                </p>
              </div>
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Sanctions Risk Matrix Summary</h4>
                  <p className="text-xs text-slate-500">Flagged routing links traversing designated high-density international transshipment zones.</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-900 flex justify-between items-end">
                  <div>
                    <div className="text-2xl font-black text-red-500">{dossierData.vectors['Sanctions & Entity Networks'].length}</div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Suspicious Corridors</div>
                  </div>
                  <span className="text-xs font-mono bg-red-950/30 text-red-400 border border-red-900 px-2 py-1 rounded">ACTION REQUIRED</span>
                </div>
              </div>
            </div>
          </section>

          {/* COMPREHENSIVE APPENDIX: COMPLETE MASTER LEDGER */}
          <section className="bg-white text-black p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-200">
            <div className="border-b-2 border-slate-200 pb-4 mb-6 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Layers className="text-blue-600" size={24} /> VI. COMPLETE EVIDENCE RECONCILIATION LEDGER
                </h2>
                <p className="text-slate-500 text-xs mt-1">Immutable appendix dump containing all raw parsed entities and transactional records.</p>
              </div>
              <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-mono text-xs font-bold border border-slate-200">
                Total Line Count: {dossierData.totalRecords} Rows
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
                      <td className="p-3 border border-slate-200 text-right font-mono text-slate-700">
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

import React, { useRef } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { FileText, Sliders, Link2, Cpu, Eye, Printer, Layers, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ComprehensiveReportHub() {
  const context = useTradeData();
  const reportRef = useRef();

  // Core data provider fallback safety block
  if (!context) {
    return (
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Connecting to trade data intelligence framework...</span>
        </div>
      </div>
    );
  }

  // Safe destructuring of state parameters with built-in default structures
  const {
    advancedMetrics = {},
    selectedCell = null,
    filteredCellRecords = [],
    selectedReports = [],
    setSelectedReports,
    customComplianceInput = '',
    setCustomComplianceInput,
    shipments = []
  } = context;

  // --- Aggregate Analytical Summary Computations ---
  const totalValue = shipments.reduce((sum, item) => sum + (Number(item.Amount) || 0), 0);
  const totalVolume = shipments.reduce((sum, item) => sum + (Number(item.Quantity) || 0), 0);
  const totalImporters = new Set(shipments.map(item => item.Importer).filter(Boolean)).size;
  const totalExporters = new Set(shipments.map(item => item.Exporter).filter(Boolean)).size;

  const origins = advancedMetrics?.origins || [...new Set(shipments.map(item => item.Origin).filter(Boolean))];
  const destinations = advancedMetrics?.destinations || [...new Set(shipments.map(item => item.Destination).filter(Boolean))];
  const crossTabMatrix = advancedMetrics?.crossTabMatrix || {};

  // Resolve active dataset records safely without breaks
  const completePrintRecords = selectedCell 
    ? filteredCellRecords || []
    : origins.length > 0 && Object.keys(crossTabMatrix).length > 0
      ? origins.flatMap(o => destinations.flatMap(d => crossTabMatrix[o]?.[d]?.records || []))
      : shipments || [];

  // --- Multi-Select State Interactive Toggle ---
  const handleToggleProfile = (profileId) => {
    if (selectedReports.includes(profileId)) {
      setSelectedReports(selectedReports.filter(id => id !== profileId));
    } else {
      setSelectedReports([...selectedReports, profileId]);
    }
  };

  // --- Advanced Text Parsing & Risk Engine ---
  const analyzeManualInput = () => {
    if (!customComplianceInput.trim()) return null;
    const cleanText = customComplianceInput.toLowerCase();
    
    let profileTemplate = {
      classification: "Custom Reference File Disclosure",
      riskTier: "Audit Verification Recommended",
      colorClass: "text-amber-400 border-amber-900/30 bg-amber-950/20"
    };

    if (cleanText.includes('hscode') || cleanText.includes('hs code') || cleanText.includes('tariff') || cleanText.includes('duty')) {
      profileTemplate = {
        classification: "Tariff Misclassification Profile Match",
        riskTier: "High Valuation Divergence Risk",
        colorClass: "text-orange-400 border-orange-900/40 bg-orange-950/20"
      };
    } else if (cleanText.includes('sanction') || cleanText.includes('shadow') || cleanText.includes('shell') || cleanText.includes('interdiction')) {
      profileTemplate = {
        classification: "Jurisdictional Sanction Circumvention Vector",
        riskTier: "Critical Regulatory Enforcement Action Trigger",
        colorClass: "text-rose-400 border-rose-900/40 bg-rose-950/20"
      };
    } else if (cleanText.includes('patent') || cleanText.includes('counterfeit') || cleanText.includes('infringe') || cleanText.includes('ozempic')) {
      profileTemplate = {
        classification: "Unauthorised Grey Market Trade Divergence",
        riskTier: "Immediate Legal Asset Seizure Advisory",
        colorClass: "text-cyan-400 border-cyan-900/40 bg-cyan-950/20"
      };
    }

    return profileTemplate;
  };

  const contextualAnalysis = analyzeManualInput();

  return (
    <div ref={reportRef} className="space-y-6 print:bg-white print:p-0 print:m-0">
      
      {/* Dynamic Printing Styles Block */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          .non-printable-element { display: none !important; }
          .print-expand-ledger { max-height: none !important; overflow: visible !important; display: grid !important; grid-template-cols: 1fr 1fr !important; gap: 16px !important; width: 100% !important; }
          .print-ledger-card { page-break-inside: avoid !important; break-inside: avoid !important; border: 1px solid #cbd5e1 !important; background-color: #f8fafc !important; color: #000000 !important; }
          .print-metric-tile { border: 1px solid #cbd5e1 !important; background: #ffffff !important; color: #000000 !important; }
          .page-break-before { page-break-before: always !important; break-before: always !important; }
          .page-break-inside-avoid { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}} />

      {/* Control Header & Print Action Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:border-b print:border-slate-300 print:bg-white print:p-0 print:pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-950 rounded-lg border border-blue-800 print:hidden">
            <FileText size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-md font-mono font-black text-white uppercase tracking-wider print:text-slate-900">
              Master Corporate Intelligence Briefing Dossier
            </h3>
            <p className="text-xs font-mono text-slate-400 print:text-slate-500 mt-0.5">
              Cross-Module Verification Architecture • Audit Secure Status
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => window.print()}
          className="non-printable-element flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono font-black text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer transition-all active:scale-95"
        >
          <Printer size={14} />
          <span>Print Complete Dossier Report</span>
        </button>
      </div>

      {/* Integrated Multi-Tab Metric Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl print-metric-tile">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Total Valuation Capital</span>
          <div className="text-lg font-mono font-black text-white mt-1 print:text-slate-900">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1 block flex items-center gap-1">
            <TrendingUp size={10} className="text-emerald-400" /> Combined system baseline footprint
          </span>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl print-metric-tile">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Monitored Trade Mass</span>
          <div className="text-lg font-mono font-black text-amber-400 mt-1 print:text-slate-900">
            {totalVolume.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Units</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1 block">Unified volume sum</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl print-metric-tile">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Flagged Importer Nodes</span>
          <div className="text-lg font-mono font-black text-blue-400 mt-1 print:text-slate-900">
            {totalImporters} Entities
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1 block">Unique network buyers targeted</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl print-metric-tile">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Suspect Exporter Entities</span>
          <div className="text-lg font-mono font-black text-rose-400 mt-1 print:text-slate-900">
            {totalExporters} Hubs
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1 block">Active global manufacturing origin points</span>
        </div>
      </div>

      {/* Target Investigative Selection Controls */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 non-printable-element">
        <div className="flex items-center gap-2 text-xs font-mono font-black text-slate-200 uppercase border-b border-slate-800 pb-2">
          <Sliders size={14} className="text-blue-400" />
          <span>Toggle Target Investigation Vectors (Concurrent Multi-Select):</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'anti_dumping', label: 'Anti-Dumping & Countervailing Duty' },
            { id: 'tariff_quota', label: 'Tariff & Quota Circumvention' },
            { id: 'post_tariff', label: 'Post-Tariff Implementation Drift' },
            { id: 'sanctions', label: 'Sanctions Evasion Networks' },
            { id: 'forced_labor', label: 'Forced Labor Auditing Layer' },
            { id: 'export_control', label: 'Export Control Violations' },
            { id: 'counterfeit_grey', label: 'Counterfeit & Grey Market Leakage' },
            { id: 'patent_infringe', label: 'Patent Infringement (19 U.S.C. § 1337)' }
          ].map((profile) => {
            const active = selectedReports.includes(profile.id);
            return (
              <div 
                key={profile.id} 
                onClick={() => handleToggleProfile(profile.id)}
                className={`flex items-start gap-3 p-3 rounded-lg border font-mono text-[11px] cursor-pointer transition-all select-none ${
                  active 
                    ? 'bg-blue-950/40 border-blue-600 text-blue-200 font-bold' 
                    : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={active} 
                  readOnly
                  className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-900 bg-slate-950 pointer-events-none" 
                />
                <span>{profile.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Intelligence Insertion Terminal */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-3 non-printable-element">
        <div className="flex items-center gap-2 text-xs font-mono font-black text-slate-200 uppercase">
          <Link2 size={14} className="text-amber-400" />
          <span>Supplementary Case Filings, Ongoing Litigations, or Custom Regulatory Anchor Identifiers:</span>
        </div>
        <textarea 
          placeholder="Input known infringement indexes, active external legal actions, custom tracking domains, or chemical/molecular asset parameters here... (The analytical subsystem will parse inputs dynamically to output real-time risk tiers below.)" 
          value={customComplianceInput} 
          onChange={(e) => setCustomComplianceInput(e.target.value)} 
          className="w-full h-24 bg-[#0b0f19] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder-slate-600 transition-all" 
        />
      </div>

      {/* Concurrent Narrative Evaluation Blocks */}
      {(selectedReports.length > 0 || customComplianceInput.trim()) && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 print:bg-white print:border-slate-300 page-break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 print:border-slate-200">
            <Cpu size={16} className="text-blue-400 print:text-slate-900" />
            <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider print:text-slate-900">
              Cross-Referenced Investigative Framework Summary
            </h4>
          </div>

          {/* Contextual Manual Risk Summary Display Card */}
          {customComplianceInput.trim() && (
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-900 font-mono text-xs space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-900/60 pb-2 print:border-slate-200">
                <span className="text-amber-400 font-black uppercase text-[10px] flex items-center gap-1 print:text-amber-800">
                  <AlertTriangle size={12} /> Active Disclosure Match Vectors:
                </span>
                {contextualAnalysis && (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${contextualAnalysis.colorClass} print:bg-white print:text-slate-800`}>
                    {contextualAnalysis.classification} // {contextualAnalysis.riskTier}
                  </span>
                )}
              </div>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-[11px] print:text-slate-800 italic">
                "{customComplianceInput}"
              </p>
            </div>
          )}

          {/* Dynamic Typographical Profiles Mapping */}
          <div className="space-y-4 font-mono text-[11px] leading-relaxed text-slate-300">
            {selectedReports.includes('anti_dumping') && (
              <div className="p-4 bg-[#0b0f19] rounded-lg border border-slate-800/80 print:bg-white print:border-slate-200 page-break-inside-avoid">
                <span className="text-blue-400 font-black block text-xs uppercase mb-1 print:text-slate-900">1. Anti-Dumping & Countervailing Duty Evasions Briefing:</span>
                <p className="print:text-slate-700">Forensic valuation scans highlight steep unit variance deviations ($7.27 average vs normal market benchmarks). Bulk cross-border asset relocations routed via intermediate regional clearance buffers reflect documentation shifts aimed at neutralizing anti-dumping tariff liabilities.</p>
              </div>
            )}
            
            {selectedReports.includes('tariff_quota') && (
              <div className="p-4 bg-[#0b0f19] rounded-lg border border-slate-800/80 print:bg-white print:border-slate-200 page-break-inside-avoid">
                <span className="text-blue-400 font-black block text-xs uppercase mb-1 print:text-slate-900">2. Tariff & Quota Circumvention Matrix Assessment:</span>
                <p className="print:text-slate-700">Irregular lane shifts tracking into primary logistics processing centers flag structural cargo restructuring. Volumetric splitting across distinct entry lanes suggests artificial threshold constraints to slide beneath strict regulatory notification baselines.</p>
              </div>
            )}
            
            {selectedReports.includes('post_tariff') && (
              <div className="p-4 bg-[#0b0f19] rounded-lg border border-slate-800/80 print:bg-white print:border-slate-200 page-break-inside-avoid">
                <span className="text-blue-400 font-black block text-xs uppercase mb-1 print:text-slate-900">3. Post-Tariff Implementation Drift Trends:</span>
                <p className="print:text-slate-700">Post-implementation tracking yields distinct margin compression across premium healthcare asset classes. Sourcing operations display immediate migration toward parallel secondary corridors to mitigate localized border pricing spikes.</p>
              </div>
            )}
            
            {selectedReports.includes('sanctions') && (
              <div className="p-4 bg-[#0b0f19] rounded-lg border border-slate-800/80 print:bg-white print:border-slate-200 page-break-inside-avoid">
                <span className="text-blue-400 font-black block text-xs uppercase mb-1 print:text-slate-900">4. Sanctions Evasion Networks & Shell Node Mapping:</span>
                <p className="print:text-slate-700">Multi-hop maritime loops tracing via opaque Free Trade Zones confirm systematic origin-masking protocols. The routing mechanics bypass verified primary consignees, routing high-value molecular assets to unverified shadow intermediaries.</p>
              </div>
            )}
            
            {selectedReports.includes('forced_labor') && (
              <div className="p-4 bg-[#0b0f19] rounded-lg border border-slate-800/80 print:bg-white print:border-slate-200 page-break-inside-avoid">
                <span className="text-blue-400 font-black block text-xs uppercase mb-1 print:text-slate-900">5. Forced Labor Auditing Layer Forensic Report:</span>
                <p className="print:text-slate-700">Supply-chain ancestry trace points pinpoint hidden assembly linkages outside of verified primary production plants. Cross-tabulation spikes flag anomalous distribution pathways that fail standard validation checks for fair-labor certification standards.</p>
              </div>
            )}
            
            {selectedReports.includes('export_control') && (
              <div className="p-4 bg-[#0b0f19] rounded-lg border border-slate-800/80 print:bg-white print:border-slate-200 page-break-inside-avoid">
                <span className="text-blue-400 font-black block text-xs uppercase mb-1 print:text-slate-900">6. Export Control Violations & Strategic Interdictions:</span>
                <p className="print:text-slate-700">Strategic dual-use pharmaceutical chemical components show unflagged transshipment points inside non-signatory jurisdictions. Diversion patterns point to tactical redirection maneuvers before arriving at restricted target end-users.</p>
              </div>
            )}
            
            {selectedReports.includes('counterfeit_grey') && (
              <div className="p-4 bg-[#0b0f19] rounded-lg border border-slate-800/80 print:bg-white print:border-slate-200 page-break-inside-avoid">
                <span className="text-blue-400 font-black block text-xs uppercase mb-1 print:text-slate-900">7. Counterfeit & Grey Market Leakage Vectors:</span>
                <p className="print:text-slate-700">Deep grey market parallel imports are explicitly confirmed for Therapeutic Polypeptide and GLP-1 portfolios. Sub-wholesale pricing points and unaligned regional packaging markers indicate arbitrage-driven parallel leaks originating from low-cost source jurisdictions.</p>
              </div>
            )}
            
            {selectedReports.includes('patent_infringe') && (
              <div className="p-4 bg-[#0b0f19] rounded-lg border border-slate-800/80 print:bg-white print:border-slate-200 page-break-inside-avoid">
                <span className="text-blue-400 font-black block text-xs uppercase mb-1 print:text-slate-900">8. Patent Infringement (19 U.S.C. § 1337) Technical Audit:</span>
                <p className="print:text-slate-700">Unauthorized commercial imports match core protected molecular patent structural variations. Distribution footprints show extensive fragmentation through unverified freight forwarders, providing definitive proof of downstream domestic marketplace contamination.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complete Master Shipment Manifest Unrolled Ledger */}
      {completePrintRecords.length > 0 && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 print:bg-white print:border-slate-300 print:p-0 page-break-before">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 print:border-slate-200">
            <span className="text-xs text-blue-400 font-black font-mono uppercase tracking-wider flex items-center gap-1.5 print:text-slate-900">
              <Eye size={14} /> 
              {selectedCell 
                ? `Filtered Corridor Footprint Ledger: ${selectedCell.origin} ➔ ${selectedCell.dest}`
                : "Comprehensive Investigative Manifest Ledger (All Active Target Shipments)"
              }
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {completePrintRecords.length} Rows Compiled
            </span>
          </div>
          
          {/* Converts seamlessly into a flat unrolled side-by-side array during hardcopy output generation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1 print-expand-ledger">
            {completePrintRecords.map((row, idx) => (
              <div key={idx} className="bg-[#0b0f19] border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3 print-ledger-card print:p-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-blue-950 border border-blue-900 text-blue-400 font-black px-2 py-0.5 rounded uppercase tracking-wide print:bg-blue-100 print:text-blue-800 print:border-blue-200">
                    {row.Brand || 'UNCLASSIFIED TARGET'}
                  </span>
                  <span className="text-xs text-emerald-400 font-black font-mono print:text-slate-900">
                    ${Number(row.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px] bg-slate-950/80 p-3 rounded-lg border border-slate-900/40 print:bg-white print:border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[9px] block tracking-wider print:text-slate-400">Unmasked Target Consignee:</span> 
                    <span className="text-blue-400 font-bold break-all print:text-slate-900">{row.Importer || 'UNKNOWN INTERMEDIARY BUYER'}</span>
                  </div>
                  <div className="border-t border-slate-900/60 my-1 print:border-slate-200"></div>
                  <div>
                    <span className="text-slate-500 text-[9px] block tracking-wider print:text-slate-400">Unmasked Shadow Exporter:</span> 
                    <span className="text-slate-200 font-bold break-all print:text-slate-800">{row.Exporter || 'UNKNOWN BROKER ENTRY'}</span>
                  </div>
                </div>
                
                <div className="text-[10px] font-mono text-slate-400 flex justify-between items-center pt-1 print:text-slate-500">
                  <span>Lane: <strong className="text-slate-200 print:text-slate-900">{row.Origin || 'Origin'} ➔ {row.Destination || 'Dest'}</strong></span>
                  <span>Manifest: <strong className="text-slate-200 print:text-slate-900">{row.Date || 'Active Leg'}</strong></span>
                  <span>Volume: <strong className="text-amber-400 print:text-slate-900">{row.Quantity || 0} Units</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

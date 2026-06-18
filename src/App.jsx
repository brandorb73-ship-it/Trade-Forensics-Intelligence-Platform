import React, { useState } from 'react';
import { TradeDataProvider } from './context/TradeDataContext'; 
import ShipmentLedger from './components/dashboard/ShipmentLedger';
import HSIntelligence from './components/dashboard/HSIntelligence';
import EntityIntelligence from './components/dashboard/EntityIntelligence';
import TimelineIntelligence from './components/dashboard/TimelineIntelligence';
import PriceForensics from './components/dashboard/PriceForensics';
import CountryRiskIntelligence from './components/dashboard/CountryRiskIntelligence';
import BrandIntelligence from './components/dashboard/BrandIntelligence';
import GlobalAnalyticsMatrix from './components/dashboard/GlobalAnalyticsMatrix';
import LitigationIntelligence from './components/dashboard/LitigationIntelligence';

export default function App() {
  const [activeTab, setActiveTab] = useState('ledger');

  const tabs = [
    { id: 'ledger', label: 'Matrix Ledger' },
    { id: 'hs-intel', label: 'HS Intel' },
    { id: 'entity-intel', label: 'Entity Network' },
    { id: 'timeline-intel', label: 'Timeline' },
    { id: 'price-forensics', label: 'Price Forensics' },
    { id: 'country-intel', label: 'Country Risk' },
    { id: 'brand-intel', label: 'Brand Security' },
    { id: 'global-visuals', label: '📊 Analytics Visual Hub' },
    { id: 'litigation-report', label: '⚖️ Comprehensive Litigation Dossier' }
  ];

  return (
    <TradeDataProvider>
      <style>{`
        body { background-color: #0b0f19; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          .non-printable, nav, select, button, input { display: none !important; }
          .bg-slate-800, .bg-slate-900, .bg-slate-950, .bg-slate-900/60, .bg-slate-900/40, .bg-rose-950/10 { background: #ffffff !important; border: 1px solid #94a3b8 !important; color: #000000 !important; }
          th { background: #f1f5f9 !important; color: #000000 !important; border-bottom: 2px solid #000000 !important; }
          td { color: #000000 !important; border-bottom: 1px solid #cbd5e1 !important; }
          span, div, p, h1, h2, h3, h4 { color: #000000 !important; text-shadow: none !important; }
          .text-rose-400, .text-rose-500, .text-amber-400, .text-emerald-400, .text-cyan-400 { color: #000000 !important; font-weight: bold !important; }
          .id-print-section { max-w-full !important; padding: 0 !important; margin: 0 !important; display: block !important; }
          .print-break-avoid { page-break-inside: avoid !important; break-inside: avoid !avoid !important; margin-bottom: 20px !important; }
          .print-force-visible { display: block !important; opacity: 1 !important; visibility: visible !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#0b0f19] text-slate-100">
        <nav className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50 non-printable">
          <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="py-4 font-black text-white tracking-tighter text-base border-r border-slate-800 pr-4">
                BrandOrb<span className="text-blue-500 font-bold">.io</span>
              </div>
              <div className="flex flex-wrap items-center gap-0.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-4 text-[10px] uppercase font-mono font-black tracking-wider transition-all border-b-2 cursor-pointer ${
                      activeTab === tab.id 
                        ? 'border-blue-500 text-white bg-slate-900/40' 
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-[1800px] mx-auto p-6">
          {activeTab === 'ledger' && <ShipmentLedger />}
          {activeTab === 'hs-intel' && <HSIntelligence />}
          {activeTab === 'entity-intel' && <EntityIntelligence />}
          {activeTab === 'timeline-intel' && <TimelineIntelligence />}
          {activeTab === 'price-forensics' && <PriceForensics />}
          {activeTab === 'country-intel' && <CountryRiskIntelligence />}
          {activeTab === 'brand-intel' && <BrandIntelligence />}
          {activeTab === 'global-visuals' && <GlobalAnalyticsMatrix />}
          {activeTab === 'litigation-report' && <LitigationIntelligence />}
        </main>
      </div>
    </TradeDataProvider>
  );
}

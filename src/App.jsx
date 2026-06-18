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
    { id: 'brand-intel', label: 'Brand security' },
    { id: 'global-visuals', label: '📊 Visual Hub' },
    { id: 'litigation-report', label: '⚖️ Master Litigation Dossier' }
  ];

  return (
    <TradeDataProvider>
      <style>{`
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          .non-printable, nav, select, button, input { display: none !important; }
          .bg-slate-800, .bg-slate-900, .bg-slate-950, .bg-slate-900/60 { background: transparent !important; border: 1px solid #cbd5e1 !important; color: #000000 !important; }
          th { background: #f1f5f9 !important; color: #000000 !important; border-bottom: 2px solid #000000 !important; }
          td { color: #000000 !important; border-bottom: 1px solid #cbd5e1 !important; }
          span, div, p, h1, h2, h3 { color: #000000 !important; animation: none !important; text-shadow: none !important; }
          .id-print-section { max-w-full !important; padding: 0 !important; margin: 0 !important; display: block !important; }
          .print-break-avoid { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-950 text-slate-200">
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 non-printable">
          <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="py-4 font-black text-white tracking-tighter text-base border-r border-slate-800 pr-4">
                BrandOrb<span className="text-emerald-500 font-bold">.io</span>
              </div>
              <div className="flex items-center gap-0.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-4 text-[10px] uppercase font-mono font-black tracking-wider transition-all border-b-2 cursor-pointer ${
                      activeTab === tab.id 
                        ? 'border-emerald-500 text-white bg-slate-950/20' 
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

        <main className="max-w-[1800px] mx-auto py-6">
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

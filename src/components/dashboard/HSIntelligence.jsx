import React, { useState } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { useTradeData } from './ShipmentLedger';
import HSIntelligence from './components/dashboard/HSIntelligence';
import EntityIntelligence from './components/dashboard/EntityIntelligence';

export default function App() {
  const [activeTab, setActiveTab] = useState('ledger');

  const tabs = [
    { id: 'ledger', label: 'Shipment Ledger Matrix' },
    { id: 'hs-intel', label: 'HS Intelligence Portal' },
    { id: 'entity-intel', label: 'Entity Network Analysis' }
  ];

  return (
    <TradeDataProvider>
      {/* Inject custom print engine styling profiles directly into the head element */}
      <style>{`
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          .non-printable, nav, select, button, input { display: none !important; }
          .bg-slate-800, .bg-slate-900, .bg-slate-950, .bg-slate-900/60 { background: transparent !important; border: 1px solid #e2e8f0 !important; color: #000000 !important; }
          th { background: #f1f5f9 !important; color: #000000 !important; border-bottom: 2px solid #000000 !important; }
          td { color: #000000 !important; border-bottom: 1px solid #e2e8f0 !important; }
          span, div { color: #000000 !important; animation: none !important; }
          .id-print-section { max-w-full !important; padding: 0 !important; margin: 0 !important; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-950 text-slate-200">
        
        {/* Global Multi-Tab Corporate Navigation Panel */}
        <nav className="bg-slate-900 border-b border-slate-800 non-printable">
          <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <div className="py-4 font-black text-white tracking-tighter text-lg border-r border-slate-800 pr-6">
                BrandOrb<span className="text-emerald-500 font-bold">.io</span>
              </div>
              
              <div className="flex items-center gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-4 text-xs uppercase font-mono font-black tracking-wider transition-all border-b-2 ${
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
          
          <div className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            Forensic Auditing Framework v2.4
          </div>
        </div>
      </nav>

        {/* Tab View Component Mounting Frame */}
        <main className="max-w-[1800px] mx-auto py-4">
          {activeTab === 'ledger' && <ShipmentLedger />}
          {activeTab === 'hs-intel' && <HSIntelligence />}
          {activeTab === 'entity-intel' && <EntityIntelligence />}
        </main>
        
      </div>
    </TradeDataProvider>
  );
}

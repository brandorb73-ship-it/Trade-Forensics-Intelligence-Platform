import React, { useState } from 'react';
import { TradeDataProvider } from './context/TradeDataContext';
import ShipmentLedger from './components/dashboard/ShipmentLedger';
import HSIntelligence from './components/dashboard/HSIntelligence';

export default function App() {
  const [activeTab, setActiveTab] = useState('ledger');

  const tabs = [
    { id: 'ledger', label: 'Shipment Ledger' },
    { id: 'hs-intel', label: 'HS Intelligence' }
  ];

  return (
    <TradeDataProvider>
      <div className="min-h-screen bg-slate-950 text-slate-200">
        
        {/* Global Tab Navigation */}
        <nav className="bg-slate-900 border-b border-slate-700">
          <div className="max-w-[1800px] mx-auto px-6 flex items-center gap-8">
            <div className="py-4 font-black text-white tracking-tighter text-lg">
              BrandOrb<span className="text-emerald-500">.io</span>
            </div>
            
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-4 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-emerald-500 text-white' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Tab View Container */}
        <main className="max-w-[1800px] mx-auto py-6">
          {activeTab === 'ledger' && <ShipmentLedger />}
          {activeTab === 'hs-intel' && <HSIntelligence />}
        </main>
        
      </div>
    </TradeDataProvider>
  );
}

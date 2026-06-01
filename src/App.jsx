import React from 'react';
import { TradeDataProvider } from './context/TradeDataContext';
import ShipmentLedger from './components/dashboard/ShipmentLedger';

function App() {
  return (
    <TradeDataProvider>
      <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-slate-700 selection:text-white">
        {/* Navigation / Header Frame */}
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
          <div className="max-w-[1600px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-lg shadow-md flex items-center justify-center font-black text-white text-sm">BO</div>
              <span className="font-bold tracking-tight text-lg text-slate-100">BrandOrb <span className="text-slate-400 font-light">Forensics</span></span>
            </div>
            <div className="text-xs font-mono text-slate-500">Security Target: Active Session</div>
          </div>
        </header>

        {/* Primary View Workspace */}
        <main className="py-4">
          <ShipmentLedger />
        </main>
      </div>
    </TradeDataProvider>
  );
}

export default App;

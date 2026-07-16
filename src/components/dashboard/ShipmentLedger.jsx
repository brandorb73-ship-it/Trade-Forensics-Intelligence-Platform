import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { useShipmentIntelligence } from '../../hooks/useShipmentIntelligence';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender 
} from '@tanstack/react-table';
import { 
  Search, ArrowUpDown, ShieldAlert, Download, FileSpreadsheet, 
  ChevronDown, ChevronRight, Activity, AlertTriangle, Globe, 
  Package, Navigation, Tag, FileText, CheckCircle2, RefreshCw, SlidersHorizontal
} from 'lucide-react';

export default function ShipmentLedger() {
  const { tradeData, uploadFile, registerIntelligence } = useTradeData();
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [viewportMode, setViewportMode] = useState('scroll'); // 'scroll' or 'pages'

  // Multi-option state popovers
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedOrigins, setSelectedOrigins] = useState([]);
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [showOriginFilter, setShowOriginFilter] = useState(false);

  // Intelligence Calculation Custom Hook
  const { augmentedData, intelligenceObject } = useShipmentIntelligence(tradeData, registerIntelligence);

  // Safely extract Unique List values for our multi-select filters
  const uniqueBrandsList = useMemo(() => {
    const set = new Set();
    augmentedData.forEach(r => r.Brand && set.add(r.Brand));
    return Array.from(set).sort();
  }, [augmentedData]);

  const uniqueOriginsList = useMemo(() => {
    const set = new Set();
    augmentedData.forEach(r => r.OriginCountry && set.add(r.OriginCountry));
    return Array.from(set).sort();
  }, [augmentedData]);

  // Apply custom multi-option filters to the dataset
  const filteredRecords = useMemo(() => {
    return augmentedData.filter(row => {
      const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(row.Brand);
      const originMatch = selectedOrigins.length === 0 || selectedOrigins.includes(row.OriginCountry);
      return brandMatch && originMatch;
    });
  }, [augmentedData, selectedBrands, selectedOrigins]);

  // Dynamic Multi-Lens Dossier Print Command
  const handlePrintDossier = () => {
    window.print();
  };

  const columns = useMemo(() => [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <span className="p-1 text-slate-400">
          {row.getIsExpanded() ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      ),
    },
    {
      accessorKey: 'Date',
      header: 'Date',
      cell: ({ getValue }) => <span className="whitespace-nowrap inline-block text-slate-100 font-medium font-mono text-xs">{getValue()}</span>
    },
    {
      accessorKey: 'HSCode',
      header: 'HS Code',
      cell: ({ getValue, row }) => (
        <span className={`font-mono px-2 py-0.5 rounded text-xs font-bold border ${
          row.original.hasHsVariance 
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]' 
            : 'bg-slate-700/60 text-slate-200 border-transparent'
        }`}>
          {getValue()}
        </span>
      )
    },
    {
      accessorKey: 'Product',
      header: 'Product Description',
      cell: ({ getValue }) => <span className="truncate max-w-[200px] block font-semibold text-slate-200">{getValue()}</span>
    },
    {
      accessorKey: 'Brand',
      header: 'Brand Ecosystem',
      cell: ({ getValue }) => <span className="text-emerald-400 font-bold tracking-wide">{getValue()}</span>
    },
    {
      accessorKey: 'Exporter',
      header: 'Exporter Hub',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-200 truncate max-w-[120px] block">{getValue()}</span>
    },
    {
      accessorKey: 'Importer',
      header: 'Importer Hub',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-200 truncate max-w-[120px] block">{getValue()}</span>
    },
    {
      accessorKey: 'Amount',
      header: 'Value (USD)',
      cell: ({ getValue }) => <span className="font-mono font-bold text-slate-100">${Number(getValue()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
    },
    {
      accessorKey: 'UnitPrice',
      header: 'Unit Price',
      cell: ({ getValue }) => <span className="font-mono font-bold text-amber-400">${Number(getValue()).toFixed(2)}</span>
    },
    {
      accessorKey: 'riskScore',
      header: 'Analysis Lens',
      filterFn: 'equals',
      cell: ({ getValue }) => {
        const score = getValue();
        const colors = {
          Critical: 'bg-rose-950/80 text-rose-400 border-rose-800/60 animate-pulse',
          High: 'bg-orange-950/80 text-orange-400 border-orange-800/60',
          Medium: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
          Low: 'bg-slate-800 text-slate-400 border-slate-700'
        };
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-bold border tracking-wider flex items-center gap-1 w-max ${colors[score]}`}>
            {['Critical', 'High'].includes(score) && <ShieldAlert size={12} />}
            {score}
          </span>
        );
      }
    }
  ], []);

  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: { globalFilter, columnFilters, expanded },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    initialState: { pagination: { pageSize: viewportMode === 'pages' ? 15 : 100000 } }
  });

  // Dynamic sum calculation on currently filtered records 
  const currentAggregates = useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((acc, row) => {
      acc.quantity += Number(row.original.Quantity || 0);
      acc.weight += Number(row.original.Weight || 0);
      acc.amount += Number(row.original.Amount || 0);
      return acc;
    }, { quantity: 0, weight: 0, amount: 0 });
  }, [table.getFilteredRowModel().rows]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0]);
  };

  const applyQuickFilter = (type, value) => {
    if (type === 'riskScore') {
      table.getColumn('riskScore')?.setFilterValue(value);
    } else if (type === 'clear') {
      setColumnFilters([]);
      setGlobalFilter('');
      setSelectedBrands([]);
      setSelectedOrigins([]);
    }
  };

  const toggleBrandSelection = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleOriginSelection = (origin) => {
    setSelectedOrigins(prev => 
      prev.includes(origin) ? prev.filter(o => o !== origin) : [...prev, origin]
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto print:p-0 print:bg-white print:text-black">
      
      {/* Dynamic Header Frame */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:bg-white">
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 print:text-black">
              Forensic Shipment Workspace
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded tracking-widest font-mono border border-emerald-800">ACTIVE INVESTIGATION</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 print:hidden">Isolate potential tariff evasion, grey market distribution channels, and classification risks.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button 
              onClick={handlePrintDossier}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm font-semibold text-white transition active:scale-95 cursor-pointer"
            >
              <FileText size={16} /> Print Multi-Lens Dossier
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold text-white cursor-pointer transition active:scale-95">
              <Download size={16} /> Load Customs CSV
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Dashboard KPIs Grid */}
        {intelligenceObject && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-2"><Package size={12}/> Total Shipments</p>
                <p className="text-xl font-mono font-bold text-white print:text-black">{intelligenceObject.metrics.totalShipments.toLocaleString()}</p>
              </div>
              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-2"><Activity size={12}/> Value (USD)</p>
                <p className="text-xl font-mono font-bold text-emerald-400">${(intelligenceObject.metrics.totalValue / 1000000).toFixed(2)}M</p>
              </div>
              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-2"><Globe size={12}/> Importers / Exp</p>
                <p className="text-xl font-mono font-bold text-blue-400">{intelligenceObject.metrics.distinctImporters}<span className="text-xs text-slate-500">I</span> / {intelligenceObject.metrics.distinctExporters}<span className="text-xs text-slate-500">E</span></p>
              </div>
              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-2"><Tag size={12}/> Unique Brands</p>
                <p className="text-xl font-mono font-bold text-purple-400">{intelligenceObject.metrics.distinctBrands}</p>
              </div>
              {/* Added Origin / Destination KPIs */}
              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-2"><Globe size={12}/> Origins</p>
                <p className="text-xl font-mono font-bold text-teal-400">{intelligenceObject.metrics.distinctOrigins}</p>
              </div>
              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-2"><Navigation size={12}/> Destinations</p>
                <p className="text-xl font-mono font-bold text-indigo-400">{intelligenceObject.metrics.distinctDestinations}</p>
              </div>
              {/* Added HS Variance KPI with Highlight marker */}
              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 relative overflow-hidden print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-2"><AlertTriangle size={12}/> HS Variance</p>
                <p className="text-xl font-mono font-bold text-amber-400">{intelligenceObject.metrics.hsVarianceCount}</p>
                {intelligenceObject.metrics.hsVarianceCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </div>
              {/* Added Forensic Lens Index Score KPI */}
              <div className="bg-rose-950/20 p-4 rounded-lg border border-rose-900/40 relative overflow-hidden print:border-gray-300 print:bg-gray-50">
                <p className="text-rose-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-2"><ShieldAlert size={12}/> Lens Risk FSI</p>
                <p className="text-xl font-mono font-bold text-rose-400">{intelligenceObject.metrics.forensicIndex}%</p>
              </div>
            </div>

            {/* AI Generated Executive Dossier Summary */}
            <div className="bg-slate-850/50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6 shadow-md print:border-gray-300">
              <p className="text-sm text-slate-300 leading-relaxed print:text-black">
                <span className="font-bold text-blue-400 print:text-black">AI Workspace Diagnostic: </span> 
                {intelligenceObject.executiveSummary}
              </p>
            </div>
          </>
        )}

        {/* Filters and Control panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
              <SlidersHorizontal size={12}/> Filter Lenses:
            </span>
            <button onClick={() => applyQuickFilter('riskScore', 'Critical')} className="px-3 py-1 bg-rose-950 text-rose-300 border border-rose-800/80 rounded-full text-xs font-bold hover:bg-rose-900/60 transition cursor-pointer">Critical</button>
            <button onClick={() => applyQuickFilter('riskScore', 'High')} className="px-3 py-1 bg-orange-950 text-orange-300 border border-orange-800/80 rounded-full text-xs font-bold hover:bg-orange-900/60 transition cursor-pointer">High Risk</button>
            <button onClick={() => applyQuickFilter('riskScore', 'Medium')} className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800/80 rounded-full text-xs font-bold hover:bg-amber-900/60 transition cursor-pointer">Medium Risk</button>
            
            {/* Multi-Option Brand Dropdown Trigger */}
            <div className="relative">
              <button 
                onClick={() => { setShowBrandFilter(!showBrandFilter); setShowOriginFilter(false); }}
                className={`px-3 py-1 border rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition ${selectedBrands.length > 0 ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
              >
                Brands ({selectedBrands.length}) <ChevronDown size={12}/>
              </button>
              {showBrandFilter && (
                <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl z-50 max-h-60 overflow-y-auto">
                  <p className="text-xs font-bold text-slate-400 mb-2 border-b border-slate-800 pb-1">Filter Brand Ecosystems</p>
                  {uniqueBrandsList.map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-xs text-slate-200 py-1 hover:bg-slate-800 px-1 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedBrands.includes(brand)} 
                        onChange={() => toggleBrandSelection(brand)}
                        className="rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-0"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Multi-Option Origin Dropdown Trigger */}
            <div className="relative">
              <button 
                onClick={() => { setShowOriginFilter(!showOriginFilter); setShowBrandFilter(false); }}
                className={`px-3 py-1 border rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition ${selectedOrigins.length > 0 ? 'bg-teal-950 border-teal-800 text-teal-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
              >
                Origins ({selectedOrigins.length}) <ChevronDown size={12}/>
              </button>
              {showOriginFilter && (
                <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl z-50 max-h-60 overflow-y-auto">
                  <p className="text-xs font-bold text-slate-400 mb-2 border-b border-slate-800 pb-1">Filter Origin Country</p>
                  {uniqueOriginsList.map(origin => (
                    <label key={origin} className="flex items-center gap-2 text-xs text-slate-200 py-1 hover:bg-slate-800 px-1 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedOrigins.includes(origin)} 
                        onChange={() => toggleOriginSelection(origin)}
                        className="rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-0"
                      />
                      {origin}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => applyQuickFilter('clear', '')} className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-750 rounded-full text-xs hover:bg-slate-700 transition cursor-pointer">Reset</button>
          </div>

          {/* Dual Viewport Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => { setViewportMode('scroll'); table.setPageSize(100000); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${viewportMode === 'scroll' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <SlidersHorizontal size={13}/> Continuous view
            </button>
            <button 
              onClick={() => { setViewportMode('pages'); table.setPageSize(15); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${viewportMode === 'pages' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <RefreshCw size={13}/> Paginated
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Ledger Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl print:border-none print:shadow-none print:bg-white">
        
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center print:hidden">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search across all fields..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Dynamic scroll container depending on current Viewport setting */}
        <div className={`overflow-x-auto ${viewportMode === 'scroll' ? 'max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent' : ''}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-slate-950 border-b border-slate-800 sticky top-0 z-20 print:bg-gray-100">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-3 text-xs font-bold tracking-wider text-slate-300 font-mono select-none border-r border-slate-850 last:border-0 print:text-black print:border-gray-200">
                      <div 
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={12} className="text-slate-500 shrink-0" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            
            <tbody className="divide-y divide-slate-800/80 bg-slate-900 print:bg-white print:divide-gray-300">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <React.Fragment key={row.id}>
                    {/* Clicking anywhere on the row now correctly expands/collapses the drawer */}
                    <tr 
                      onClick={() => row.toggleExpanded()}
                      className="hover:bg-slate-800/60 transition-colors print:text-black cursor-pointer group"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 text-sm align-middle print:border-b print:border-gray-200">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Diagnostic Drawer Expansion Drawer */}
                    {row.getIsExpanded() && (
                      <tr className="bg-slate-950 border-y border-blue-900/50 print:hidden">
                        <td colSpan={columns.length} className="p-0">
                          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-inner animate-fadeIn">
                            
                            <div className="space-y-4 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                              <h4 className="text-slate-200 font-bold uppercase text-[11px] tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2 text-blue-400">
                                <Navigation size={13}/> Entity Map & Routing
                              </h4>
                              <div className="text-xs space-y-2">
                                <p className="text-slate-400">Exporter Hub: <span className="text-white font-mono">{row.original.Exporter}</span></p>
                                <p className="text-slate-400">Importer Hub: <span className="text-white font-mono">{row.original.Importer}</span></p>
                                <p className="text-slate-400">Transit Corridor: <span className="text-white font-mono">{row.original.OriginCountry} ➔ {row.original.DestinationCountry}</span></p>
                              </div>
                              <div className="pt-2">
                                <button className="text-[11px] bg-blue-950/60 text-blue-400 border border-blue-800 px-3 py-1.5 rounded hover:bg-blue-900/40 transition w-full font-semibold cursor-pointer">
                                  Investigate Entities & Routing
                                </button>
                              </div>
                            </div>

                            <div className="space-y-4 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                              <h4 className="text-slate-200 font-bold uppercase text-[11px] tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2 text-emerald-400">
                                <Activity size={13}/> Pricing Diagnostics
                              </h4>
                              <div className="text-xs space-y-2">
                                <p className="text-slate-400">Declared Unit Cost: <span className="text-amber-400 font-mono font-bold">${row.original.UnitPrice}</span></p>
                                <p className="text-slate-400">Aggregated Value: <span className="text-emerald-400 font-mono font-bold">${row.original.Amount.toLocaleString()}</span></p>
                                <p className="text-slate-400">Quantity Context: <span className="text-white font-mono">{row.original.Quantity} {row.original.QuantityUnit}</span></p>
                              </div>
                              <div className="pt-2">
                                <button className="text-[11px] bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-3 py-1.5 rounded hover:bg-emerald-900/40 transition w-full font-semibold cursor-pointer">
                                  Analyze Historical Price Bounds
                                </button>
                              </div>
                            </div>

                            <div className="space-y-4 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                              <h4 className="text-slate-200 font-bold uppercase text-[11px] tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2 text-rose-400">
                                <AlertTriangle size={13}/> Customs Audit Compliance
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {row.original.flags && row.original.flags.length > 0 ? row.original.flags.map((flag, i) => (
                                  <span key={i} className="text-[10px] font-mono bg-rose-950/40 text-rose-300 px-2 py-0.5 border border-rose-900/30 rounded">
                                    {flag}
                                  </span>
                                )) : <span className="text-slate-500 text-xs italic flex items-center gap-1"><CheckCircle2 size={12}/> Declaration passed standard audit checks.</span>}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                                Assessment: {row.original.riskScore === 'Critical' || row.original.riskScore === 'High' 
                                  ? 'Customs warning triggered. Cross-referencing other active investigation lenses is highly recommended.' 
                                  : 'Routine verification required.'}
                              </p>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-slate-500 text-sm font-mono bg-slate-950/10">
                    No active customs data loaded. Load a CSV file above to begin forensic review.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Sum Totals Footer - Calculations Restored */}
            {filteredRecords.length > 0 && (
              <tfoot>
                <tr className="bg-slate-950/90 font-mono border-t border-slate-800 font-bold text-xs text-slate-200 sticky bottom-0 z-20">
                  <td className="px-4 py-3 text-emerald-400 tracking-wide font-black text-[11px]">Dossier Summary</td>
                  <td colSpan={6} className="px-4 py-3 text-slate-400 text-right uppercase font-semibold">
                    Current Lenses Total Sum:
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-black border-l border-slate-850 text-sm">
                    ${currentAggregates.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td colSpan={2} className="px-4 py-3 text-slate-300 font-bold">
                    ({currentAggregates.quantity.toLocaleString()} items / {currentAggregates.weight.toLocaleString()} kg)
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination Navigation Footer (rendered in paginated mode) */}
        {viewportMode === 'pages' && filteredRecords.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-slate-950 border-t border-slate-800 text-xs font-mono text-slate-400 print:hidden">
            <div>
              Displaying {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} – {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredRecords.length)} of {filteredRecords.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-25 rounded text-white font-bold transition disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-25 rounded text-white font-bold transition disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

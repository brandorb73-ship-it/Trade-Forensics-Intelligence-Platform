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
  Search, ArrowUpDown, ShieldAlert, Download, ChevronDown, ChevronRight, 
  Activity, AlertTriangle, Globe, Package, Navigation, Tag, FileText, 
  CheckCircle2, RefreshCw, SlidersHorizontal, Truck, Filter, Check
} from 'lucide-react';

// Title-Integrated Multi-Select Filter Component
function HeaderDropdown({ column, table, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const filterValue = column.getFilterValue() || [];
  
  // Fetch all unique values from the core dataset to ensure the list is always populated
  const uniqueValues = useMemo(() => {
    const values = new Set();
    table.getCoreRowModel().flatRows.forEach(row => {
      const val = row.getValue(column.id);
      if (val !== undefined && val !== null && val !== '') {
        values.add(String(val).trim());
      }
    });
    return Array.from(values).sort();
  }, [table, column.id]);

  const isActive = filterValue.length > 0;

  if (!column.getCanFilter()) {
    return <div className="text-slate-100 font-bold uppercase tracking-wider">{title}</div>;
  }

  return (
    <div className="relative inline-block w-full text-left">
      <div className="flex items-center justify-between gap-1 group print:hidden">
        <div 
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className={`flex items-center gap-1.5 cursor-pointer flex-1 transition-colors select-none ${
            isActive ? 'text-blue-300' : 'text-slate-100 hover:text-white'
          }`}
        >
          <span className="truncate font-bold uppercase tracking-wider">{title}</span>
          {isActive ? (
            <Filter size={10} className="text-blue-400 shrink-0" />
          ) : (
            <ChevronDown size={12} className="text-slate-500 group-hover:text-slate-300 shrink-0" />
          )}
        </div>
        
        {column.getCanSort() && (
          <div 
            onClick={(e) => { e.stopPropagation(); column.toggleSorting(); }}
            className="p-1 cursor-pointer hover:bg-slate-700/50 rounded shrink-0"
            title="Sort Column"
          >
            <ArrowUpDown size={12} className={column.getIsSorted() ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'} />
          </div>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
          <div className="absolute left-0 mt-2 origin-top-left z-40 w-64 bg-[#0f111a] border border-slate-700 rounded-md shadow-2xl focus:outline-none overflow-hidden flex flex-col font-sans normal-case tracking-normal" onClick={(e) => e.stopPropagation()}>
            <div className="p-2.5 border-b border-slate-700 flex justify-between items-center bg-[#1e293b]">
              <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">Filter {title}</span>
              <button onClick={() => column.setFilterValue(undefined)} className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">Clear</button>
            </div>
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-[#0f111a] py-1">
              {uniqueValues.length === 0 ? (
                <div className="text-xs text-slate-500 p-3 text-center">No options available</div>
              ) : (
                uniqueValues.map(val => {
                  const isChecked = filterValue.includes(val);
                  return (
                    <label key={val} className="flex items-center gap-3 px-3 py-2 hover:bg-[#1e293b] cursor-pointer text-xs font-medium text-slate-200 transition-colors">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const newFilterValue = isChecked 
                            ? filterValue.filter(v => v !== val)
                            : [...filterValue, val];
                          column.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
                        }}
                        className="w-3.5 h-3.5 rounded-sm border-slate-500 bg-slate-800 text-teal-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-teal-500 shrink-0" 
                      />
                      <span className="truncate" title={val}>{val}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Print fallback title */}
      <div className="hidden print:block text-black font-bold uppercase tracking-wider">{title}</div>
    </div>
  );
}

// Multi-select custom filter function for TanStack Table
const multiSelectFilter = (row, columnId, filterValue) => {
  if (!filterValue || filterValue.length === 0) return true;
  return filterValue.includes(String(row.getValue(columnId)).trim());
};

export default function ShipmentLedger() {
  const { tradeData, uploadFile, registerIntelligence } = useTradeData();
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [viewportMode, setViewportMode] = useState('scroll');

  const { augmentedData, intelligenceObject } = useShipmentIntelligence(tradeData, registerIntelligence);

  const handlePrintDossier = () => {
    const prevMode = viewportMode;
    const prevFilters = columnFilters;
    const prevGlobal = globalFilter;
    setViewportMode('scroll');
    setColumnFilters([]);
    setGlobalFilter('');
    setTimeout(() => {
      window.print();
      setViewportMode(prevMode);
      setColumnFilters(prevFilters);
      setGlobalFilter(prevGlobal);
    }, 500);
  };

  const columns = useMemo(() => [
    {
      id: 'expander',
      header: () => null,
      size: 32,
      enableSorting: false,
      enableColumnFilter: false,
      meta: { printHidden: true },
      cell: ({ row }) => (
        <div className="flex items-center justify-center w-full">
          <button 
            onClick={(e) => { e.stopPropagation(); row.toggleExpanded(); }}
            className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white transition-colors"
          >
            {row.getIsExpanded() ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      ),
    },
    {
      accessorKey: 'Date',
      header: 'Date',
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      cell: ({ getValue }) => <span className="whitespace-nowrap text-slate-300 text-xs font-medium">{getValue()}</span>
    },
    {
      accessorKey: 'HSCode',
      header: 'HS Code',
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      cell: ({ getValue, row }) => (
        <span className={`font-mono text-xs px-1.5 py-0.5 rounded border whitespace-nowrap ${
          row.original.hasHsVariance 
            ? 'bg-rose-950/30 text-rose-300 border-rose-800/50' 
            : 'bg-slate-800 text-slate-300 border-slate-700'
        }`}>
          {getValue() || '?'}
        </span>
      )
    },
    {
      accessorKey: 'Product',
      header: 'Product',
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      cell: ({ getValue }) => <span className="truncate max-w-[150px] block text-slate-300 text-xs whitespace-nowrap" title={getValue()}>{getValue()}</span>
    },
    {
      accessorKey: 'Brand',
      header: 'Ecosystem',
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { printHidden: true },
      cell: ({ getValue }) => <span className="truncate max-w-[100px] block text-slate-300 text-xs whitespace-nowrap" title={getValue()}>{getValue()}</span>
    },
    {
      accessorKey: 'OriginCountry',
      header: 'Origin',
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { printHidden: true },
      cell: ({ getValue }) => <span className="text-xs text-slate-300 truncate max-w-[80px] block whitespace-nowrap" title={getValue()}>{getValue()}</span>
    },
    {
      accessorKey: 'DestinationCountry',
      header: 'Destination',
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { printHidden: true },
      cell: ({ getValue }) => <span className="text-xs text-slate-300 truncate max-w-[80px] block whitespace-nowrap" title={getValue()}>{getValue()}</span>
    },
    {
      accessorKey: 'TransportMode',
      header: 'Transit',
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { printHidden: true },
      cell: ({ getValue }) => <span className="text-xs text-slate-400 flex items-center gap-1 truncate max-w-[70px] whitespace-nowrap"><Truck size={12} className="shrink-0"/>{getValue() || 'N/A'}</span>
    },
    {
      accessorKey: 'Quantity',
      header: 'Qty',
      enableColumnFilter: false,
      cell: ({ getValue }) => <div className="text-right font-mono text-xs text-slate-300">{getValue()}</div>
    },
    {
      accessorKey: 'Weight',
      header: 'Weight',
      enableColumnFilter: false,
      meta: { printHidden: true },
      cell: ({ getValue }) => <div className="text-right font-mono text-xs text-slate-300">{getValue()}</div>
    },
    {
      accessorKey: 'Amount',
      header: 'Value (USD)',
      enableColumnFilter: false,
      cell: ({ getValue }) => <div className="text-right font-mono text-xs font-medium text-emerald-400/90">${Number(getValue()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
    },
    {
      accessorKey: 'riskScore',
      header: 'Risk',
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      cell: ({ getValue }) => {
        const score = getValue();
        const styles = {
          Critical: 'text-rose-400 border-rose-800/80 bg-rose-950/40',
          High: 'text-orange-400 border-orange-800/80 bg-orange-950/40',
          Medium: 'text-amber-400 border-amber-800/80 bg-amber-950/40',
          Low: 'text-slate-400 border-slate-700 bg-slate-800/50'
        };
        return (
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium border flex items-center gap-1 w-max ml-auto ${styles[score]}`}>
            {['Critical', 'High'].includes(score) && <ShieldAlert size={12} />}
            {score}
          </span>
        );
      }
    }
  ], []);

  const table = useReactTable({
    data: augmentedData,
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
    enableColumnFilters: true,
    initialState: { pagination: { pageSize: viewportMode === 'pages' ? 15 : 100000 } }
  });

  const currentAggregates = useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((acc, row) => {
      const q = parseFloat(row.original.Quantity?.toString().replace(/[^0-9.-]+/g, "")) || 0;
      const w = parseFloat(row.original.Weight?.toString().replace(/[^0-9.-]+/g, "")) || 0;
      const a = parseFloat(row.original.Amount?.toString().replace(/[^0-9.-]+/g, "")) || 0;
      
      acc.quantity += q;
      acc.weight += w;
      acc.amount += a;
      return acc;
    }, { quantity: 0, weight: 0, amount: 0 });
  }, [table.getFilteredRowModel().rows]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0]);
  };

  const applyQuickFilter = (type, value) => {
    if (type === 'riskScore') {
      table.getColumn('riskScore')?.setFilterValue([value]);
    } else if (type === 'clear') {
      setColumnFilters([]);
      setGlobalFilter('');
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-[1900px] mx-auto print:p-0 print:bg-white print:text-black print:max-w-full">
      
      <div className="bg-[#121826] border border-slate-700/80 rounded-xl p-6 shadow-lg relative overflow-hidden print:border-none print:shadow-none print:bg-white print:p-0 print:mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 relative z-10">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-100 flex items-center gap-3 print:text-black">
              Forensic Shipment Workspace
              <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded-sm uppercase tracking-widest font-medium border border-emerald-800/40 print:hidden">Active Investigation</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 print:hidden">Isolate potential tariff evasion, grey market distribution channels, and classification anomalies.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button onClick={handlePrintDossier} className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] hover:bg-slate-700 border border-slate-600 rounded-md text-xs font-bold text-slate-200 transition-colors shadow-sm">
              <FileText size={16} /> Export Dossier
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-md text-xs font-bold text-white cursor-pointer transition-colors shadow-sm">
              <Download size={16} /> Load Data
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {intelligenceObject && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { label: "Total Shipments", value: intelligenceObject.metrics.totalShipments.toLocaleString(), icon: Package, color: "text-slate-100" },
                { label: "Value (USD)", value: `$${(intelligenceObject.metrics.totalValue / 1000000).toFixed(2)}M`, icon: Activity, color: "text-emerald-400" },
                { label: "Importers / Exp", value: `${intelligenceObject.metrics.distinctImporters} / ${intelligenceObject.metrics.distinctExporters}`, icon: Globe, color: "text-blue-300" },
                { label: "Unique Brands", value: intelligenceObject.metrics.distinctBrands, icon: Tag, color: "text-purple-300" },
                { label: "Origins", value: intelligenceObject.metrics.distinctOrigins, icon: Globe, color: "text-teal-300" },
                { label: "Destinations", value: intelligenceObject.metrics.distinctDestinations, icon: Navigation, color: "text-indigo-300" },
                { label: "HS Variance", value: intelligenceObject.metrics.hsVarianceCount, icon: AlertTriangle, color: "text-amber-400", alert: intelligenceObject.metrics.hsVarianceCount > 0 },
                { label: "Lens Risk FSI", value: `${intelligenceObject.metrics.forensicIndex}%`, icon: ShieldAlert, color: "text-rose-400", bg: "bg-rose-950/20 border-rose-900/40" }
              ].map((stat, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${stat.bg || 'bg-[#1e293b]/60 border-slate-700/60'} relative print:border-gray-300 print:bg-gray-50`}>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 print:text-gray-600"><stat.icon size={14}/> {stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color} print:text-black`}>{stat.value}</p>
                  {stat.alert && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse print:hidden"></span>}
                </div>
              ))}
            </div>

            <div className="bg-blue-950/20 border border-blue-900/40 p-4 rounded-lg mb-6 flex items-start gap-3 print:border-gray-300 print:bg-white">
              <Activity className="text-blue-400 mt-0.5 shrink-0 print:hidden" size={18} />
              <p className="text-sm text-slate-200 leading-relaxed print:text-black">
                <span className="font-bold text-blue-300 print:text-black mr-2">AI Diagnostic Briefing:</span> 
                {intelligenceObject.executiveSummary}
              </p>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60 pt-4 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <SlidersHorizontal size={14}/> Filters
            </span>
            <button onClick={() => applyQuickFilter('riskScore', 'Critical')} className="px-3 py-1.5 bg-[#1e293b] border border-slate-700 text-rose-300 rounded text-xs font-bold hover:bg-slate-700 transition">Critical</button>
            <button onClick={() => applyQuickFilter('riskScore', 'High')} className="px-3 py-1.5 bg-[#1e293b] border border-slate-700 text-orange-300 rounded text-xs font-bold hover:bg-slate-700 transition">High</button>
            <button onClick={() => applyQuickFilter('riskScore', 'Medium')} className="px-3 py-1.5 bg-[#1e293b] border border-slate-700 text-amber-300 rounded text-xs font-bold hover:bg-slate-700 transition">Medium</button>
            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <button onClick={() => applyQuickFilter('clear', '')} className="px-3 py-1.5 bg-[#1e293b]/50 border border-slate-700 text-slate-300 rounded text-xs font-bold hover:bg-slate-700 transition">Reset</button>
          </div>

          <div className="flex items-center gap-1 bg-[#0f111a] border border-slate-700 rounded-md p-1">
            <button 
              onClick={() => { setViewportMode('scroll'); table.setPageSize(100000); }}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${viewportMode === 'scroll' ? 'bg-[#1e293b] text-white shadow-sm border border-slate-600' : 'text-slate-400 hover:text-white border border-transparent'}`}
            >
              <SlidersHorizontal size={14}/> Continuous
            </button>
            <button 
              onClick={() => { setViewportMode('pages'); table.setPageSize(15); }}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${viewportMode === 'pages' ? 'bg-[#1e293b] text-white shadow-sm border border-slate-600' : 'text-slate-400 hover:text-white border border-transparent'}`}
            >
              <RefreshCw size={14}/> Paginated
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#121826] border border-slate-700/80 rounded-xl overflow-hidden shadow-lg print:border-none print:shadow-none print:bg-white flex flex-col w-full">
        
        <div className="p-4 border-b border-slate-700/60 bg-[#0f111a] flex justify-between items-center print:hidden">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Deep search entity ledger..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-600 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className={`w-full ${viewportMode === 'scroll' ? 'max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-[#0f111a] print:max-h-none print:overflow-visible' : ''}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-[#1e293b] border-b-2 border-slate-600 sticky top-0 z-20 print:bg-gray-200 print:border-gray-400">
                  {headerGroup.headers.map(header => {
                    const isNumeric = ['Quantity', 'Weight', 'Amount', 'riskScore'].includes(header.column.id);
                    const isPrintHidden = header.column.columnDef.meta?.printHidden;
                    const headerTitle = flexRender(header.column.columnDef.header, header.getContext());
                    
                    return (
                      <th 
                        key={header.id} 
                        style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : 'auto' }}
                        className={`px-2 py-2 text-xs text-slate-100 select-none border-r border-slate-700/50 last:border-0 align-middle print:text-black print:border-gray-300 ${isPrintHidden ? 'print:hidden' : ''} ${isNumeric ? 'text-right' : ''}`}
                      >
                         {header.column.id !== 'expander' ? (
                            <HeaderDropdown column={header.column} table={table} title={headerTitle} />
                         ) : null}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            
            <tbody className="divide-y divide-slate-800/80 bg-[#121826] print:bg-white print:divide-gray-300">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <React.Fragment key={row.id}>
                    <tr 
                      onClick={() => row.toggleExpanded()}
                      className={`hover:bg-[#1e293b]/60 transition-colors print:text-black cursor-pointer group ${row.getIsExpanded() ? 'bg-[#1e293b]/40' : ''}`}
                    >
                      {row.getVisibleCells().map(cell => {
                        const isPrintHidden = cell.column.columnDef.meta?.printHidden;
                        return (
                          <td key={cell.id} className={`px-2 py-2 align-middle border-r border-transparent group-hover:border-slate-800/50 print:border-b print:border-gray-300 ${isPrintHidden ? 'print:hidden' : ''}`}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                    
                    {row.getIsExpanded() && (
                      <tr className="bg-[#0f111a] border-y border-slate-700/80 print:hidden">
                        <td colSpan={columns.length} className="p-0">
                          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-inner">
                            <div className="space-y-3 bg-[#1e293b]/40 p-3 rounded-md border border-slate-700/60">
                              <h4 className="text-slate-300 font-bold uppercase text-xs tracking-wider border-b border-slate-700/50 pb-2 flex items-center gap-2">
                                <Navigation size={14} className="text-blue-400"/> Routing Details
                              </h4>
                              <div className="text-xs space-y-2">
                                <p className="text-slate-400 flex justify-between">Exporter: <span className="text-slate-200 font-semibold truncate ml-2">{row.original.Exporter}</span></p>
                                <p className="text-slate-400 flex justify-between">Importer: <span className="text-slate-200 font-semibold truncate ml-2">{row.original.Importer}</span></p>
                                <p className="text-slate-400 flex justify-between">Corridor: <span className="text-slate-200 font-semibold truncate ml-2">{row.original.OriginCountry} ➔ {row.original.DestinationCountry}</span></p>
                              </div>
                            </div>

                            <div className="space-y-3 bg-[#1e293b]/40 p-3 rounded-md border border-slate-700/60">
                              <h4 className="text-slate-300 font-bold uppercase text-xs tracking-wider border-b border-slate-700/50 pb-2 flex items-center gap-2">
                                <Activity size={14} className="text-emerald-400"/> Transaction Metrics
                              </h4>
                              <div className="text-xs space-y-2">
                                <p className="text-slate-400 flex justify-between">Unit Price: <span className="text-slate-200 font-mono">${row.original.UnitPrice}</span></p>
                                <p className="text-slate-400 flex justify-between">Total Value: <span className="text-emerald-400 font-mono font-semibold">${row.original.Amount.toLocaleString()}</span></p>
                                <p className="text-slate-400 flex justify-between">Volume: <span className="text-slate-200 font-mono">{row.original.Quantity} units / {row.original.Weight}kg</span></p>
                              </div>
                            </div>

                            <div className="space-y-3 bg-[#1e293b]/40 p-3 rounded-md border border-slate-700/60 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-rose-900/10 to-transparent pointer-events-none"></div>
                              <h4 className="text-slate-300 font-bold uppercase text-xs tracking-wider border-b border-slate-700/50 pb-2 flex items-center gap-2 relative z-10">
                                <AlertTriangle size={14} className="text-rose-400"/> Forensic Findings
                              </h4>
                              <div className="relative z-10 space-y-3">
                                <div>
                                  <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-600">
                                    Status: {row.original.riskContext}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  {row.original.flags && row.original.flags.length > 0 ? row.original.flags.map((flag, i) => (
                                    <span key={i} className="text-xs font-semibold bg-rose-950/40 text-rose-300 px-2 py-1.5 border border-rose-900/50 rounded flex items-start gap-1.5 leading-relaxed">
                                      <span className="mt-0.5 font-black">•</span> {flag}
                                    </span>
                                  )) : <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500/80"/> Standard matrix checks passed.</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-slate-500 text-sm font-medium bg-[#121826]">
                    No active customs data matches the current lens parameters.
                  </td>
                </tr>
              )}
            </tbody>

            {table.getFilteredRowModel().rows.length > 0 && (
              <tfoot>
                <tr className="bg-[#1e293b] border-t-2 border-slate-600 font-bold text-xs text-slate-200 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] print:border-gray-400 print:text-black">
                  {table.getVisibleLeafColumns().map(col => {
                    const isPrintHidden = col.columnDef.meta?.printHidden;
                    return (
                      <td key={col.id} className={`px-2 py-3 border-slate-700/50 print:border-gray-300 ${col.id !== 'expander' ? 'border-l' : ''} ${isPrintHidden ? 'print:hidden' : ''}`}>
                        {col.id === 'Product' && <div className="text-right uppercase text-xs tracking-wider text-slate-300 print:text-black">Totals:</div>}
                        {col.id === 'Quantity' && <div className="text-right font-mono text-white print:text-black">{currentAggregates.quantity.toLocaleString()}</div>}
                        {col.id === 'Weight' && <div className="text-right font-mono text-white print:text-black">{currentAggregates.weight.toLocaleString()}kg</div>}
                        {col.id === 'Amount' && <div className="text-right font-mono font-bold text-emerald-400 print:text-black">${currentAggregates.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {viewportMode === 'pages' && table.getFilteredRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-[#0f111a] border-t border-slate-700 text-xs text-slate-400 font-semibold print:hidden">
            <div>
              Displaying {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} – {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} records
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1.5 bg-[#1e293b] hover:bg-slate-700 border border-slate-600 disabled:opacity-50 rounded text-slate-200 transition-colors disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>
              <button 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                className="px-3 py-1.5 bg-[#1e293b] hover:bg-slate-700 border border-slate-600 disabled:opacity-50 rounded text-slate-200 transition-colors disabled:cursor-not-allowed font-medium"
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

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

// Premium Multi-Select Header Filter Component
function PopoverFilter({ column, table }) {
  const [isOpen, setIsOpen] = useState(false);
  const filterValue = column.getFilterValue() || [];
  
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

  if (uniqueValues.length === 0) return null;

  const toggleValue = (val) => {
    const newVal = filterValue.includes(val)
      ? filterValue.filter(v => v !== val)
      : [...filterValue, val];
    column.setFilterValue(newVal.length ? newVal : undefined);
  };

  const isActive = filterValue.length > 0;

  return (
    <div className="relative inline-block text-left ml-1 print:hidden">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`p-1 rounded transition-colors ${isActive ? 'text-blue-400 bg-blue-900/30' : 'text-slate-500 hover:bg-slate-700 hover:text-slate-300'}`}
      >
        <Filter size={12} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
          <div className="absolute left-0 mt-2 origin-top-right z-40 w-56 bg-[#1e293b] border border-slate-600 rounded-md shadow-2xl focus:outline-none overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-2 border-b border-slate-600/60 flex justify-between items-center bg-[#0f111a]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Filter Options</span>
              <button onClick={() => column.setFilterValue(undefined)} className="text-[10px] text-blue-400 hover:text-blue-300">Clear</button>
            </div>
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 p-1">
              {uniqueValues.map(val => {
                const isChecked = filterValue.includes(val);
                return (
                  <label key={val} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-700/50 rounded cursor-pointer text-xs text-slate-300 transition-colors">
                    <div className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-slate-500 bg-slate-800'}`}>
                      {isChecked && <Check size={10} className="text-white" />}
                    </div>
                    <span className="truncate" title={val}>{val}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
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
      size: 24,
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
      cell: ({ getValue }) => <span className="whitespace-nowrap text-slate-300 text-[11px] font-medium">{getValue()}</span>
    },
    {
      accessorKey: 'HSCode',
      header: 'HS Code',
      filterFn: multiSelectFilter,
      cell: ({ getValue, row }) => (
        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${
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
      header: 'Product Description',
      filterFn: multiSelectFilter,
      meta: { printHidden: true },
      cell: ({ getValue }) => <span className="truncate max-w-[120px] block text-slate-300 text-[11px]" title={getValue()}>{getValue()}</span>
    },
    {
      accessorKey: 'Brand',
      header: 'Ecosystem',
      filterFn: multiSelectFilter,
      meta: { printHidden: true },
      cell: ({ getValue }) => <span className="truncate max-w-[100px] block text-slate-300 text-[11px]" title={getValue()}>{getValue()}</span>
    },
    {
      accessorKey: 'OriginCountry',
      header: 'Origin',
      filterFn: multiSelectFilter,
      cell: ({ getValue }) => <span className="text-[11px] text-slate-300 truncate max-w-[70px] block" title={getValue()}>{getValue()}</span>
    },
    {
      accessorKey: 'DestinationCountry',
      header: 'Destination',
      filterFn: multiSelectFilter,
      cell: ({ getValue }) => <span className="text-[11px] text-slate-300 truncate max-w-[70px] block" title={getValue()}>{getValue()}</span>
    },
    {
      accessorKey: 'TransportMode',
      header: 'Transport',
      filterFn: multiSelectFilter,
      meta: { printHidden: true },
      cell: ({ getValue }) => <span className="text-[10px] text-slate-400 flex items-center gap-1"><Truck size={11}/>{getValue() || 'N/A'}</span>
    },
    {
      accessorKey: 'Quantity',
      header: 'Qty',
      cell: ({ getValue }) => <div className="text-right font-mono text-[11px] text-slate-300">{getValue()}</div>
    },
    {
      accessorKey: 'Weight',
      header: 'Weight',
      meta: { printHidden: true },
      cell: ({ getValue }) => <div className="text-right font-mono text-[11px] text-slate-300">{getValue()}</div>
    },
    {
      accessorKey: 'Amount',
      header: 'Value (USD)',
      cell: ({ getValue }) => <div className="text-right font-mono text-[11px] font-medium text-emerald-400/90">${Number(getValue()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
    },
    {
      accessorKey: 'riskScore',
      header: 'Risk Lens',
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
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 w-max ${styles[score]}`}>
            {['Critical', 'High'].includes(score) && <ShieldAlert size={10} />}
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
    <div className="p-4 space-y-4 max-w-[1900px] mx-auto print:p-0 print:bg-white print:text-black">
      
      <div className="bg-[#121826] border border-slate-700/80 rounded-xl p-5 shadow-lg relative overflow-hidden print:border-none print:shadow-none print:bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 relative z-10">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-100 flex items-center gap-3 print:text-black">
              Forensic Shipment Workspace
              <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded-sm uppercase tracking-widest font-medium border border-emerald-800/40">Active Investigation</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 print:hidden">Isolate potential tariff evasion, grey market distribution channels, and classification anomalies.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button onClick={handlePrintDossier} className="flex items-center gap-2 px-3 py-1.5 bg-[#1e293b] hover:bg-slate-700 border border-slate-600 rounded-md text-xs font-medium text-slate-200 transition-colors">
              <FileText size={14} /> Export Dossier
            </button>
            <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-md text-xs font-medium text-white cursor-pointer transition-colors shadow-sm">
              <Download size={14} /> Load Data
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {intelligenceObject && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
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
                <div key={idx} className={`p-2.5 rounded-lg border ${stat.bg || 'bg-[#1e293b]/60 border-slate-700/60'} relative print:border-gray-300 print:bg-gray-50`}>
                  <p className="text-slate-400 text-[9px] font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1"><stat.icon size={10}/> {stat.label}</p>
                  <p className={`text-sm font-medium ${stat.color} print:text-black`}>{stat.value}</p>
                  {stat.alert && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                </div>
              ))}
            </div>

            <div className="bg-blue-950/20 border border-blue-900/40 p-3 rounded-lg mb-4 flex items-start gap-2.5 print:border-gray-300">
              <Activity className="text-blue-400 mt-0.5 shrink-0" size={14} />
              <p className="text-xs text-slate-300 leading-relaxed print:text-black">
                <span className="font-semibold text-blue-300 print:text-black mr-2">AI Diagnostic Briefing:</span> 
                {intelligenceObject.executiveSummary}
              </p>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60 pt-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
              <SlidersHorizontal size={12}/> Filters
            </span>
            <button onClick={() => applyQuickFilter('riskScore', 'Critical')} className="px-2 py-1 bg-[#1e293b] border border-slate-700 text-rose-300 rounded text-[10px] font-medium hover:bg-slate-700 transition">Critical</button>
            <button onClick={() => applyQuickFilter('riskScore', 'High')} className="px-2 py-1 bg-[#1e293b] border border-slate-700 text-orange-300 rounded text-[10px] font-medium hover:bg-slate-700 transition">High</button>
            <button onClick={() => applyQuickFilter('riskScore', 'Medium')} className="px-2 py-1 bg-[#1e293b] border border-slate-700 text-amber-300 rounded text-[10px] font-medium hover:bg-slate-700 transition">Medium</button>
            <div className="w-px h-3 bg-slate-700 mx-0.5"></div>
            <button onClick={() => applyQuickFilter('clear', '')} className="px-2 py-1 bg-[#1e293b]/50 border border-slate-700 text-slate-300 rounded text-[10px] font-medium hover:bg-slate-700 transition">Reset</button>
          </div>

          <div className="flex items-center gap-1 bg-[#0f111a] border border-slate-700 rounded-md p-1">
            <button 
              onClick={() => { setViewportMode('scroll'); table.setPageSize(100000); }}
              className={`px-2 py-1 rounded text-[10px] font-medium transition flex items-center gap-1 ${viewportMode === 'scroll' ? 'bg-[#1e293b] text-white shadow-sm border border-slate-600' : 'text-slate-400 hover:text-white border border-transparent'}`}
            >
              <SlidersHorizontal size={12}/> Continuous
            </button>
            <button 
              onClick={() => { setViewportMode('pages'); table.setPageSize(15); }}
              className={`px-2 py-1 rounded text-[10px] font-medium transition flex items-center gap-1 ${viewportMode === 'pages' ? 'bg-[#1e293b] text-white shadow-sm border border-slate-600' : 'text-slate-400 hover:text-white border border-transparent'}`}
            >
              <RefreshCw size={12}/> Paginated
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#121826] border border-slate-700/80 rounded-xl overflow-hidden shadow-lg print:border-none print:shadow-none print:bg-white flex flex-col w-full">
        
        <div className="p-3 border-b border-slate-700/60 bg-[#0f111a] flex justify-between items-center print:hidden">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Deep search entity ledger..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-600 rounded-md pl-8 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className={`w-full ${viewportMode === 'scroll' ? 'max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent' : ''}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-[#0f111a] border-b border-slate-700 sticky top-0 z-20 print:bg-gray-100">
                  {headerGroup.headers.map(header => {
                    const isNumeric = ['Quantity', 'Weight', 'Amount'].includes(header.column.id);
                    const isPrintHidden = header.column.columnDef.meta?.printHidden;
                    return (
                      <th 
                        key={header.id} 
                        style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : 'auto' }}
                        className={`px-2 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider select-none border-r border-slate-800/50 last:border-0 align-middle print:text-black print:border-gray-300 ${isPrintHidden ? 'print:hidden' : ''}`}
                      >
                        <div className={`flex items-center group ${isNumeric ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                          <div 
                            onClick={header.column.getToggleSortingHandler()}
                            className={`flex items-center gap-1 cursor-pointer hover:text-slate-200 transition-colors flex-1 ${isNumeric ? 'justify-end' : ''}`}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && <ArrowUpDown size={10} className="text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />}
                          </div>
                          
                          {header.column.getCanFilter() && (
                            <PopoverFilter column={header.column} table={table} />
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            
            <tbody className="divide-y divide-slate-800/60 bg-[#121826] print:bg-white print:divide-gray-300">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <React.Fragment key={row.id}>
                    <tr 
                      onClick={() => row.toggleExpanded()}
                      className={`hover:bg-[#1e293b]/50 transition-colors print:text-black cursor-pointer group ${row.getIsExpanded() ? 'bg-[#1e293b]/30' : ''}`}
                    >
                      {row.getVisibleCells().map(cell => {
                        const isPrintHidden = cell.column.columnDef.meta?.printHidden;
                        return (
                          <td key={cell.id} className={`px-2 py-1.5 align-middle print:border-b print:border-gray-300 ${isPrintHidden ? 'print:hidden' : ''}`}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                    
                    {row.getIsExpanded() && (
                      <tr className="bg-[#0f111a] border-y border-slate-700/50 print:hidden">
                        <td colSpan={columns.length} className="p-0">
                          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-inner">
                            <div className="space-y-2 bg-[#1e293b]/40 p-3 rounded-md border border-slate-700/60">
                              <h4 className="text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700/50 pb-1.5 flex items-center gap-1.5">
                                <Navigation size={12} className="text-blue-400"/> Routing Details
                              </h4>
                              <div className="text-xs space-y-1.5">
                                <p className="text-slate-400 flex justify-between">Exporter: <span className="text-slate-200 font-medium truncate ml-2">{row.original.Exporter}</span></p>
                                <p className="text-slate-400 flex justify-between">Importer: <span className="text-slate-200 font-medium truncate ml-2">{row.original.Importer}</span></p>
                                <p className="text-slate-400 flex justify-between">Corridor: <span className="text-slate-200 font-medium truncate ml-2">{row.original.OriginCountry} ➔ {row.original.DestinationCountry}</span></p>
                              </div>
                            </div>

                            <div className="space-y-2 bg-[#1e293b]/40 p-3 rounded-md border border-slate-700/60">
                              <h4 className="text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700/50 pb-1.5 flex items-center gap-1.5">
                                <Activity size={12} className="text-emerald-400"/> Transaction Metrics
                              </h4>
                              <div className="text-xs space-y-1.5">
                                <p className="text-slate-400 flex justify-between">Unit Price: <span className="text-slate-200 font-mono">${row.original.UnitPrice}</span></p>
                                <p className="text-slate-400 flex justify-between">Total Value: <span className="text-emerald-400 font-mono font-medium">${row.original.Amount.toLocaleString()}</span></p>
                                <p className="text-slate-400 flex justify-between">Volume: <span className="text-slate-200 font-mono">{row.original.Quantity} units / {row.original.Weight}kg</span></p>
                              </div>
                            </div>

                            <div className="space-y-2 bg-[#1e293b]/40 p-3 rounded-md border border-slate-700/60 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-rose-900/5 to-transparent pointer-events-none"></div>
                              <h4 className="text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700/50 pb-1.5 flex items-center gap-1.5 relative z-10">
                                <AlertTriangle size={12} className="text-rose-400"/> Forensic Findings
                              </h4>
                              <div className="relative z-10 space-y-2">
                                <div>
                                  <span className="text-[10px] font-medium text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600">
                                    Status: {row.original.riskContext}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  {row.original.flags && row.original.flags.length > 0 ? row.original.flags.map((flag, i) => (
                                    <span key={i} className="text-[10px] font-medium bg-rose-950/30 text-rose-300 px-1.5 py-1 border border-rose-900/40 rounded flex items-start gap-1">
                                      <span className="mt-0.5">•</span> {flag}
                                    </span>
                                  )) : <span className="text-slate-400 text-[10px] flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500/80"/> Standard matrix checks passed.</span>}
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
                  <td colSpan={columns.length} className="text-center py-10 text-slate-500 text-xs bg-[#121826]">
                    No active customs data matches the current lens parameters.
                  </td>
                </tr>
              )}
            </tbody>

            {table.getFilteredRowModel().rows.length > 0 && (
              <tfoot>
                <tr className="bg-[#0f111a] border-t border-slate-700 font-medium text-[11px] text-slate-300 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] print:border-gray-400 print:text-black">
                  {table.getVisibleLeafColumns().map(col => {
                    const isPrintHidden = col.columnDef.meta?.printHidden;
                    return (
                      <td key={col.id} className={`px-2 py-2 border-slate-800/50 print:border-gray-300 ${col.id !== 'expander' ? 'border-l' : ''} ${isPrintHidden ? 'print:hidden' : ''}`}>
                        {col.id === 'DestinationCountry' && <div className="text-right uppercase text-[10px] tracking-wider text-slate-400 print:text-black">Totals:</div>}
                        {col.id === 'Quantity' && <div className="text-right font-mono text-slate-200 print:text-black">{currentAggregates.quantity.toLocaleString()}</div>}
                        {col.id === 'Weight' && <div className="text-right font-mono text-slate-200 print:text-black">{currentAggregates.weight.toLocaleString()}kg</div>}
                        {col.id === 'Amount' && <div className="text-right font-mono font-semibold text-emerald-400/90 print:text-black">${currentAggregates.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {viewportMode === 'pages' && table.getFilteredRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-[#0f111a] border-t border-slate-800 text-[11px] text-slate-400 font-medium print:hidden">
            <div>
              Displaying {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} – {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} records
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-1 bg-[#1e293b] hover:bg-slate-700 border border-slate-600 disabled:opacity-50 rounded text-slate-200 transition-colors disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                className="px-2 py-1 bg-[#1e293b] hover:bg-slate-700 border border-slate-600 disabled:opacity-50 rounded text-slate-200 transition-colors disabled:cursor-not-allowed"
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

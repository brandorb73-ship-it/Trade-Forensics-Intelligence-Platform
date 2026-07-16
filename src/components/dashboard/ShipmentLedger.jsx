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
  CheckCircle2, RefreshCw, SlidersHorizontal, Truck
} from 'lucide-react';

// Reusable Filter Component for Column Headers
function ColumnFilter({ column, table }) {
  const columnFilterValue = column.getFilterValue();
  
  const uniqueValues = useMemo(() => {
    const values = new Set();
    table.getPreFilteredRowModel().flatRows.forEach(row => {
      const val = row.getValue(column.id);
      if (val) values.add(val);
    });
    return Array.from(values).sort();
  }, [table, column.id]);

  return (
    <div className="mt-2 w-full print:hidden">
      <select
        value={(columnFilterValue ?? '')}
        onChange={e => column.setFilterValue(e.target.value || undefined)}
        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
        onClick={(e) => e.stopPropagation()} // Prevent sort triggering
      >
        <option value="">All</option>
        {uniqueValues.map(val => (
          <option key={val} value={val}>{val}</option>
        ))}
      </select>
    </div>
  );
}

export default function ShipmentLedger() {
  const { tradeData, uploadFile, registerIntelligence } = useTradeData();
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [viewportMode, setViewportMode] = useState('scroll');

  const { augmentedData, intelligenceObject } = useShipmentIntelligence(tradeData, registerIntelligence);

  // Print function temporarily clears constraints to export full dossier
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
      cell: ({ row }) => (
        <span className="p-2 text-slate-200">
          {row.getIsExpanded() ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      ),
    },
    {
      accessorKey: 'Date',
      header: 'Date',
      cell: ({ getValue }) => <span className="whitespace-nowrap inline-block text-slate-100 font-bold font-mono text-sm">{getValue()}</span>
    },
    {
      accessorKey: 'HSCode',
      header: 'HS Code',
      cell: ({ getValue, row }) => (
        <span className={`font-mono px-3 py-1 rounded text-sm font-bold border ${
          row.original.hasHsVariance 
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]' 
            : 'bg-slate-700/80 text-slate-100 border-transparent'
        }`}>
          {getValue()}
        </span>
      )
    },
    {
      accessorKey: 'Product',
      header: 'Product Description',
      cell: ({ getValue }) => <span className="truncate max-w-[200px] block font-bold text-slate-100 text-sm">{getValue()}</span>
    },
    {
      accessorKey: 'Brand',
      header: 'Brand Ecosystem',
      filterFn: 'equals',
      cell: ({ getValue }) => <span className="text-emerald-400 font-black tracking-wide text-sm">{getValue()}</span>
    },
    {
      accessorKey: 'OriginCountry',
      header: 'Origin',
      filterFn: 'equals',
      cell: ({ getValue }) => <span className="font-mono text-sm text-slate-100 font-bold">{getValue()}</span>
    },
    {
      accessorKey: 'DestinationCountry',
      header: 'Destination',
      filterFn: 'equals',
      cell: ({ getValue }) => <span className="font-mono text-sm text-slate-100 font-bold">{getValue()}</span>
    },
    {
      accessorKey: 'TransportMode',
      header: 'Transport',
      filterFn: 'equals',
      cell: ({ getValue }) => <span className="font-bold text-sm text-slate-200 flex items-center gap-1.5"><Truck size={14}/>{getValue() || 'N/A'}</span>
    },
    {
      accessorKey: 'Quantity',
      header: 'Quantity',
      cell: ({ getValue }) => <span className="font-mono font-bold text-slate-100 text-sm">{getValue()}</span>
    },
    {
      accessorKey: 'Weight',
      header: 'Weight',
      cell: ({ getValue }) => <span className="font-mono font-bold text-slate-100 text-sm">{getValue()}</span>
    },
    {
      accessorKey: 'Amount',
      header: 'Value (USD)',
      cell: ({ getValue }) => <span className="font-mono font-bold text-white text-sm">${Number(getValue()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
    },
    {
      accessorKey: 'riskScore',
      header: 'Analysis Lens',
      filterFn: 'equals',
      cell: ({ getValue }) => {
        const score = getValue();
        const colors = {
          Critical: 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse',
          High: 'bg-orange-950 text-orange-300 border-orange-700',
          Medium: 'bg-amber-950 text-amber-300 border-amber-700',
          Low: 'bg-slate-800 text-slate-200 border-slate-600'
        };
        return (
          <div className="flex flex-col gap-1">
            <span className={`px-2 py-1 rounded text-sm font-black border tracking-wider flex items-center justify-center gap-1 w-full ${colors[score]}`}>
              {['Critical', 'High'].includes(score) && <ShieldAlert size={14} />}
              {score}
            </span>
          </div>
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
      table.getColumn('riskScore')?.setFilterValue(value);
    } else if (type === 'clear') {
      setColumnFilters([]);
      setGlobalFilter('');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1900px] mx-auto print:p-0 print:bg-white print:text-black">
      
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:bg-white">
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 relative z-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3 print:text-black">
              Forensic Shipment Workspace
              <span className="text-sm bg-emerald-950 text-emerald-400 px-3 py-1 rounded tracking-widest font-mono border border-emerald-700">ACTIVE INVESTIGATION</span>
            </h1>
            <p className="text-base font-medium text-slate-300 mt-2 print:hidden">Isolate potential tariff evasion, grey market distribution channels, and classification risks.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button 
              onClick={handlePrintDossier}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-base font-bold text-white transition active:scale-95 cursor-pointer"
            >
              <FileText size={18} /> Print Full Dossier Data
            </button>
            <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded text-base font-bold text-white cursor-pointer transition active:scale-95">
              <Download size={18} /> Load Customs CSV
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {intelligenceObject && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-300 text-sm font-bold uppercase mb-1 flex items-center gap-2"><Package size={14}/> Total Shipments</p>
                <p className="text-2xl font-mono font-black text-white print:text-black">{intelligenceObject.metrics.totalShipments.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-300 text-sm font-bold uppercase mb-1 flex items-center gap-2"><Activity size={14}/> Value (USD)</p>
                <p className="text-2xl font-mono font-black text-emerald-400">${(intelligenceObject.metrics.totalValue / 1000000).toFixed(2)}M</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-300 text-sm font-bold uppercase mb-1 flex items-center gap-2"><Globe size={14}/> Importers / Exp</p>
                <p className="text-2xl font-mono font-black text-blue-400">{intelligenceObject.metrics.distinctImporters}<span className="text-sm text-slate-400">I</span> / {intelligenceObject.metrics.distinctExporters}<span className="text-sm text-slate-400">E</span></p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-300 text-sm font-bold uppercase mb-1 flex items-center gap-2"><Tag size={14}/> Unique Brands</p>
                <p className="text-2xl font-mono font-black text-purple-400">{intelligenceObject.metrics.distinctBrands}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-300 text-sm font-bold uppercase mb-1 flex items-center gap-2"><Globe size={14}/> Origins</p>
                <p className="text-2xl font-mono font-black text-teal-400">{intelligenceObject.metrics.distinctOrigins}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-300 text-sm font-bold uppercase mb-1 flex items-center gap-2"><Navigation size={14}/> Destinations</p>
                <p className="text-2xl font-mono font-black text-indigo-400">{intelligenceObject.metrics.distinctDestinations}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 relative overflow-hidden print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-300 text-sm font-bold uppercase mb-1 flex items-center gap-2"><AlertTriangle size={14}/> HS Variance</p>
                <p className="text-2xl font-mono font-black text-amber-400">{intelligenceObject.metrics.hsVarianceCount}</p>
                {intelligenceObject.metrics.hsVarianceCount > 0 && (
                  <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </div>
              <div className="bg-rose-950/40 p-4 rounded-lg border border-rose-800 relative overflow-hidden print:border-gray-300 print:bg-gray-50">
                <p className="text-rose-300 text-sm font-bold uppercase mb-1 flex items-center gap-2"><ShieldAlert size={14}/> Lens Risk FSI</p>
                <p className="text-2xl font-mono font-black text-rose-400">{intelligenceObject.metrics.forensicIndex}%</p>
              </div>
            </div>

            <div className="bg-slate-800 border-l-4 border-blue-500 p-5 rounded-r-lg mb-6 shadow-md print:border-gray-300">
              <p className="text-base text-slate-200 leading-relaxed print:text-black">
                <span className="font-black text-blue-400 print:text-black">AI Workspace Diagnostic: </span> 
                {intelligenceObject.executiveSummary}
              </p>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-700 pt-5 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-300 font-bold uppercase tracking-wider mr-2 flex items-center gap-2">
              <SlidersHorizontal size={16}/> Filter Shortcuts:
            </span>
            <button onClick={() => applyQuickFilter('riskScore', 'Critical')} className="px-4 py-1.5 bg-rose-950 text-rose-300 border border-rose-700 rounded-full text-sm font-bold hover:bg-rose-900 transition cursor-pointer">Critical Risk</button>
            <button onClick={() => applyQuickFilter('riskScore', 'High')} className="px-4 py-1.5 bg-orange-950 text-orange-300 border border-orange-700 rounded-full text-sm font-bold hover:bg-orange-900 transition cursor-pointer">High Risk</button>
            <button onClick={() => applyQuickFilter('riskScore', 'Medium')} className="px-4 py-1.5 bg-amber-950 text-amber-300 border border-amber-700 rounded-full text-sm font-bold hover:bg-amber-900 transition cursor-pointer">Medium Risk</button>
            <button onClick={() => applyQuickFilter('clear', '')} className="px-4 py-1.5 bg-slate-700 text-white border border-slate-600 rounded-full text-sm font-bold hover:bg-slate-600 transition cursor-pointer">Reset All Filters</button>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-700">
            <button 
              onClick={() => { setViewportMode('scroll'); table.setPageSize(100000); }}
              className={`px-4 py-2 rounded-md text-sm font-bold transition flex items-center gap-2 cursor-pointer ${viewportMode === 'scroll' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            >
              <SlidersHorizontal size={16}/> Continuous View
            </button>
            <button 
              onClick={() => { setViewportMode('pages'); table.setPageSize(15); }}
              className={`px-4 py-2 rounded-md text-sm font-bold transition flex items-center gap-2 cursor-pointer ${viewportMode === 'pages' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            >
              <RefreshCw size={16}/> Paginated View
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl print:border-none print:shadow-none print:bg-white">
        
        <div className="p-5 border-b border-slate-700 bg-slate-950 flex justify-between items-center print:hidden">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Deep search across all ledger fields..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-12 pr-4 py-2.5 text-base text-white focus:outline-none focus:border-blue-500 font-mono placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className={`overflow-x-auto ${viewportMode === 'scroll' ? 'max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent' : ''}`}>
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-slate-950 border-b border-slate-700 sticky top-0 z-20 print:bg-gray-100">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-5 py-4 text-sm font-black tracking-wider text-slate-200 font-mono select-none border-r border-slate-800 last:border-0 align-top print:text-black print:border-gray-300">
                      <div 
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors uppercase"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={14} className="text-slate-400 shrink-0" />}
                      </div>
                      
                      {header.column.getCanFilter() && (
                        <ColumnFilter column={header.column} table={table} />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            
            <tbody className="divide-y divide-slate-800 bg-slate-900 print:bg-white print:divide-gray-300">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <React.Fragment key={row.id}>
                    <tr 
                      onClick={() => row.toggleExpanded()}
                      className="hover:bg-slate-800 transition-colors print:text-black cursor-pointer group"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-5 py-4 text-base align-middle print:border-b print:border-gray-300">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    
                    {row.getIsExpanded() && (
                      <tr className="bg-slate-950 border-y border-blue-800/60 print:hidden">
                        <td colSpan={columns.length} className="p-0">
                          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-inner">
                            
                            <div className="space-y-4 bg-slate-900 p-5 rounded-lg border border-slate-700">
                              <h4 className="text-slate-100 font-black uppercase text-sm tracking-widest border-b border-slate-700 pb-3 flex items-center gap-2 text-blue-400">
                                <Navigation size={18}/> Entity & Route Analysis
                              </h4>
                              <div className="text-sm space-y-3">
                                <p className="text-slate-300 font-medium">Exporter: <span className="text-white font-mono font-bold block mt-1">{row.original.Exporter}</span></p>
                                <p className="text-slate-300 font-medium">Importer: <span className="text-white font-mono font-bold block mt-1">{row.original.Importer}</span></p>
                                <p className="text-slate-300 font-medium">Corridor: <span className="text-white font-mono font-bold block mt-1">{row.original.OriginCountry} ➔ {row.original.DestinationCountry}</span></p>
                              </div>
                            </div>

                            <div className="space-y-4 bg-slate-900 p-5 rounded-lg border border-slate-700">
                              <h4 className="text-slate-100 font-black uppercase text-sm tracking-widest border-b border-slate-700 pb-3 flex items-center gap-2 text-emerald-400">
                                <Activity size={18}/> Economic Viability
                              </h4>
                              <div className="text-sm space-y-3">
                                <p className="text-slate-300 font-medium">Declared Unit: <span className="text-amber-400 font-mono font-black block mt-1">${row.original.UnitPrice}</span></p>
                                <p className="text-slate-300 font-medium">Total Volume: <span className="text-emerald-400 font-mono font-black block mt-1">${row.original.Amount.toLocaleString()}</span></p>
                                <p className="text-slate-300 font-medium flex gap-4">
                                  <span>Qty: <span className="text-white font-mono font-bold">{row.original.Quantity}</span></span>
                                  <span>Wt: <span className="text-white font-mono font-bold">{row.original.Weight}kg</span></span>
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4 bg-slate-900 p-5 rounded-lg border border-slate-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                              <h4 className="text-slate-100 font-black uppercase text-sm tracking-widest border-b border-slate-700 pb-3 flex items-center gap-2 text-rose-400">
                                <AlertTriangle size={18}/> Forensic Audit Summary
                              </h4>
                              
                              <div className="mb-3">
                                <span className="text-sm font-bold text-white bg-slate-800 px-3 py-1.5 rounded-md border border-slate-600 block w-max">
                                  Status: {row.original.riskContext}
                                </span>
                              </div>

                              <div className="flex flex-col gap-2">
                                {row.original.flags && row.original.flags.length > 0 ? row.original.flags.map((flag, i) => (
                                  <span key={i} className="text-xs font-mono font-bold bg-rose-950/80 text-rose-300 px-3 py-2 border border-rose-800 rounded">
                                    {flag}
                                  </span>
                                )) : <span className="text-slate-300 text-sm italic flex items-center gap-2 font-bold"><CheckCircle2 size={16} className="text-emerald-500"/> Declaration passed standard matrix checks.</span>}
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
                  <td colSpan={columns.length} className="text-center py-20 text-slate-300 text-lg font-mono font-bold bg-slate-950/20">
                    No active customs data matches the current lens filters.
                  </td>
                </tr>
              )}
            </tbody>

            {/* This is the fixed line right below */}
            {table.getFilteredRowModel().rows.length > 0 && (
              <tfoot>
                <tr className="bg-slate-950 font-mono border-t-2 border-slate-600 font-black text-sm text-slate-100 sticky bottom-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
                  <td className="px-5 py-4 text-emerald-400 tracking-wide font-black text-base uppercase">Ledger Totals</td>
                  <td colSpan={7} className="px-5 py-4 text-slate-300 text-right uppercase">
                    Active Filter Aggregates:
                  </td>
                  <td className="px-5 py-4 text-white font-black border-l border-slate-800">
                    {currentAggregates.quantity.toLocaleString()} items
                  </td>
                  <td className="px-5 py-4 text-white font-black border-l border-slate-800">
                    {currentAggregates.weight.toLocaleString()} kg
                  </td>
                  <td className="px-5 py-4 text-emerald-400 font-black border-l border-slate-800 text-lg">
                    ${currentAggregates.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td colSpan={1} className="px-5 py-4 border-l border-slate-800"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {viewportMode === 'pages' && table.getFilteredRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between p-5 bg-slate-950 border-t border-slate-700 text-sm font-mono text-slate-300 font-bold print:hidden">
            <div>
              Displaying {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} – {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} entries
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-white font-bold transition disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-white font-bold transition disabled:cursor-not-allowed cursor-pointer"
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

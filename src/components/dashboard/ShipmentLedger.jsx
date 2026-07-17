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

// Refined, ultra-compact filter for professional data grids
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
    <div className="mt-1.5 w-full print:hidden">
      <select
        value={(columnFilterValue ?? '')}
        onChange={e => column.setFilterValue(e.target.value || undefined)}
        className="w-full bg-slate-900/50 border border-slate-700 text-slate-300 text-[11px] rounded px-1.5 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
        onClick={(e) => e.stopPropagation()} 
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
      size: 40,
      cell: ({ row }) => (
        <div className="flex items-center justify-center w-full">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              row.toggleExpanded();
            }}
            className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white transition-colors"
          >
            {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      ),
    },
    {
      accessorKey: 'Date',
      header: 'Date',
      cell: ({ getValue }) => <span className="whitespace-nowrap text-slate-200 text-sm font-medium">{getValue()}</span>
    },
    {
      accessorKey: 'HSCode',
      header: 'HS Code',
      cell: ({ getValue, row }) => (
        <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
          row.original.hasHsVariance 
            ? 'bg-amber-900/30 text-amber-400 border-amber-700/50' 
            : 'bg-slate-800 text-slate-300 border-slate-700'
        }`}>
          {getValue()}
        </span>
      )
    },
    {
      accessorKey: 'Product',
      header: 'Product Description',
      cell: ({ getValue }) => <span className="truncate max-w-[180px] block text-slate-200 text-sm" title={getValue()}>{getValue()}</span>
    },
    {
      accessorKey: 'Brand',
      header: 'Ecosystem',
      filterFn: 'equals',
      cell: ({ getValue }) => <span className="text-slate-300 text-sm">{getValue()}</span>
    },
    {
      accessorKey: 'OriginCountry',
      header: 'Origin',
      filterFn: 'equals',
      cell: ({ getValue }) => <span className="text-sm text-slate-300">{getValue()}</span>
    },
    {
      accessorKey: 'DestinationCountry',
      header: 'Destination',
      filterFn: 'equals',
      cell: ({ getValue }) => <span className="text-sm text-slate-300">{getValue()}</span>
    },
    {
      accessorKey: 'TransportMode',
      header: 'Transport',
      filterFn: 'equals',
      cell: ({ getValue }) => <span className="text-sm text-slate-400 flex items-center gap-1.5"><Truck size={13}/>{getValue() || 'N/A'}</span>
    },
    {
      accessorKey: 'Quantity',
      header: () => <div className="text-right">Quantity</div>,
      cell: ({ getValue }) => <div className="text-right font-mono text-sm text-slate-300">{getValue()}</div>
    },
    {
      accessorKey: 'Weight',
      header: () => <div className="text-right">Weight</div>,
      cell: ({ getValue }) => <div className="text-right font-mono text-sm text-slate-300">{getValue()}</div>
    },
    {
      accessorKey: 'Amount',
      header: () => <div className="text-right">Value (USD)</div>,
      cell: ({ getValue }) => <div className="text-right font-mono text-sm font-medium text-emerald-400">${Number(getValue()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
    },
    {
      accessorKey: 'riskScore',
      header: 'Risk Lens',
      filterFn: 'equals',
      cell: ({ getValue }) => {
        const score = getValue();
        const styles = {
          Critical: 'text-rose-400 border-rose-800 bg-rose-950/30',
          High: 'text-orange-400 border-orange-800 bg-orange-950/30',
          Medium: 'text-amber-400 border-amber-800 bg-amber-950/30',
          Low: 'text-slate-400 border-slate-700 bg-slate-800/50'
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1 w-max ${styles[score]}`}>
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
      
      {/* Premium Dashboard Panel */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-6 shadow-lg relative overflow-hidden print:border-none print:shadow-none print:bg-white">
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 relative z-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-3 print:text-black">
              Forensic Shipment Workspace
              <span className="text-[10px] bg-emerald-950/50 text-emerald-400 px-2.5 py-1 rounded-sm uppercase tracking-widest font-medium border border-emerald-800/50">Active Investigation</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 print:hidden">Isolate potential tariff evasion, grey market distribution channels, and classification anomalies.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button 
              onClick={handlePrintDossier}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-sm font-medium text-slate-200 transition-colors"
            >
              <FileText size={16} /> Export Dossier
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-md text-sm font-medium text-white cursor-pointer transition-colors shadow-sm">
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
                { label: "Importers / Exp", value: `${intelligenceObject.metrics.distinctImporters} / ${intelligenceObject.metrics.distinctExporters}`, icon: Globe, color: "text-blue-400" },
                { label: "Unique Brands", value: intelligenceObject.metrics.distinctBrands, icon: Tag, color: "text-purple-400" },
                { label: "Origins", value: intelligenceObject.metrics.distinctOrigins, icon: Globe, color: "text-teal-400" },
                { label: "Destinations", value: intelligenceObject.metrics.distinctDestinations, icon: Navigation, color: "text-indigo-400" },
                { label: "HS Variance", value: intelligenceObject.metrics.hsVarianceCount, icon: AlertTriangle, color: "text-amber-400", alert: intelligenceObject.metrics.hsVarianceCount > 0 },
                { label: "Lens Risk FSI", value: `${intelligenceObject.metrics.forensicIndex}%`, icon: ShieldAlert, color: "text-rose-400", bg: "bg-rose-950/20 border-rose-900/50" }
              ].map((stat, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${stat.bg || 'bg-slate-800/40 border-slate-700/50'} relative print:border-gray-300 print:bg-gray-50`}>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><stat.icon size={12}/> {stat.label}</p>
                  <p className={`text-lg font-medium ${stat.color} print:text-black`}>{stat.value}</p>
                  {stat.alert && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
                </div>
              ))}
            </div>

            <div className="bg-blue-950/20 border border-blue-900/50 p-4 rounded-lg mb-6 flex items-start gap-3 print:border-gray-300">
              <Activity className="text-blue-400 mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-slate-300 leading-relaxed print:text-black">
                <span className="font-semibold text-blue-400 print:text-black mr-2">Workspace Diagnostic:</span> 
                {intelligenceObject.executiveSummary}
              </p>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-700/60 pt-4 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <SlidersHorizontal size={14}/> Filters
            </span>
            <button onClick={() => applyQuickFilter('riskScore', 'Critical')} className="px-3 py-1 bg-slate-800 border border-slate-700 text-rose-400 rounded text-xs font-medium hover:bg-slate-700 transition">Critical</button>
            <button onClick={() => applyQuickFilter('riskScore', 'High')} className="px-3 py-1 bg-slate-800 border border-slate-700 text-orange-400 rounded text-xs font-medium hover:bg-slate-700 transition">High</button>
            <button onClick={() => applyQuickFilter('riskScore', 'Medium')} className="px-3 py-1 bg-slate-800 border border-slate-700 text-amber-400 rounded text-xs font-medium hover:bg-slate-700 transition">Medium</button>
            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <button onClick={() => applyQuickFilter('clear', '')} className="px-3 py-1 bg-slate-800/50 border border-slate-700 text-slate-300 rounded text-xs font-medium hover:bg-slate-700 transition">Reset</button>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-md p-1">
            <button 
              onClick={() => { setViewportMode('scroll'); table.setPageSize(100000); }}
              className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1.5 ${viewportMode === 'scroll' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <SlidersHorizontal size={14}/> Continuous
            </button>
            <button 
              onClick={() => { setViewportMode('pages'); table.setPageSize(15); }}
              className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1.5 ${viewportMode === 'pages' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <RefreshCw size={14}/> Paginated
            </button>
          </div>
        </div>
      </div>

      {/* Premium Data Grid */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg print:border-none print:shadow-none print:bg-white flex flex-col">
        
        <div className="p-4 border-b border-slate-700/60 bg-slate-900/50 flex justify-between items-center print:hidden">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Deep search entity ledger..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition-all"
            />
          </div>
        </div>

        <div className={`overflow-x-auto w-full ${viewportMode === 'scroll' ? 'max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent' : ''}`}>
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-slate-950 border-b border-slate-700 sticky top-0 z-20 print:bg-gray-100">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : 'auto' }}
                      className="px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none border-r border-slate-800/50 last:border-0 align-top print:text-black print:border-gray-300"
                    >
                      <div 
                        onClick={header.column.getToggleSortingHandler()}
                        className={`flex items-center gap-1.5 cursor-pointer hover:text-slate-200 transition-colors ${header.column.id === 'Quantity' || header.column.id === 'Weight' || header.column.id === 'Amount' ? 'justify-end' : ''}`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={12} className="text-slate-600 shrink-0" />}
                      </div>
                      
                      {header.column.getCanFilter() && (
                        <ColumnFilter column={header.column} table={table} />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            
            <tbody className="divide-y divide-slate-800/60 bg-slate-900 print:bg-white print:divide-gray-300">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <React.Fragment key={row.id}>
                    <tr 
                      onClick={() => row.toggleExpanded()}
                      className={`hover:bg-slate-800/50 transition-colors print:text-black cursor-pointer group ${row.getIsExpanded() ? 'bg-slate-800/30' : ''}`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-3 py-2.5 align-middle print:border-b print:border-gray-300">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    
                    {row.getIsExpanded() && (
                      <tr className="bg-slate-950 border-y border-slate-700/50 print:hidden">
                        <td colSpan={columns.length} className="p-0">
                          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-inner">
                            
                            <div className="space-y-3 bg-slate-900 p-4 rounded-md border border-slate-800">
                              <h4 className="text-slate-300 font-semibold uppercase text-xs tracking-wider border-b border-slate-700/50 pb-2 flex items-center gap-2">
                                <Navigation size={14} className="text-blue-400"/> Routing Details
                              </h4>
                              <div className="text-sm space-y-2">
                                <p className="text-slate-400 flex justify-between">Exporter: <span className="text-slate-200 font-medium">{row.original.Exporter}</span></p>
                                <p className="text-slate-400 flex justify-between">Importer: <span className="text-slate-200 font-medium">{row.original.Importer}</span></p>
                                <p className="text-slate-400 flex justify-between">Corridor: <span className="text-slate-200 font-medium">{row.original.OriginCountry} ➔ {row.original.DestinationCountry}</span></p>
                              </div>
                            </div>

                            <div className="space-y-3 bg-slate-900 p-4 rounded-md border border-slate-800">
                              <h4 className="text-slate-300 font-semibold uppercase text-xs tracking-wider border-b border-slate-700/50 pb-2 flex items-center gap-2">
                                <Activity size={14} className="text-emerald-400"/> Transaction Metrics
                              </h4>
                              <div className="text-sm space-y-2">
                                <p className="text-slate-400 flex justify-between">Unit Price: <span className="text-slate-200 font-mono">${row.original.UnitPrice}</span></p>
                                <p className="text-slate-400 flex justify-between">Total Value: <span className="text-emerald-400 font-mono font-medium">${row.original.Amount.toLocaleString()}</span></p>
                                <p className="text-slate-400 flex justify-between">Volume: <span className="text-slate-200 font-mono">{row.original.Quantity} units / {row.original.Weight}kg</span></p>
                              </div>
                            </div>

                            <div className="space-y-3 bg-slate-900 p-4 rounded-md border border-slate-800 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-rose-900/10 to-transparent pointer-events-none"></div>
                              <h4 className="text-slate-300 font-semibold uppercase text-xs tracking-wider border-b border-slate-700/50 pb-2 flex items-center gap-2 relative z-10">
                                <AlertTriangle size={14} className="text-rose-400"/> Forensic Findings
                              </h4>
                              <div className="relative z-10 space-y-3">
                                <div>
                                  <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                    Status: {row.original.riskContext}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  {row.original.flags && row.original.flags.length > 0 ? row.original.flags.map((flag, i) => (
                                    <span key={i} className="text-[11px] font-medium bg-rose-950/40 text-rose-300 px-2 py-1.5 border border-rose-900/50 rounded flex items-start gap-1.5">
                                      <span className="mt-0.5">•</span> {flag}
                                    </span>
                                  )) : <span className="text-slate-400 text-xs flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500"/> Standard matrix checks passed.</span>}
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
                  <td colSpan={columns.length} className="text-center py-16 text-slate-400 text-sm bg-slate-900">
                    No active customs data matches the current lens parameters.
                  </td>
                </tr>
              )}
            </tbody>

            {table.getFilteredRowModel().rows.length > 0 && (
              <tfoot>
                <tr className="bg-slate-950 border-t border-slate-700 font-medium text-xs text-slate-300 sticky bottom-0 z-20">
                  <td colSpan={8} className="px-3 py-3 text-right uppercase tracking-wider text-slate-400">
                    Ledger Aggregates:
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-200 border-l border-slate-800/50">
                    {currentAggregates.quantity.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-200 border-l border-slate-800/50">
                    {currentAggregates.weight.toLocaleString()}kg
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-semibold text-emerald-400 border-l border-slate-800/50">
                    ${currentAggregates.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className="px-3 py-3 border-l border-slate-800/50"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {viewportMode === 'pages' && table.getFilteredRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 font-medium print:hidden">
            <div>
              Displaying {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} – {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} records
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded text-slate-200 transition-colors disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded text-slate-200 transition-colors disabled:cursor-not-allowed"
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

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
import { Search, ArrowUpDown, ShieldAlert, Download, FileSpreadsheet, ChevronDown, ChevronRight, Activity, AlertTriangle, Globe, Package, Navigation, Tag } from 'lucide-react';

export default function ShipmentLedger() {
  const { tradeData, uploadFile, registerIntelligence } = useTradeData();
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [expanded, setExpanded] = useState({});

  // Intelligence Engine Hook
  const { augmentedData, intelligenceObject } = useShipmentIntelligence(tradeData, registerIntelligence);

  const getMonthYearString = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        const monthStr = parts[1].substring(0, 3);
        const yearStr = parts[2] ? (parts[2].length === 2 ? `20${parts[2]}` : parts[2]) : '';
        return `${monthStr} ${yearStr}`.trim();
      }
      return dateStr;
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  };

  const getUniqueColumnValues = (columnId) => {
    const values = new Set();
    augmentedData.forEach(row => {
      if (columnId === 'Date') {
        values.add(getMonthYearString(row.Date));
      } else if (row[columnId] !== undefined && row[columnId] !== null && row[columnId] !== '') {
        values.add(row[columnId]);
      }
    });
    return Array.from(values).sort((a, b) => String(a).localeCompare(String(b)));
  };

  const columns = useMemo(() => [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
        <button
          onClick={row.getToggleExpandedHandler()}
          className="p-1 hover:bg-slate-700 rounded text-slate-400 transition"
        >
          {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      ),
    },
    {
      accessorKey: 'Date',
      header: 'Date',
      filterFn: (row, columnId, filterValue) => getMonthYearString(row.original.Date) === filterValue,
      cell: ({ getValue }) => <span className="whitespace-nowrap inline-block min-w-[90px] text-slate-100 font-medium">{getValue()}</span>
    },
    {
      accessorKey: 'HSCode',
      header: 'HS Code',
      cell: ({ getValue }) => <span className="font-mono bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-xs font-bold">{getValue()}</span>
    },
    {
      accessorKey: 'Product',
      header: 'Product Description',
      cell: ({ getValue }) => <span className="truncate max-w-[150px] block font-semibold text-slate-200">{getValue()}</span>
    },
    {
      accessorKey: 'Brand',
      header: 'Brand',
      cell: ({ getValue }) => <span className="text-emerald-400 font-bold tracking-wide">{getValue()}</span>
    },
    {
      accessorKey: 'Exporter',
      header: 'Exporter',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-200 truncate max-w-[120px] block">{getValue()}</span>
    },
    {
      accessorKey: 'Importer',
      header: 'Importer',
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
      header: 'Risk',
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
  ], [augmentedData]);

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
    initialState: { pagination: { pageSize: 15 } }
  });

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
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto print:p-0 print:bg-white print:text-black">
      
      {/* Executive Investigation Dashboard */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl print:border-none print:shadow-none print:bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 print:text-black">
              Forensic Shipment Workspace
              <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded tracking-widest font-mono border border-emerald-800">ACTIVE INVESTIGATION</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm font-semibold text-white transition">
              <FileSpreadsheet size={16} /> Export Dossier
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold text-white cursor-pointer transition">
              <Download size={16} /> Load Data
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {intelligenceObject && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-2"><Package size={14}/> Total Shipments</p>
                <p className="text-2xl font-mono text-white print:text-black">{intelligenceObject.metrics.totalShipments.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-2"><Activity size={14}/> Trade Value (USD)</p>
                <p className="text-2xl font-mono text-emerald-400">${(intelligenceObject.metrics.totalValue / 1000000).toFixed(2)}M</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-2"><Globe size={14}/> Entities</p>
                <p className="text-2xl font-mono text-blue-400">{intelligenceObject.metrics.distinctExporters} <span className="text-sm text-slate-500 font-sans">Exp</span> / {intelligenceObject.metrics.distinctImporters} <span className="text-sm text-slate-500 font-sans">Imp</span></p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 print:border-gray-300 print:bg-gray-50">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-2"><Tag size={14}/> Unique Brands</p>
                <p className="text-2xl font-mono text-purple-400">{intelligenceObject.metrics.distinctBrands}</p>
              </div>
              <div className="bg-rose-950/30 p-4 rounded-lg border border-rose-900/50 print:border-gray-300 print:bg-gray-50">
                <p className="text-rose-400 text-xs font-bold uppercase mb-1 flex items-center gap-2"><AlertTriangle size={14}/> Risk Anomalies</p>
                <p className="text-2xl font-mono text-rose-400">{intelligenceObject.evidence.length}</p>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-slate-800/50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
              <p className="text-sm text-slate-300 leading-relaxed print:text-black">
                <span className="font-bold text-white print:text-black">AI Intelligence Summary: </span> 
                {intelligenceObject.executiveSummary}
              </p>
            </div>
            
            {/* Investigation Filters */}
            <div className="flex flex-wrap gap-2 print:hidden">
              <span className="text-xs text-slate-400 font-bold uppercase py-2 mr-2">Quick Lenses:</span>
              <button onClick={() => applyQuickFilter('riskScore', 'Critical')} className="px-3 py-1 bg-rose-900/40 text-rose-300 border border-rose-800 rounded-full text-xs font-bold hover:bg-rose-900/60 transition">Critical Risk Only</button>
              <button onClick={() => applyQuickFilter('riskScore', 'High')} className="px-3 py-1 bg-orange-900/40 text-orange-300 border border-orange-800 rounded-full text-xs font-bold hover:bg-orange-900/60 transition">High & Critical</button>
              <button onClick={() => applyQuickFilter('clear', '')} className="px-3 py-1 bg-slate-700 text-slate-300 border border-slate-600 rounded-full text-xs font-bold hover:bg-slate-600 transition">Clear Filters</button>
            </div>
          </>
        )}
      </div>

      {/* Main Ledger Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl print:border-none print:shadow-none">
        
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center print:hidden">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search across all fields..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-slate-900 border-b border-slate-700 print:bg-gray-200">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-3 py-3 text-xs font-bold tracking-wider text-slate-300 font-mono select-none border-r border-slate-800 last:border-0 print:text-black print:border-gray-300">
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
            
            <tbody className="divide-y divide-slate-700/80 bg-slate-800 print:bg-white print:divide-gray-300">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-slate-700/40 transition-colors print:text-black">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-3 py-3 text-sm align-middle print:border-b print:border-gray-200">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Expanded Row: Investigation Drawer */}
                    {row.getIsExpanded() && (
                      <tr className="bg-slate-900 border-b-2 border-slate-600 print:hidden">
                        <td colSpan={columns.length} className="p-0">
                          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-inner">
                            
                            <div className="space-y-4">
                              <h4 className="text-slate-200 font-bold uppercase text-xs tracking-widest border-b border-slate-700 pb-2 flex items-center gap-2"><Navigation size={14}/> Entity Intelligence</h4>
                              <div className="text-sm">
                                <p className="text-slate-400">Exporter: <span className="text-white font-mono">{row.original.Exporter}</span></p>
                                <p className="text-slate-400 mt-2">Importer: <span className="text-white font-mono">{row.original.Importer}</span></p>
                                <p className="text-slate-400 mt-2">Route: <span className="text-white font-mono">{row.original.OriginCountry} ➔ {row.original.DestinationCountry}</span></p>
                              </div>
                              <button className="text-xs bg-blue-900/30 text-blue-400 border border-blue-800 px-3 py-1.5 rounded hover:bg-blue-900/50 transition w-full">Launch Entity Intelligence</button>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-slate-200 font-bold uppercase text-xs tracking-widest border-b border-slate-700 pb-2 flex items-center gap-2"><Activity size={14}/> Price Forensics</h4>
                              <div className="text-sm">
                                <p className="text-slate-400">Declared Unit Price: <span className="text-amber-400 font-mono font-bold">${row.original.UnitPrice}</span></p>
                                <p className="text-slate-400 mt-2">Total Value: <span className="text-emerald-400 font-mono font-bold">${row.original.Amount.toLocaleString()}</span></p>
                                <p className="text-slate-400 mt-2">Quantity: <span className="text-white font-mono">{row.original.Quantity} {row.original.QuantityUnit}</span></p>
                              </div>
                              <button className="text-xs bg-amber-900/30 text-amber-400 border border-amber-800 px-3 py-1.5 rounded hover:bg-amber-900/50 transition w-full">Launch Price Forensics</button>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-slate-200 font-bold uppercase text-xs tracking-widest border-b border-slate-700 pb-2 flex items-center gap-2"><AlertTriangle size={14}/> Investigation Flags</h4>
                              <div className="flex flex-wrap gap-2">
                                {row.original.flags && row.original.flags.length > 0 ? row.original.flags.map((flag, i) => (
                                  <span key={i} className="text-xs font-mono bg-rose-950 text-rose-300 px-2 py-1 border border-rose-800 rounded">
                                    {flag}
                                  </span>
                                )) : <span className="text-slate-500 text-sm italic">No forensic flags triggered.</span>}
                              </div>
                              <p className="text-xs text-slate-400 mt-2">
                                AI Assessment: {row.original.riskScore === 'Critical' ? 'Immediate review recommended. Cargo exhibits multiple indicators of structural disguise.' : 'Standard cargo processing.'}
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
                  <td colSpan={columns.length} className="text-center py-16 text-slate-400 text-sm font-mono bg-slate-900/20">
                    No active manifest file loaded. Import your trade matrix CSV to begin forensic rendering.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        {augmentedData.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-slate-900 border-t border-slate-700 text-xs font-mono text-slate-300 print:hidden">
            <div>
              Showing rows {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} – {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, augmentedData.length)} of {augmentedData.length}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-white font-bold transition"
              >
                Previous
              </button>
              <button 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-white font-bold transition"
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

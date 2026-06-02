import React, { useState, useMemo } from 'react';
import { useTradeData } from '../../context/TradeDataContext';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel,
  flexRender 
} from '@tanstack/react-table';
import { Search, ArrowUpDown, ShieldAlert, Download } from 'lucide-react';

export default function ShipmentLedger() {
  const { tradeData, uploadFile } = useTradeData();
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);

  // Dynamically extract unique values for dropdown filtering based on column ID
  const getUniqueColumnValues = (columnId) => {
    const values = new Set();
    tradeData.forEach(row => {
      if (row[columnId] !== undefined && row[columnId] !== null && row[columnId] !== '') {
        values.add(row[columnId]);
      }
    });
    return Array.from(values).sort();
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'Date',
      header: 'Date',
      cell: ({ getValue }) => <span className="whitespace-nowrap inline-block min-w-[100px] text-slate-100 font-medium">{getValue()}</span>
    },
    {
      accessorKey: 'HSCode',
      header: 'HS Code',
      cell: ({ getValue, row }) => (
        <span className={`font-mono px-2 py-0.5 rounded text-xs font-bold ${
          row.original.hsRisk === 'high' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'bg-slate-700 text-slate-200'
        }`}>
          {getValue()}
        </span>
      )
    },
    {
      accessorKey: 'Product',
      header: 'Product Description',
      cell: ({ getValue }) => <span className="truncate max-w-xs block font-semibold text-slate-200">{getValue()}</span>
    },
    {
      accessorKey: 'Brand',
      header: 'Brand Ecosystem',
      cell: ({ getValue }) => <span className="text-emerald-400 font-bold tracking-wide">{getValue()}</span>
    },
    {
      accessorKey: 'Exporter',
      header: 'Exporter (Source)',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-200 truncate max-w-[140px] block">{getValue()}</span>
    },
    {
      accessorKey: 'Importer',
      header: 'Importer (Target)',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-200 truncate max-w-[140px] block">{getValue()}</span>
    },
    {
      accessorKey: 'Quantity',
      header: 'Qty',
      cell: ({ getValue }) => <span className="font-mono text-slate-100 font-semibold">{Number(getValue() || 0).toLocaleString()}</span>
    },
    {
      accessorKey: 'QuantityUnit',
      header: 'Unit',
      cell: ({ getValue }) => <span className="text-slate-300 font-mono text-xs uppercase">{getValue()}</span>
    },
    {
      accessorKey: 'Weight',
      header: 'Weight (Kg)',
      cell: ({ getValue }) => <span className="font-mono text-slate-200">{Number(getValue() || 0).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
    },
    {
      accessorKey: 'Amount',
      header: 'Value (USD)',
      cell: ({ getValue }) => {
        const val = getValue();
        return <span className="font-mono font-bold text-slate-100">${Number(val).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>;
      }
    },
    {
      accessorKey: 'UnitPrice',
      header: 'Unit Price',
      cell: ({ getValue }) => {
        const val = getValue();
        return <span className="font-mono font-bold text-amber-400">${Number(val).toFixed(2)}</span>;
      }
    },
    {
      accessorKey: 'OriginCountry',
      header: 'Origin',
      cell: ({ getValue }) => <span className="text-slate-200 text-xs font-medium">{getValue()}</span>
    },
    {
      accessorKey: 'DestinationCountry',
      header: 'Destination',
      cell: ({ getValue }) => <span className="text-slate-200 text-xs font-medium">{getValue()}</span>
    },
    {
      accessorKey: 'TransportationMode',
      header: 'Transit Mode',
      cell: ({ getValue }) => (
        <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 uppercase">
          {getValue()}
        </span>
      )
    },
    {
      id: 'forensicAlert',
      header: 'Risk State',
      cell: ({ row }) => row.original.hsRisk === 'high' ? (
        <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold tracking-wider bg-rose-950/40 border border-rose-800/60 px-2 py-0.5 rounded animate-pulse">
          <ShieldAlert size={13} /> HS DISGUISE
        </div>
      ) : (
        <span className="text-slate-400 text-xs font-mono">PASSED</span>
      )
    }
  ], [tradeData]);

  const table = useReactTable({
    data: tradeData,
    columns,
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } }
  });

  const filteredTotalValue = useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((sum, row) => {
      const amt = parseFloat(row.original.Amount);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
  }, [table.getFilteredRowModel().rows]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0]);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Upper Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            BrandOrb <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-200 uppercase tracking-widest font-mono border border-slate-600">Master Ledger Workspace</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1">Ingest customs-linked manifests to isolate supply-chain anomalies.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm font-semibold text-white cursor-pointer transition shadow-sm">
            <Download size={16} />
            <span>Load Customs CSV</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>

          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-3 text-slate-300" size={16} />
            <input
              type="text"
              placeholder="Global ledger search..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-slate-400 font-mono placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-slate-900 border-b border-slate-700">
                  {headerGroup.headers.map(header => {
                    const uniqueValues = header.column.getCanFilter() 
                      ? getUniqueColumnValues(header.column.id) 
                      : [];

                    return (
                      <th key={header.id} className="px-3 py-3 text-xs font-bold tracking-wider text-slate-200 font-mono select-none border-r border-slate-800 last:border-0 min-w-[90px]">
                        {/* Column Header Sorting Trigger */}
                        <div 
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors mb-2"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && <ArrowUpDown size={12} className="text-slate-400 shrink-0" />}
                        </div>

                        {/* Dropdown Select Filters */}
                        {header.column.getCanFilter() && uniqueValues.length > 0 ? (
                          <select
                            value={(header.column.getFilterValue() ?? '')}
                            onChange={e => header.column.setFilterValue(e.target.value || undefined)}
                            className="w-full bg-slate-950 text-[11px] font-mono px-1 py-1 rounded border border-slate-700 focus:outline-none focus:border-slate-500 text-slate-200 cursor-pointer font-normal"
                          >
                            <option value="">All</option>
                            {uniqueValues.map(val => (
                              <option key={val} value={val}>{val}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="h-6"></div> /* Layout placeholder for non-filterable items */
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            
            <tbody className="divide-y divide-slate-700/80 bg-slate-800">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-700/40 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-3 py-3 text-sm align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-slate-400 text-sm font-mono bg-slate-900/20">
                    No active manifest file loaded. Import your trade matrix CSV to begin forensic rendering.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Summary Totals Footer Row */}
            {tradeData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900/90 font-mono border-t-2 border-slate-600 font-bold text-sm text-slate-100">
                  <td className="px-3 py-4 text-emerald-400 tracking-wide">SUMMARY</td>
                  <td colSpan={8} className="px-3 py-4 text-slate-400 text-right text-xs uppercase font-medium">
                    Filtered Set Aggregate Value:
                  </td>
                  <td className="px-3 py-4 text-emerald-400 font-black border-x border-slate-800">
                    ${filteredTotalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td colSpan={5} className="bg-slate-900/40"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination Panel */}
        {tradeData.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-slate-900 border-t border-slate-700 text-xs font-mono text-slate-300">
            <div>
              Showing rows {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} – {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, tradeData.length)} of {tradeData.length}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-white font-bold transition disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-white font-bold transition disabled:cursor-not-allowed"
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

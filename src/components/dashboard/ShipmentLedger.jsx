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

  // Define columns tailored to structural forensic analysis
  const columns = useMemo(() => [
    {
      accessorKey: 'Date',
      header: 'Date',
    },
    {
      accessorKey: 'HS Code',
      header: 'HS Code',
      cell: ({ row }) => (
        <span className={`font-mono px-2 py-1 rounded text-xs ${
          row.original.hsRisk === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-700 text-slate-300'
        }`}>
          {row.getValue('HS Code')}
        </span>
      )
    },
    {
      accessorKey: 'PRODUCT',
      header: 'Product Description',
      cell: ({ value }) => <span className="truncate max-w-xs block font-medium">{value}</span>
    },
    {
      accessorKey: 'Brand',
      header: 'Brand Ecosystem',
      cell: ({ value }) => <span className="text-emerald-400 font-semibold">{value}</span>
    },
    {
      accessorKey: 'Exporter',
      header: 'Exporter (Source Entity)',
      cell: ({ value }) => <span className="font-mono text-xs text-slate-300 truncate max-w-[120px] block">{value}</span>
    },
    {
      accessorKey: 'Importer',
      header: 'Importer (Target Entity)',
      cell: ({ value }) => <span className="font-mono text-xs text-slate-300 truncate max-w-[120px] block">{value}</span>
    },
    {
      accessorKey: 'Amount($)',
      header: 'Value (USD)',
      cell: ({ value }) => <span className="font-mono font-bold text-slate-200">${Number(value).toLocaleString()}</span>
    },
    {
      accessorKey: 'Unit Price($)',
      header: 'Unit Price',
      cell: ({ value }) => <span className="font-mono text-amber-400">${Number(value).toFixed(2)}</span>
    },
    {
      accessorKey: 'Origin Country',
      header: 'Origin',
    },
    {
      accessorKey: 'Destination Country',
      header: 'Destination',
    },
    {
      id: 'forensicAlert',
      header: 'Risk State',
      cell: ({ row }) => row.original.hsRisk === 'high' ? (
        <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold animate-pulse">
          <ShieldAlert size={14} /> HS DISGUISE
        </div>
      ) : (
        <span className="text-slate-500 text-xs">Standard</span>
      )
    }
  ], []);

  const table = useReactTable({
    data: tradeData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0]);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Upper Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            BrandOrb <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest font-mono">Master Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Ingest customs-linked manifests to isolate supply-chain anomalies.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* File Upload Drop-zone alternative */}
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm font-medium cursor-pointer transition">
            <Download size={16} />
            <span>Load Customs CSV</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>

          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search entities, codes, routing corridors..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
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
                <tr key={headerGroup.id} className="bg-slate-900/50 border-b border-slate-700">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-3.5 text-xs font-semibold tracking-wider text-slate-400 font-mono select-none cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={12} className="opacity-60" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-700/60 bg-slate-800">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-700/30 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-slate-300 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-slate-500 text-sm font-mono">
                    No active manifest file loaded. Import a standard trade matrix to begin forensic rendering.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Controls */}
        {tradeData.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-slate-900/40 border-t border-slate-700 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span>Showing rows {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} – {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, tradeData.length)} of {tradeData.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded disabled:cursor-not-allowed text-slate-200 transition"
              >
                Previous
              </button>
              <button 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded disabled:cursor-not-allowed text-slate-200 transition"
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

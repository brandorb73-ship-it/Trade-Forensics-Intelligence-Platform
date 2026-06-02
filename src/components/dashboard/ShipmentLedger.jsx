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

  const columns = useMemo(() => [
    {
      accessorKey: 'Date',
      header: 'Date',
      cell: ({ value }) => <span className="whitespace-nowrap inline-block min-w-[100px] text-slate-100 font-medium">{value}</span>
    },
    {
      accessorKey: 'HSCode',
      header: 'HS Code',
      cell: ({ row }) => (
        <span className={`font-mono px-2 py-0.5 rounded text-xs font-bold ${
          row.original.hsRisk === 'high' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'bg-slate-700 text-slate-200'
        }`}>
          {row.getValue('HSCode')}
        </span>
      )
    },
    {
      accessorKey: 'Product',
      header: 'Product Description',
      cell: ({ value }) => <span className="truncate max-w-xs block font-semibold text-slate-200">{value}</span>
    },
    {
      accessorKey: 'Brand',
      header: 'Brand Ecosystem',
      cell: ({ value }) => <span className="text-emerald-400 font-bold tracking-wide">{value}</span>
    },
    {
      accessorKey: 'Exporter',
      header: 'Exporter (Source)',
      cell: ({ value }) => <span className="font-mono text-xs text-slate-200 truncate max-w-[140px] block">{value}</span>
    },
    {
      accessorKey: 'Importer',
      header: 'Importer (Target)',
      cell: ({ value }) => <span className="font-mono text-xs text-slate-200 truncate max-w-[140px] block">{value}</span>
    },
    {
      accessorKey: 'Amount',
      header: 'Value (USD)',
      cell: ({ value }) => <span className="font-mono font-bold text-slate-100">${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
    },
    {
      accessorKey: 'UnitPrice',
      header: 'Unit Price',
      cell: ({ value }) => <span className="font-mono font-bold text-amber-400">${Number(value).toFixed(2)}</span>
    },
    {
      accessorKey: 'OriginCountry',
      header: 'Origin',
      cell: ({ value }) => <span className="text-slate-200 text-xs font-medium">{value}</span>
    },
    {
      accessorKey: 'DestinationCountry',
      header: 'Destination',
      cell: ({ value }) => <span className="text-slate-200 text-xs font-medium">{value}</span>
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
    initialState: { pagination: { pageSize: 15 } }
  });

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0]);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
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
              placeholder="Search entities, codes, corridors..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-slate-400 font-mono placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-slate-900 border-b border-slate-700">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-4 text-xs font-bold tracking-wider text-slate-200 font-mono select-none cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={12} className="text-slate-400" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-700/80 bg-slate-800">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-700/40 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3.5 text-sm align-middle">
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
          </table>
        </div>

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

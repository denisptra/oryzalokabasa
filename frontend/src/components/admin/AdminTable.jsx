"use client";

import { Loader, Info } from "lucide-react";

export default function AdminTable({ 
    columns, 
    data, 
    loading, 
    onSelectAll, 
    onSelectOne, 
    selectedIds = [],
    emptyMessage = "No data found",
    emptyIcon: EmptyIcon = Info,
    renderRow
}) {
    const isAllSelected = data.length > 0 && selectedIds.length === data.length;

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center py-20">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-center py-20">
                <EmptyIcon size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            {onSelectAll && (
                                <th className="px-4 py-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={onSelectAll}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                </th>
                            )}
                            {columns.map((col, idx) => (
                                <th 
                                    key={idx} 
                                    className={`px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${col.className || ""}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((item, idx) => renderRow(item, idx, selectedIds.includes(item.id)))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

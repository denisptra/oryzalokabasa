"use client";

import { Search, Filter } from "lucide-react";

export default function AdminFilters({ 
    search, 
    onSearchChange, 
    placeholder = "Pencarian...",
    dropdowns = []
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
                {dropdowns.map((dropdown, idx) => (
                    <div key={idx} className="flex items-center gap-2 min-w-[150px]">
                        {dropdown.icon && <dropdown.icon size={18} className="text-slate-400 hidden sm:block" />}
                        <select
                            value={dropdown.value}
                            onChange={(e) => dropdown.onChange(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-white"
                        >
                            <option value="ALL">{dropdown.allLabel || `Semua ${dropdown.label}`}</option>
                            {dropdown.options.map((opt) => (
                                <option key={opt.id || opt.value} value={opt.id || opt.value}>
                                    {opt.name || opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
}

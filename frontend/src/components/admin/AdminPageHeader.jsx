"use client";

import { Plus } from "lucide-react";

export default function AdminPageHeader({ 
    title, 
    subtitle, 
    icon: Icon, 
    iconColor = "text-blue-600",
    actions = [],
    stats = []
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    {Icon && <Icon size={28} className={iconColor} />}
                    {title}
                </h1>
                {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                {stats.map((stat, idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-100 shadow-xs">
                        <span>{stat.label}:</span>
                        <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-blue-600">{stat.value}</span>
                    </div>
                ))}
                
                {actions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={action.onClick}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm ${
                            action.variant === "danger" 
                            ? "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20" 
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
                        }`}
                    >
                        {action.icon && <action.icon size={18} />}
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

import Link from "next/link";
import { FileText, ChevronRight, Settings, UploadCloud } from "lucide-react";

const menuItems = [
    {
        title: "Invoice Settings",
        description: "Configure invoice templates, business info, address, and VAT/NIT details.",
        icon: <FileText size={18} strokeWidth={2.5} />,
        href: "/settings/invoice",
        badge: "Config"
    },
    {
        title: "Data Import",
        description: "Bulk import inventory and products from a CSV file with column mapping.",
        icon: <UploadCloud size={18} strokeWidth={2.5} />,
        href: "/settings/import",
        badge: "CSV"
    },
];

export default function SettingsMenuPage() {
    return (
        <div className="md:px-3 md:py-3 flex flex-col h-full gap-4 overflow-hidden md:bg-white rounded-[var(--sidebar-radius)] md:shadow-glass">

            {/* ── Header ── */}
            <header className="px-5 py-5 border-b border-primary/5 glass shrink-0 shadow-glass z-20 rounded-[var(--sidebar-radius)]">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-lg)] shadow-inner">
                        <Settings size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">
                            System Settings
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mt-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                            Configurations &amp; Preferences
                        </p>
                    </div>
                </div>
            </header>

            {/* ── Menu Grid ── */}
            <main className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6">
                <div className="grid gap-4 md:grid-cols-2 max-w-3xl pt-2">
                    {menuItems.map((item) => (
                        <Link key={item.href} href={item.href} className="group block">
                            <div className="bg-white rounded-[var(--ui-radius-xl)] p-5 border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex items-start justify-between cursor-pointer h-full gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    {/* Icon */}
                                    <div className="p-3 bg-primary/5 rounded-[var(--ui-radius-lg)] text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm shrink-0 mt-0.5">
                                        {item.icon}
                                    </div>
                                    {/* Text */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-[13px] font-black text-slate-800 uppercase italic tracking-tight leading-none">
                                                {item.title}
                                            </h3>
                                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black rounded uppercase tracking-widest">
                                                {item.badge}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                {/* Arrow */}
                                <div className="p-2 bg-slate-100 rounded-[var(--ui-radius-md)] text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-0.5">
                                    <ChevronRight size={15} strokeWidth={2.5} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}

import Link from "next/link";
import { FileText, ChevronRight, Settings, Users, Store, UploadCloud } from "lucide-react";

export default function SettingsMenuPage() {
  const menuItems = [
    {
      title: "Invoice Settings",
      description: "Configure your invoice templates, business information, address, and VAT/NIT details.",
      icon: <FileText className="w-6 h-6 text-primary" />,
      href: "/settings/invoice"
    },
    {
      title: "Data Import",
      description: "Bulk import your inventory and products from a CSV file.",
      icon: <UploadCloud className="w-6 h-6 text-primary" />,
      href: "/settings/import"
    },
    // Leaving room for more settings items later if the user requests them
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-8 custom-scrollbar bg-[#F8F9FA]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                     <Settings size={24} strokeWidth={1.5} />
                 </div>
                 <h1 className="text-4xl font-black tracking-tight text-primary">Settings</h1>
             </div>
             <p className="text-muted-foreground font-semibold flex items-center gap-2">
                 <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                 System Configurations & Preferences
             </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className="group bg-white rounded-[2.5rem] p-6 shadow-sm border border-transparent hover:border-primary/10 hover:shadow-xl transition-all duration-300 flex items-start justify-between cursor-pointer h-full">
                <div className="flex gap-4 items-start">
                  <div className="p-4 bg-secondary/50 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm text-primary">
                    {item.icon}
                  </div>
                  <div className="mt-1">
                    <h3 className="text-xl font-black text-primary uppercase tracking-tight group-hover:text-accent transition-colors">{item.title}</h3>
                    <p className="text-xs font-bold text-muted-foreground/60 mt-1 leading-relaxed max-w-[200px]">{item.description}</p>
                  </div>
                </div>
                <div className="p-3 bg-secondary/30 rounded-xl text-primary/40 group-hover:bg-primary group-hover:text-white group-hover:translate-x-2 transition-all mt-1">
                  <ChevronRight className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

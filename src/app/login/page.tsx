"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { KeyRound, User, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        const success = await login(username, password);
        if (!success) {
            setError(true);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-medium">
            <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                {/* Logo / Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/5 hover:scale-110 transition-transform duration-500">
                        <ShieldCheck size={32} className="text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black text-black tracking-tighter uppercase mb-1">
                        Fox<span className="text-primary">POS</span>
                    </h1>
                    <p className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.4em]">Workshop Management System</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-border shadow-2xl shadow-black/5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Identity</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    className="w-full bg-white border border-border rounded-xl py-4 pl-14 pr-6 text-black text-sm font-bold placeholder:text-muted-foreground/40 outline-none focus:border-black transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Secret Key</label>
                            <div className="relative group">
                                <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white border border-border rounded-xl py-4 pl-14 pr-6 text-black text-sm font-bold placeholder:text-muted-foreground/40 outline-none focus:border-black transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-xl flex items-center gap-3 text-destructive animate-in shake duration-300">
                                <AlertCircle size={18} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Authentication Failed</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black hover:bg-zinc-800 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-black/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : "Access System"}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-12">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-30">Fox Garage Core Tools v1.0</p>
                </div>
            </div>
        </div>
    );
}

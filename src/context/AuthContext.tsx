"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, pass: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check for "session" in localStorage
        const savedUser = localStorage.getItem("foxpos_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        // Path protection
        if (!loading) {
            if (!user && pathname !== "/login") {
                router.push("/login");
            } else if (user && pathname === "/login") {
                router.push("/");
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (username: string, pass: string) => {
        // DEV MODE: Allow 'fox' and '1234'
        if (username === "fox" && pass === "1234") {
            try {
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", "fox@foxpos.com")
                    .single();

                if (error) throw error;

                const sessionUser = {
                    id: data.id,
                    email: data.email,
                    full_name: data.full_name,
                    role: data.role
                };

                setUser(sessionUser);
                localStorage.setItem("foxpos_user", JSON.stringify(sessionUser));
                return true;
            } catch (err) {
                console.error("Auth Error:", err);
                return false;
            }
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("foxpos_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

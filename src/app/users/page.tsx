"use client";

import { useState, useEffect } from "react";
import { UserPlus, Shield, Mail, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import { userService } from "@/services/userService";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        const { data } = await userService.fetchUsers();
        if (data) setUsers(data);
        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">Manage system users, roles, and permissions.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <UserPlus size={20} />
                    Add New User
                </button>
            </div>

            <div className="grid gap-6">
                <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i} className="h-16 bg-secondary/10 animate-pulse"></tr>)
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                                    {user.full_name?.charAt(0) || user.email.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">{user.full_name || "N/A"}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail size={12} /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-secondary border w-fit">
                                                <Shield size={14} className="text-primary" />
                                                <span className="text-xs font-bold capitalize">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_active ? (
                                                <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                                                    <CheckCircle size={14} /> Active
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-destructive text-xs font-semibold">
                                                    <XCircle size={14} /> Inactive
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                                                <MoreHorizontal size={18} className="text-muted-foreground" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

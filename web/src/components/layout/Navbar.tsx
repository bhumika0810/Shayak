"use client";
import Link from "next/link"
import { School, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { syncManager } from "@/lib/sync"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
    const [status, setStatus] = useState<"online" | "offline" | "syncing">("online");
    const { user, logout } = useAuth();

    useEffect(() => {
        setStatus(syncManager.getStatus());
        const unsubscribe = syncManager.subscribe(setStatus);
        return () => unsubscribe();
    }, []);

    return (
        <header className="sticky top-4 z-50 w-full px-4 mb-4">
            <div className="mx-auto max-w-7xl rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-lg supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto flex h-16 items-center px-4 justify-between">
                    <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-md">
                            <School className="h-6 w-6 text-white" />
                        </div>
                        <span className="hidden font-bold sm:inline-block text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
                            Sahayak
                        </span>
                    </Link>

                    <nav className="flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-sm font-medium text-slate-600 hidden md:inline-block">
                                    Welcome, {user.name}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={logout}
                                    className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <div className="h-6 w-px bg-slate-200 mx-1"></div>

                        <Button variant="ghost" size="sm" className="gap-2 bg-white/50 border border-slate-200">
                            <div className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                status === 'online' && "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
                                status === 'offline' && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
                                status === 'syncing' && "bg-yellow-500 animate-pulse"
                            )} />
                            <span className="text-xs font-medium text-slate-600">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                        </Button>
                    </nav>
                </div>
            </div>
        </header>
    )
}
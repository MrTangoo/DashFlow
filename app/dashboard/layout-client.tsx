"use client";

import Image from "next/image";
import { LayoutDashboard, Settings, User, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { TasksProvider } from "@/components/providers/tasks-provider";

export default function DashboardLayoutClient({
    children,
    tasks,
}: {
    children: React.ReactNode;
    tasks: any[];
}) {
    return (
        <TasksProvider initialTasks={tasks}>
            <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white overflow-hidden relative selection:bg-purple-500/30 transition-colors duration-300">
                {/* Background Gradients - Only visible in dark mode */}
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none dark:opacity-100 opacity-0 transition-opacity duration-300">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                    <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
                </div>

                {/* Sidebar / Navigation */}
                <nav className="fixed left-0 top-0 h-full w-20 bg-white dark:bg-white/5 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 flex flex-col items-center py-8 gap-8 z-50 hidden lg:flex transition-colors duration-300">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-gray-200 dark:border-white/10">
                        <Image src="/logo.png" alt="Logo" width={20} height={20} />
                    </div>
                    <div className="flex-1 flex flex-col gap-6 w-full items-center mt-8">
                        <Link href="/dashboard">
                            <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all">
                                <LayoutDashboard className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link href="/dashboard/profile">
                            <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all">
                                <User className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link href="/dashboard/settings">
                            <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all">
                                <Settings className="w-5 h-5" />
                            </button>
                        </Link>
                    </div>

                    {/* Logout Button at Bottom */}
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-600 dark:text-white/70 hover:text-red-600 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all"
                        title="Se déconnecter"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </nav>

                <main className="lg:pl-28 p-8 max-w-[1600px] mx-auto">
                    {children}
                </main>
            </div>
        </TasksProvider>
    );
}

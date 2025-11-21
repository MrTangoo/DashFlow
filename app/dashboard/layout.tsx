import Image from "next/image";
import { LayoutDashboard, Settings, User } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden relative selection:bg-purple-500/30">
            {/* Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar / Navigation */}
            <nav className="fixed left-0 top-0 h-full w-20 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-8 gap-8 z-50 hidden lg:flex">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
                    <Image src="/logo.png" alt="Logo" width={20} height={20} />
                </div>
                <div className="flex-1 flex flex-col gap-6 w-full items-center mt-8">
                    <Link href="/dashboard">
                        <button className="p-3 rounded-xl hover:bg-white/10 text-white/70 hover:text-white border border-transparent hover:border-white/10 transition-all">
                            <LayoutDashboard className="w-5 h-5" />
                        </button>
                    </Link>
                    <Link href="/dashboard/profile">
                        <button className="p-3 rounded-xl hover:bg-white/10 text-white/70 hover:text-white border border-transparent hover:border-white/10 transition-all">
                            <User className="w-5 h-5" />
                        </button>
                    </Link>
                    <button className="p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <main className="lg:pl-28 p-8 max-w-[1600px] mx-auto">
                {children}
            </main>
        </div>
    );
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import TasksWidget from "@/components/dashboard/tasks-widget"
import NotesWidget from "@/components/dashboard/notes-widget"
import StatsWidget from "@/components/dashboard/stats-widget"
import { CloudSun, LayoutDashboard, Settings, User } from "lucide-react"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const currentDate = new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    })

    return (
        <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden relative selection:bg-purple-500/30">
            {/* Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar / Navigation (Simplified for now) */}
            <nav className="fixed left-0 top-0 h-full w-20 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-8 gap-8 z-50 hidden lg:flex">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 flex flex-col gap-6 w-full items-center mt-8">
                    <button className="p-3 rounded-xl bg-white/10 text-white border border-white/10 shadow-inner">
                        <LayoutDashboard className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                        <User className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <main className="lg:pl-28 p-8 max-w-[1600px] mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <p className="text-blue-400 font-medium mb-2 uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            {currentDate}
                        </p>
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{session.user?.name || "Utilisateur"}</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">Prêt à organiser votre journée ?</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-default">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <CloudSun className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Météo</p>
                                <p className="font-semibold">24°C Ensoleillé</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min">
                    {/* Tasks Widget - Spans 1 column */}
                    <div className="h-full">
                        <TasksWidget />
                    </div>

                    {/* Notes Widget - Spans 1 column */}
                    <div className="h-full">
                        <NotesWidget />
                    </div>

                    {/* Stats Widget */}
                    <div className="md:col-span-1 h-[400px]">
                        <StatsWidget />
                    </div>
                </div>
            </main>
        </div>
    )
}

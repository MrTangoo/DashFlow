import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import TasksWidget from "@/components/dashboard/tasks-widget"
import NotesWidget from "@/components/dashboard/notes-widget"
import StatsWidget from "@/components/dashboard/stats-widget"
import WeatherWidget from "@/components/dashboard/weather-widget"
import DetailedWeatherWidget from "@/components/dashboard/detailed-weather-widget"

import prisma from "@/lib/prisma"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const tasks = await prisma.task.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    })

    const currentDate = new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    })

    return (
        <>
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
                    <StatsWidget tasks={tasks} />
                </div>

                {/* Detailed Weather Widget */}
                <div className="md:col-span-1 h-[450px]">
                    <DetailedWeatherWidget />
                </div>
            </div>
        </>
    )
}


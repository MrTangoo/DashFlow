"use client"

import { BarChart3, TrendingUp, CheckCircle2, History } from "lucide-react"
import { motion } from "framer-motion"
import { useLocale } from "@/components/locale-provider"
import { useTasks } from "@/components/providers/tasks-provider"
import Link from "next/link"

export default function StatsWidget() {
    const { t, locale } = useLocale()
    const { tasks } = useTasks()

    // Calculate stats for TODAY only
    const today = new Date().toISOString().split('T')[0]
    const todaysTasks = tasks.filter(task => task.date === today)

    const totalTasks = todaysTasks.length
    const completedCount = todaysTasks.filter(t => t.completed).length
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

    // Calculate chart data based on tasks created in the last 7 days
    const days = locale === "fr"
        ? ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
        : locale === "de"
            ? ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
            : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d
    })

    const chartData = last7Days.map((date) => {
        const dayName = days[date.getDay()]
        const dateString = date.toISOString().split('T')[0]

        // Count tasks created on this day
        const tasksOnDay = tasks.filter(task => task.date === dateString).length

        // Scale value for visual representation (cap at 100 for bar height)
        // If we have tasks, we show relative height. If max tasks in period is small, we scale up.
        // For simplicity, let's just use count * 20 capped at 100.
        const value = Math.min(tasksOnDay * 20, 100)

        return { day: dayName, value: value, count: tasksOnDay }
    })

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden group">
            {/* Decorative background blur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] -z-10 transition-all duration-500 group-hover:bg-emerald-500/20" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{t("widgets.stats.title")}</h2>
                        <p className="text-xs text-slate-400 font-medium">{t("widgets.stats.subtitle")}</p>
                    </div>
                </div>
                <Link href="/dashboard/history">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all" title="History">
                        <History className="w-5 h-5" />
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">{t("widgets.stats.completed")}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{completedCount}</div>
                    <div className="text-xs text-white/40 mt-1">{t("widgets.stats.outOf")} {totalTasks} {t("widgets.stats.tasks")}</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">{t("widgets.stats.rate")}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{completionRate}%</div>
                    <div className="text-xs text-white/40 mt-1">{t("widgets.stats.successRate")}</div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-end">
                <div className="flex justify-between gap-2 h-32 w-full px-2">
                    {chartData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1 group/bar">
                            <div className="w-full relative flex-1 flex items-end">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${item.value}%` }}
                                    transition={{ duration: 1, delay: index * 0.1, type: "spring", stiffness: 100 }}
                                    className="w-full bg-white/10 rounded-t-lg group-hover/bar:bg-emerald-500/50 transition-colors relative"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {item.count} tasks
                                    </div>
                                </motion.div>
                            </div>
                            <span className="text-[10px] text-white/30 font-medium">{item.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

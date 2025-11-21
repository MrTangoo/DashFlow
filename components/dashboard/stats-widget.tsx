"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Calendar, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Task {
    id: string
    completed: boolean
}

export default function StatsWidget() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/tasks")
            if (res.ok) {
                const data = await res.json()
                setTasks(data)
            }
        } catch (error) {
            console.error("Failed to fetch stats", error)
        } finally {
            setLoading(false)
        }
    }

    const completedCount = tasks.filter((t) => t.completed).length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

    // Mock data for the chart (last 7 days)
    const chartData = [
        { day: "Lun", value: 40 },
        { day: "Mar", value: 70 },
        { day: "Mer", value: 50 },
        { day: "Jeu", value: 90 },
        { day: "Ven", value: 60 },
        { day: "Sam", value: 30 },
        { day: "Dim", value: 80 },
    ]

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden group">
            {/* Decorative background blur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] -z-10 transition-all duration-500 group-hover:bg-emerald-500/20" />

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Aperçu</h2>
                    <p className="text-xs text-slate-400 font-medium">Vos performances</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Complétées</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{completedCount}</div>
                    <div className="text-xs text-white/40 mt-1">sur {totalTasks} tâches</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Taux</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{completionRate}%</div>
                    <div className="text-xs text-white/40 mt-1">de réussite</div>
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
                                        {item.value}%
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

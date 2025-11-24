"use client"

import { useState } from "react"
import { useTasks } from "@/components/providers/tasks-provider"
import { useLocale } from "@/components/locale-provider"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, ArrowUpDown, CheckCircle2, Circle, Calendar, Trash2, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
    const { t, locale } = useLocale()
    const { tasks, toggleTask, deleteTask } = useTasks()
    const [filter, setFilter] = useState<"all" | "completed" | "active">("all")
    const [sort, setSort] = useState<"date" | "status">("date")
    const [search, setSearch] = useState("")
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const filteredTasks = tasks
        .filter(task => {
            if (filter === "completed") return task.completed
            if (filter === "active") return !task.completed
            return true
        })
        .filter(task => task.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sort === "date") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            } else {
                return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1
            }
        })

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString(locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t("history.title")}</h1>
                    <p className="text-slate-400">{t("history.subtitle")}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={t("history.searchPlaceholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-full sm:w-64"
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2 min-w-[140px] justify-between"
                            >
                                <span>
                                    {filter === "all" ? t("history.filterAll") :
                                        filter === "completed" ? t("history.filterCompleted") :
                                            t("history.filterActive")}
                                </span>
                                <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", isFilterOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isFilterOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-2 w-full min-w-[140px] bg-[#0f172a] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden"
                                        >
                                            <div className="p-1">
                                                {[
                                                    { value: "all", label: t("history.filterAll") },
                                                    { value: "completed", label: t("history.filterCompleted") },
                                                    { value: "active", label: t("history.filterActive") }
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => {
                                                            setFilter(option.value as any)
                                                            setIsFilterOpen(false)
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                                                            filter === option.value
                                                                ? "bg-purple-500/20 text-purple-400"
                                                                : "text-white/70 hover:bg-white/5 hover:text-white"
                                                        )}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={() => setSort(sort === "date" ? "status" : "date")}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">{sort === "date" ? t("history.sortByDate") : t("history.sortByStatus")}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 grid gap-4">
                    <AnimatePresence initial={false}>
                        {filteredTasks.length === 0 ? (
                            <div className="text-center py-12 text-white/40">
                                <p>{t("history.noTasksFound")}</p>
                            </div>
                        ) : (
                            filteredTasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={cn(
                                        "group flex items-center justify-between p-4 rounded-xl border border-transparent transition-all duration-200",
                                        task.completed
                                            ? "bg-white/[0.02] hover:bg-white/[0.04]"
                                            : "bg-white/5 hover:bg-white/10 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <button
                                            onClick={() => toggleTask(task.id, task.completed)}
                                            className="relative group/btn flex-shrink-0"
                                        >
                                            {task.completed ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <Circle className="w-6 h-6 text-white/30 group-hover/btn:text-purple-400 transition-colors" />
                                            )}
                                        </button>
                                        <div className="min-w-0">
                                            <p className={cn(
                                                "font-medium truncate transition-all duration-300",
                                                task.completed ? "text-white/30 line-through" : "text-white/90"
                                            )}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(task.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="text-white/20 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

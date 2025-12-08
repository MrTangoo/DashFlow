"use client"

import { useState } from "react"
import { Plus, CheckCircle2, Circle, Trash2, ListTodo } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useLocale } from "@/components/locale-provider"
import { useTasks } from "@/components/providers/tasks-provider"

export default function TasksWidget() {
    const { t } = useLocale()
    const { tasks, loading, addTask: addTaskContext, toggleTask: toggleTaskContext, deleteTask: deleteTaskContext } = useTasks()
    const [newTask, setNewTask] = useState("")

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim()) return
        await addTaskContext(newTask)
        setNewTask("")
    }

    const toggleTask = async (id: string, completed: boolean) => {
        await toggleTaskContext(id, completed)
    }

    const deleteTask = async (id: string) => {
        await deleteTaskContext(id)
    }

    // Filter tasks: Show tasks created today OR incomplete tasks
    // Hide completed tasks from previous days
    const today = new Date().toISOString().split('T')[0]
    const filteredTasks = tasks.filter(task => {
        const isToday = task.date === today
        return isToday || !task.completed
    })

    const completedCount = filteredTasks.filter(t => t.completed).length
    const progress = filteredTasks.length > 0 ? (completedCount / filteredTasks.length) * 100 : 0

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden group">
            {/* Decorative background blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] -z-10 transition-all duration-500 group-hover:bg-purple-500/20" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400">
                        <ListTodo className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{t("widgets.tasks.title")}</h2>
                        <p className="text-xs text-slate-400 font-medium">{completedCount}/{filteredTasks.length} {t("widgets.tasks.completed")}</p>
                    </div>
                </div>
                {/* Circular Progress */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/10" />
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-purple-500 transition-all duration-1000 ease-out" strokeDasharray={100} strokeDashoffset={100 - progress} />
                    </svg>
                </div>
            </div>

            <form onSubmit={addTask} className="mb-6 relative group/input">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder={t("widgets.tasks.taskPlaceholder")}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 pl-11 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm placeholder:text-white/30"
                />
                <Plus className="w-5 h-5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within/input:text-purple-400" />
                <button
                    type="submit"
                    disabled={!newTask.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-500 hover:bg-purple-400 text-white p-1.5 rounded-lg transition-all disabled:opacity-0 disabled:scale-75 opacity-100 scale-100"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3 text-white/30">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin" />
                        <span className="text-sm">{t("common.loading")}</span>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                            <ListTodo className="w-6 h-6 text-white/20" />
                        </div>
                        <p className="text-white/40 text-sm">{t("widgets.tasks.noTasks")}</p>
                        <p className="text-white/20 text-xs mt-1">{t("widgets.tasks.addTaskHint")}</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false} mode="popLayout">
                        {filteredTasks.map((task) => (
                            <motion.div
                                key={task.clientId || task.id}
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -100, scale: 0.8 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className={cn(
                                    "group flex items-center justify-between p-3 rounded-xl border border-transparent transition-all duration-200",
                                    task.completed
                                        ? "bg-white/[0.02] hover:bg-white/[0.04]"
                                        : "bg-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-purple-500/5"
                                )}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <button
                                        onClick={() => toggleTask(task.id, task.completed)}
                                        className="relative group/btn"
                                    >
                                        {task.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-white/30 group-hover/btn:text-purple-400 transition-colors" />
                                        )}
                                    </button>
                                    <span
                                        className={cn(
                                            "truncate text-sm transition-all duration-300",
                                            task.completed ? "text-white/30 line-through" : "text-white/90 font-medium"
                                        )}
                                    >
                                        {task.title}
                                    </span>
                                </div>
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="text-white/20 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}

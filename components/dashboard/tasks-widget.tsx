"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Task {
    id: string
    title: string
    completed: boolean
}

export default function TasksWidget() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTask, setNewTask] = useState("")
    const [loading, setLoading] = useState(true)
    const router = useRouter()

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
            console.error("Failed to fetch tasks", error)
        } finally {
            setLoading(false)
        }
    }

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim()) return

        const tempId = Date.now().toString()
        const optimisticTask = { id: tempId, title: newTask, completed: false }
        setTasks([optimisticTask, ...tasks])
        setNewTask("")

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: optimisticTask.title }),
            })

            if (res.ok) {
                const createdTask = await res.json()
                setTasks((prev) => prev.map((t) => (t.id === tempId ? createdTask : t)))
                router.refresh()
            } else {
                // Revert on failure
                setTasks((prev) => prev.filter((t) => t.id !== tempId))
            }
        } catch (error) {
            console.error("Failed to add task", error)
            setTasks((prev) => prev.filter((t) => t.id !== tempId))
        }
    }

    const toggleTask = async (id: string, completed: boolean) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
        )

        try {
            await fetch(`/api/tasks/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: !completed }),
            })
            router.refresh()
        } catch (error) {
            console.error("Failed to update task", error)
            // Revert
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, completed } : t))
            )
        }
    }

    const deleteTask = async (id: string) => {
        const taskToDelete = tasks.find((t) => t.id === id)
        setTasks((prev) => prev.filter((t) => t.id !== id))

        try {
            await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
            })
            router.refresh()
        } catch (error) {
            console.error("Failed to delete task", error)
            if (taskToDelete) {
                setTasks((prev) => [...prev, taskToDelete])
            }
        }
    }

    return (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl text-white w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Tâches</h2>

            <form onSubmit={addTask} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Nouvelle tâche..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    Ajouter
                </button>
            </form>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="text-center py-4 text-white/50">Chargement...</div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-4 text-white/50">Aucune tâche pour le moment</div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className="group flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <button
                                    onClick={() => toggleTask(task.id, task.completed)}
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.completed
                                            ? "bg-green-500 border-green-500"
                                            : "border-white/30 hover:border-white/50"
                                        }`}
                                >
                                    {task.completed && (
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </button>
                                <span
                                    className={`truncate ${task.completed ? "text-white/30 line-through" : "text-white"
                                        }`}
                                >
                                    {task.title}
                                </span>
                            </div>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

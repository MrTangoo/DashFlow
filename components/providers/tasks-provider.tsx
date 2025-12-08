"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface Task {
    id: string
    title: string
    completed: boolean
    createdAt: Date
    date: string // YYYY-MM-DD
    clientId?: string
}

interface TasksContextType {
    tasks: Task[]
    loading: boolean
    addTask: (title: string) => Promise<void>
    toggleTask: (id: string, completed: boolean) => Promise<void>
    deleteTask: (id: string) => Promise<void>
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({
    children,
    initialTasks = []
}: {
    children: ReactNode
    initialTasks?: Task[]
}) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Sync initialTasks if they change (e.g. revalidation)
    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    const addTask = async (title: string) => {
        if (!title.trim()) return

        const tempId = Date.now().toString()
        const today = new Date().toISOString().split('T')[0]
        const optimisticTask = {
            id: tempId,
            title,
            completed: false,
            createdAt: new Date(),
            date: today,
            clientId: tempId
        }

        setTasks(prev => [optimisticTask, ...prev])

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            })

            if (res.ok) {
                const createdTask = await res.json()
                setTasks(prev => prev.map(t =>
                    t.id === tempId ? { ...createdTask, clientId: tempId } : t
                ))
            } else {
                setTasks(prev => prev.filter(t => t.id !== tempId))
            }
        } catch (error) {
            console.error("Failed to add task", error)
            setTasks(prev => prev.filter(t => t.id !== tempId))
        }
    }

    const toggleTask = async (id: string, completed: boolean) => {
        setTasks(prev =>
            prev.map(t => (t.id === id ? { ...t, completed: !completed } : t))
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
            setTasks(prev =>
                prev.map(t => (t.id === id ? { ...t, completed } : t))
            )
        }
    }

    const deleteTask = async (id: string) => {
        const taskToDelete = tasks.find(t => t.id === id)
        setTasks(prev => prev.filter(t => t.id !== id))

        try {
            await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
            })
            router.refresh()
        } catch (error) {
            console.error("Failed to delete task", error)
            if (taskToDelete) {
                setTasks(prev => [...prev, taskToDelete])
            }
        }
    }

    return (
        <TasksContext.Provider value={{ tasks, loading, addTask, toggleTask, deleteTask }}>
            {children}
        </TasksContext.Provider>
    )
}

export function useTasks() {
    const context = useContext(TasksContext)
    if (context === undefined) {
        throw new Error("useTasks must be used within a TasksProvider")
    }
    return context
}

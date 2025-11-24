"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, StickyNote, Trash2, PenLine, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useLocale } from "@/components/locale-provider"

interface Note {
    id: string
    content: string
    updatedAt: string
    clientId?: string
}

export default function NotesWidget() {
    const { t } = useLocale()
    const [notes, setNotes] = useState<Note[]>([])
    const [newNote, setNewNote] = useState("")
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState("")
    const router = useRouter()

    useEffect(() => {
        fetchNotes()
    }, [])

    const fetchNotes = async () => {
        try {
            const res = await fetch("/api/notes")
            if (res.ok) {
                const data = await res.json()
                setNotes(data)
            }
        } catch (error) {
            console.error("Failed to fetch notes", error)
        } finally {
            setLoading(false)
        }
    }

    const addNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newNote.trim()) return

        const tempId = Date.now().toString()
        const optimisticNote = {
            id: tempId,
            content: newNote,
            updatedAt: new Date().toISOString(),
            clientId: tempId,
        }
        setNotes([optimisticNote, ...notes])
        setNewNote("")

        try {
            const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: optimisticNote.content }),
            })

            if (res.ok) {
                const createdNote = await res.json()
                setNotes((prev) => prev.map((n) => (n.id === tempId ? { ...createdNote, clientId: tempId } : n)))
                router.refresh()
            } else {
                setNotes((prev) => prev.filter((n) => n.id !== tempId))
            }
        } catch (error) {
            console.error("Failed to add note", error)
            setNotes((prev) => prev.filter((n) => n.id !== tempId))
        }
    }

    const startEditing = (note: Note) => {
        setEditingId(note.id)
        setEditContent(note.content)
    }

    const saveEdit = async (id: string) => {
        if (!editContent.trim()) return

        setNotes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, content: editContent } : n))
        )
        setEditingId(null)

        try {
            await fetch(`/api/notes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editContent }),
            })
            router.refresh()
        } catch (error) {
            console.error("Failed to update note", error)
            fetchNotes() // Revert by refetching
        }
    }

    const deleteNote = async (id: string) => {
        const noteToDelete = notes.find((n) => n.id === id)
        setNotes((prev) => prev.filter((n) => n.id !== id))

        try {
            await fetch(`/api/notes/${id}`, {
                method: "DELETE",
            })
            router.refresh()
        } catch (error) {
            console.error("Failed to delete note", error)
            if (noteToDelete) {
                setNotes((prev) => [...prev, noteToDelete])
            }
        }
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden group">
            {/* Decorative background blur */}
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] -z-10 transition-all duration-500 group-hover:bg-blue-500/20" />

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <StickyNote className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{t("widgets.notes.title")}</h2>
                    <p className="text-xs text-slate-400 font-medium">{notes.length} {t("widgets.notes.notes")}</p>
                </div>
            </div>

            <form onSubmit={addNote} className="mb-6 relative group/input">
                <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={t("widgets.notes.notePlaceholder")}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 pl-11 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm placeholder:text-white/30"
                />
                <Plus className="w-5 h-5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within/input:text-blue-400" />
                <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-400 text-white p-1.5 rounded-lg transition-all disabled:opacity-0 disabled:scale-75 opacity-100 scale-100"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3 text-white/30">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-sm">{t("common.loading")}</span>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                            <StickyNote className="w-6 h-6 text-white/20" />
                        </div>
                        <p className="text-white/40 text-sm">{t("widgets.notes.noNotes")}</p>
                        <p className="text-white/20 text-xs mt-1">{t("widgets.notes.captureIdeas")}</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {notes.map((note) => (
                            <motion.div
                                key={note.clientId || note.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative bg-yellow-100/5 hover:bg-yellow-100/10 border border-white/5 hover:border-white/10 p-4 rounded-2xl transition-all duration-300"
                            >
                                {editingId === note.id ? (
                                    <div className="flex flex-col gap-3">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-white"
                                            rows={3}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => saveEdit(note.id)}
                                                className="p-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p
                                            onClick={() => startEditing(note)}
                                            className="text-sm text-white/80 whitespace-pre-wrap cursor-pointer leading-relaxed"
                                        >
                                            {note.content}
                                        </p>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                            <span className="text-[10px] text-white/20 font-medium uppercase tracking-wider">
                                                {new Date(note.updatedAt).toLocaleDateString()}
                                            </span>

                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                <button
                                                    onClick={() => startEditing(note)}
                                                    className="p-1.5 rounded-lg text-white/30 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                                                >
                                                    <PenLine className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => deleteNote(note.id)}
                                                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}

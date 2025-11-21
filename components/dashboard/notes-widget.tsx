"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Note {
    id: string
    content: string
    updatedAt: string
}

export default function NotesWidget() {
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
                setNotes((prev) => prev.map((n) => (n.id === tempId ? createdNote : n)))
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
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl text-white w-full max-w-md flex flex-col h-[400px]">
            <h2 className="text-2xl font-bold mb-4">Notes Rapides</h2>

            <form onSubmit={addNote} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Nouvelle note..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    +
                </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {loading ? (
                    <div className="text-center py-4 text-white/50">Chargement...</div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-4 text-white/50">Aucune note</div>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            className="group bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all relative"
                        >
                            {editingId === note.id ? (
                                <div className="flex gap-2">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="flex-1 bg-black/20 border border-white/10 rounded p-2 text-sm focus:outline-none resize-none"
                                        rows={3}
                                        autoFocus
                                    />
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => saveEdit(note.id)}
                                            className="text-green-400 hover:text-green-300 p-1"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="text-red-400 hover:text-red-300 p-1"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p
                                        onClick={() => startEditing(note)}
                                        className="text-sm text-white/90 whitespace-pre-wrap cursor-pointer"
                                    >
                                        {note.content}
                                    </p>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button
                                            onClick={() => startEditing(note)}
                                            className="text-white/40 hover:text-white transition-colors"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() => deleteNote(note.id)}
                                            className="text-white/40 hover:text-red-400 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <div className="mt-2 text-xs text-white/30">
                                        {new Date(note.updatedAt).toLocaleDateString()}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import TasksWidget from "@/components/dashboard/tasks-widget"
import NotesWidget from "@/components/dashboard/notes-widget"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8 text-white">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                        Bonjour, {session.user?.name || "Utilisateur"}
                    </h1>
                    <p className="text-white/60 mt-2">Voici votre tableau de bord personnel.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Widget Tâches */}
                    <TasksWidget />

                    {/* Widget Notes */}
                    <NotesWidget />

                    {/* Placeholder pour d'autres widgets */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex items-center justify-center text-white/30 border-dashed min-h-[300px]">
                        Widget Météo (À venir)
                    </div>
                </div>
            </div>
        </div>
    )
}

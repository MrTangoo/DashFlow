import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Get all incomplete tasks (from any day) OR completed tasks from today only
        const tasks = await prisma.task.findMany({
            where: {
                userId: session.user.id,
                OR: [
                    { completed: false }, // All incomplete tasks
                    {
                        completed: true,
                        date: today // Only today's completed tasks
                    }
                ]
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(tasks)
    } catch (error) {
        console.error("Error fetching tasks:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { title } = await request.json()

        if (!title || typeof title !== "string") {
            return NextResponse.json({ error: "Invalid title" }, { status: 400 })
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const task = await prisma.task.create({
            data: {
                title,
                userId: session.user.id,
                date: today,
            },
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error("Error creating task:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

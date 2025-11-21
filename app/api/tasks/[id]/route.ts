import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const { title, completed } = await req.json()

    const task = await prisma.task.update({
        where: {
            id,
            userId: session.user.id,
        },
        data: {
            title,
            completed,
        },
    })

    return NextResponse.json(task)
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    await prisma.task.delete({
        where: {
            id,
            userId: session.user.id,
        },
    })

    return NextResponse.json({ success: true })
}

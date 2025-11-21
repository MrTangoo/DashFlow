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
    const { content } = await req.json()

    const note = await prisma.note.update({
        where: {
            id,
            userId: session.user.id,
        },
        data: {
            content,
        },
    })

    return NextResponse.json(note)
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    await prisma.note.delete({
        where: {
            id,
            userId: session.user.id,
        },
    })

    return NextResponse.json({ success: true })
}

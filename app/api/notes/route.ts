import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notes = await prisma.note.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(notes)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await req.json()

    if (!content) {
        return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const note = await prisma.note.create({
        data: {
            content,
            userId: session.user.id,
        },
    })

    return NextResponse.json(note)
}

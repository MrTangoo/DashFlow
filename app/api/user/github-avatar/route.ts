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

        // Fetch GitHub account linked to this user
        const githubAccount = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: "github"
            }
        })

        if (!githubAccount) {
            return NextResponse.json({ avatar: null })
        }

        // Fetch GitHub user data using the providerAccountId
        const githubUserId = githubAccount.providerAccountId
        const githubAvatarUrl = `https://avatars.githubusercontent.com/u/${githubUserId}`

        return NextResponse.json({ avatar: githubAvatarUrl })
    } catch (error) {
        console.error("Error fetching GitHub avatar:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

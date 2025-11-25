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

        // Check if user has a GitHub account linked
        const account = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: "github"
            }
        })

        if (!account?.access_token) {
            return NextResponse.json({ error: "GitHub account not linked" }, { status: 404 })
        }

        // Fetch user data to get username
        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${account.access_token}`,
                Accept: "application/vnd.github.v3+json"
            }
        })

        if (!userResponse.ok) {
            return NextResponse.json({ error: "Failed to fetch GitHub user" }, { status: userResponse.status })
        }

        const userData = await userResponse.json()
        const username = userData.login

        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0]

        // Use GitHub Search API to get commits from today
        const searchResponse = await fetch(
            `https://api.github.com/search/commits?q=author:${username}+committer-date:${today}&per_page=100`,
            {
                headers: {
                    Authorization: `Bearer ${account.access_token}`,
                    Accept: "application/vnd.github.cloak-preview+json" // Required for commit search
                }
            }
        )

        const commits: any[] = []
        if (searchResponse.ok) {
            const searchData = await searchResponse.json()

            // Extract commit details from search results
            for (const item of (searchData.items || []).slice(0, 10)) {
                commits.push({
                    message: item.commit?.message || "No message",
                    repo: item.repository?.full_name || "Unknown",
                    timestamp: item.commit?.committer?.date || new Date().toISOString(),
                    sha: item.sha
                })
            }
        }

        return NextResponse.json(commits)

    } catch (error) {
        console.error("Error fetching GitHub activity:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

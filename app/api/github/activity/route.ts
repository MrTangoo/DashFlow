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

        // Fetch recent events
        const eventsResponse = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, {
            headers: {
                Authorization: `Bearer ${account.access_token}`,
                Accept: "application/vnd.github.v3+json"
            }
        })

        if (!eventsResponse.ok) {
            return NextResponse.json({ error: "Failed to fetch GitHub events" }, { status: eventsResponse.status })
        }

        const events = await eventsResponse.json()

        // Get today's date range
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const todayEnd = new Date(todayStart)
        todayEnd.setDate(todayEnd.getDate() + 1)

        // Filter for today's push events
        const todayPushEvents = events.filter((event: any) => {
            if (event.type !== "PushEvent") return false
            const eventDate = new Date(event.created_at)
            return eventDate >= todayStart && eventDate < todayEnd
        })

        // Extract commit details
        const commits = todayPushEvents.flatMap((event: any) => {
            const repoName = event.repo?.name || "Unknown"
            const eventTime = new Date(event.created_at)

            return (event.payload?.commits || []).map((commit: any) => ({
                message: commit.message,
                repo: repoName,
                timestamp: eventTime.toISOString(),
                sha: commit.sha
            }))
        })

        // Sort by timestamp (most recent first) and limit to 10
        commits.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        const recentCommits = commits.slice(0, 10)

        return NextResponse.json(recentCommits)

    } catch (error) {
        console.error("Error fetching GitHub activity:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

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

        // Use GitHub Search API to count commits from today
        const searchResponse = await fetch(
            `https://api.github.com/search/commits?q=author:${username}+committer-date:${today}`,
            {
                headers: {
                    Authorization: `Bearer ${account.access_token}`,
                    Accept: "application/vnd.github.cloak-preview+json" // Required for commit search
                }
            }
        )

        let commitsToday = 0
        if (searchResponse.ok) {
            const searchData = await searchResponse.json()
            commitsToday = searchData.total_count || 0
        }

        // Fetch recent events to get repos worked on today
        const eventsResponse = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, {
            headers: {
                Authorization: `Bearer ${account.access_token}`,
                Accept: "application/vnd.github.v3+json"
            }
        })

        let reposToday = 0
        if (eventsResponse.ok) {
            const events = await eventsResponse.json()

            // Get today's date range
            const now = new Date()
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const todayEnd = new Date(todayStart)
            todayEnd.setDate(todayEnd.getDate() + 1)

            // Filter events for today
            const todayEvents = events.filter((event: any) => {
                const eventDate = new Date(event.created_at)
                return eventDate >= todayStart && eventDate < todayEnd
            })

            // Get unique repositories worked on today
            const reposSet = new Set(
                todayEvents
                    .filter((event: any) => event.repo?.name)
                    .map((event: any) => event.repo.name)
            )
            reposToday = reposSet.size
        }

        // Calculate productivity level based on commits
        let productivity: "Low" | "Medium" | "High"
        if (commitsToday === 0) {
            productivity = "Low"
        } else if (commitsToday < 5) {
            productivity = "Medium"
        } else {
            productivity = "High"
        }

        return NextResponse.json({
            commitsToday,
            reposToday,
            productivity,
            username: userData.login,
            avatar: userData.avatar_url
        })

    } catch (error) {
        console.error("Error fetching GitHub stats:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

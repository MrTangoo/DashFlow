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

        // Fetch recent events (last 100)
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

        // Get today's date range (start and end of day in local time)
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const todayEnd = new Date(todayStart)
        todayEnd.setDate(todayEnd.getDate() + 1)

        console.log('Today range:', { todayStart, todayEnd, now })

        // Filter events for today
        const todayEvents = events.filter((event: any) => {
            const eventDate = new Date(event.created_at)
            return eventDate >= todayStart && eventDate < todayEnd
        })

        console.log('Today events count:', todayEvents.length)
        console.log('Today events types:', todayEvents.map((e: any) => e.type))

        // Count commits (PushEvents) today
        const pushEvents = todayEvents.filter((event: any) => event.type === "PushEvent")
        console.log('Push events count:', pushEvents.length)

        // Log first push event to see structure
        if (pushEvents.length > 0) {
            console.log('First push event payload:', JSON.stringify(pushEvents[0].payload, null, 2))
        }

        // Try both commits array and size property
        const commitsToday = pushEvents.reduce((total: number, event: any) => {
            // GitHub API can return commits in different ways
            const commitsCount = event.payload?.commits?.length || event.payload?.size || 0
            console.log('Event commits count:', commitsCount, 'from event:', event.repo?.name)
            return total + commitsCount
        }, 0)

        console.log('Total commits today:', commitsToday)

        // Get unique repositories worked on today
        const reposToday = new Set(
            todayEvents
                .filter((event: any) => event.repo?.name)
                .map((event: any) => event.repo.name)
        )

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
            reposToday: reposToday.size,
            productivity,
            username: userData.login,
            avatar: userData.avatar_url
        })

    } catch (error) {
        console.error("Error fetching GitHub stats:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

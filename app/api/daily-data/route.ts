import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET: Fetch today's daily data
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        let dailyData = await prisma.dailyData.findUnique({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: today,
                },
            },
        });

        // Create if doesn't exist
        if (!dailyData) {
            dailyData = await prisma.dailyData.create({
                data: {
                    userId: session.user.id,
                    date: today,
                    waterBottles: 0,
                },
            });
        }

        return NextResponse.json(dailyData);
    } catch (error) {
        console.error("Error fetching daily data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT: Update today's water bottles
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { waterBottles } = await request.json();

        if (typeof waterBottles !== 'number' || waterBottles < 0) {
            return NextResponse.json({ error: "Invalid water bottles count" }, { status: 400 });
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const dailyData = await prisma.dailyData.upsert({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: today,
                },
            },
            update: {
                waterBottles,
            },
            create: {
                userId: session.user.id,
                date: today,
                waterBottles,
            },
        });

        return NextResponse.json(dailyData);
    } catch (error) {
        console.error("Error updating daily data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

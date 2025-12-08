import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all widgets for the user
        const widgets = await prisma.widget.findMany({
            where: { userId: session.user.id },
            select: { type: true, visible: true, order: true },
            orderBy: { order: 'asc' }
        });

        // Create a map of widget visibility and order
        const preferences: Record<string, { visible: boolean; order: number }> = {};
        widgets.forEach(widget => {
            preferences[widget.type] = {
                visible: widget.visible,
                order: widget.order
            };
        });

        // Default widget types with default order
        const defaultTypes = ["tasks", "notes", "stats", "github", "pomodoro", "waterTracker", "weather"];

        // Fill in missing widgets with default visibility and order
        defaultTypes.forEach((type, index) => {
            if (!(type in preferences)) {
                preferences[type] = {
                    visible: true,
                    order: index
                };
            }
        });

        return NextResponse.json(preferences);
    } catch (error) {
        console.error("Error fetching widget preferences:", error);
        return NextResponse.json(
            { error: "Failed to fetch preferences" },
            { status: 500 }
        );
    }
}

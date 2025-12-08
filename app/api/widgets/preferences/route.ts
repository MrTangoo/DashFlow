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
            select: { type: true, visible: true }
        });

        // Create a map of widget visibility
        const preferences: Record<string, boolean> = {};
        widgets.forEach(widget => {
            preferences[widget.type] = widget.visible;
        });

        // Default widget types
        const defaultTypes = ["tasks", "notes", "stats", "github", "pomodoro", "water", "weather"];

        // Fill in missing widgets with default visibility
        defaultTypes.forEach(type => {
            if (!(type in preferences)) {
                preferences[type] = true;
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

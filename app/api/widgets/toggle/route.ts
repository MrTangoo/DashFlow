import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { widgetType, visible } = body;

        if (!widgetType || typeof visible !== "boolean") {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        // Check if widget exists for this user
        const existingWidget = await prisma.widget.findFirst({
            where: {
                userId: session.user.id,
                type: widgetType
            }
        });

        if (existingWidget) {
            // Update existing widget
            const updatedWidget = await prisma.widget.update({
                where: { id: existingWidget.id },
                data: { visible }
            });
            return NextResponse.json(updatedWidget);
        } else {
            // Create new widget entry with default position
            const newWidget = await prisma.widget.create({
                data: {
                    userId: session.user.id,
                    type: widgetType,
                    visible,
                    x: 0,
                    y: 0,
                    w: 1,
                    h: 1
                }
            });
            return NextResponse.json(newWidget);
        }
    } catch (error) {
        console.error("Error toggling widget visibility:", error);
        return NextResponse.json(
            { error: "Failed to toggle widget" },
            { status: 500 }
        );
    }
}

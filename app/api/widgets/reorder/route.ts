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
        const { widgetOrder } = body; // Array of widget types in order

        if (!Array.isArray(widgetOrder)) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        // Update order for each widget
        const updatePromises = widgetOrder.map(async (widgetType, index) => {
            const existingWidget = await prisma.widget.findFirst({
                where: {
                    userId: session.user.id,
                    type: widgetType
                }
            });

            if (existingWidget) {
                return prisma.widget.update({
                    where: { id: existingWidget.id },
                    data: { order: index }
                });
            } else {
                return prisma.widget.create({
                    data: {
                        userId: session.user.id,
                        type: widgetType,
                        order: index,
                        x: 0,
                        y: 0,
                        w: 1,
                        h: 1,
                        visible: true
                    }
                });
            }
        });

        await Promise.all(updatePromises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating widget order:", error);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        );
    }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Non autorisé", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true },
        });

        if (!user) {
            return new NextResponse("Utilisateur non trouvé", { status: 404 });
        }

        return NextResponse.json({
            hasPassword: !!user.password,
        });
    } catch (error) {
        console.error("Has password check error:", error);
        return new NextResponse("Erreur interne", { status: 500 });
    }
}

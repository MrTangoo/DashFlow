import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Non autorisé", { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = changePasswordSchema.parse(body);

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, password: true },
        });

        if (!user) {
            return new NextResponse("Utilisateur non trouvé", { status: 404 });
        }

        // Check if user has a password (not OAuth-only user)
        if (!user.password) {
            return new NextResponse("Cette fonctionnalité n'est pas disponible pour les comptes OAuth", { status: 400 });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return new NextResponse("Mot de passe actuel incorrect", { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({
            message: "Mot de passe modifié avec succès",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(error.issues[0].message, { status: 400 });
        }
        console.error("Change password error:", error);
        return new NextResponse("Erreur interne", { status: 500 });
    }
}

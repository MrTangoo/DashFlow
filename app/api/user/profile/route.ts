import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    image: z.string().url("URL d'image invalide").optional().or(z.literal("")),
});

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Non autorisé", { status: 401 });
        }

        const body = await req.json();
        const { name, email, image } = profileSchema.parse(body);

        // Check if email is already taken by another user
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser && existingUser.id !== session.user.id) {
            return new NextResponse("Cet email est déjà utilisé", { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                email,
                image: image || null,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(error.issues[0].message, { status: 400 });
        }
        return new NextResponse("Erreur interne", { status: 500 });
    }
}

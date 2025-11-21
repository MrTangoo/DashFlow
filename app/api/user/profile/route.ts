import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    imageBase64: z.string().optional(),
});

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Non autorisé", { status: 401 });
        }

        const body = await req.json();
        const { name, email, imageBase64 } = profileSchema.parse(body);

        // Check if email is already taken by another user
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser && existingUser.id !== session.user.id) {
            return new NextResponse("Cet email est déjà utilisé", { status: 400 });
        }

        // Convert base64 to Uint8Array if image is provided
        let imageData: Uint8Array<ArrayBuffer> | undefined;
        if (imageBase64 && imageBase64.startsWith("data:image/")) {
            const base64Data = imageBase64.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");
            imageData = new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                email,
                ...(imageData && {
                    imageData,
                    image: `/api/user/image?userId=${session.user.id}`,
                }),
            },
        });

        return NextResponse.json({
            ...updatedUser,
            imageData: undefined, // Don't send blob in response
            image: updatedUser.imageData ? `/api/user/image?userId=${updatedUser.id}` : updatedUser.image,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(error.issues[0].message, { status: 400 });
        }
        console.error("Profile update error:", error);
        return new NextResponse("Erreur interne", { status: 500 });
    }
}

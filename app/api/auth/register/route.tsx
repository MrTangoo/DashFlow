import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-helpers"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, password } = body

        // Validation des champs
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email et mot de passe requis" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Le mot de passe doit contenir au moins 6 caractères" },
                { status: 400 }
            )
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Cet email est déjà utilisé" },
                { status: 400 }
            )
        }

        // Hacher le mot de passe
        const hashedPassword = await hashPassword(password)

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                name: name || null,
                email,
                password: hashedPassword,
            },
        })

        return NextResponse.json(
            {
                message: "Compte créé avec succès",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error)
        return NextResponse.json(
            { error: "Une erreur est survenue lors de l'inscription" },
            { status: 500 }
        )
    }
}

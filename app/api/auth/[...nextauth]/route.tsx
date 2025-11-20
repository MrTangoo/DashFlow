import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import GithubProvider from "next-auth/providers/github"

export const authOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: "jwt" as const },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })

                if (!user || !user.password) return null

                const isValid = await bcrypt.compare(credentials.password, user.password)
                if (!isValid) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            },
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) token.id = user.id
            return token
        },
        async session({ session, token }: any) {
            if (session.user) session.user.id = token.id as string
            return session
        },
    },
    pages: { signIn: "/login" },
}

// Crée l'instance NextAuth
const handler = NextAuth(authOptions)

// **EXPORT DIRECT POUR APP ROUTER**
export { handler as GET, handler as POST }

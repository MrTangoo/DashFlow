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
        async jwt({ token, user, trigger }: any) {
            // On initial sign in, add user id to token
            if (user) {
                token.id = user.id
                token.name = user.name
                token.email = user.email
                token.picture = user.image
            }

            // On session update or token refresh, fetch fresh user data
            if (trigger === "update" || !user) {
                if (token.id) {
                    const freshUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { id: true, name: true, email: true, image: true }
                    })
                    if (freshUser) {
                        token.name = freshUser.name
                        token.email = freshUser.email
                        token.picture = freshUser.image
                    }
                }
            }

            return token
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
            }
            return session
        },
    },
    pages: { signIn: "/login" },
}

// Crée l'instance NextAuth
const handler = NextAuth(authOptions)

// **EXPORT DIRECT POUR APP ROUTER**
export { handler as GET, handler as POST }

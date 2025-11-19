import { getServerSession } from "next-auth"
import { authOptions } from "../app/api/auth/[...nextauth]/route"
import bcrypt from "bcrypt"

/**
 * Get the current session on the server side
 */
export async function getSession() {
    return await getServerSession(authOptions)
}

/**
 * Get the current user from the session
 */
export async function getCurrentUser() {
    const session = await getSession()
    return session?.user
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
}

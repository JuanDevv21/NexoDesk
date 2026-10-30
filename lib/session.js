import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const key = new TextEncoder().encode(process.env.SESSION_SECRET)

export async function encrypt(payload) {
    return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function decrypt(token) {
    try {
        const {payload} = await jwtVerify(token, key, {algorithms: ['HS256']})
        return payload
    } catch {
        return null
    }
}

export async function createSession({userId, role}) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const token = await encrypt({userId, role})
    const cookieStore = await cookies()
}

export async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    return token ? decrypt(token) : null
}
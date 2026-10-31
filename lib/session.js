import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const key = new TextEncoder().encode(process.env.SESSION_SECRET)

// Crea el token JWT, lo protege, le agrega fecha y hora, tiempo en el que expira y lo firma con la key
export async function encrypt(payload) {
    return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

// Se compara el token generado con la clave para verificar autenticidad, si confirma devuelve los datos descifrados
export async function decrypt(token) {
    try {
        const {payload} = await jwtVerify(token, key, {algorithms: ['HS256']})
        return payload
    } catch {
        return null
    }
}

// Guarda la cookie en el navegador, fecha de expiracion, llama encrypt para convertir el objeto en un token JWT firmado
export async function createSession({ userId, role}) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const token = await encrypt({userId, role})
    const cookieStore = await cookies()

    // Configuraciones de seguridad
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    })
}

// Funcion para saber que usuario esta navegando actualmente en cualquier parte de la app
export async function getSession() {
    const cookieStore = await cookies() // accede al almacen de cookies del servidor buscando la llamada session
    const token = cookieStore.get('session')?.value
    return token ? decrypt(token) : null
}


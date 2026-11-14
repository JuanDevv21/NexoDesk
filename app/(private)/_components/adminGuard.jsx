import { getCurrentUser } from '../../../lib/auth'
import AccessDenied from './AccessDenied'

// Devuelve un mensaje si el usuario no puede ver la página, o null si es administrador
export async function adminGuard() {
    const user = await getCurrentUser()

    if (!user) {
    return <p>Tu sesión ya no es válida. Cierra sesión e inicia de nuevo.</p>
    }

    if (user.role !== 'ADMIN') return <AccessDenied />

    return null
}
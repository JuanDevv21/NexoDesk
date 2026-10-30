import { redirect } from 'next/navigation'
import { prisma } from '../lib/prisma'
import { getSession } from '../lib/session'

const HomePage = async () => {
    const session = await getSession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true },
    })

    if (!user) {
    return (
        <div style={{ padding: 32 }}>
        <p>Tu sesión ya no es válida. Borra la cookie "session" y vuelve a iniciar sesión.</p>
        </div>
    )
    }

    return (
    <div style={{ padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Hola, {user.name}</h1>
        <p style={{ color: '#6A7282' }}>
        Rol: {user.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
        </p>
    </div>
    )
}

export default HomePage
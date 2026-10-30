import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { prisma } from '../lib/prisma'
import { getSession } from '../lib/session'

const Welcome = async () => {
    const session = await getSession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true },
    })

    if (!user) {
    return <p>Tu sesión ya no es válida. Borra la cookie "session" y vuelve a iniciar sesión.</p>
    }

    return (
    <>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Hola, {user.name}</h1>
        <p style={{ color: '#6A7282' }}>
        Rol: {user.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
        </p>
    </>
    )
}

const HomePage = () => {
    return (
    <div style={{ padding: 32 }}>
        <Suspense fallback={<p style={{ color: '#6A7282' }}>Cargando...</p>}>
        <Welcome />
        </Suspense>
    </div>
    )
}

export default HomePage
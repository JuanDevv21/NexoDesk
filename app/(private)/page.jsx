import { Suspense } from 'react'
import { getCurrentUser } from '../../lib/auth'

const Welcome = async () => {
    const user = await getCurrentUser()

    if (!user) {
    return <p>Tu sesión ya no es válida. Cierra sesión (arriba a la derecha) e inicia de nuevo.</p>
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
    <Suspense fallback={<p style={{ color: '#6A7282' }}>Cargando...</p>}>
        <Welcome />
    </Suspense>
    )
}

export default HomePage
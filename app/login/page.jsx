import { Suspense } from 'react'
import LoginForm from './LoginForm'

const LoginContent = async ({ searchParams }) => {
    const { logout, reset } = await searchParams

    const notice =
        reset === '1'
            ? 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'
            : logout === '1'
                ? 'Sesión cerrada correctamente'
                : null

    return <LoginForm notice={notice} />
}

const LoginPage = ({ searchParams }) => {
    return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
            <Suspense fallback={<LoginForm />}>
                <LoginContent searchParams={searchParams} />
            </Suspense>
        </main>
    )
}

export default LoginPage
import { Suspense } from 'react'
import Link from 'next/link'
import { LifeBuoy } from 'lucide-react'
import { prisma } from '../../lib/prisma'
import { hashToken } from '../../lib/tokens'
import ResetPasswordForm from './ResetPasswordForm'
import styles from '../login/login.module.css'

const InvalidLink = () => (
    <div className={styles.card}>
    <div className={styles.brand}>
        <LifeBuoy size={20} color="#4F39F6" />
        <span>NexoDesk</span>
    </div>

    <h1 className={styles.title}>Enlace no válido</h1>

    <div className={styles.alert} role="alert">
        Este enlace no es válido, ya fue usado o venció. Solicita uno nuevo para continuar.
    </div>

    <Link href="/recuperar-contrasena" className={`${styles.link} ${styles.linkCenter}`}>
        Solicitar un enlace nuevo
    </Link>
    </div>
)

const ResetContent = async ({ searchParams }) => {
    const { token } = await searchParams

    const record =
    typeof token === 'string' && token
        ? await prisma.passwordResetToken.findUnique({
            where: { tokenHash: hashToken(token) },
            select: { expiresAt: true, usedAt: true, user: { select: { active: true } } },
        })
        : null

    const isValid =
    record && !record.usedAt && record.expiresAt > new Date() && record.user.active

    if (!isValid) return <InvalidLink />

    return <ResetPasswordForm token={token} />
}

const ResetPasswordPage = ({ searchParams }) => {
    return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
        <Suspense fallback={<p style={{ color: '#6A7282' }}>Cargando...</p>}>
        <ResetContent searchParams={searchParams} />
        </Suspense>
    </main>
    )
}

export default ResetPasswordPage
'use client'

import Link from "next/link"
import { useActionState } from "react"
import { LifeBuoy } from "lucide-react"
import { requestPasswordReset } from "./actions"
import styles from '../login/login.module.css'

const ForgotPasswordForm = () => {
    const [state, formAction, pending] = useActionState(requestPasswordReset, undefined)

    return (
    <form action={formAction} className={styles.card} noValidate>
        <div className={styles.brand}>
            <LifeBuoy size={20} color="#4F39F6" />
            <span>NexoDesk</span>
        </div>

        <h1 className={styles.title}>Recuperar contraseña</h1>
        <p className={styles.subtitle}>
            Te enviaremos un enlace para crear una nueva contraseña
        </p>

        {state?.success ? (
        <div className={styles.success} role="status">
            {state.message}
        </div>
        ) : (
        <>
            <div className={styles.field}>
                <label htmlFor="email">Correo electrónico</label>
                <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state?.email ?? ''}
                aria-invalid={Boolean(state?.error)}
                />
                {state?.error && <span className={styles.error}>{state.error}</span>}
            </div>

            <button type="submit" disabled={pending} className={styles.button}>
                {pending ? 'Enviando...' : 'Enviar enlace'}
            </button>
        </>
        )}

        <Link href="/login" className={`${styles.link} ${styles.linkCenter}`}>
            Volver a iniciar sesión
        </Link>
    </form>
    )
}

export default ForgotPasswordForm
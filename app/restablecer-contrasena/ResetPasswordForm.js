'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { LifeBuoy } from 'lucide-react'
import { resetPassword } from './actions'
import styles from '../login/login.module.css'

const resetPasswordForm = ({token}) => {
    const [state, formAction, pending] = useActionState(resetPassword, undefined)
    const errors = state?.errors ?? {}

    return (
    <form action={formAction} className={styles.card} noValidate>
        <div className={styles.brand}>
        <LifeBuoy size={20} color="#4F39F6" />
        <span>NexoDesk</span>
        </div>

        <h1 className={styles.title}>Nueva contraseña</h1>
        <p className={styles.subtitle}>Elige una contraseña para tu cuenta</p>

        {state?.message && (
        <div className={styles.alert} role="alert">
            {state.message}{' '}
            <Link href="/recuperar-contrasena" className={styles.link}>
            Solicitar un enlace nuevo
            </Link>
        </div>
        )}

        <input type="hidden" name="token" value={token} />

        <div className={styles.field}>
        <label htmlFor="password">Nueva contraseña</label>
        <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? (
            <span className={styles.error}>{errors.password}</span>
        ) : (
            <span className={styles.hint}>Mínimo 8 caracteres, con letras y números.</span>
        )}
        </div>

        <div className={styles.field}>
        <label htmlFor="confirm">Confirmar contraseña</label>
        <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirm)}
        />
        {errors.confirm && <span className={styles.error}>{errors.confirm}</span>}
        </div>

        <button type="submit" disabled={pending} className={styles.button}>
        {pending ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
    </form>
    )
}

export default resetPasswordForm
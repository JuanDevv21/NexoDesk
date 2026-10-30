'use client'

import { useActionState } from "react"
import { LifeBuoy } from "lucide-react"
import { login } from "./actions"
import styles from './login.module.css'

const LoginForm = () => {
    const [state, formAction, pending] = useActionState(login, undefined)

    return (
    <form action={formAction} className={styles.card} noValidate>
        <div className={styles.brand}>
        <LifeBuoy size={20} color="#4F39F6" />
        <span>NexoDesk</span>
        </div>

        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>Ingresa con tu cuenta para continuar</p>

        {state?.message && (
        <div className={styles.alert} role="alert">
            {state.message}
        </div>
        )}

        <div className={styles.field}>
        <label htmlFor="email">Correo electrónico</label>
        <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state?.email ?? ''}
            aria-invalid={Boolean(state?.errors?.email)}
        />
        {state?.errors?.email && <span className={styles.error}>{state.errors.email}</span>}
        </div>

        <div className={styles.field}>
        <label htmlFor="password">Contraseña</label>
        <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(state?.errors?.password)}
        />
        {state?.errors?.password && <span className={styles.error}>{state.errors.password}</span>}
        </div>

        <button type="submit" disabled={pending} className={styles.button}>
        {pending ? 'Ingresando...' : 'Ingresar'}
        </button>
    </form>
    )
}

export default LoginForm

'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import styles from './clientes.module.css'

const ClientForm = ({action, initialValues = {}, submitLabel = 'guardar'}) => {
    const [state, formAction, pending] = useActionState(action, undefined)
    const errors = state?.errors ?? {}
    const values = {name: '', email: '', phone: '', company: '', ...initialValues, ...state?.values}

    return (
    <form action={formAction} className={`${styles.card} ${styles.form}`} noValidate>
        {state?.success && (
        <div className={styles.success} role="status">
            {state.message}{' '}
            <Link href="/clientes" className={styles.successLink}>
            Ver listado de clientes
            </Link>
        </div>
        )}
        {state?.message && !state.success && (
        <div className={styles.alert} role="alert">
            {state.message}
        </div>
        )}

        <div className={styles.field}>
            <label htmlFor="name">Nombre</label>
            <input
                id="name"
                name="name"
                type="text"
                autoComplete="off"
                defaultValue={values.name}
                aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>

        <div className={styles.field}>
            <label htmlFor="email">Correo electrónico</label>
            <input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                defaultValue={values.email}
                aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>

        <div className={styles.field}>
            <label htmlFor="phone">Teléfono (opcional)</label>
            <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="off"
                defaultValue={values.phone}
                aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone ? (
            <span className={styles.error}>{errors.phone}</span>
        ) : (
            <span className={styles.hint}>Entre 7 y 15 dígitos. Puede incluir +, espacios o guiones.</span>
        )}
        </div>

        <div className={styles.field}>
            <label htmlFor="company">Empresa (opcional)</label>
            <input
                id="company"
                name="company"
                type="text"
                autoComplete="off"
                defaultValue={values.company}
                aria-invalid={Boolean(errors.company)}
            />
            {errors.company && <span className={styles.error}>{errors.company}</span>}
        </div>

        <button type="submit" disabled={pending} className={styles.button}>
        {pending ? 'Guardando...' : submitLabel}
        </button>
    </form>
    )
}

export default ClientForm
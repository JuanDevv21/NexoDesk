'use client'

import { useActionState } from 'react'
import { UserPlus } from 'lucide-react'
import { createEmployee } from './actions'
import styles from './empleados.module.css'

const EmployeeForm = () => {
  const [state, formAction, pending] = useActionState(createEmployee, undefined)
  const errors = state?.errors ?? {}
  const values = state?.values ?? {}

  return (
    <form action={formAction} className={`${styles.card} ${styles.form}`} noValidate>
      <h2 className={styles.cardTitle}>
        <UserPlus size={16} />
        <span>Registrar empleado</span>
      </h2>

      {state?.success && (
        <div className={styles.success} role="status">{state.message}</div>
      )}
      {state?.message && !state.success && (
        <div className={styles.alert} role="alert">{state.message}</div>
      )}

      <div className={styles.field}>
        <label htmlFor="name">Nombre completo</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="off"
          defaultValue={values.name ?? ''}
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
          defaultValue={values.email ?? ''}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Contraseña inicial</label>
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
        <label htmlFor="role">Rol</label>
        <select
          id="role"
          name="role"
          defaultValue={values.role || 'EMPLOYEE'}
          aria-invalid={Boolean(errors.role)}
        >
          <option value="EMPLOYEE">Empleado</option>
          <option value="ADMIN">Administrador</option>
        </select>
        {errors.role && <span className={styles.error}>{errors.role}</span>}
      </div>

      <button type="submit" disabled={pending} className={styles.button}>
        {pending ? 'Registrando...' : 'Registrar empleado'}
      </button>
    </form>
  )
}

export default EmployeeForm
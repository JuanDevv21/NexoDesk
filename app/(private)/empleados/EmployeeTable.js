'use client'

import { useActionState, useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { changeRole } from "./actions"
import styles from './empleados.module.css'

const ROLE_LABELS = { ADMIN: 'Administrador', EMPLOYEE: 'Empleado'}

const EmployeeTable = ({employees, currentUserId}) => {
    const [state, formAction, pending] = useActionState(changeRole, undefined)
    const [change, setChange] = useState(null) // {employee, newRol}
    const dialogRef = useRef(null)

    useEffect(() => {
        if (state) dialogRef.current?.close()
    }, [state])

    const askConfirmation = (employee, newRole) => {
        if (newRole === employee.role) return
        setChange({employee, newRole})
        dialogRef.current?.showModal()
    }

    const isSelf = change?.employee.id === currentUserId

    return (
    <section className={`${styles.card} ${styles.tableCard}`}>
        <h2 className={`${styles.cardTitle} ${styles.cardHeader}`}>
            Listado de empleados ({employees.length})
        </h2>

        {state?.message && (
            <div
                className={`${state.success ? styles.success : styles.alert} ${styles.banner}`}
                role={state.success ? 'status' : 'alert'}
            >
                {state.message}
            </div>
        )}

        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Cambiar rol</th>
                    </tr>
                </thead>
                <tbody>
                {employees.map((employee) => (
                    <tr key={employee.id}>
                        <td>{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>
                            <span
                                className={`${styles.badge} ${
                                employee.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeEmployee
                                }`}
                                >
                                {ROLE_LABELS[employee.role] ?? employee.role}
                            </span>
                        </td>
                        <td>
                            <span
                                className={`${styles.badge} ${
                                employee.active ? styles.badgeActive : styles.badgeInactive
                                }`}
                                >
                                {employee.active ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td>
                            <div className={styles.roleSelectWrap}>
                                <select
                                    className={styles.roleSelect}
                                    value={employee.role}
                                    onChange={(event) => askConfirmation(employee, event.target.value)}
                                    aria-label={`Cambiar el rol de ${employee.name}`}
                                >
                                    <option value="EMPLOYEE">Empleado</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                                <ChevronDown size={16} className={styles.selectIcon} />
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

        <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="confirm-title"
        onClose={() => setChange(null)}
        >
        {change && (
            <form action={formAction}>
            <h2 id="confirm-title" className={styles.dialogTitle}>
                Confirmar cambio de rol
            </h2>

            <p className={styles.dialogText}>
                Vas a cambiar el rol de <strong>{change.employee.name}</strong> (
                {change.employee.email}) de{' '}
                <strong>{ROLE_LABELS[change.employee.role]}</strong> a{' '}
                <strong>{ROLE_LABELS[change.newRole]}</strong>.
            </p>

            {isSelf && (
                <p className={styles.dialogWarning}>
                Estás cambiando tu propio rol. Al confirmar perderás el acceso a la
                gestión de empleados.
                </p>
            )}

            <input type="hidden" name="userId" value={change.employee.id} />
            <input type="hidden" name="role" value={change.newRole} />

            <div className={styles.dialogActions}>
                <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => dialogRef.current?.close()}
                >
                Cancelar
                </button>
                <button type="submit" className={styles.button} disabled={pending}>
                {pending ? 'Guardando...' : 'Confirmar cambio'}
                </button>
            </div>
            </form>
        )}
        </dialog>
    </section>
    )
}

export default EmployeeTable